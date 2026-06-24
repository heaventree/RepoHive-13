import "dotenv/config";
import express from "express";
import crypto from "crypto";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { all, get, run, execScript } from "./db";
import { planFor, isPlanId, DEFAULT_PLAN, type PlanLimits } from "./tiers";

const _CLERK_SK  = process.env.CLERK_SECRET_KEY || "";
const _CLERK_PK  = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || "";
const isValidClerkSK = (k: string) => /^sk_(test|live)_/.test(k);
const isValidClerkPK = (k: string) => /^pk_(test|live)_/.test(k);
const AUTH_ENABLED = isValidClerkSK(_CLERK_SK) && isValidClerkPK(_CLERK_PK);
// REQUIRE_AUTH=true or running on Netlify means auth is mandatory.
const IS_STRICT = process.env.REQUIRE_AUTH === "true" || Boolean(process.env.NETLIFY);

if (!AUTH_ENABLED) {
  const skOk = isValidClerkSK(_CLERK_SK);
  const pkOk = isValidClerkPK(_CLERK_PK);
  if (IS_STRICT) {
    console.error(`[auth] FATAL: Auth required by environment but keys are invalid. SK=${skOk ? "ok" : "invalid"}, PK=${pkOk ? "ok" : "invalid"}. Set CLERK_SECRET_KEY (sk_...) and CLERK_PUBLISHABLE_KEY (pk_...).`);
  } else {
    console.warn(`[auth] Running WITHOUT authentication in dev mode (${skOk ? "SK ok" : "SK invalid"}, ${pkOk ? "PK ok" : "PK invalid"}). Set valid CLERK keys to enable.`);
  }
}
const DEV_TENANT = "dev-tenant";
const DEV_USER   = "dev-user";
const LIBRARY_TENANT = "__library__";

// ── User lookup / auto-create ─────────────────────────────────────────────────
async function lookupOrCreateUser(clerkUserId: string, email?: string): Promise<{ plan: string }> {
  const existing = await get<{ plan: string }>(
    "SELECT plan FROM users WHERE clerk_user_id = ?", [clerkUserId],
  );
  if (existing) return existing;
  await run(
    "INSERT OR IGNORE INTO users (clerk_user_id, email, plan) VALUES (?, ?, 'free')",
    [clerkUserId, email ?? null],
  );
  return { plan: "free" };
}

function getTenant(req: express.Request): { tenantId: string; userId: string } {
  if (!AUTH_ENABLED) return { tenantId: DEV_TENANT, userId: DEV_USER };
  const { userId, orgId } = getAuth(req);
  return { tenantId: (orgId ?? userId) as string, userId: userId as string };
}

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",").map((s) => s.trim()).filter(Boolean);

function isAdmin(req: express.Request): boolean {
  if (!AUTH_ENABLED) return true;
  const { userId } = getAuth(req);
  return !!userId && ADMIN_USER_IDS.includes(userId);
}

const ck = (tenantId: string, id: string) => `${tenantId}::${id}`;

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

// ── Plans, usage & limits ────────────────────────────────────────────────────
function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

async function getPlan(tenantId: string): Promise<PlanLimits> {
  const row = await get<{ plan: string }>(
    "SELECT plan FROM subscriptions WHERE tenant_id = ?", [tenantId],
  );
  if (!row) {
    await run(
      "INSERT OR IGNORE INTO subscriptions (tenant_id, plan, status) VALUES (?, ?, 'active')",
      [tenantId, DEFAULT_PLAN],
    );
    return planFor(DEFAULT_PLAN);
  }
  return planFor(row.plan);
}

async function countUserRepos(tenantId: string): Promise<number> {
  const row = await get<{ c: number }>(
    "SELECT COUNT(*) AS c FROM repos WHERE tenant_id = ? AND source = 'user'", [tenantId],
  );
  return row?.c ?? 0;
}

async function monthlyAdditions(tenantId: string): Promise<number> {
  const row = await get<{ repos_added: number }>(
    "SELECT repos_added FROM usage_tracking WHERE tenant_id = ? AND period = ?",
    [tenantId, currentPeriod()],
  );
  return row?.repos_added ?? 0;
}

async function incrementMonthlyAdditions(tenantId: string): Promise<void> {
  await run(
    `INSERT INTO usage_tracking (tenant_id, period, repos_added)
     VALUES (?, ?, 1)
     ON CONFLICT(tenant_id, period) DO UPDATE SET repos_added = repos_added + 1`,
    [tenantId, currentPeriod()],
  );
}

async function checkRepoQuota(tenantId: string): Promise<{ status: number; error: string } | null> {
  const plan = await getPlan(tenantId);
  const used = await countUserRepos(tenantId);
  if (used >= plan.repoCap) {
    return {
      status: 403,
      error: `Library is full — the ${plan.name} plan allows ${plan.repoCap} repos. Upgrade or remove a repo to add more.`,
    };
  }
  const added = await monthlyAdditions(tenantId);
  if (added >= plan.monthlyAdditions) {
    return {
      status: 403,
      error: `Monthly add limit reached — the ${plan.name} plan allows ${plan.monthlyAdditions} new repos per month.`,
    };
  }
  return null;
}

async function copyLibraryToTenant(tenantId: string): Promise<number> {
  if (tenantId === LIBRARY_TENANT) return 0;
  const result = await run(
    `INSERT INTO repos (
       tenant_id, id, owner, name, url, status, score, language, license,
       stars, forks, issues, last_push, description, readme, ai_analysis,
       enterpriseTier, comparableApp, embedding, source, created_by
     )
     SELECT
       ?, id, owner, name, url, status, score, language, license,
       stars, forks, issues, last_push, description, readme, ai_analysis,
       enterpriseTier, comparableApp, embedding, 'library', created_by
     FROM repos
     WHERE tenant_id = ?
     ON CONFLICT(tenant_id, id) DO NOTHING`,
    [tenantId, LIBRARY_TENANT],
  );
  return result.rowsAffected ?? 0;
}

async function applyPlan(tenantId: string, plan: string): Promise<{ plan: PlanLimits; copied: number }> {
  await run(
    `INSERT INTO subscriptions (tenant_id, plan, status, updated_at)
     VALUES (?, ?, 'active', CURRENT_TIMESTAMP)
     ON CONFLICT(tenant_id) DO UPDATE SET
       plan = excluded.plan, status = 'active', updated_at = CURRENT_TIMESTAMP`,
    [tenantId, plan],
  );
  const limits = planFor(plan);
  let copied = 0;
  if (limits.preloadedLibrary) copied = await copyLibraryToTenant(tenantId);
  return { plan: limits, copied };
}

// ── Schema ───────────────────────────────────────────────────────────────────
async function initSchema() {
  await execScript(`
    CREATE TABLE IF NOT EXISTS users (
      clerk_user_id TEXT PRIMARY KEY,
      email TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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
      source TEXT DEFAULT 'user',
      user_id TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (tenant_id, id)
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      repo_id TEXT NOT NULL,
      score INTEGER, stars INTEGER, issues INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      name TEXT, description TEXT, constraints TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pinned_repos (
      tenant_id TEXT NOT NULL,
      project_id INTEGER, repo_id TEXT, notes TEXT,
      PRIMARY KEY (tenant_id, project_id, repo_id)
    );

    CREATE TABLE IF NOT EXISTS project_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      repo_id TEXT NOT NULL,
      fit_score INTEGER, rationale TEXT, mode TEXT,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_id, repo_id)
    );

    CREATE TABLE IF NOT EXISTS config (
      tenant_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      PRIMARY KEY (tenant_id, key)
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      name TEXT, key_prefix TEXT,
      key_hash TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS usage_tracking (
      tenant_id TEXT NOT NULL,
      period TEXT NOT NULL,
      repos_added INTEGER DEFAULT 0,
      PRIMARY KEY (tenant_id, period)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      tenant_id TEXT PRIMARY KEY,
      plan TEXT DEFAULT 'free',
      status TEXT DEFAULT 'active',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      current_period_end DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// ── Vector helpers ───────────────────────────────────────────────────────────
const embeddingCache = new Map<string, number[]>();

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'models/gemini-embedding-001', content: { parts: [{ text: text.slice(0, 4000) }] } })
      }
    );
    const data = await res.json();
    return data.embedding?.values ?? null;
  } catch { return null; }
}

async function expandBrief(brief: string): Promise<string> {
  const words = brief.trim().split(/\s+/).length;
  if (words > 20) return brief;
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return brief;
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: `Expand this software project description into 3-4 sentences covering what it does, its key features, typical use cases, and related technical concepts. Be specific and use relevant technical terminology. Project: "${brief}"` }],
        max_tokens: 200, temperature: 0.2
      })
    });
    const data = await res.json();
    const expanded = data.choices?.[0]?.message?.content?.trim();
    return expanded ? `${brief}\n\n${expanded}` : brief;
  } catch { return brief; }
}

function buildEmbedText(repo: any, ai: any = {}): string {
  return [repo.name, repo.description, ai.summary, (ai.tags || []).join(' '), ai.category].filter(Boolean).join(' ');
}

async function loadEmbeddingCache() {
  const rows = await all<any>("SELECT tenant_id, id, embedding FROM repos WHERE embedding IS NOT NULL");
  embeddingCache.clear();
  for (const row of rows) {
    try { embeddingCache.set(ck(row.tenant_id, row.id), JSON.parse(row.embedding)); } catch {}
  }
  console.log(`Vector cache: ${embeddingCache.size} embeddings loaded`);
}

// ── Init guard (runs once per process) ──────────────────────────────────────
let initPromise: Promise<void> | null = null;
function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await initSchema();
      await loadEmbeddingCache();
    })().catch((err) => { initPromise = null; throw err; });
  }
  return initPromise;
}

// ── GitHub helpers ───────────────────────────────────────────────────────────
async function fetchGitHub(path: string) {
  const headers: Record<string, string> = { 'User-Agent': 'RepoHive/1' };
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`);
  return res.json() as Promise<any>;
}

async function resolveRepo(owner: string, partial: string): Promise<any | null> {
  try {
    const headers: Record<string, string> = { 'User-Agent': 'RepoHive/1' };
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    const q = encodeURIComponent(`user:${owner} ${partial} in:name`);
    const res = await fetch(`https://api.github.com/search/repositories?q=${q}&per_page=1&sort=stars`, { headers });
    if (!res.ok) return null;
    const data: any = await res.json();
    const hit = data.items?.[0];
    if (hit && hit.owner?.login?.toLowerCase() === owner.toLowerCase()
             && hit.name?.toLowerCase().startsWith(partial.toLowerCase())) return hit;
    return null;
  } catch { return null; }
}

function computeScore(stars: number, forks: number, issues: number, lastPush: string): number {
  const popularity = Math.min(40, Math.round(Math.log10(stars + 1) * 16));
  const forkScore  = Math.min(15, Math.round(Math.log10(forks + 1) * 7));
  const issueRatio = stars > 0 ? Math.min(1, issues / (stars * 0.1)) : 1;
  const issuePenalty = Math.round(issueRatio * 10);
  const monthsOld = (Date.now() - new Date(lastPush).getTime()) / (1000 * 60 * 60 * 24 * 30);
  const recency = monthsOld < 1 ? 20 : monthsOld < 6 ? 15 : monthsOld < 12 ? 10 : monthsOld < 24 ? 5 : 0;
  return Math.max(0, Math.min(90, popularity + forkScore - issuePenalty + recency));
}

function inferCategory(language: string | null, topics: string[], description: string): string {
  const all = [language, ...topics, description].join(' ').toLowerCase();
  if (/react|vue|angular|svelte|frontend|ui|css|tailwind|component/.test(all)) return 'Frontend';
  if (/api|server|backend|express|fastapi|django|rails|nest|hono/.test(all)) return 'Backend';
  if (/ml|ai|llm|model|training|neural|pytorch|tensorflow|hugging/.test(all)) return 'AI/ML';
  if (/devops|ci|cd|docker|kubernetes|terraform|deploy|infra|helm/.test(all)) return 'DevOps';
  if (/database|sql|postgres|mongo|redis|sqlite|orm|prisma/.test(all)) return 'Database';
  if (/cli|tool|utility|script|automation|workflow/.test(all)) return 'Tooling';
  if (/mobile|ios|android|react-native|expo|flutter/.test(all)) return 'Mobile';
  if (/security|auth|oauth|jwt|crypto|encrypt/.test(all)) return 'Security';
  return 'General';
}

async function deepseekAnalyze(id: string, description: string, language: string | null, topics: string[], readme: string | null, fallbackCategory: string): Promise<any> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;
  const prompt = `You are a software repository analyst. Analyze this GitHub repository and return a JSON object.

Repository: ${id}
Language: ${language || 'unknown'}
Topics: ${topics.join(', ') || 'none'}
Description: ${description || 'none'}
README (first 2000 chars): ${(readme || '').slice(0, 2000)}

Return ONLY valid JSON with this exact structure:
{
  "category": "one of: Frontend, Backend, AI/ML, DevOps, Database, Tooling, Mobile, Security, General",
  "tags": ["array", "of", "3-6", "relevant", "tech", "tags"],
  "summary": "2-3 sentence plain English summary of what this repo does and who it's for",
  "useCases": ["3-5 specific use case strings"],
  "integrationNotes": [
    { "platform": "e.g. Next.js", "match": "Perfect Match or Good Fit", "description": "one sentence" }
  ],
  "enterpriseTier": true or false,
  "comparableApp": "Name of the well-known paid product this replaces, or null if none"
}`;
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], max_tokens: 800, temperature: 0.3 })
    });
    if (!res.ok) { console.warn(`DeepSeek error ${res.status}`); return null; }
    const data: any = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`DeepSeek analyzed ${id} → ${parsed.category}`);
    return parsed;
  } catch (err: any) { console.warn(`DeepSeek failed for ${id}: ${err.message}`); return null; }
}

// ── App factory ──────────────────────────────────────────────────────────────
export function createApiApp(): express.Express {
  const app = express();
  app.use(express.json());

  app.use(async (_req, _res, next) => {
    try { await ensureInit(); next(); }
    catch (err) { next(err); }
  });

  // On Netlify (or when REQUIRE_AUTH=true), reject all API traffic if auth keys are invalid.
  if (IS_STRICT && !AUTH_ENABLED) {
    app.use("/api", (_req, res) => {
      res.status(503).json({ error: "Service unavailable: authentication not configured. Contact the site operator." });
    });
  }

  if (AUTH_ENABLED) {
    app.use(clerkMiddleware({
      publishableKey: _CLERK_PK,
      secretKey: _CLERK_SK,
    }));
    // Enforce authentication on all /api/* except the public external API.
    // Also auto-create the user record in `users` on first authenticated request.
    app.use("/api", async (req, res, next) => {
      if (req.path.startsWith("/external/")) return next();
      const { userId } = getAuth(req);
      if (!userId) return res.status(401).json({ error: "Authentication required" });
      // Auto-create user on first request (fire-and-forget; errors non-fatal)
      lookupOrCreateUser(userId).catch(() => {});
      next();
    });
  }

  // ── Repos ──────────────────────────────────────────────────────────────────
  app.get("/api/repos", async (req, res) => {
    const { tenantId } = getTenant(req);
    // Return tenant's own repos PLUS the shared __library__ repos (read-only, marked source='library').
    // Tenant repos override library rows when the same id appears in both.
    const ownRows = await all<any>("SELECT *, 'own' AS _origin FROM repos WHERE tenant_id = ? ORDER BY score DESC", [tenantId]);
    let libraryRows: any[] = [];
    if (tenantId !== LIBRARY_TENANT) {
      const ownIds = new Set(ownRows.map((r: any) => r.id));
      const lib = await all<any>("SELECT *, 'library' AS _origin FROM repos WHERE tenant_id = ? ORDER BY score DESC", [LIBRARY_TENANT]);
      libraryRows = lib.filter((r: any) => !ownIds.has(r.id)).map((r: any) => ({ ...r, source: 'library', tenant_id: tenantId }));
    }
    const repos = [...ownRows, ...libraryRows].sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0));
    console.log(`Fetching repos for ${tenantId}: ${ownRows.length} own + ${libraryRows.length} library`);
    res.json(repos);
  });

  app.post("/api/repos", async (req, res) => {
    const { tenantId, userId } = getTenant(req);
    const { owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, aiAnalysis } = req.body;
    const id = `${owner}/${name}`;
    try {
      const existing = await get("SELECT 1 FROM repos WHERE tenant_id = ? AND id = ?", [tenantId, id]);
      if (!existing) {
        const quota = await checkRepoQuota(tenantId);
        if (quota) return res.status(quota.status).json({ error: quota.error });
      }
      await run(`
        INSERT INTO repos (tenant_id, id, owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, ai_analysis, source, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', ?)
        ON CONFLICT(tenant_id, id) DO UPDATE SET
          stars=excluded.stars, forks=excluded.forks, issues=excluded.issues,
          last_push=excluded.last_push, score=excluded.score,
          readme=excluded.readme, ai_analysis=excluded.ai_analysis,
          updated_at=CURRENT_TIMESTAMP
      `, [tenantId, id, owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, JSON.stringify(aiAnalysis), userId]);
      await run("INSERT INTO snapshots (tenant_id, repo_id, score, stars, issues) VALUES (?, ?, ?, ?, ?)", [tenantId, id, score, stars, issues]);
      if (!existing) await incrementMonthlyAdditions(tenantId);
      res.json({ success: true, id });
      const embedText = buildEmbedText({ name, description }, aiAnalysis || {});
      generateEmbedding(embedText).then(async emb => {
        if (emb) {
          await run("UPDATE repos SET embedding = ? WHERE tenant_id = ? AND id = ?", [JSON.stringify(emb), tenantId, id]);
          embeddingCache.set(ck(tenantId, id), emb);
        }
      }).catch(() => {});
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.get("/api/repos/:owner/:name", async (req, res) => {
    const { tenantId } = getTenant(req);
    const id = `${req.params.owner}/${req.params.name}`;
    const repo = await get("SELECT * FROM repos WHERE tenant_id = ? AND id = ?", [tenantId, id]);
    const snapshots = await all("SELECT * FROM snapshots WHERE tenant_id = ? AND repo_id = ? ORDER BY timestamp DESC LIMIT 10", [tenantId, id]);
    res.json({ ...repo, snapshots });
  });

  app.put("/api/repos/:owner/:name", async (req, res) => {
    const { tenantId } = getTenant(req);
    const id = `${req.params.owner}/${req.params.name}`;
    const { score, status, ai_analysis } = req.body;
    await run(
      "UPDATE repos SET score=?, status=?, ai_analysis=?, updated_at=CURRENT_TIMESTAMP WHERE tenant_id=? AND id=?",
      [score, status, ai_analysis, tenantId, id]
    );
    res.json({ success: true });
  });

  app.delete("/api/repos/:owner/:name", async (req, res) => {
    const { tenantId } = getTenant(req);
    const id = `${req.params.owner}/${req.params.name}`;
    await run("DELETE FROM repos WHERE tenant_id = ? AND id = ?", [tenantId, id]);
    embeddingCache.delete(ck(tenantId, id));
    res.json({ success: true });
  });

  // ── Ingest ─────────────────────────────────────────────────────────────────
  app.post("/api/ingest", async (req, res) => {
    const { tenantId, userId } = getTenant(req);
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url is required" });

    const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (!match) return res.status(400).json({ error: "Not a valid GitHub URL" });
    const [, owner, repoName] = match;

    const quota = await checkRepoQuota(tenantId);
    if (quota) return res.status(quota.status).json({ error: quota.error });

    try {
      let data: any;
      try {
        data = await fetchGitHub(`/repos/${owner}/${repoName}`);
      } catch (err: any) {
        if (err.message?.includes('404')) {
          const resolved = await resolveRepo(owner, repoName);
          if (!resolved) throw err;
          data = resolved;
        } else throw err;
      }

      const canonicalOwner = data.owner?.login ?? owner;
      const canonicalName  = data.name ?? repoName;
      const id = `${canonicalOwner}/${canonicalName}`;

      const existing = await get('SELECT id FROM repos WHERE tenant_id = ? AND id = ?', [tenantId, id]);
      if (existing) return res.status(409).json({ error: `Repo ${id} already exists in library` });

      const stars    = data.stargazers_count ?? 0;
      const forks    = data.forks_count ?? 0;
      const issues   = data.open_issues_count ?? 0;
      const language = data.language ?? null;
      const license  = data.license?.spdx_id ?? data.license?.name ?? null;
      const lastPush = data.pushed_at ?? new Date().toISOString();
      const desc     = data.description ?? '';
      const topics   = data.topics ?? [];
      const score    = computeScore(stars, forks, issues, lastPush);
      const category = inferCategory(language, topics, desc);

      let readme = null;
      try {
        const rm = await fetchGitHub(`/repos/${canonicalOwner}/${canonicalName}/readme`);
        readme = Buffer.from(rm.content, 'base64').toString('utf8').slice(0, 5000);
      } catch (_) {}

      const fallbackAnalysis = {
        category,
        tags: [language, ...topics.slice(0, 4)].filter(Boolean) as string[],
        summary: desc || id,
        useCases: topics.slice(0, 3).map((t: string) =>
          t.split('-').map((w: string) => w[0]?.toUpperCase() + w.slice(1)).join(' ')
        ).filter(Boolean),
        integrationNotes: []
      };

      const aiResult = await deepseekAnalyze(id, desc, language, topics, readme, category);
      const aiAnalysis = aiResult ?? fallbackAnalysis;

      await run(`
        INSERT INTO repos (tenant_id, id, owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, ai_analysis, source, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', ?)
        ON CONFLICT(tenant_id, id) DO UPDATE SET
          stars=excluded.stars, forks=excluded.forks, issues=excluded.issues,
          last_push=excluded.last_push, score=excluded.score,
          readme=excluded.readme, ai_analysis=excluded.ai_analysis,
          updated_at=CURRENT_TIMESTAMP
      `, [tenantId, id, canonicalOwner, canonicalName, data.html_url, stars, forks, issues, language, license, lastPush, desc, readme, score, JSON.stringify(aiAnalysis), userId]);
      await run("INSERT INTO snapshots (tenant_id, repo_id, score, stars, issues) VALUES (?, ?, ?, ?, ?)", [tenantId, id, score, stars, issues]);
      await incrementMonthlyAdditions(tenantId);

      console.log(`Ingested ${id} for ${tenantId} — score: ${score}`);
      res.json({ success: true, id, score, category });

      const embedText = buildEmbedText({ name: canonicalName, description: desc }, aiAnalysis);
      generateEmbedding(embedText).then(async emb => {
        if (emb) {
          await run("UPDATE repos SET embedding = ? WHERE tenant_id = ? AND id = ?", [JSON.stringify(emb), tenantId, id]);
          embeddingCache.set(ck(tenantId, id), emb);
          console.log(`Auto-embedded ${id}`);
        }
      }).catch(() => {});
    } catch (err: any) {
      console.error(`Ingest failed for ${owner}/${repoName}:`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Recommend ──────────────────────────────────────────────────────────────
  app.post("/api/recommend", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { brief = '', constraints, projectId } = req.body;
    const repos = await all<any>("SELECT id, owner, name, url, stars, forks, issues, language, license, last_push, description, score FROM repos WHERE tenant_id = ?", [tenantId]);

    const applyFilters = (repo: any, rawScore: number) => {
      if (constraints?.minStars && repo.stars < constraints.minStars) return 0;
      if (constraints?.language && repo.language?.toLowerCase() !== constraints.language.toLowerCase()) rawScore *= 0.6;
      return rawScore;
    };

    const saveRecommendations = async (pid: number, recs: any[]) => {
      for (const r of recs) {
        try {
          await run(`
            INSERT INTO project_recommendations (tenant_id, project_id, repo_id, fit_score, rationale, mode)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(project_id, repo_id) DO UPDATE SET
              fit_score=excluded.fit_score, rationale=excluded.rationale, mode=excluded.mode, saved_at=CURRENT_TIMESTAMP
          `, [tenantId, pid, r.repoId, r.fitScore, r.rationale, r._mode]);
        } catch {}
      }
    };

    if (embeddingCache.size > 0) {
      const queryText = await expandBrief(brief);
      const briefEmb = await generateEmbedding(queryText);
      if (briefEmb) {
        const SIM_FLOOR = 0.63;
        const rawScored = repos
          .filter(r => embeddingCache.has(ck(tenantId, r.id)))
          .map(repo => ({ repo, sim: cosineSimilarity(briefEmb, embeddingCache.get(ck(tenantId, repo.id))!) }));
        rawScored.sort((a, b) => b.sim - a.sim);
        const qualifying = rawScored.filter(r => r.sim >= SIM_FLOOR);
        const top = qualifying.slice(0, 10);
        const maxSim = rawScored[0]?.sim ?? 0;
        console.log(`Vector recommend: ${qualifying.length} above floor (top: ${Math.round(maxSim * 100)}%)`);
        if (top.length === 0) {
          if (projectId) await saveRecommendations(projectId, []);
          return res.json([]);
        }
        const calibrate = (sim: number): number => {
          if (sim >= 0.82) return Math.round(95 + ((sim - 0.82) / 0.18) * 2);
          if (sim >= 0.72) return Math.round(75 + ((sim - 0.72) / 0.10) * 19);
          if (sim >= 0.65) return Math.round(55 + ((sim - 0.65) / 0.07) * 19);
          return Math.round(45 + ((sim - 0.63) / 0.02) * 9);
        };
        const label = (sim: number) =>
          sim >= 0.82 ? 'Strongest match' : sim >= 0.72 ? 'Strong match' : sim >= 0.65 ? 'Moderate match' : 'Closest match';
        const results = top.map(({ repo, sim }) => ({
          repoId: repo.id,
          fitScore: Math.round(applyFilters(repo, calibrate(sim))),
          rationale: `${label(sim)} · ${Math.round(sim * 100)}% semantic similarity.`,
          warnings: repo.issues > 500 ? ['High open issue count'] : [],
          _mode: 'vector'
        }));
        results.sort((a, b) => b.fitScore - a.fitScore);
        if (projectId) await saveRecommendations(projectId, results);
        return res.json(results);
      }
    }

    const keywords = brief.toLowerCase().split(/\W+/).filter((w: string) => w.length > 3);
    const scored = repos.map(repo => {
      let fit = repo.score ?? 0;
      const text = [repo.id, repo.description, repo.language].join(' ').toLowerCase();
      keywords.forEach((kw: string) => { if (text.includes(kw)) fit += 8; });
      const matches = keywords.filter((k: string) => text.includes(k));
      return {
        repoId: repo.id,
        fitScore: Math.round(applyFilters(repo, Math.min(99, fit))),
        rationale: `Keyword match on: ${matches.join(', ') || 'general criteria'}.`,
        warnings: repo.issues > 500 ? ['High open issue count'] : [],
        _mode: 'keyword'
      };
    });
    scored.sort((a: any, b: any) => b.fitScore - a.fitScore);
    const kwResults = scored.slice(0, 10);
    if (projectId) await saveRecommendations(projectId, kwResults);
    res.json(kwResults);
  });

  // ── Search ─────────────────────────────────────────────────────────────────
  app.get("/api/search", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { q = '' } = req.query as Record<string, string>;
    if (!q.trim()) return res.json([]);
    const pattern = `%${q}%`;
    const repos = await all(
      `SELECT * FROM repos WHERE tenant_id = ? AND (id LIKE ? OR description LIKE ? OR language LIKE ?) ORDER BY score DESC LIMIT 30`,
      [tenantId, pattern, pattern, pattern]
    );
    res.json(repos);
  });

  // ── Projects ───────────────────────────────────────────────────────────────
  app.get("/api/projects", async (req, res) => {
    const { tenantId } = getTenant(req);
    res.json(await all("SELECT * FROM projects WHERE tenant_id = ?", [tenantId]));
  });

  app.post("/api/projects", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { name, description, constraints } = req.body;
    const result = await run("INSERT INTO projects (tenant_id, name, description, constraints) VALUES (?, ?, ?, ?)", [tenantId, name, description, JSON.stringify(constraints)]);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/projects/:id", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { name, description, constraints } = req.body;
    await run("UPDATE projects SET name=?, description=?, constraints=? WHERE id=? AND tenant_id=?", [name, description, JSON.stringify(constraints), req.params.id, tenantId]);
    res.json({ success: true });
  });

  app.delete("/api/projects/:id", async (req, res) => {
    const { tenantId } = getTenant(req);
    await run("DELETE FROM pinned_repos WHERE tenant_id=? AND project_id=?", [tenantId, req.params.id]);
    await run("DELETE FROM project_recommendations WHERE tenant_id=? AND project_id=?", [tenantId, req.params.id]);
    await run("DELETE FROM projects WHERE id=? AND tenant_id=?", [req.params.id, tenantId]);
    res.json({ success: true });
  });

  app.get("/api/projects/:id/pinned", async (req, res) => {
    const { tenantId } = getTenant(req);
    const pinned = await all(
      `SELECT r.*, p.notes FROM repos r JOIN pinned_repos p ON r.id = p.repo_id AND r.tenant_id = p.tenant_id
       WHERE p.project_id = ? AND p.tenant_id = ?`,
      [req.params.id, tenantId]
    );
    res.json(pinned);
  });

  app.post("/api/projects/:id/pin", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { repo_id, notes } = req.body;
    await run("INSERT OR REPLACE INTO pinned_repos (tenant_id, project_id, repo_id, notes) VALUES (?, ?, ?, ?)", [tenantId, req.params.id, repo_id, notes]);
    res.json({ success: true });
  });

  app.delete("/api/projects/:id/pin/:repoId(*)", async (req, res) => {
    const { tenantId } = getTenant(req);
    await run("DELETE FROM pinned_repos WHERE tenant_id=? AND project_id=? AND repo_id=?", [tenantId, req.params.id, req.params.repoId]);
    res.json({ success: true });
  });

  app.get("/api/projects/:id/recommendations", async (req, res) => {
    const { tenantId } = getTenant(req);
    const recs = await all<any>(
      "SELECT repo_id, fit_score, rationale, mode, saved_at FROM project_recommendations WHERE project_id=? AND tenant_id=? ORDER BY fit_score DESC",
      [req.params.id, tenantId]
    );
    res.json(recs.map(r => ({ repoId: r.repo_id, fitScore: r.fit_score, rationale: r.rationale, _mode: r.mode, savedAt: r.saved_at, warnings: [] })));
  });

  app.delete("/api/projects/:id/recommendations/:repoId(*)", async (req, res) => {
    const { tenantId } = getTenant(req);
    await run("DELETE FROM project_recommendations WHERE project_id=? AND repo_id=? AND tenant_id=?", [req.params.id, req.params.repoId, tenantId]);
    res.json({ success: true });
  });

  // ── Config ─────────────────────────────────────────────────────────────────
  app.get("/api/config", async (req, res) => {
    const { tenantId } = getTenant(req);
    const rows = await all("SELECT key, value FROM config WHERE tenant_id=?", [tenantId]);
    const map = rows.reduce((acc: any, row: any) => { try { acc[row.key] = JSON.parse(row.value); } catch { acc[row.key] = row.value; } return acc; }, {});
    res.json(map);
  });

  app.post("/api/config", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { key, value } = req.body;
    await run("INSERT OR REPLACE INTO config (tenant_id, key, value) VALUES (?, ?, ?)", [tenantId, key, JSON.stringify(value)]);
    res.json({ success: true });
  });

  // ── API Keys ───────────────────────────────────────────────────────────────
  app.get("/api/keys", async (req, res) => {
    const { tenantId } = getTenant(req);
    const keys = await all("SELECT id, name, key_prefix, created_at, last_used_at FROM api_keys WHERE tenant_id=?", [tenantId]);
    res.json(keys);
  });

  app.post("/api/keys", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { name } = req.body ?? {};
    const plan = await getPlan(tenantId);
    const keyCount = (await get<{ c: number }>("SELECT COUNT(*) AS c FROM api_keys WHERE tenant_id=?", [tenantId]))?.c ?? 0;
    if (keyCount >= plan.apiKeys) {
      const detail = plan.apiKeys === 0
        ? `API keys aren't available on the ${plan.name} plan — upgrade to create one.`
        : `Key limit reached — the ${plan.name} plan allows ${plan.apiKeys} key${plan.apiKeys === 1 ? "" : "s"}.`;
      return res.status(403).json({ error: detail });
    }
    const raw = "rh_" + crypto.randomBytes(24).toString("hex");
    const prefix = raw.slice(0, 10);
    await run("INSERT INTO api_keys (tenant_id, name, key_prefix, key_hash) VALUES (?, ?, ?, ?)", [tenantId, name || "API key", prefix, sha256(raw)]);
    res.json({ key: raw, key_prefix: prefix });
  });

  app.delete("/api/keys/:id", async (req, res) => {
    const { tenantId } = getTenant(req);
    await run("DELETE FROM api_keys WHERE id=? AND tenant_id=?", [req.params.id, tenantId]);
    res.json({ success: true });
  });

  // ── Subscription ───────────────────────────────────────────────────────────
  app.get("/api/subscription", async (req, res) => {
    const { tenantId } = getTenant(req);
    const plan = await getPlan(tenantId);
    const [repos, additions, keyCount] = await Promise.all([
      countUserRepos(tenantId),
      monthlyAdditions(tenantId),
      get<{ c: number }>("SELECT COUNT(*) AS c FROM api_keys WHERE tenant_id=?", [tenantId]).then(r => r?.c ?? 0),
    ]);
    res.json({
      plan: plan.id, planName: plan.name,
      limits: { repoCap: plan.repoCap, monthlyAdditions: plan.monthlyAdditions, apiKeys: plan.apiKeys, preloadedLibrary: plan.preloadedLibrary },
      usage: { repos, additionsThisMonth: additions, apiKeys: keyCount, period: currentPeriod() },
    });
  });

  app.post("/api/subscription/plan", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { plan } = req.body ?? {};
    if (!isPlanId(plan)) return res.status(400).json({ error: "Unknown plan. Expected: free, solo, or studio." });
    const { plan: limits, copied } = await applyPlan(tenantId, plan);
    if (copied > 0) { await loadEmbeddingCache(); console.log(`Plan → ${plan} for ${tenantId}; copied ${copied} library repos`); }
    res.json({ plan: limits.id, planName: limits.name, copiedFromLibrary: copied });
  });

  // ── Admin: curate preloaded library ───────────────────────────────────────
  function requireAdmin(req: express.Request, res: express.Response): boolean {
    if (isAdmin(req)) return true;
    res.status(403).json({ error: "Admin access required" });
    return false;
  }

  app.get("/api/admin/status", (req, res) => {
    res.json({ admin: isAdmin(req) });
  });

  app.get("/api/admin/library", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const repos = await all(
      `SELECT id, owner, name, url, score, language, stars, ai_analysis, (embedding IS NOT NULL) AS embedded
       FROM repos WHERE tenant_id=? ORDER BY score DESC`,
      [LIBRARY_TENANT]
    );
    res.json(repos);
  });

  app.post("/api/admin/library/promote", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { tenantId } = getTenant(req);
    const { repoId } = req.body ?? {};
    if (!repoId) return res.status(400).json({ error: "repoId is required" });
    const repo = await get<any>("SELECT * FROM repos WHERE tenant_id=? AND id=?", [tenantId, repoId]);
    if (!repo) return res.status(404).json({ error: `Repo ${repoId} not found` });
    let tier = repo.enterpriseTier ? 1 : 0;
    let comparable = repo.comparableApp ?? null;
    try { const a = JSON.parse(repo.ai_analysis ?? ""); tier = a.enterpriseTier ? 1 : 0; comparable = a.comparableApp ?? comparable; } catch {}
    await run(
      `INSERT INTO repos (tenant_id, id, owner, name, url, status, score, language, license, stars, forks, issues, last_push, description, readme, ai_analysis, enterpriseTier, comparableApp, embedding, source, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'library', ?)
       ON CONFLICT(tenant_id, id) DO UPDATE SET score=excluded.score, stars=excluded.stars, ai_analysis=excluded.ai_analysis, embedding=excluded.embedding, updated_at=CURRENT_TIMESTAMP`,
      [LIBRARY_TENANT, repo.id, repo.owner, repo.name, repo.url, repo.status, repo.score, repo.language, repo.license, repo.stars, repo.forks, repo.issues, repo.last_push, repo.description, repo.readme, repo.ai_analysis, tier, comparable, repo.embedding, repo.created_by]
    );
    if (repo.embedding) { try { embeddingCache.set(ck(LIBRARY_TENANT, repo.id), JSON.parse(repo.embedding)); } catch {} }
    res.json({ success: true, id: repo.id });
  });

  // ── Analysis sweep ─────────────────────────────────────────────────────────
  let sweepStatus = { running: false, total: 0, done: 0, failed: 0 };

  app.get("/api/sweep/status", (_req, res) => { res.json(sweepStatus); });

  app.post("/api/sweep", async (req, res) => {
    const { tenantId } = getTenant(req);
    if (sweepStatus.running) return res.json({ message: 'Sweep already running', ...sweepStatus });
    const allRepos = await all<any>("SELECT id, description, language, readme, ai_analysis FROM repos WHERE tenant_id=?", [tenantId]);
    const needsUpdate = allRepos.filter(r => { try { const a = r.ai_analysis ? JSON.parse(r.ai_analysis) : {}; return typeof a.enterpriseTier === 'undefined'; } catch { return true; } });
    sweepStatus = { running: true, total: needsUpdate.length, done: 0, failed: 0 };
    res.json({ message: `Sweep started for ${needsUpdate.length} repos`, total: needsUpdate.length });
    (async () => {
      for (const repo of needsUpdate) {
        try {
          let existing: any = {};
          try { existing = repo.ai_analysis ? JSON.parse(repo.ai_analysis) : {}; } catch {}
          const fresh = await deepseekAnalyze(repo.id, repo.description || '', repo.language, existing.tags || [], repo.readme, existing.category || 'General');
          if (fresh) {
            const merged = { ...existing, ...fresh };
            await run("UPDATE repos SET ai_analysis=? WHERE tenant_id=? AND id=?", [JSON.stringify(merged), tenantId, repo.id]);
          }
          sweepStatus.done++;
        } catch (err: any) { console.warn(`Sweep failed for ${repo.id}: ${err.message}`); sweepStatus.failed++; sweepStatus.done++; }
        await new Promise(r => setTimeout(r, 200));
      }
      sweepStatus.running = false;
    })();
  });

  // ── Embed sweep ────────────────────────────────────────────────────────────
  let embedSweepStatus = { running: false, total: 0, done: 0, failed: 0 };

  app.get("/api/embed/status", async (req, res) => {
    const { tenantId } = getTenant(req);
    const total = (await get<any>("SELECT COUNT(*) as c FROM repos WHERE tenant_id=?", [tenantId]))?.c ?? 0;
    const embedded = (await get<any>("SELECT COUNT(*) as c FROM repos WHERE tenant_id=? AND embedding IS NOT NULL", [tenantId]))?.c ?? 0;
    res.json({ ...embedSweepStatus, embedded, total });
  });

  app.post("/api/embed/sweep", async (req, res) => {
    const { tenantId } = getTenant(req);
    if (embedSweepStatus.running) return res.json({ message: 'Embed sweep already running', ...embedSweepStatus });
    const repos = await all<any>("SELECT id, name, description, ai_analysis FROM repos WHERE tenant_id=? AND embedding IS NULL", [tenantId]);
    embedSweepStatus = { running: true, total: repos.length, done: 0, failed: 0 };
    res.json({ message: `Embedding sweep started for ${repos.length} repos`, total: repos.length });
    (async () => {
      for (const repo of repos) {
        try {
          let ai: any = {};
          try { ai = repo.ai_analysis ? JSON.parse(repo.ai_analysis) : {}; } catch {}
          const emb = await generateEmbedding(buildEmbedText(repo, ai));
          if (emb) {
            await run("UPDATE repos SET embedding=? WHERE tenant_id=? AND id=?", [JSON.stringify(emb), tenantId, repo.id]);
            embeddingCache.set(ck(tenantId, repo.id), emb);
          }
          embedSweepStatus.done++;
        } catch (e: any) { embedSweepStatus.failed++; embedSweepStatus.done++; }
        await new Promise(r => setTimeout(r, 250));
      }
      embedSweepStatus.running = false;
    })();
  });

  // ── Admin stubs (design-heavy branch endpoints) ──────────────────────────
  app.get("/api/admin/stats", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const tenants = (await get<any>("SELECT COUNT(DISTINCT tenant_id) as c FROM repos"))?.c ?? 0;
    const planRows = await all("SELECT plan, COUNT(*) as c FROM subscriptions GROUP BY plan");
    const planDistribution: Record<string, number> = {};
    for (const r of planRows) planDistribution[r.plan] = r.c;
    const userRepos = (await get<any>("SELECT COUNT(*) as c FROM repos WHERE tenant_id != ?", [LIBRARY_TENANT]))?.c ?? 0;
    const libraryCopies = (await get<any>("SELECT COUNT(*) as c FROM repos WHERE tenant_id = ?", [LIBRARY_TENANT]))?.c ?? 0;
    const period = currentPeriod();
    const added = (await get<any>("SELECT COUNT(*) as c FROM usage_tracking WHERE period = ?", [period]))?.c ?? 0;
    const keys = (await get<any>("SELECT COUNT(*) as c FROM api_keys"))?.c ?? 0;
    const projects = (await get<any>("SELECT COUNT(*) as c FROM projects"))?.c ?? 0;
    res.json({ tenants, planDistribution, userRepos, libraryCopies, librarySize: libraryCopies, reposAddedThisMonth: added, apiKeys: keys, projects, period });
  });

  app.get("/api/admin/tenants", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const rows = await all(`
      SELECT tenant_id, plan, status, updated_at,
        (SELECT COUNT(*) FROM repos WHERE tenant_id = s.tenant_id AND tenant_id != ?) as user_repos,
        (SELECT COUNT(*) FROM repos WHERE tenant_id = s.tenant_id AND tenant_id = ?) as library_copies,
        (SELECT COUNT(*) FROM usage_tracking WHERE tenant_id = s.tenant_id AND period = ?) as added_this_month,
        (SELECT COUNT(*) FROM api_keys WHERE tenant_id = s.tenant_id) as api_keys
      FROM subscriptions s ORDER BY updated_at DESC
    `, [LIBRARY_TENANT, LIBRARY_TENANT, currentPeriod()]);
    res.json({ tenants: rows.map((r: any) => ({ ...r, isOrg: false })) });
  });

  app.post("/api/admin/rescan", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { limit = '150' } = req.query;
    res.json({ message: 'Rescan queued', updated: 0, archived: 0, errors: 0, processed: parseInt(limit as string) });
  });

  app.get("/api/admin/costs", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ calls: [], total: 0, budget: 0, alerts: [], period: currentPeriod() });
  });

  app.post("/api/admin/costs/budget", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true });
  });

  app.get("/api/admin/reclassify/status", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ needsReclass: 0, total: 0, done: 0, failed: 0, running: false });
  });

  app.post("/api/admin/reclassify", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true, processed: 0 });
  });

  app.get("/api/admin/seo/pages", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ pages: [] });
  });

  app.post("/api/admin/seo/pages", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true });
  });

  app.delete("/api/admin/seo/pages", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true });
  });

  app.get("/api/admin/seo/settings", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({});
  });

  app.post("/api/admin/seo/settings", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true });
  });

  app.post("/api/admin/seo/audit", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ issues: [], score: 0, suggestions: [] });
  });

  app.post("/api/admin/seo/apply", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true });
  });

  app.get("/api/admin/blog", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ posts: [], drafts: [] });
  });

  app.get("/api/admin/blog/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ post: null });
  });

  app.post("/api/admin/blog", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true, id: crypto.randomUUID() });
  });

  app.delete("/api/admin/blog/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true });
  });

  app.post("/api/admin/blog/draft", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true });
  });

  app.get("/api/admin/blog/promo/suggest", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ suggestions: [] });
  });

  app.post("/api/admin/blog/promo", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true });
  });

  app.get("/api/admin/harbor/status", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ status: 'ready', queue: 0 });
  });

  app.post("/api/admin/harbor/pull", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ pulled: 0 });
  });

  app.get("/api/admin/integrations", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ integrations: [] });
  });

  app.get("/api/admin/integrations/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ integration: null });
  });

  app.post("/api/admin/integrations", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true, id: crypto.randomUUID() });
  });

  app.delete("/api/admin/integrations/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true });
  });

  app.post("/api/admin/integrations/:id/fetch-logo", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true, url: null });
  });

  app.post("/api/admin/integrations/seed", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ seeded: 0 });
  });

  app.post("/api/admin/tenants/:tenantId/plan", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    res.json({ success: true });
  });

  app.delete("/api/admin/library/:repoId(*)", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    await run("DELETE FROM repos WHERE tenant_id=? AND id=?", [LIBRARY_TENANT, req.params.repoId]);
    res.json({ success: true });
  });

  // ── External API (API-key auth) ────────────────────────────────────────────
  app.get("/api/external/repos", async (req, res) => {
    const { q, minScore, limit = '20', apiKey } = req.query as Record<string, string>;
    if (!apiKey) return res.status(401).json({ error: "API key required" });
    const keyHash = sha256(apiKey);
    const keyRow = await get<any>("SELECT tenant_id FROM api_keys WHERE key_hash=?", [keyHash]);
    if (!keyRow) return res.status(401).json({ error: "Invalid API key" });
    await run("UPDATE api_keys SET last_used_at=CURRENT_TIMESTAMP WHERE key_hash=?", [keyHash]);
    const tenantId = keyRow.tenant_id;
    let sql = "SELECT id, owner, name, url, score, language, stars, description, ai_analysis FROM repos WHERE tenant_id=?";
    const params: any[] = [tenantId];
    if (q) { sql += " AND (name LIKE ? OR description LIKE ?)"; const p = `%${q}%`; params.push(p, p); }
    if (minScore) { sql += " AND score >= ?"; params.push(parseInt(minScore)); }
    sql += " ORDER BY score DESC LIMIT ?";
    params.push(parseInt(limit));
    const repos = await all(sql, params);
    res.json({ count: repos.length, repos: repos.map((r: any) => ({ ...r, ai_analysis: r.ai_analysis ? JSON.parse(r.ai_analysis) : null })) });
  });

  return app;
}
