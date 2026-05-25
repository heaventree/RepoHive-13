// One-off migration: import the curated "App Killers" repo set into the
// preloaded library tenant (and optionally into a specific tenant).
//
// The 309 repos were recovered from the pre-multi-tenant RepoScout database
// (git history) and exported to scripts/seed/library-seed.json.gz. This script
// reads that seed, maps it onto the current multi-tenant `repos` schema, and
// upserts each row under the reserved __library__ tenant with source='library'.
// From there the app's normal upgrade flow (copyLibraryToTenant) copies them
// into Solo/Studio subscribers.
//
// Usage (run where TURSO_DATABASE_URL is reachable, e.g. Render shell):
//   npx tsx scripts/seed-library.ts                 # seed __library__ only
//   npx tsx scripts/seed-library.ts --copy-to <id>  # also copy into a tenant
//
// Idempotent: existing rows (same tenant_id + id) are left untouched.

import "dotenv/config";
import { gunzipSync } from "zlib";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { all, get, run, execScript } from "../db";

const LIBRARY_TENANT = "__library__";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface SeedRepo {
  id: string;
  owner: string | null;
  name: string | null;
  url: string | null;
  status: string | null;
  score: number | null;
  language: string | null;
  license: string | null;
  stars: number | null;
  forks: number | null;
  issues: number | null;
  last_push: string | null;
  description: string | null;
  readme: string | null;
  ai_analysis: string | null;
  created_at: string | null;
  updated_at: string | null;
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

function loadSeed(): SeedRepo[] {
  const gz = readFileSync(path.join(__dirname, "seed", "library-seed.json.gz"));
  return JSON.parse(gunzipSync(gz).toString("utf8"));
}

// enterpriseTier / comparableApp live inside the ai_analysis JSON in the old
// schema; promote them to their own columns for the current schema.
function promote(aiAnalysis: string | null): { tier: number; comparable: string | null } {
  try {
    const a = JSON.parse(aiAnalysis ?? "");
    return { tier: a?.enterpriseTier ? 1 : 0, comparable: a?.comparableApp ?? null };
  } catch {
    return { tier: 0, comparable: null };
  }
}

async function seedLibrary(repos: SeedRepo[]): Promise<number> {
  let inserted = 0;
  for (const r of repos) {
    const { tier, comparable } = promote(r.ai_analysis);
    const res = await run(
      `INSERT INTO repos (
         tenant_id, id, owner, name, url, status, score, language, license,
         stars, forks, issues, last_push, description, readme, ai_analysis,
         enterpriseTier, comparableApp, embedding, source, created_by,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'library', NULL, ?, ?)
       ON CONFLICT(tenant_id, id) DO NOTHING`,
      [
        LIBRARY_TENANT, r.id, r.owner, r.name, r.url, r.status ?? "ACTIVE",
        r.score ?? 0, r.language, r.license, r.stars ?? 0, r.forks ?? 0, r.issues ?? 0,
        r.last_push, r.description, r.readme, r.ai_analysis, tier, comparable,
        r.created_at, r.updated_at,
      ],
    );
    inserted += res.rowsAffected ?? 0;
  }
  return inserted;
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
  const copyIdx = args.indexOf("--copy-to");
  const copyTo = copyIdx >= 0 ? args[copyIdx + 1] : null;
  if (copyIdx >= 0 && !copyTo) {
    console.error("--copy-to requires a tenant id, e.g. --copy-to user_2abc...");
    process.exit(1);
  }

  await ensureSchema();
  const repos = loadSeed();
  console.log(`Loaded ${repos.length} repos from seed.`);

  const before = (await get<{ c: number }>(
    "SELECT COUNT(*) AS c FROM repos WHERE tenant_id = ?", [LIBRARY_TENANT],
  ))?.c ?? 0;
  const inserted = await seedLibrary(repos);
  const after = (await get<{ c: number }>(
    "SELECT COUNT(*) AS c FROM repos WHERE tenant_id = ?", [LIBRARY_TENANT],
  ))?.c ?? 0;
  console.log(`__library__: +${inserted} new (was ${before}, now ${after}).`);

  if (copyTo) {
    const copied = await copyToTenant(copyTo);
    const total = (await get<{ c: number }>(
      "SELECT COUNT(*) AS c FROM repos WHERE tenant_id = ?", [copyTo],
    ))?.c ?? 0;
    console.log(`tenant ${copyTo}: +${copied} copied (now ${total} total).`);
  }
  console.log("Done. (Embeddings are NULL — run the in-app embedding sweep to enable vector search.)");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
