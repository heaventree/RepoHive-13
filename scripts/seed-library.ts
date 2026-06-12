// One-off migration: import the curated "App Killers" repo set into the
// preloaded library tenant (and optionally into a specific tenant).
//
// Two data sources, in priority order:
//   --from <reposcout.db>  read directly from an exported single-tenant DB.
//                          Carries embeddings, so vector search works with no
//                          re-embedding. Use this for a full, zero-API restore.
//   (default)              read the committed scripts/seed/library-seed.json.gz
//                          (583 repos, no embeddings — run the in-app embedding
//                          sweep afterwards to enable vector search).
//
// Rows are mapped onto the current multi-tenant `repos` schema and upserted
// under the reserved __library__ tenant with source='library'. From there the
// app's upgrade flow (copyLibraryToTenant) copies them into subscribers.
//
// Usage (run where TURSO_DATABASE_URL is reachable, e.g. Render shell):
//   npx tsx scripts/seed-library.ts --from ./reposcout.db
//   npx tsx scripts/seed-library.ts --from ./reposcout.db --copy-to user_2abc...
//   npx tsx scripts/seed-library.ts                      # committed seed only
//
// Idempotent: existing rows (same tenant_id + id) are left untouched.

import "dotenv/config";
import { gunzipSync } from "zlib";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import { all, get, run, execScript } from "../db";

const LIBRARY_TENANT = "__library__";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface SeedRepo {
  id: string;
  owner?: string | null;
  name?: string | null;
  url?: string | null;
  status?: string | null;
  score?: number | null;
  language?: string | null;
  license?: string | null;
  stars?: number | null;
  forks?: number | null;
  issues?: number | null;
  last_push?: string | null;
  description?: string | null;
  readme?: string | null;
  ai_analysis?: string | null;
  enterpriseTier?: number | null;
  comparableApp?: string | null;
  embedding?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// The current repos table (mirrors server.ts initSchema). CREATE IF NOT EXISTS
// so this is a no-op against the live DB where the app already made it.
async function ensureSchema() {
  await execScript(`
    CREATE TABLE IF NOT EXISTS repos (
      tenant_id TEXT NOT NULL,
      id TEXT NOT NULL,
      owner TEXT, name TEXT, url TEXT,
      status TEXT DEFAULT 'ACTIVE',
      score INTEGER DEFAULT 0,
      language TEXT, license TEXT,
      stars INTEGER DEFAULT 0, forks INTEGER DEFAULT 0, issues INTEGER DEFAULT 0,
      last_push TEXT, description TEXT, readme TEXT, ai_analysis TEXT,
      enterpriseTier INTEGER DEFAULT 0, comparableApp TEXT, embedding TEXT,
      source TEXT DEFAULT 'user', created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (tenant_id, id)
    );
  `);
}

function loadFromGz(): SeedRepo[] {
  const gz = readFileSync(path.join(__dirname, "seed", "library-seed.json.gz"));
  return JSON.parse(gunzipSync(gz).toString("utf8"));
}

// Read repos out of an exported single-tenant SQLite/libSQL DB file. Older
// exports lack enterpriseTier/comparableApp/embedding columns, so select * and
// pick fields defensively.
async function loadFromDb(file: string): Promise<SeedRepo[]> {
  const src = createClient({ url: `file:${path.resolve(file)}` });
  const r = await src.execute("SELECT * FROM repos");
  return r.rows.map((row) =>
    Object.fromEntries(r.columns.map((c, i) => [c, (row as any)[i]])),
  ) as SeedRepo[];
}

// The App Killer flag is the analyst's verdict, which the app writes into the
// ai_analysis JSON (the dedicated columns are vestigial and usually 0/null in
// exports). So read the JSON first and only fall back to the columns when the
// JSON lacks the field.
function tierFields(r: SeedRepo): { tier: number; comparable: string | null } {
  try {
    const a = JSON.parse(r.ai_analysis ?? "");
    if (a && typeof a.enterpriseTier !== "undefined") {
      return { tier: a.enterpriseTier ? 1 : 0, comparable: a.comparableApp ?? r.comparableApp ?? null };
    }
  } catch {}
  return { tier: r.enterpriseTier ? 1 : 0, comparable: r.comparableApp ?? null };
}

async function seedLibrary(repos: SeedRepo[]): Promise<{ inserted: number; withEmbedding: number }> {
  let inserted = 0, withEmbedding = 0;
  for (const r of repos) {
    const { tier, comparable } = tierFields(r);
    const embedding = r.embedding ?? null;
    const res = await run(
      `INSERT INTO repos (
         tenant_id, id, owner, name, url, status, score, language, license,
         stars, forks, issues, last_push, description, readme, ai_analysis,
         enterpriseTier, comparableApp, embedding, source, created_by,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'library', NULL, ?, ?)
       ON CONFLICT(tenant_id, id) DO NOTHING`,
      [
        LIBRARY_TENANT, r.id, r.owner, r.name, r.url, r.status ?? "ACTIVE",
        r.score ?? 0, r.language, r.license, r.stars ?? 0, r.forks ?? 0, r.issues ?? 0,
        r.last_push, r.description, r.readme, r.ai_analysis, tier, comparable, embedding,
        r.created_at, r.updated_at,
      ],
    );
    const n = res.rowsAffected ?? 0;
    inserted += n;
    if (n && embedding) withEmbedding++;
  }
  return { inserted, withEmbedding };
}

// Mirror of server.ts copyLibraryToTenant — copies the library into a tenant,
// keeping source='library' so the repos never count against that tenant's cap.
async function copyToTenant(tenantId: string): Promise<number> {
  const res = await run(
    `INSERT INTO repos (
       tenant_id, id, owner, name, url, status, score, language, license,
       stars, forks, issues, last_push, description, readme, ai_analysis,
       enterpriseTier, comparableApp, embedding, source, created_by
     )
     SELECT ?, id, owner, name, url, status, score, language, license,
       stars, forks, issues, last_push, description, readme, ai_analysis,
       enterpriseTier, comparableApp, embedding, 'library', created_by
     FROM repos WHERE tenant_id = ?
     ON CONFLICT(tenant_id, id) DO NOTHING`,
    [tenantId, LIBRARY_TENANT],
  );
  return res.rowsAffected ?? 0;
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : null;
  };
  // Accept either the flag form (--from <path> --copy-to <id>) or bare
  // positional args (anything that looks like a .db path / tenant id).
  // Easy to get the npm-run quoting wrong on PowerShell, so be forgiving.
  const positional = args.filter(a => !a.startsWith("--") && !["--from", "--copy-to"].includes(args[args.indexOf(a) - 1] ?? ""));
  const looksLikeTenant = (s?: string | null) => !!s && /^(user|org)_/.test(s);
  const looksLikeDbPath = (s?: string | null) => !!s && /\.(db|sqlite)$/i.test(s);

  const from = arg("--from") || positional.find(looksLikeDbPath) || null;
  let copyTo = arg("--copy-to") || positional.find(looksLikeTenant) || null;
  if (args.includes("--copy-to") && !copyTo) {
    console.error("--copy-to requires a tenant id, e.g. --copy-to user_2abc...");
    process.exit(1);
  }

  await ensureSchema();
  const repos = from ? await loadFromDb(from) : loadFromGz();
  console.log(`Loaded ${repos.length} repos from ${from ? `DB ${from}` : "committed seed"}.`);

  const before = (await get<{ c: number }>(
    "SELECT COUNT(*) AS c FROM repos WHERE tenant_id = ?", [LIBRARY_TENANT],
  ))?.c ?? 0;
  const { inserted, withEmbedding } = await seedLibrary(repos);
  const after = (await get<{ c: number }>(
    "SELECT COUNT(*) AS c FROM repos WHERE tenant_id = ?", [LIBRARY_TENANT],
  ))?.c ?? 0;
  console.log(`__library__: +${inserted} new (${withEmbedding} with embeddings; was ${before}, now ${after}).`);

  if (copyTo) {
    const copied = await copyToTenant(copyTo);
    const total = (await get<{ c: number }>(
      "SELECT COUNT(*) AS c FROM repos WHERE tenant_id = ?", [copyTo],
    ))?.c ?? 0;
    console.log(`tenant ${copyTo}: +${copied} copied (now ${total} total).`);
  }

  const missing = (await get<{ c: number }>(
    "SELECT COUNT(*) AS c FROM repos WHERE tenant_id = ? AND embedding IS NULL", [LIBRARY_TENANT],
  ))?.c ?? 0;
  if (missing > 0) {
    console.log(`Note: ${missing} library repos have no embedding — run the in-app embedding sweep to enable vector search.`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
