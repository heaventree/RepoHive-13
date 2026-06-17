// Shared API factory used by both the local dev server (server.ts) and the
// Netlify Function (netlify/functions/api.ts). Owns all /api/* routes and
// runs schema + embedding-cache init exactly once on the first request.

import "dotenv/config";
import express from "express";
import crypto from "crypto";
import Stripe from "stripe";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { all, get, run, execScript } from "./db";
import { planFor, isPlanId, DEFAULT_PLAN, type PlanLimits } from "./tiers";
import { rescanOldestRepos } from "./lib/rescan";
import { buildAnalysisPrompt, analyzeRepo } from "./lib/analyze";
import { reclassifyBatch, reclassifyStats, reclassifyDistribution, reclassifyTenantBreakdown } from "./lib/reclassify";
import { pullCompletedArticles, getAccount as harborGetAccount, HarborError, type HarborJob } from "./lib/harbor";

// When CLERK_SECRET_KEY is absent we run with auth disabled and scope all data
// to a single dev tenant — keeps the app runnable offline / in CI / sandboxes.
const AUTH_ENABLED = Boolean(process.env.CLERK_SECRET_KEY);
const DEV_TENANT = "dev-tenant";
const DEV_USER = "dev-user";

// Preloaded "App Killers" repos live under this reserved tenant with
// source='library'. On upgrade to a plan with preloadedLibrary=true they are
// copied into the subscriber's own library (see copyLibraryToTenant).
const LIBRARY_TENANT = "__library__";

// Resolve the calling tenant. tenant_id is the Clerk org (Studio teams) when an
// org is active, otherwise the user id (personal Free/Solo accounts).
function getTenant(req: express.Request): { tenantId: string; userId: string } {
  if (!AUTH_ENABLED) return { tenantId: DEV_TENANT, userId: DEV_USER };
  const { userId, orgId } = getAuth(req);
  return { tenantId: (orgId ?? userId) as string, userId: userId as string };
}

// Admins may curate the preloaded library. Identified by Clerk user id via the
// ADMIN_USER_IDS env var (comma-separated). With auth disabled (dev) the single
// dev tenant is treated as admin so the feature is exercisable locally.
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",").map((s) => s.trim()).filter(Boolean);

function isAdmin(req: express.Request): boolean {
  if (!AUTH_ENABLED) return true;
  const { userId } = getAuth(req);
  return !!userId && ADMIN_USER_IDS.includes(userId);
}

// Composite cache key — repo ids ("owner/name") are only unique within a tenant.
const ck = (tenantId: string, id: string) => `${tenantId}::${id}`;

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

// ── Plans, usage & limits ─────────────────────────────────────────────────────
// Calendar-month bucket used to track monthly additions, e.g. "2026-05".
function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

// Return the tenant's plan limits, creating a default (free) subscription row
// the first time we see a tenant so every tenant always has a concrete plan.
async function getPlan(tenantId: string): Promise<PlanLimits> {
  const row = await get<{ plan: string }>(
    "SELECT plan FROM subscriptions WHERE tenant_id = ?",
    [tenantId],
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

// User-added repos count against the cap; preloaded library repos do not.
async function countUserRepos(tenantId: string): Promise<number> {
  const row = await get<{ c: number }>(
    "SELECT COUNT(*) AS c FROM repos WHERE tenant_id = ? AND source = 'user'",
    [tenantId],
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

// Decide whether a tenant may add one more user repo. Returns null when allowed,
// otherwise an { status, error } pair the route can return directly.
async function checkRepoQuota(
  tenantId: string,
): Promise<{ status: number; error: string } | null> {
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

// Copy the preloaded App Killers library into a tenant's own library. Idempotent
// — existing rows are left untouched, and copied repos keep source='library' so
// they don't count against the tenant's cap. Returns the number newly inserted.
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

// Apply a plan change to a tenant: persist the plan and, when the new plan
// includes the preloaded library, copy it in. This is the seam a Stripe webhook
// will call once billing lands; for now the dev plan-switch endpoint calls it.
async function applyPlan(
  tenantId: string,
  plan: string,
): Promise<{ plan: PlanLimits; copied: number }> {
  await run(
    `INSERT INTO subscriptions (tenant_id, plan, status, updated_at)
     VALUES (?, ?, 'active', CURRENT_TIMESTAMP)
     ON CONFLICT(tenant_id) DO UPDATE SET
       plan = excluded.plan,
       status = 'active',
       updated_at = CURRENT_TIMESTAMP`,
    [tenantId, plan],
  );
  const limits = planFor(plan);
  let copied = 0;
  if (limits.preloadedLibrary) copied = await copyLibraryToTenant(tenantId);
  return { plan: limits, copied };
}

// ── Stripe billing ───────────────────────────────────────────────────────────
// All Stripe wiring is optional: when STRIPE_SECRET_KEY is unset the billing
// routes respond 503 and the rest of the app is unaffected.
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (!stripeClient) stripeClient = new Stripe(key);
  return stripeClient;
}

// Stripe Price IDs for each paid plan/interval, configured in the Stripe
// dashboard and supplied via env. priceToPlan() inverts the mapping so webhook
// events can resolve which plan a subscription corresponds to.
function priceIdFor(plan: string, interval: string): string | undefined {
  const table: Record<string, string | undefined> = {
    "solo:monthly":   process.env.STRIPE_PRICE_SOLO_MONTHLY,
    "solo:annual":    process.env.STRIPE_PRICE_SOLO_ANNUAL,
    "studio:monthly": process.env.STRIPE_PRICE_STUDIO_MONTHLY,
    "studio:annual":  process.env.STRIPE_PRICE_STUDIO_ANNUAL,
  };
  return table[`${plan}:${interval}`]?.trim() || undefined;
}

function priceToPlan(priceId: string): string | null {
  for (const plan of ["solo", "studio"]) {
    for (const interval of ["monthly", "annual"]) {
      if (priceIdFor(plan, interval) === priceId) return plan;
    }
  }
  return null;
}

async function recordStripeIds(tenantId: string, customerId?: string | null, subscriptionId?: string | null) {
  await run(
    `INSERT INTO subscriptions (tenant_id, plan, status, stripe_customer_id, stripe_subscription_id)
     VALUES (?, ?, 'active', ?, ?)
     ON CONFLICT(tenant_id) DO UPDATE SET
       stripe_customer_id = COALESCE(excluded.stripe_customer_id, stripe_customer_id),
       stripe_subscription_id = COALESCE(excluded.stripe_subscription_id, stripe_subscription_id),
       updated_at = CURRENT_TIMESTAMP`,
    [tenantId, DEFAULT_PLAN, customerId ?? null, subscriptionId ?? null],
  );
}

async function tenantForStripeEvent(opts: { metadataTenant?: string | null; customerId?: string | null; subscriptionId?: string | null }): Promise<string | null> {
  if (opts.metadataTenant) return opts.metadataTenant;
  if (opts.subscriptionId) {
    const row = await get<{ tenant_id: string }>(
      "SELECT tenant_id FROM subscriptions WHERE stripe_subscription_id = ?", [opts.subscriptionId]);
    if (row) return row.tenant_id;
  }
  if (opts.customerId) {
    const row = await get<{ tenant_id: string }>(
      "SELECT tenant_id FROM subscriptions WHERE stripe_customer_id = ?", [opts.customerId]);
    if (row) return row.tenant_id;
  }
  return null;
}

// ── Schema ───────────────────────────────────────────────────────────────────
async function initSchema() {
  await execScript(`
    CREATE TABLE IF NOT EXISTS repos (
      tenant_id TEXT NOT NULL,
      id TEXT NOT NULL,
      owner TEXT,
      name TEXT,
      url TEXT,
      status TEXT DEFAULT 'ACTIVE',
      score INTEGER DEFAULT 0,
      language TEXT,
      license TEXT,
      stars INTEGER DEFAULT 0,
      forks INTEGER DEFAULT 0,
      issues INTEGER DEFAULT 0,
      last_push TEXT,
      description TEXT,
      readme TEXT,
      ai_analysis TEXT,
      enterpriseTier INTEGER DEFAULT 0,
      comparableApp TEXT,
      embedding TEXT,
      source TEXT DEFAULT 'user',
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (tenant_id, id)
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      repo_id TEXT NOT NULL,
      score INTEGER,
      stars INTEGER,
      issues INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      name TEXT,
      description TEXT,
      constraints TEXT,
      is_public INTEGER DEFAULT 0,
      public_slug TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pinned_repos (
      tenant_id TEXT NOT NULL,
      project_id INTEGER,
      repo_id TEXT,
      notes TEXT,
      PRIMARY KEY (tenant_id, project_id, repo_id)
    );

    CREATE TABLE IF NOT EXISTS project_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      repo_id TEXT NOT NULL,
      fit_score INTEGER,
      rationale TEXT,
      mode TEXT,
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
      name TEXT,
      key_prefix TEXT,
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

    CREATE TABLE IF NOT EXISTS ai_usage_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      operation TEXT NOT NULL,
      tenant_id TEXT,
      input_units INTEGER DEFAULT 0,
      output_units INTEGER DEFAULT 0,
      cost_usd REAL DEFAULT 0,
      ok INTEGER DEFAULT 1,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cost_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seo_pages (
      path TEXT PRIMARY KEY,
      label TEXT,
      title TEXT,
      description TEXT,
      og_image TEXT,
      keywords TEXT,
      noindex INTEGER DEFAULT 0,
      ai_score INTEGER,
      ai_suggestions TEXT,
      last_audited_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS seo_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      body_md TEXT,
      og_image TEXT,
      seo_title TEXT,
      seo_description TEXT,
      tags TEXT,
      author TEXT,
      status TEXT DEFAULT 'draft',
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// ── Schema migrations ────────────────────────────────────────────────────────
// Columns added after initial deploy. Safe to run on every boot — libSQL
// returns an error for duplicate columns which we intentionally ignore.
async function runMigrations() {
  const migrations = [
    // Phase 2: shareable projects
    "ALTER TABLE projects ADD COLUMN is_public INTEGER DEFAULT 0",
    "ALTER TABLE projects ADD COLUMN public_slug TEXT",
    // Phase 3: split blog content into Harbor-sourced imports vs internal
    // promo articles vs manually-written ones. format lets us store Harbor's
    // HTML alongside our markdown posts; harbor_job_id dedupes imports;
    // featured_repo_id links a promo article to the repo it features so we
    // never feature the same repo twice.
    "ALTER TABLE blog_posts ADD COLUMN source TEXT DEFAULT 'manual'",
    "ALTER TABLE blog_posts ADD COLUMN format TEXT DEFAULT 'md'",
    "ALTER TABLE blog_posts ADD COLUMN body_html TEXT",
    "ALTER TABLE blog_posts ADD COLUMN harbor_job_id TEXT",
    "ALTER TABLE blog_posts ADD COLUMN featured_repo_id TEXT",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_harbor_job_id ON blog_posts(harbor_job_id) WHERE harbor_job_id IS NOT NULL",
  ];
  for (const sql of migrations) {
    try { await run(sql); } catch { /* column already exists — ok */ }
  }
}

// ── AI cost tracking ─────────────────────────────────────────────────────────
// Approximate prices (USD) as of mid-2025 — update via COST_CONFIG overrides.
const PRICE_TABLE: Record<string, { input: number; output: number; unit: string }> = {
  // DeepSeek Chat: $0.14/M input, $0.28/M output tokens
  'deepseek:deepseek-chat':      { input: 0.14 / 1_000_000, output: 0.28 / 1_000_000, unit: 'tokens' },
  // Gemini Embedding 001: $0.00025/1K tokens (in = out same price)
  'gemini:gemini-embedding-001': { input: 0.00025 / 1_000,  output: 0,                unit: 'tokens' },
  // GitHub API: free — tracked for rate-limit visibility only
  'github:rest':                 { input: 0, output: 0, unit: 'requests' },
};

function calcCost(providerModel: string, inputUnits: number, outputUnits: number): number {
  const p = PRICE_TABLE[providerModel];
  if (!p) return 0;
  return p.input * inputUnits + p.output * outputUnits;
}

// Fire-and-forget: never let tracking errors bubble up to callers.
async function trackUsage(opts: {
  provider: string; model: string; operation: string; tenantId?: string;
  inputUnits: number; outputUnits?: number; ok?: boolean;
}): Promise<void> {
  try {
    const { provider, model, operation, tenantId, inputUnits, outputUnits = 0, ok = true } = opts;
    const cost = calcCost(`${provider}:${model}`, inputUnits, outputUnits);
    await run(
      `INSERT INTO ai_usage_events (provider, model, operation, tenant_id, input_units, output_units, cost_usd, ok)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [provider, model, operation, tenantId ?? null, inputUnits, outputUnits, cost, ok ? 1 : 0],
    );
  } catch { /* tracking must never break the caller */ }
}

// ── Vector helpers ──────────────────────────────────────────────────────────
const embeddingCache = new Map<string, number[]>();

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

async function generateEmbedding(text: string, tenantId?: string): Promise<number[] | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const truncated = text.slice(0, 4000);
  const inputTokens = Math.ceil(truncated.length / 4);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'models/gemini-embedding-001', content: { parts: [{ text: truncated }] } })
      }
    );
    const data = await res.json();
    const values = data.embedding?.values ?? null;
    trackUsage({ provider: 'gemini', model: 'gemini-embedding-001', operation: 'embed', tenantId, inputUnits: inputTokens, ok: values !== null });
    return values;
  } catch {
    trackUsage({ provider: 'gemini', model: 'gemini-embedding-001', operation: 'embed', tenantId, inputUnits: inputTokens, ok: false });
    return null;
  }
}

// Expand a short brief into a richer description so the embedding
// captures synonyms and related concepts (e.g. "CRM" → full feature list).
async function expandBrief(brief: string, tenantId?: string): Promise<string> {
  const words = brief.trim().split(/\s+/).length;
  if (words > 20) return brief; // already detailed enough
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return brief;
  const prompt = `Expand this software project description into 3-4 sentences covering what it does, its key features, typical use cases, and related technical concepts. Be specific and use relevant technical terminology. Project: "${brief}"`;
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.2
      })
    });
    const data = await res.json();
    const inputTokens  = data.usage?.prompt_tokens     ?? Math.ceil(prompt.length / 4);
    const outputTokens = data.usage?.completion_tokens ?? 0;
    const expanded = data.choices?.[0]?.message?.content?.trim();
    trackUsage({ provider: 'deepseek', model: 'deepseek-chat', operation: 'expand-brief', tenantId, inputUnits: inputTokens, outputUnits: outputTokens, ok: !!expanded });
    return expanded ? `${brief}\n\n${expanded}` : brief;
  } catch {
    trackUsage({ provider: 'deepseek', model: 'deepseek-chat', operation: 'expand-brief', tenantId, inputUnits: Math.ceil(prompt.length / 4), ok: false });
    return brief;
  }
}

function buildEmbedText(repo: any, ai: any = {}): string {
  return [repo.name, repo.description, ai.summary, (ai.tags || []).join(' '), ai.category].filter(Boolean).join(' ');
}

async function loadEmbeddingCache() {
  // Exclude the master library tenant — its embeddings are duplicated into each
  // subscriber's tenant on upgrade, so loading them here would double the memory
  // for no benefit (searches run against the per-tenant copy, not __library__).
  const rows = await all<any>(
    "SELECT tenant_id, id, embedding FROM repos WHERE embedding IS NOT NULL AND tenant_id != ?",
    [LIBRARY_TENANT],
  );
  embeddingCache.clear();
  for (const row of rows) {
    try { embeddingCache.set(ck(row.tenant_id, row.id), JSON.parse(row.embedding)); } catch {}
  }
  console.log(`Vector cache: ${embeddingCache.size} embeddings loaded`);
}
// ────────────────────────────────────────────────────────────────────────────

// One-shot init guard. On a long-lived dev server this runs once at boot; on a
// serverless cold-start it runs on the first request and is reused thereafter.
let initPromise: Promise<void> | null = null;
function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await initSchema();
      await runMigrations();
      await loadEmbeddingCache();
    })().catch((err) => {
      initPromise = null; // let the next request retry
      throw err;
    });
  }
  return initPromise;
}

export function createApiApp(): express.Express {
  const app = express();
  // Keep the raw request bytes alongside the parsed JSON — Stripe webhook
  // signatures are computed over the exact raw body.
  app.use(express.json({
    verify: (req, _res, buf) => { (req as any).rawBody = buf; },
  }));

  // Run schema + cache init exactly once on the first request. Surface init
  // failures as a JSON 500 with the error message — without this the function
  // would crash and Netlify would return an opaque 502.
  app.use(async (_req, res, next) => {
    try {
      await ensureInit();
      next();
    } catch (err: any) {
      console.error("[init] schema/cache initialization failed:", err);
      res.status(500).json({
        error: "Server initialization failed.",
        detail: err?.message ?? String(err),
      });
    }
  });

  // Verify the Clerk session on every request (when configured). The Express
  // middleware needs the publishable key as well as the secret; environments
  // often only define the VITE_-prefixed variant (for the frontend build), so
  // fall back to it rather than crashing every request with a 500.
  if (AUTH_ENABLED) {
    app.use(clerkMiddleware({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
    }));
    // Gate the internal API. /api/external/* authenticates with an API key and
    // /api/stripe/webhook authenticates with a Stripe signature, so they are
    // allowed through here.
    app.use("/api", (req, res, next) => {
      if (req.path.startsWith("/external")) return next();
      if (req.path === "/stripe/webhook") return next();
      if (req.path.startsWith("/p/")) return next(); // public shareable projects
      if (req.path === "/seo/settings") return next(); // public — SPA SEO metadata
      if (req.path === "/blog" || req.path.startsWith("/blog/")) return next(); // public blog
      const { userId } = getAuth(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      next();
    });
  } else {
    console.warn("[auth] CLERK_SECRET_KEY not set — API running with auth disabled (single dev tenant).");
  }

  // --- Ingest helpers ---
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

  async function fetchGitHub(path: string, tenantId?: string) {
    const headers: Record<string, string> = { 'User-Agent': 'RepoHive/2' };
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com${path}`, { headers });
    trackUsage({ provider: 'github', model: 'rest', operation: path.split('?')[0].replace(/\/[^/]+$/g, '/:id'), tenantId, inputUnits: 1, ok: res.ok });
    if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`);
    return res.json() as Promise<any>;
  }

  // Resolve a truncated repo name by searching GitHub for owner + partial name
  async function resolveRepo(owner: string, partial: string): Promise<any | null> {
    try {
      const headers: Record<string, string> = { 'User-Agent': 'RepoHive/2' };
      if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      const q = encodeURIComponent(`user:${owner} ${partial} in:name`);
      const res = await fetch(`https://api.github.com/search/repositories?q=${q}&per_page=1&sort=stars`, { headers });
      if (!res.ok) return null;
      const data: any = await res.json();
      const hit = data.items?.[0];
      // Only accept if owner matches and repo name starts with the partial string
      if (hit && hit.owner?.login?.toLowerCase() === owner.toLowerCase()
               && hit.name?.toLowerCase().startsWith(partial.toLowerCase())) {
        return hit;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function deepseekAnalyze(id: string, description: string, language: string | null, topics: string[], readme: string | null, fallbackCategory: string, tenantId?: string): Promise<any> {
    if (!process.env.DEEPSEEK_API_KEY) return null;
    const promptLen = buildAnalysisPrompt(id, description, language, topics, readme).length;

    try {
      const { parsed, inputTokens, outputTokens } = await analyzeRepo(id, description, language, topics, readme);
      trackUsage({ provider: 'deepseek', model: 'deepseek-chat', operation: 'analyze-repo', tenantId, inputUnits: inputTokens, outputUnits: outputTokens, ok: !!parsed });
      if (!parsed) return null;
      console.log(`DeepSeek analyzed ${id} → ${parsed.category}`);
      return parsed;
    } catch (err: any) {
      console.warn(`DeepSeek analysis failed for ${id}: ${err.message}`);
      trackUsage({ provider: 'deepseek', model: 'deepseek-chat', operation: 'analyze-repo', tenantId, inputUnits: Math.ceil(promptLen / 4), ok: false });
      return null;
    }
  }

  // POST /api/ingest
  app.post("/api/ingest", async (req, res) => {
    const { tenantId, userId } = getTenant(req);
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url is required" });

    const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (!match) return res.status(400).json({ error: "Not a valid GitHub URL" });
    const [, owner, repoName] = match;

    // Ingest only ever adds a new repo (duplicates 409 below), so enforce the
    // plan quota up front — before spending GitHub / AI calls on it.
    const quota = await checkRepoQuota(tenantId);
    if (quota) return res.status(quota.status).json({ error: quota.error });

    try {
      let data: any;
      try {
        data = await fetchGitHub(`/repos/${owner}/${repoName}`, tenantId);
      } catch (err: any) {
        if (err.message?.includes('404')) {
          // Repo name may be truncated — try GitHub search to resolve it
          const resolved = await resolveRepo(owner, repoName);
          if (!resolved) throw err; // still fail if nothing found
          console.log(`Resolved truncated "${owner}/${repoName}" → "${resolved.full_name}"`);
          data = resolved;
        } else {
          throw err;
        }
      }

      // Always use GitHub's canonical casing to avoid duplicates
      const canonicalOwner = data.owner?.login ?? owner;
      const canonicalName  = data.name ?? repoName;
      const id = `${canonicalOwner}/${canonicalName}`;

      // Check for duplicates within this tenant
      const existing = await get('SELECT id FROM repos WHERE tenant_id = ? AND id = ?', [tenantId, id]);
      if (existing) return res.status(409).json({ error: `Repo ${id} already exists in library` });

      const stars     = data.stargazers_count ?? 0;
      const forks     = data.forks_count ?? 0;
      const issues    = data.open_issues_count ?? 0;
      const language  = data.language ?? null;
      const license   = data.license?.spdx_id ?? data.license?.name ?? null;
      const lastPush  = data.pushed_at ?? new Date().toISOString();
      const desc      = data.description ?? '';
      const topics    = data.topics ?? [];
      const score     = computeScore(stars, forks, issues, lastPush);
      const category  = inferCategory(language, topics, desc);

      let readme = null;
      try {
        const rm = await fetchGitHub(`/repos/${canonicalOwner}/${canonicalName}/readme`, tenantId);
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

      const aiResult = await deepseekAnalyze(id, desc, language, topics, readme, category, tenantId);
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

      console.log(`Ingested ${id} for ${tenantId} — score: ${score}, category: ${category}`);
      res.json({ success: true, id, score, category });

      // Auto-embed after ingest — don't block the response
      const embedText = buildEmbedText({ name: canonicalName, description: desc }, aiAnalysis);
      generateEmbedding(embedText, tenantId).then(async emb => {
        if (emb) {
          await run("UPDATE repos SET embedding = ? WHERE tenant_id = ? AND id = ?", [JSON.stringify(emb), tenantId, id]);
          embeddingCache.set(ck(tenantId, id), emb);
          console.log(`Auto-embedded ${id} (cache: ${embeddingCache.size})`);
        }
      }).catch(() => {});
    } catch (err: any) {
      console.error(`Ingest failed for ${owner}/${repoName}:`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/recommend — vector search with keyword fallback
  app.post("/api/recommend", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { brief = '', constraints, projectId } = req.body;
    const repos = await all<any>("SELECT id, owner, name, url, stars, forks, issues, language, license, last_push, description, score FROM repos WHERE tenant_id = ?", [tenantId]);

    const applyFilters = (repo: any, rawScore: number) => {
      if (constraints?.minStars && repo.stars < constraints.minStars) return 0;
      if (constraints?.language && repo.language?.toLowerCase() !== constraints.language.toLowerCase()) rawScore *= 0.6;
      return rawScore;
    };

    // ── Vector path ──────────────────────────────────────────────────────────
    if (embeddingCache.size > 0) {
      // Expand short briefs so "CRM" becomes a full feature description
      const queryText = await expandBrief(brief, tenantId);
      const briefEmb = await generateEmbedding(queryText, tenantId);
      if (briefEmb) {
        // Compute raw cosine similarities for all repos with embeddings
        const rawScored = repos
          .filter(r => embeddingCache.has(ck(tenantId, r.id)))
          .map(repo => ({
            repo,
            sim: cosineSimilarity(briefEmb, embeddingCache.get(ck(tenantId, repo.id))!)
          }));

        // Hard minimum: exclude repos below this similarity floor entirely.
        // Observed for gemini-embedding-001: unrelated content scores ~0.55–0.62,
        // genuinely relevant content scores 0.65+. The 0.63 cutoff sits cleanly
        // in the gap, so irrelevant results simply don't appear.
        const SIM_FLOOR = 0.63;

        rawScored.sort((a, b) => b.sim - a.sim);
        const qualifying = rawScored.filter(r => r.sim >= SIM_FLOOR);
        const top = qualifying.slice(0, 10);
        const maxSim = rawScored[0]?.sim ?? 0;

        console.log(`Vector recommend: ${qualifying.length} repos above floor (top sim: ${Math.round(maxSim * 100)}%, expanded: ${queryText.length > brief.length})`);

        // If nothing passes the floor, return an empty array — the frontend will
        // tell the user their library lacks relevant repos for this topic.
        if (top.length === 0) {
          if (projectId) await saveRecommendations(tenantId, projectId, []);
          return res.json([]);
        }

        // Calibrate using absolute thresholds for gemini-embedding-001.
        //   sim ≥ 0.82 → 95–97  (exceptional)
        //   sim ≥ 0.72 → 75–94  (strong)
        //   sim ≥ 0.65 → 55–74  (moderate)
        //   sim ≥ 0.63 → 45–54  (low but above floor)
        const calibrate = (sim: number): number => {
          if (sim >= 0.82) return Math.round(95 + ((sim - 0.82) / 0.18) * 2);
          if (sim >= 0.72) return Math.round(75 + ((sim - 0.72) / 0.10) * 19);
          if (sim >= 0.65) return Math.round(55 + ((sim - 0.65) / 0.07) * 19);
          return Math.round(45 + ((sim - 0.63) / 0.02) * 9);  // 45–53
        };

        const label = (sim: number) =>
          sim >= 0.82 ? 'Strongest match' : sim >= 0.72 ? 'Strong match' : sim >= 0.65 ? 'Moderate match' : 'Closest match';

        const results = top.map(({ repo, sim }) => {
          const baseScore = calibrate(sim);
          const fitScore = Math.round(applyFilters(repo, baseScore));
          const pct = Math.round(sim * 100);
          return {
            repoId: repo.id,
            fitScore,
            rationale: `${label(sim)} · ${pct}% semantic similarity to your project brief.`,
            warnings: repo.issues > 500 ? ['High open issue count'] : [],
            _mode: 'vector'
          };
        });

        results.sort((a, b) => b.fitScore - a.fitScore);
        if (projectId) await saveRecommendations(tenantId, projectId, results);
        return res.json(results);
      }
    }

    // ── Keyword fallback ─────────────────────────────────────────────────────
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
    if (projectId) await saveRecommendations(tenantId, projectId, kwResults);
    res.json(kwResults);
  });

  async function saveRecommendations(tenantId: string, projectId: number, recs: any[]) {
    for (const r of recs) {
      try {
        await run(`
          INSERT INTO project_recommendations (tenant_id, project_id, repo_id, fit_score, rationale, mode)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(project_id, repo_id) DO UPDATE SET
            fit_score=excluded.fit_score,
            rationale=excluded.rationale,
            mode=excluded.mode,
            saved_at=CURRENT_TIMESTAMP
        `, [tenantId, projectId, r.repoId, r.fitScore, r.rationale, r._mode]);
      } catch {}
    }
  }

  // API Routes
  app.get("/api/repos", async (req, res) => {
    const { tenantId } = getTenant(req);
    // Exclude heavy columns (readme, embedding) from list — they are only needed
    // on the detail view and can easily push 500+ repos past Netlify's 6 MB limit.
    const repos = await all(
      `SELECT tenant_id, id, owner, name, url, status, score, language, license,
              stars, forks, issues, last_push, description, ai_analysis,
              enterpriseTier, comparableApp, source, created_by, created_at, updated_at
       FROM repos WHERE tenant_id = ? ORDER BY score DESC`,
      [tenantId],
    );
    console.log(`Fetching repos for ${tenantId}: found ${repos.length} records`);
    res.json(repos);
  });

  app.post("/api/repos", async (req, res) => {
    const { tenantId, userId } = getTenant(req);
    const { owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, aiAnalysis } = req.body;
    const id = `${owner}/${name}`;
    console.log(`Attempting to save repo: ${id} for ${tenantId}`);

    try {
      // This route upserts, so only a brand-new repo consumes quota. Updates to
      // an existing repo (re-analysis, refreshed stars) are always allowed.
      const existing = await get("SELECT 1 FROM repos WHERE tenant_id = ? AND id = ?", [tenantId, id]);
      if (!existing) {
        const quota = await checkRepoQuota(tenantId);
        if (quota) return res.status(quota.status).json({ error: quota.error });
      }

      await run(`
        INSERT INTO repos (tenant_id, id, owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, ai_analysis, source, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', ?)
        ON CONFLICT(tenant_id, id) DO UPDATE SET
          stars=excluded.stars,
          forks=excluded.forks,
          issues=excluded.issues,
          last_push=excluded.last_push,
          score=excluded.score,
          readme=excluded.readme,
          ai_analysis=excluded.ai_analysis,
          updated_at=CURRENT_TIMESTAMP
      `, [tenantId, id, owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, JSON.stringify(aiAnalysis), userId]);

      // Create snapshot
      await run("INSERT INTO snapshots (tenant_id, repo_id, score, stars, issues) VALUES (?, ?, ?, ?, ?)", [tenantId, id, score, stars, issues]);
      if (!existing) await incrementMonthlyAdditions(tenantId);

      res.json({ success: true, id });

      // Generate embedding asynchronously (don't block the response)
      const embedText = buildEmbedText({ name, description }, aiAnalysis || {});
      generateEmbedding(embedText).then(async emb => {
        if (emb) {
          await run("UPDATE repos SET embedding = ? WHERE tenant_id = ? AND id = ?", [JSON.stringify(emb), tenantId, id]);
          embeddingCache.set(ck(tenantId, id), emb);
        }
      }).catch(() => {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/repos/:owner/:name", async (req, res) => {
    const { tenantId } = getTenant(req);
    const id = `${req.params.owner}/${req.params.name}`;
    const repo = await get("SELECT * FROM repos WHERE tenant_id = ? AND id = ?", [tenantId, id]);
    const snapshots = await all("SELECT * FROM snapshots WHERE tenant_id = ? AND repo_id = ? ORDER BY timestamp DESC LIMIT 10", [tenantId, id]);
    res.json({ ...repo, snapshots });
  });

  app.get("/api/projects", async (req, res) => {
    const { tenantId } = getTenant(req);
    const projects = await all("SELECT * FROM projects WHERE tenant_id = ?", [tenantId]);
    res.json(projects);
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
    await run("UPDATE projects SET name = ?, description = ?, constraints = ? WHERE id = ? AND tenant_id = ?", [name, description, JSON.stringify(constraints), req.params.id, tenantId]);
    res.json({ success: true });
  });

  app.get("/api/projects/:id/pinned", async (req, res) => {
    const { tenantId } = getTenant(req);
    const pinned = await all(`
      SELECT r.*, p.notes
      FROM repos r
      JOIN pinned_repos p ON r.tenant_id = p.tenant_id AND r.id = p.repo_id
      WHERE p.project_id = ? AND p.tenant_id = ?
    `, [req.params.id, tenantId]);
    res.json(pinned);
  });

  app.post("/api/projects/:id/pin", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { repo_id, notes } = req.body;
    await run("INSERT OR REPLACE INTO pinned_repos (tenant_id, project_id, repo_id, notes) VALUES (?, ?, ?, ?)", [tenantId, req.params.id, repo_id, notes]);
    res.json({ success: true });
  });

  app.get("/api/projects/:id/recommendations", async (req, res) => {
    const { tenantId } = getTenant(req);
    const recs = await all<any>(`
      SELECT pr.repo_id, pr.fit_score, pr.rationale, pr.mode, pr.saved_at
      FROM project_recommendations pr
      WHERE pr.project_id = ? AND pr.tenant_id = ?
      ORDER BY pr.fit_score DESC
    `, [req.params.id, tenantId]);
    res.json(recs.map(r => ({
      repoId: r.repo_id,
      fitScore: r.fit_score,
      rationale: r.rationale,
      _mode: r.mode,
      savedAt: r.saved_at,
      warnings: []
    })));
  });

  app.delete("/api/projects/:id/recommendations/:repoId(*)", async (req, res) => {
    const { tenantId } = getTenant(req);
    await run("DELETE FROM project_recommendations WHERE project_id = ? AND repo_id = ? AND tenant_id = ?", [req.params.id, req.params.repoId, tenantId]);
    res.json({ success: true });
  });

  // Share a project: toggle public, generate a stable slug, return the URL.
  app.post("/api/projects/:id/share", async (req, res) => {
    const { tenantId } = getTenant(req);
    const project = await get<any>(
      "SELECT id, is_public, public_slug FROM projects WHERE id = ? AND tenant_id = ?",
      [req.params.id, tenantId],
    );
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (project.is_public) {
      // Already public — toggle off
      await run("UPDATE projects SET is_public=0 WHERE id=? AND tenant_id=?", [req.params.id, tenantId]);
      return res.json({ isPublic: false, slug: project.public_slug });
    }

    // Make public: generate a slug if none exists yet
    const slug = project.public_slug ?? sha256(`${tenantId}:${req.params.id}:${Date.now()}`).slice(0, 12);
    await run(
      "UPDATE projects SET is_public=1, public_slug=? WHERE id=? AND tenant_id=?",
      [slug, req.params.id, tenantId],
    );
    res.json({ isPublic: true, slug });
  });

  // Public project view — no auth, slug-based. Returns project + top recommendations
  // + lightweight repo metadata (no readme/embedding). Used by the public share page.
  app.get("/api/p/:slug", async (req, res) => {
    const project = await get<any>(
      "SELECT * FROM projects WHERE public_slug = ? AND is_public = 1",
      [req.params.slug],
    );
    if (!project) return res.status(404).json({ error: "Project not found or not public" });

    const recs = await all<any>(
      `SELECT pr.repo_id, pr.fit_score, pr.rationale,
              r.name, r.owner, r.url, r.stars, r.language, r.license,
              r.description, r.ai_analysis, r.score
       FROM project_recommendations pr
       JOIN repos r ON r.tenant_id = pr.tenant_id AND r.id = pr.repo_id
       WHERE pr.project_id = ? AND pr.tenant_id = ?
       ORDER BY pr.fit_score DESC
       LIMIT 10`,
      [project.id, project.tenant_id],
    );

    res.json({
      project: {
        name: project.name,
        description: project.description,
        constraints: project.constraints ? JSON.parse(project.constraints) : {},
        createdAt: project.created_at,
      },
      recommendations: recs,
    });
  });

  // Fetch a GitHub user's public starred repos (public API, no user auth needed).
  // Proxied through the server so we can attach our GITHUB_TOKEN and avoid the
  // anonymous 60 req/hr rate limit.
  app.get("/api/github/stars", async (req, res) => {
    const { username, page = "1" } = req.query as Record<string, string>;
    if (!username?.trim()) return res.status(400).json({ error: "username is required" });
    const headers: Record<string, string> = { "User-Agent": "RepoHive/2" };
    if (process.env.GITHUB_TOKEN) headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    try {
      const ghRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/starred?per_page=100&page=${page}`,
        { headers },
      );
      if (!ghRes.ok) {
        const msg = ghRes.status === 404 ? "GitHub user not found" : `GitHub API error ${ghRes.status}`;
        return res.status(ghRes.status).json({ error: msg });
      }
      const data: any[] = await ghRes.json();
      // Return only the fields we need — keeps payload small
      res.json(data.map(r => ({
        id:          r.full_name,
        owner:       r.owner?.login,
        name:        r.name,
        url:         r.html_url,
        stars:       r.stargazers_count,
        forks:       r.forks_count,
        issues:      r.open_issues_count,
        language:    r.language,
        license:     r.license?.spdx_id ?? r.license?.name ?? null,
        last_push:   r.pushed_at,
        description: r.description,
      })));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/config", async (req, res) => {
    const { tenantId } = getTenant(req);
    const config = await all<any>("SELECT key, value FROM config WHERE tenant_id = ?", [tenantId]);
    const configMap = config.reduce((acc: any, curr: any) => {
      acc[curr.key] = JSON.parse(curr.value);
      return acc;
    }, {});
    res.json(configMap);
  });

  app.post("/api/config", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { key, value } = req.body;
    await run("INSERT OR REPLACE INTO config (tenant_id, key, value) VALUES (?, ?, ?)", [tenantId, key, JSON.stringify(value)]);
    res.json({ success: true });
  });

  // ── API key management (Clerk-authenticated, tenant-scoped) ──────────────────
  app.get("/api/keys", async (req, res) => {
    const { tenantId } = getTenant(req);
    const keys = await all("SELECT id, name, key_prefix, created_at, last_used_at FROM api_keys WHERE tenant_id = ? ORDER BY created_at DESC", [tenantId]);
    res.json(keys);
  });

  app.post("/api/keys", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { name } = req.body ?? {};

    const plan = await getPlan(tenantId);
    const keyCount = (await get<{ c: number }>("SELECT COUNT(*) AS c FROM api_keys WHERE tenant_id = ?", [tenantId]))?.c ?? 0;
    if (keyCount >= plan.apiKeys) {
      const detail = plan.apiKeys === 0
        ? `API keys aren't available on the ${plan.name} plan — upgrade to create one.`
        : `Key limit reached — the ${plan.name} plan allows ${plan.apiKeys} API key${plan.apiKeys === 1 ? "" : "s"}.`;
      return res.status(403).json({ error: detail });
    }

    const raw = "rh_" + crypto.randomBytes(24).toString("hex");
    const prefix = raw.slice(0, 10);
    await run("INSERT INTO api_keys (tenant_id, name, key_prefix, key_hash) VALUES (?, ?, ?, ?)", [tenantId, name || "API key", prefix, sha256(raw)]);
    // The full key is shown exactly once — only its hash is stored.
    res.json({ key: raw, key_prefix: prefix });
  });

  app.delete("/api/keys/:id", async (req, res) => {
    const { tenantId } = getTenant(req);
    await run("DELETE FROM api_keys WHERE id = ? AND tenant_id = ?", [req.params.id, tenantId]);
    res.json({ success: true });
  });

  // ── Subscription & usage (plan limits, live consumption) ─────────────────────
  // The frontend reads this to render the current plan, what's left, and to
  // disable actions the plan doesn't allow.
  app.get("/api/subscription", async (req, res) => {
    const { tenantId } = getTenant(req);
    const plan = await getPlan(tenantId);
    const [repos, additions, keyCount] = await Promise.all([
      countUserRepos(tenantId),
      monthlyAdditions(tenantId),
      get<{ c: number }>("SELECT COUNT(*) AS c FROM api_keys WHERE tenant_id = ?", [tenantId]).then(r => r?.c ?? 0),
    ]);
    res.json({
      plan: plan.id,
      planName: plan.name,
      limits: {
        repoCap: plan.repoCap,
        monthlyAdditions: plan.monthlyAdditions,
        apiKeys: plan.apiKeys,
        preloadedLibrary: plan.preloadedLibrary,
      },
      usage: {
        repos,
        additionsThisMonth: additions,
        apiKeys: keyCount,
        period: currentPeriod(),
      },
    });
  });

  // Plan switching seam. Billing is deferred, so this lets us exercise the full
  // upgrade path (limit changes + preloaded-library copy) without Stripe. When
  // billing lands, the Stripe webhook calls applyPlan() with the same effect and
  // this dev route can be removed.
  app.post("/api/subscription/plan", async (req, res) => {
    const { tenantId } = getTenant(req);
    const { plan } = req.body ?? {};
    if (!isPlanId(plan)) {
      return res.status(400).json({ error: "Unknown plan. Expected: free, solo, or studio." });
    }
    const { plan: limits, copied } = await applyPlan(tenantId, plan);
    if (copied > 0) {
      await loadEmbeddingCache(); // surface freshly-copied library embeddings to search
      console.log(`Plan → ${plan} for ${tenantId}; copied ${copied} library repos`);
    }
    res.json({ plan: limits.id, planName: limits.name, copiedFromLibrary: copied });
  });

  // ── Stripe billing routes ────────────────────────────────────────────────────
  // Start a Stripe Checkout session for a paid plan. The tenant id travels in
  // the session metadata so the webhook can activate the right account.
  app.post("/api/stripe/checkout", async (req, res) => {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ error: "Billing is not configured yet." });

    const { tenantId, userId } = getTenant(req);
    const { plan, interval = "monthly" } = req.body ?? {};
    if (plan !== "solo" && plan !== "studio") {
      return res.status(400).json({ error: "plan must be 'solo' or 'studio'" });
    }
    if (interval !== "monthly" && interval !== "annual") {
      return res.status(400).json({ error: "interval must be 'monthly' or 'annual'" });
    }
    const price = priceIdFor(plan, interval);
    if (!price) {
      return res.status(503).json({ error: `Price for ${plan}/${interval} is not configured (STRIPE_PRICE_* env).` });
    }

    const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    try {
      const existing = await get<{ stripe_customer_id: string | null }>(
        "SELECT stripe_customer_id FROM subscriptions WHERE tenant_id = ?", [tenantId]);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price, quantity: 1 }],
        ...(existing?.stripe_customer_id ? { customer: existing.stripe_customer_id } : {}),
        client_reference_id: tenantId,
        metadata: { tenantId, plan, userId },
        subscription_data: { metadata: { tenantId, plan } },
        success_url: `${appUrl}/app?billing=success`,
        cancel_url: `${appUrl}/pricing?billing=cancelled`,
        allow_promotion_codes: true,
      });
      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Stripe checkout failed:", err.message);
      res.status(500).json({ error: "Could not start checkout. Please try again." });
    }
  });

  // Open the Stripe customer portal (manage payment method, cancel, invoices).
  app.post("/api/stripe/portal", async (req, res) => {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ error: "Billing is not configured yet." });

    const { tenantId } = getTenant(req);
    const row = await get<{ stripe_customer_id: string | null }>(
      "SELECT stripe_customer_id FROM subscriptions WHERE tenant_id = ?", [tenantId]);
    if (!row?.stripe_customer_id) {
      return res.status(404).json({ error: "No billing account yet — subscribe to a paid plan first." });
    }
    const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
    try {
      const portal = await stripe.billingPortal.sessions.create({
        customer: row.stripe_customer_id,
        return_url: `${appUrl}/app`,
      });
      res.json({ url: portal.url });
    } catch (err: any) {
      console.error("Stripe portal failed:", err.message);
      res.status(500).json({ error: "Could not open the billing portal." });
    }
  });

  // Stripe webhook — authenticated by signature over the raw body, not by a
  // Clerk session (exempted from the auth gate above).
  app.post("/api/stripe/webhook", async (req, res) => {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!stripe || !secret) return res.status(503).json({ error: "Billing is not configured yet." });

    let event: Stripe.Event;
    try {
      const sig = req.headers["stripe-signature"] as string;
      event = stripe.webhooks.constructEvent((req as any).rawBody, sig, secret);
    } catch (err: any) {
      console.warn("Stripe webhook signature verification failed:", err.message);
      return res.status(400).json({ error: "Invalid signature" });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const tenantId = session.metadata?.tenantId || session.client_reference_id;
          const plan = session.metadata?.plan;
          if (tenantId && isPlanId(plan ?? "")) {
            await recordStripeIds(tenantId,
              typeof session.customer === "string" ? session.customer : session.customer?.id,
              typeof session.subscription === "string" ? session.subscription : session.subscription?.id);
            const { copied } = await applyPlan(tenantId, plan!);
            if (copied > 0) await loadEmbeddingCache();
            console.log(`Stripe: checkout complete → ${plan} for ${tenantId} (+${copied} library repos)`);
          } else {
            console.warn("Stripe: checkout.session.completed without usable tenant/plan metadata");
          }
          break;
        }

        case "customer.subscription.updated": {
          const sub = event.data.object as Stripe.Subscription;
          const tenantId = await tenantForStripeEvent({
            metadataTenant: sub.metadata?.tenantId,
            subscriptionId: sub.id,
            customerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
          });
          if (!tenantId) { console.warn(`Stripe: no tenant for subscription ${sub.id}`); break; }

          const priceId = sub.items.data[0]?.price?.id;
          const plan = priceId ? priceToPlan(priceId) : null;
          if (sub.status === "active" || sub.status === "trialing") {
            if (plan) {
              const { copied } = await applyPlan(tenantId, plan);
              if (copied > 0) await loadEmbeddingCache();
            }
            await run("UPDATE subscriptions SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ?", [tenantId]);
          } else if (sub.status === "past_due" || sub.status === "unpaid") {
            await run("UPDATE subscriptions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ?", [sub.status, tenantId]);
          } else if (sub.status === "canceled") {
            await applyPlan(tenantId, "free");
          }
          console.log(`Stripe: subscription ${sub.id} → ${sub.status} (tenant ${tenantId}, plan ${plan ?? "unchanged"})`);
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const tenantId = await tenantForStripeEvent({
            metadataTenant: sub.metadata?.tenantId,
            subscriptionId: sub.id,
            customerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
          });
          if (tenantId) {
            await applyPlan(tenantId, "free");
            console.log(`Stripe: subscription deleted → free for ${tenantId}`);
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const tenantId = await tenantForStripeEvent({
            customerId: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id,
          });
          if (tenantId) {
            await run("UPDATE subscriptions SET status = 'past_due', updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ?", [tenantId]);
            console.log(`Stripe: payment failed → past_due for ${tenantId}`);
          }
          break;
        }

        default:
          // Unhandled event types are acknowledged so Stripe doesn't retry them.
          break;
      }
      res.json({ received: true });
    } catch (err: any) {
      console.error(`Stripe webhook handler failed (${event.type}):`, err.message);
      res.status(500).json({ error: "Webhook handling failed" });
    }
  });

  // ── Admin: curate the preloaded library ─────────────────────────────────────
  // An admin promotes repos from their own account into the __library__ tenant,
  // which is the App Killers library Solo/Studio subscribers receive on upgrade.
  function requireAdmin(req: express.Request, res: express.Response): boolean {
    if (isAdmin(req)) return true;
    res.status(403).json({ error: "Admin access required" });
    return false;
  }

  // Lets the frontend show/hide the admin-only library category.
  app.get("/api/admin/status", (req, res) => {
    res.json({ admin: isAdmin(req) });
  });

  app.get("/api/admin/library", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const repos = await all(
      `SELECT id, owner, name, url, score, language, stars, ai_analysis,
              (embedding IS NOT NULL) AS embedded
       FROM repos WHERE tenant_id = ? ORDER BY score DESC`,
      [LIBRARY_TENANT],
    );
    res.json(repos);
  });

  // Promote a repo from the caller's own library into the preloaded library.
  // Carries the embedding so vector search works immediately; enterpriseTier /
  // comparableApp are derived from ai_analysis (the app's source of truth).
  app.post("/api/admin/library/promote", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { tenantId } = getTenant(req);
    const { repoId } = req.body ?? {};
    if (!repoId) return res.status(400).json({ error: "repoId is required" });

    const repo = await get<any>("SELECT * FROM repos WHERE tenant_id = ? AND id = ?", [tenantId, repoId]);
    if (!repo) return res.status(404).json({ error: `Repo ${repoId} not found in your library` });

    let tier = repo.enterpriseTier ? 1 : 0;
    let comparable = repo.comparableApp ?? null;
    try {
      const a = JSON.parse(repo.ai_analysis ?? "");
      if (a && typeof a.enterpriseTier !== "undefined") {
        tier = a.enterpriseTier ? 1 : 0;
        comparable = a.comparableApp ?? comparable;
      }
    } catch {}

    await run(
      `INSERT INTO repos (
         tenant_id, id, owner, name, url, status, score, language, license,
         stars, forks, issues, last_push, description, readme, ai_analysis,
         enterpriseTier, comparableApp, embedding, source, created_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'library', ?)
       ON CONFLICT(tenant_id, id) DO UPDATE SET
         score=excluded.score, stars=excluded.stars, forks=excluded.forks,
         issues=excluded.issues, last_push=excluded.last_push,
         description=excluded.description, readme=excluded.readme,
         ai_analysis=excluded.ai_analysis, enterpriseTier=excluded.enterpriseTier,
         comparableApp=excluded.comparableApp, embedding=excluded.embedding,
         updated_at=CURRENT_TIMESTAMP`,
      [
        LIBRARY_TENANT, repo.id, repo.owner, repo.name, repo.url, repo.status,
        repo.score, repo.language, repo.license, repo.stars, repo.forks, repo.issues,
        repo.last_push, repo.description, repo.readme, repo.ai_analysis, tier, comparable,
        repo.embedding, repo.created_by,
      ],
    );
    if (repo.embedding) {
      try { embeddingCache.set(ck(LIBRARY_TENANT, repo.id), JSON.parse(repo.embedding)); } catch {}
    }
    console.log(`Library promote: ${repo.id} added to __library__ by admin`);
    res.json({ success: true, id: repo.id });
  });

  // Remove a repo from the preloaded library (does not touch any subscriber's
  // already-copied instance).
  app.delete("/api/admin/library/:repoId(*)", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    await run("DELETE FROM repos WHERE tenant_id = ? AND id = ?", [LIBRARY_TENANT, req.params.repoId]);
    embeddingCache.delete(ck(LIBRARY_TENANT, req.params.repoId));
    res.json({ success: true });
  });

  // Platform-wide stats for the admin overview: tenant counts, plan
  // distribution, repo totals, and this month's activity.
  app.get("/api/admin/stats", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const period = currentPeriod();
    const [tenants, plans, repos, additions, keys, projects] = await Promise.all([
      get<{ c: number }>(
        "SELECT COUNT(DISTINCT tenant_id) AS c FROM subscriptions WHERE tenant_id != ?", [LIBRARY_TENANT]),
      all<{ plan: string; c: number }>(
        "SELECT plan, COUNT(*) AS c FROM subscriptions WHERE tenant_id != ? GROUP BY plan", [LIBRARY_TENANT]),
      get<{ user_repos: number; library_copies: number }>(
        `SELECT
           SUM(CASE WHEN source = 'user' THEN 1 ELSE 0 END) AS user_repos,
           SUM(CASE WHEN source = 'library' THEN 1 ELSE 0 END) AS library_copies
         FROM repos WHERE tenant_id != ?`, [LIBRARY_TENANT]),
      get<{ c: number }>(
        "SELECT COALESCE(SUM(repos_added), 0) AS c FROM usage_tracking WHERE period = ?", [period]),
      get<{ c: number }>("SELECT COUNT(*) AS c FROM api_keys"),
      get<{ c: number }>("SELECT COUNT(*) AS c FROM projects"),
    ]);
    const librarySize = (await get<{ c: number }>(
      "SELECT COUNT(*) AS c FROM repos WHERE tenant_id = ?", [LIBRARY_TENANT]))?.c ?? 0;
    res.json({
      tenants: tenants?.c ?? 0,
      planDistribution: Object.fromEntries(plans.map(p => [p.plan, p.c])),
      userRepos: repos?.user_repos ?? 0,
      libraryCopies: repos?.library_copies ?? 0,
      librarySize,
      reposAddedThisMonth: additions?.c ?? 0,
      apiKeys: keys?.c ?? 0,
      projects: projects?.c ?? 0,
      period,
    });
  });

  // Per-tenant management view: plan, status, usage, key count. Enriched with
  // the Clerk user's email/name where resolvable (personal accounts only —
  // org_ tenants resolve to the org, which we just label).
  app.get("/api/admin/tenants", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const period = currentPeriod();
    const rows = await all<any>(
      `SELECT s.tenant_id, s.plan, s.status, s.updated_at,
              COALESCE(r.user_repos, 0)    AS user_repos,
              COALESCE(r.library_copies, 0) AS library_copies,
              COALESCE(u.repos_added, 0)   AS added_this_month,
              COALESCE(k.key_count, 0)     AS api_keys
       FROM subscriptions s
       LEFT JOIN (
         SELECT tenant_id,
                SUM(CASE WHEN source = 'user' THEN 1 ELSE 0 END) AS user_repos,
                SUM(CASE WHEN source = 'library' THEN 1 ELSE 0 END) AS library_copies
         FROM repos GROUP BY tenant_id
       ) r ON r.tenant_id = s.tenant_id
       LEFT JOIN usage_tracking u ON u.tenant_id = s.tenant_id AND u.period = ?
       LEFT JOIN (
         SELECT tenant_id, COUNT(*) AS key_count FROM api_keys GROUP BY tenant_id
       ) k ON k.tenant_id = s.tenant_id
       WHERE s.tenant_id != ?
       ORDER BY s.updated_at DESC`,
      [period, LIBRARY_TENANT],
    );

    // Best-effort identity enrichment from Clerk; tolerate failures (network,
    // deleted users) so the table still renders.
    const enriched = await Promise.all(rows.map(async (row) => {
      let email: string | null = null;
      let name: string | null = null;
      if (AUTH_ENABLED && row.tenant_id.startsWith("user_")) {
        try {
          const user = await clerkClient.users.getUser(row.tenant_id);
          email = user.primaryEmailAddress?.emailAddress
            ?? user.emailAddresses[0]?.emailAddress ?? null;
          name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
        } catch {}
      }
      return { ...row, email, name, isOrg: row.tenant_id.startsWith("org_") };
    }));
    res.json(enriched);
  });

  // Change a tenant's plan from the admin panel (e.g. comp a subscription or
  // fix a billing mishap). Uses the same applyPlan seam Stripe drives.
  app.post("/api/admin/tenants/:tenantId/plan", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { plan } = req.body ?? {};
    if (!isPlanId(plan)) {
      return res.status(400).json({ error: "Unknown plan. Expected: free, solo, or studio." });
    }
    const { plan: limits, copied } = await applyPlan(req.params.tenantId, plan);
    if (copied > 0) await loadEmbeddingCache();
    console.log(`Admin: plan → ${plan} for ${req.params.tenantId} (+${copied} library repos)`);
    res.json({ plan: limits.id, copiedFromLibrary: copied });
  });

  // Manual rescan trigger — admin only. Also used by the weekly scheduled
  // Netlify function which calls rescanOldestRepos() directly.
  app.post("/api/admin/rescan", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const limit = Math.min(parseInt((req.query.limit as string) || "150"), 500);
    try {
      const result = await rescanOldestRepos(limit);
      console.log(`[rescan] Admin triggered: ${JSON.stringify(result)}`);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Admin cost monitoring ──────────────────────────────────────────────────
  // Aggregated AI + GitHub usage for the cost dashboard. Returns:
  //  - totals for all time and the current calendar month
  //  - per-provider/model breakdown
  //  - daily totals for the last 30 days (chart data)
  //  - the 50 most recent raw events
  app.get("/api/admin/costs", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const period = currentPeriod(); // "YYYY-MM"

    const [totals, byModel, daily, recent, monthTotals, budgetRow] = await Promise.all([
      // All-time totals
      get<{ total_cost: number; total_calls: number; failed_calls: number }>(
        `SELECT ROUND(SUM(cost_usd), 6) AS total_cost, COUNT(*) AS total_calls,
                SUM(CASE WHEN ok=0 THEN 1 ELSE 0 END) AS failed_calls
         FROM ai_usage_events`),
      // Per-provider+model breakdown (all time)
      all<{ provider: string; model: string; operation: string; calls: number; input_units: number; output_units: number; cost_usd: number; failed: number }>(
        `SELECT provider, model, operation,
                COUNT(*) AS calls,
                SUM(input_units) AS input_units,
                SUM(output_units) AS output_units,
                ROUND(SUM(cost_usd), 6) AS cost_usd,
                SUM(CASE WHEN ok=0 THEN 1 ELSE 0 END) AS failed
         FROM ai_usage_events
         GROUP BY provider, model, operation
         ORDER BY cost_usd DESC`),
      // Daily totals for the last 30 days
      all<{ day: string; cost_usd: number; calls: number }>(
        `SELECT DATE(recorded_at) AS day,
                ROUND(SUM(cost_usd), 6) AS cost_usd,
                COUNT(*) AS calls
         FROM ai_usage_events
         WHERE recorded_at >= DATE('now', '-30 days')
         GROUP BY DATE(recorded_at)
         ORDER BY day ASC`),
      // 50 most-recent raw events for the activity log
      all<any>(
        `SELECT id, provider, model, operation, tenant_id, input_units, output_units,
                ROUND(cost_usd, 6) AS cost_usd, ok, recorded_at
         FROM ai_usage_events ORDER BY id DESC LIMIT 50`),
      // This-month totals
      get<{ cost_usd: number; calls: number }>(
        `SELECT ROUND(SUM(cost_usd), 6) AS cost_usd, COUNT(*) AS calls
         FROM ai_usage_events
         WHERE strftime('%Y-%m', recorded_at) = ?`, [period]),
      // Monthly budget threshold
      get<{ value: string }>("SELECT value FROM cost_config WHERE key = 'monthly_budget_usd'"),
    ]);

    res.json({
      allTime: {
        costUsd: totals?.total_cost ?? 0,
        calls: totals?.total_calls ?? 0,
        failedCalls: totals?.failed_calls ?? 0,
      },
      thisMonth: {
        period,
        costUsd: monthTotals?.cost_usd ?? 0,
        calls: monthTotals?.calls ?? 0,
      },
      byModel,
      daily,
      recent,
      budgetUsd: budgetRow ? parseFloat(budgetRow.value) : null,
    });
  });

  // Set or update the monthly budget warning threshold.
  app.post("/api/admin/costs/budget", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { budgetUsd } = req.body ?? {};
    if (budgetUsd === null || budgetUsd === undefined) {
      await run("DELETE FROM cost_config WHERE key = 'monthly_budget_usd'");
      return res.json({ budgetUsd: null });
    }
    const v = parseFloat(budgetUsd);
    if (isNaN(v) || v < 0) return res.status(400).json({ error: "budgetUsd must be a non-negative number" });
    await run(
      `INSERT INTO cost_config (key, value) VALUES ('monthly_budget_usd', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [String(v)],
    );
    res.json({ budgetUsd: v });
  });

  // External API for agents (e.g. Replit) — authenticated by API key, scoped to
  // the key's tenant.
  app.get("/api/external/repos", async (req, res) => {
    const { q, minScore, limit = 20, apiKey } = req.query;
    const headerKey = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const provided = (apiKey as string) || headerKey;
    if (!provided) return res.status(401).json({ error: "Missing API Key" });

    const keyRow = await get<any>("SELECT tenant_id FROM api_keys WHERE key_hash = ?", [sha256(provided)]);
    if (!keyRow) return res.status(401).json({ error: "Invalid API Key" });
    run("UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE key_hash = ?", [sha256(provided)]).catch(() => {});

    let query = "SELECT id, owner, name, url, score, language, stars, description, ai_analysis FROM repos WHERE tenant_id = ?";
    const params: any[] = [keyRow.tenant_id];

    if (q) {
      query += " AND (name LIKE ? OR description LIKE ? OR language LIKE ?)";
      const searchPattern = `%${q}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (minScore) {
      query += " AND score >= ?";
      params.push(parseInt(minScore as string));
    }

    query += " ORDER BY score DESC LIMIT ?";
    params.push(parseInt(limit as string));

    try {
      const repos = await all<any>(query, params);
      res.json({
        count: repos.length,
        repos: repos.map((r: any) => ({
          ...r,
          ai_analysis: r.ai_analysis ? JSON.parse(r.ai_analysis) : null
        }))
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Background sweep: re-analyze the tenant's repos missing enterpriseTier field
  let sweepStatus: { running: boolean; total: number; done: number; failed: number } = { running: false, total: 0, done: 0, failed: 0 };

  app.get("/api/sweep/status", (_req, res) => {
    res.json(sweepStatus);
  });

  app.post("/api/sweep", async (req, res) => {
    const { tenantId } = getTenant(req);
    if (sweepStatus.running) return res.json({ message: 'Sweep already running', ...sweepStatus });

    const allRepos = await all<any>("SELECT id, description, language, readme, ai_analysis FROM repos WHERE tenant_id = ?", [tenantId]);
    const needsUpdate = allRepos.filter(r => {
      try {
        const a = r.ai_analysis ? JSON.parse(r.ai_analysis) : {};
        return typeof a.enterpriseTier === 'undefined';
      } catch { return true; }
    });

    sweepStatus = { running: true, total: needsUpdate.length, done: 0, failed: 0 };
    res.json({ message: `Sweep started for ${needsUpdate.length} repos`, total: needsUpdate.length });

    // Run in background — do not await
    (async () => {
      for (const repo of needsUpdate) {
        try {
          let existing: any = {};
          try { existing = repo.ai_analysis ? JSON.parse(repo.ai_analysis) : {}; } catch {}

          const topics = existing.tags || [];
          const category = existing.category || 'General';

          const fresh = await deepseekAnalyze(repo.id, repo.description || '', repo.language, topics, repo.readme, category);
          if (fresh) {
            const merged = { ...existing, ...fresh };
            await run("UPDATE repos SET ai_analysis = ? WHERE tenant_id = ? AND id = ?", [JSON.stringify(merged), tenantId, repo.id]);
            console.log(`Sweep updated ${repo.id} → enterpriseTier: ${fresh.enterpriseTier}, replaces: ${fresh.comparableApp}`);
          }
          sweepStatus.done++;
        } catch (err: any) {
          console.warn(`Sweep failed for ${repo.id}: ${err.message}`);
          sweepStatus.failed++;
          sweepStatus.done++;
        }
        // Small pause to avoid rate-limiting
        await new Promise(r => setTimeout(r, 200));
      }
      sweepStatus.running = false;
      console.log(`Sweep complete — ${sweepStatus.total} processed, ${sweepStatus.failed} failed`);
    })();
  });

  // ── Admin: global reclassification sweep ────────────────────────────────────
  // Re-runs AI analysis across ALL tenants for repos whose stored analysis
  // predates the current classifier, so admins can refresh the library after we
  // tighten the prompt. The API runs as a single serverless function, so the
  // sweep is processed in small awaited batches (see lib/reclassify.ts): the
  // frontend repeats the call until `remaining` hits 0, and a Netlify scheduled
  // function (netlify/functions/reclassify.ts) drains the backlog periodically.
  app.get("/api/admin/reclassify/status", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const [stats, distribution, tenants] = await Promise.all([
        reclassifyStats(),
        reclassifyDistribution(),
        reclassifyTenantBreakdown(),
      ]);
      res.json({ ...stats, distribution, tenants });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/reclassify", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const limit = parseInt((req.query.limit as string) || "15");
    const force = req.query.force === 'true' || req.body?.force === true;
    const forceSince = force ? ((req.query.since as string) || req.body?.since || new Date().toISOString()) : null;
    try {
      const result = await reclassifyBatch({ limit, forceSince });
      res.json({ ...result, since: forceSince });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Embedding sweep endpoints ────────────────────────────────────────────────
  let embedSweepStatus = { running: false, total: 0, done: 0, failed: 0 };

  app.get("/api/embed/status", async (req, res) => {
    const { tenantId } = getTenant(req);
    const total = (await get<any>("SELECT COUNT(*) as c FROM repos WHERE tenant_id = ?", [tenantId]))?.c ?? 0;
    const embedded = (await get<any>("SELECT COUNT(*) as c FROM repos WHERE tenant_id = ? AND embedding IS NOT NULL", [tenantId]))?.c ?? 0;
    res.json({ ...embedSweepStatus, embedded, total });
  });

  app.post("/api/embed/sweep", async (req, res) => {
    const { tenantId } = getTenant(req);
    if (embedSweepStatus.running) return res.json({ message: 'Embed sweep already running', ...embedSweepStatus });

    const repos = await all<any>("SELECT id, name, description, ai_analysis FROM repos WHERE tenant_id = ? AND embedding IS NULL", [tenantId]);
    embedSweepStatus = { running: true, total: repos.length, done: 0, failed: 0 };
    res.json({ message: `Embedding sweep started for ${repos.length} repos`, total: repos.length });

    (async () => {
      for (const repo of repos) {
        try {
          let ai: any = {};
          try { ai = repo.ai_analysis ? JSON.parse(repo.ai_analysis) : {}; } catch {}
          const text = buildEmbedText(repo, ai);
          const emb = await generateEmbedding(text);
          if (emb) {
            await run("UPDATE repos SET embedding = ? WHERE tenant_id = ? AND id = ?", [JSON.stringify(emb), tenantId, repo.id]);
            embeddingCache.set(ck(tenantId, repo.id), emb);
            console.log(`Embedded ${repo.id} (cache: ${embeddingCache.size})`);
          }
          embedSweepStatus.done++;
        } catch (e: any) {
          console.warn(`Embed failed for ${repo.id}: ${e.message}`);
          embedSweepStatus.failed++;
          embedSweepStatus.done++;
        }
        await new Promise(r => setTimeout(r, 250));
      }
      embedSweepStatus.running = false;
      console.log(`Embedding sweep complete — ${embeddingCache.size} total in cache`);
    })();
  });
  // ─── SEO admin (Reacteo-style) ───────────────────────────────────────────────
  // Seed default routes that the admin can immediately edit. Idempotent.
  const DEFAULT_SEO_PAGES = [
    { path: '/',              label: 'Landing' },
    { path: '/pricing',       label: 'Pricing' },
    { path: '/how-it-works',  label: 'How It Works' },
    { path: '/app-killers',   label: 'App Killers' },
    { path: '/integrations',  label: 'Integrations' },
    { path: '/blog',          label: 'Blog index' },
    { path: '/legal/privacy', label: 'Privacy' },
    { path: '/legal/terms',   label: 'Terms' },
  ];

  async function seedSeoPages() {
    for (const p of DEFAULT_SEO_PAGES) {
      await run(
        "INSERT OR IGNORE INTO seo_pages (path, label) VALUES (?, ?)",
        [p.path, p.label],
      );
    }
  }
  // Fire-and-forget; runs once per cold start.
  ensureInit().then(() => seedSeoPages()).catch(() => {});

  // Public — used by the SPA on every page to fetch overrides + GA/GTM ids.
  app.get("/api/seo/settings", async (_req, res) => {
    const rows = await all<{ key: string; value: string }>("SELECT key, value FROM seo_settings");
    const settings: Record<string, string> = {};
    for (const r of rows) settings[r.key] = r.value;
    const overrides = await all<any>(
      "SELECT path, title, description, og_image AS ogImage, keywords, noindex FROM seo_pages",
    );
    res.json({ settings, overrides });
  });

  app.get("/api/admin/seo/pages", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const rows = await all(
      "SELECT * FROM seo_pages ORDER BY path",
    );
    res.json(rows);
  });

  app.post("/api/admin/seo/pages", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { path, label, title, description, og_image, keywords, noindex } = req.body ?? {};
    if (!path) return res.status(400).json({ error: "path is required" });
    await run(
      `INSERT INTO seo_pages (path, label, title, description, og_image, keywords, noindex, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(path) DO UPDATE SET
         label=excluded.label, title=excluded.title, description=excluded.description,
         og_image=excluded.og_image, keywords=excluded.keywords, noindex=excluded.noindex,
         updated_at=CURRENT_TIMESTAMP`,
      [path, label ?? null, title ?? null, description ?? null, og_image ?? null, keywords ?? null, noindex ? 1 : 0],
    );
    res.json({ success: true });
  });

  app.delete("/api/admin/seo/pages", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const path = req.query.path as string;
    if (!path) return res.status(400).json({ error: "path is required" });
    await run("DELETE FROM seo_pages WHERE path = ?", [path]);
    res.json({ success: true });
  });

  app.get("/api/admin/seo/settings", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const rows = await all<{ key: string; value: string }>("SELECT key, value FROM seo_settings");
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = r.value;
    res.json(out);
  });

  app.post("/api/admin/seo/settings", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const body = req.body ?? {};
    for (const [k, v] of Object.entries(body)) {
      if (typeof v === 'string') {
        await run(
          "INSERT INTO seo_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          [k, v],
        );
      }
    }
    res.json({ success: true });
  });

  // DeepSeek-powered SEO audit: scores a page's metadata 0-100 and returns
  // ranked suggestions for title, description, keywords, structure.
  //
  // The auditor needs two things the original version was missing:
  //  1. RepoHive product context — "App Killer" / "SaaS Ready" are RepoHive
  //     repo classifications, NOT Android task-killers or generic SaaS terms.
  //     Without this glossary the model hallucinates wildly off-topic.
  //  2. The actual page content — we fetch the rendered HTML and pass the
  //     visible text so suggestions match what the page is about, not just
  //     the path slug.
  const REPOHIVE_BRIEF = `## About RepoHive
RepoHive is a SaaS tool for engineering teams to discover, score, and curate open-source GitHub repositories. It uses AI to classify repos and surface OSS that can replace paid SaaS products.

## Glossary (RepoHive-specific terminology — DO NOT free-associate)
- "App Killer" / "App Killers" → a curated class of OSS repos that can replace a specific paid SaaS app (e.g. an OSS Calendly alternative). It has nothing to do with Android task killers, battery savers, force-stopping background processes, or phone performance. NEVER suggest copy that implies that.
- "SaaS Ready" → an OSS repo that is production-grade and could be self-hosted as a SaaS replacement, even if no specific named competitor exists. Not about being SaaS-friendly software in general.
- "Toolbox" → a user's personal curated library of repos in RepoHive.
- Audience: senior engineers, tech leads, CTOs at 5–200-engineer product companies. Peer-to-peer technical voice. No marketing fluff ("game-changer", "unlock", "leverage", "boost speed").

## Hard prohibitions for suggestions
- Never suggest copy aimed at consumer phone/Android utilities.
- Never write generic SaaS marketing fluff.
- Title under 60 chars, description 140-160 chars, keywords 5-8 high-intent dev/OSS terms.`;

  async function fetchPageContent(path: string): Promise<string> {
    try {
      const base = (process.env.APP_URL || 'https://repohive.app').replace(/\/$/, '');
      const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
      const r = await fetch(url, { headers: { 'User-Agent': 'RepoHive-SEO-Audit/1.0' } });
      if (!r.ok) return '';
      const html = await r.text();
      // Strip <script>/<style>, then tags, then collapse whitespace. Good
      // enough to give the model the page's actual content blocks.
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return text.slice(0, 4000);
    } catch {
      return '';
    }
  }

  async function deepseekSeoAudit(page: { path: string; title?: string; description?: string; keywords?: string }, tenantId?: string) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return null;
    const pageContent = await fetchPageContent(page.path);
    const userPrompt = `URL path: ${page.path}
Current title: ${page.title || '(empty)'}
Current description: ${page.description || '(empty)'}
Current keywords: ${page.keywords || '(empty)'}

Actual page content (extracted from the rendered page):
${pageContent || '(could not fetch — base your suggestions strictly on the path and RepoHive context above; do NOT invent unrelated subject matter)'}

Return ONLY valid JSON with this exact structure:
{
  "score": 0-100 integer rating overall SEO quality,
  "issues": ["array of specific problems with current metadata, grounded in what the page actually says"],
  "suggestions": {
    "title": "improved title under 60 chars, compelling, with primary keyword early — must match what this page is actually about",
    "description": "improved meta description 140-160 chars, action-oriented — must reflect actual page content",
    "keywords": "comma-separated 5-8 high-intent dev/OSS keywords aligned to the page"
  },
  "rationale": "1-2 sentence explanation of the changes, citing specific page content"
}`;
    try {
      const r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: REPOHIVE_BRIEF },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 800,
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });
      if (!r.ok) {
        trackUsage({ provider: 'deepseek', model: 'deepseek-chat', operation: 'seo-audit', tenantId, inputUnits: Math.ceil((REPOHIVE_BRIEF.length + userPrompt.length) / 4), ok: false });
        return null;
      }
      const data: any = await r.json();
      const inTok = data.usage?.prompt_tokens ?? Math.ceil((REPOHIVE_BRIEF.length + userPrompt.length) / 4);
      const outTok = data.usage?.completion_tokens ?? 0;
      const text = data.choices?.[0]?.message?.content || '';
      let parsed: any = null;
      try { parsed = JSON.parse(text); }
      catch {
        const m = text.match(/\{[\s\S]*\}/);
        if (m) { try { parsed = JSON.parse(m[0]); } catch { /* leave null */ } }
      }
      trackUsage({ provider: 'deepseek', model: 'deepseek-chat', operation: 'seo-audit', tenantId, inputUnits: inTok, outputUnits: outTok, ok: !!parsed });
      return parsed;
    } catch {
      return null;
    }
  }

  app.post("/api/admin/seo/audit", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { path } = req.body ?? {};
    if (!path) return res.status(400).json({ error: "path is required" });
    const page = await get<any>("SELECT * FROM seo_pages WHERE path = ?", [path]);
    if (!page) return res.status(404).json({ error: "Page not found" });
    const { userId } = getTenant(req);
    const result = await deepseekSeoAudit(page, userId);
    if (!result) return res.status(502).json({ error: "AI audit failed (check DEEPSEEK_API_KEY)" });
    await run(
      `UPDATE seo_pages SET ai_score = ?, ai_suggestions = ?, last_audited_at = CURRENT_TIMESTAMP WHERE path = ?`,
      [result.score ?? null, JSON.stringify(result), path],
    );
    res.json(result);
  });

  app.post("/api/admin/seo/apply", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { path } = req.body ?? {};
    const page = await get<any>("SELECT * FROM seo_pages WHERE path = ?", [path]);
    if (!page?.ai_suggestions) return res.status(400).json({ error: "No suggestions to apply" });
    const s = JSON.parse(page.ai_suggestions).suggestions || {};
    await run(
      `UPDATE seo_pages SET title = ?, description = ?, keywords = ?, updated_at = CURRENT_TIMESTAMP WHERE path = ?`,
      [s.title ?? page.title, s.description ?? page.description, s.keywords ?? page.keywords, path],
    );
    res.json({ success: true });
  });

  // ─── Blog (SEO content) ──────────────────────────────────────────────────────
  function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  }

  // Public — list of published posts.
  app.get("/api/blog", async (_req, res) => {
    const posts = await all(
      `SELECT slug, title, excerpt, og_image AS ogImage, tags, author, published_at AS publishedAt
       FROM blog_posts WHERE status = 'published'
       ORDER BY published_at DESC LIMIT 100`,
    );
    res.json(posts);
  });

  // Public — single post by slug.
  app.get("/api/blog/:slug", async (req, res) => {
    const post = await get(
      `SELECT slug, title, excerpt, body_md AS bodyMd, body_html AS bodyHtml,
              format, og_image AS ogImage,
              seo_title AS seoTitle, seo_description AS seoDescription,
              tags, author, published_at AS publishedAt
       FROM blog_posts WHERE slug = ? AND status = 'published'`,
      [req.params.slug],
    );
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  });

  // Admin — full list (incl. drafts).
  app.get("/api/admin/blog", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const posts = await all(
      `SELECT id, slug, title, excerpt, status, source, format, featured_repo_id AS featuredRepoId,
              published_at AS publishedAt, updated_at AS updatedAt
       FROM blog_posts ORDER BY updated_at DESC`,
    );
    res.json(posts);
  });

  app.get("/api/admin/blog/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const post = await get("SELECT * FROM blog_posts WHERE id = ?", [req.params.id]);
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  });

  app.post("/api/admin/blog", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const {
      id, slug, title, excerpt, body_md, og_image, seo_title, seo_description, tags, author, status,
      source, format, body_html, featured_repo_id,
    } = req.body ?? {};
    if (!title) return res.status(400).json({ error: "title is required" });
    const finalSlug = slug || slugify(title);
    const publishedAt = status === 'published' ? new Date().toISOString() : null;
    if (id) {
      await run(
        `UPDATE blog_posts SET slug=?, title=?, excerpt=?, body_md=?, og_image=?, seo_title=?, seo_description=?,
           tags=?, author=?, status=?, source=?, format=?, body_html=?, featured_repo_id=?,
           published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP ELSE published_at END,
           updated_at = CURRENT_TIMESTAMP
         WHERE id=?`,
        [finalSlug, title, excerpt ?? null, body_md ?? null, og_image ?? null, seo_title ?? null, seo_description ?? null,
         tags ?? null, author ?? null, status ?? 'draft', source ?? null, format ?? null, body_html ?? null, featured_repo_id ?? null,
         status ?? 'draft', id],
      );
      res.json({ success: true, id });
    } else {
      const result = await run(
        `INSERT INTO blog_posts (slug, title, excerpt, body_md, og_image, seo_title, seo_description, tags, author, status, published_at, source, format, body_html, featured_repo_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [finalSlug, title, excerpt ?? null, body_md ?? null, og_image ?? null, seo_title ?? null, seo_description ?? null,
         tags ?? null, author ?? null, status ?? 'draft', publishedAt, source ?? null, format ?? null, body_html ?? null, featured_repo_id ?? null],
      );
      res.json({ success: true, id: Number(result.lastInsertRowid) });
    }
  });

  app.delete("/api/admin/blog/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    await run("DELETE FROM blog_posts WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  // DeepSeek blog draft generator.
  app.post("/api/admin/blog/draft", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { topic, keywords, tone } = req.body ?? {};
    if (!topic) return res.status(400).json({ error: "topic is required" });
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "DEEPSEEK_API_KEY not set" });

    const SYSTEM_PROMPT = `You are the staff technical writer for RepoHive — a SaaS that helps engineering teams discover, score, and curate open-source GitHub repositories with AI.

## Publication
RepoHive Blog — read by senior engineers, staff/principal engineers, tech leads, and CTOs at product companies with 5–200 engineers.

## Voice & Tone
- Opinionated but fair. Take a clear position and defend it with evidence.
- Precise, not clever. Name the thing, describe the thing. No metaphors in technical sentences.
- Dry wit is acceptable; enthusiasm is not. Never write "excited to share", "game-changer", "revolutionary", "deep dive", "unlock", "leverage", or "empower."
- Never open with "In today's fast-paced world..." or any scene-setting preamble. Start with the claim or the problem.
- Active voice throughout.
- Technical sentences under 25 words. Longer only for context paragraphs.
- Write peer-to-peer, as if explaining to a colleague who is equally technical, not a customer prospect.

## Topic Pillars (only write within these)
1. OSS alternatives to paid SaaS — with real cost/ops breakdowns
2. Self-hosting guides — include actual config snippets and operational gotchas
3. GitHub repo quality signals — what makes a repo trustworthy beyond star count
4. Developer tooling — CLIs, local-first tools, new runtimes, DX improvements
5. AI tools for engineers — LLM frameworks, embedding pipelines, local inference; no hype
6. Tech stack decisions — database selection, message queue tradeoffs, language ecosystems with real numbers

## Structure Requirements
- Opening: 2–3 sentences, no heading. State the problem and who it affects. No history, no background.
- Body: 3–5 H2 sections, H3 sub-points where needed. Minimum 800 words, target 1,100–1,400 words.
- Every article must include at least one syntactically correct, runnable code block (shell command, config file, or API call).
- Every article must include at least one direct comparison between two specific tools/options with concrete numbers.
- Closing: H2 titled "Find the Right Tool Faster". 2–3 sentences pointing to RepoHive's repo discovery features. Link text: "explore repos on RepoHive" or "search curated repos".

## SEO Requirements
- Title: 50–60 characters, primary keyword near the front, states a finding or benefit (not just a topic)
- Slug: 3–6 words, lowercase, hyphens only, no stop words
- Excerpt: exactly 1 sentence, under 155 characters, written for a human scanning a list of posts
- seo_title: 50–60 characters optimised for search result click-through
- seo_description: 140–160 characters exactly, contains primary keyword, ends with a benefit clause
- Tags: 3–5 real search terms (e.g. open-source, self-hosting, observability)
- Primary keyword appears in H1, one H2, and naturally 2–4× in body — never forced

## Technical Accuracy Rules
- Only reference packages that exist on GitHub. Cite stars or recent release dates only if they support the point.
- Always specify version or date context for performance claims: "As of mid-2024, version 2.3..."
- When comparing, compare the same metric (don't mix a free-tier price limit with a self-hosted ops cost).
- All code blocks must be syntactically correct and runnable as written.
- No fake company names, no placeholder scenarios. Use real tools with real configs.

## Hard Prohibitions
- No "Conclusion" section that repeats earlier content
- No numbered listicles of vague tips
- No citations from Forbes, Medium listicles, or vendor marketing blogs
- No disclaimer paragraphs
- Do not recommend a tool you cannot verify is actively maintained
- Do not pad to word count — every sentence must add information`;

    const userPrompt = `Write a blog post for RepoHive.

Topic: ${topic}
Target keywords: ${keywords || '(infer from topic)'}${tone ? `\nTone note: ${tone}` : ''}

Return ONLY a single valid JSON object (no markdown wrapper, no explanation before or after):
{
  "title": "Post title 50-60 chars, keyword-first, states a finding",
  "slug": "url-slug-3-to-6-words",
  "excerpt": "One sentence under 155 chars for the post listing",
  "seo_title": "Title tag 50-60 chars optimised for search CTR",
  "seo_description": "Meta description 140-160 chars with primary keyword and benefit clause",
  "tags": "comma,separated,tags",
  "author": "RepoHive Team",
  "body_md": "Full markdown post 1100-1400 words. Opening paragraph with no heading. 3-5 H2 sections with H3 sub-points. At least one fenced code block. At least one direct comparison with numbers. Final H2: Find the Right Tool Faster with CTA to repohive.app."
}`;

    try {
      const r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 4000,
          temperature: 0.55,
          response_format: { type: 'json_object' },
        }),
      });
      if (!r.ok) return res.status(502).json({ error: `DeepSeek ${r.status}` });
      const data: any = await r.json();
      const inTok = data.usage?.prompt_tokens ?? 0;
      const outTok = data.usage?.completion_tokens ?? 0;
      const { userId } = getTenant(req);
      trackUsage({ provider: 'deepseek', model: 'deepseek-chat', operation: 'blog-draft', tenantId: userId, inputUnits: inTok, outputUnits: outTok, ok: true });
      const text: string = data.choices?.[0]?.message?.content || '';
      // json_object mode returns pure JSON, but fall back to regex extraction just in case
      try {
        res.json(JSON.parse(text));
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return res.status(502).json({ error: "AI returned no JSON" });
        res.json(JSON.parse(match[0]));
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Harbor blog import ─────────────────────────────────────────────────────
  // Harbor (harbor.app) owns topic discovery, writing, images, headings — we
  // only import the finished articles and auto-publish them. Deduped by Harbor
  // job id so the same article can never land twice.
  app.get("/api/admin/harbor/status", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    if (!process.env.HARBOR_API_KEY) {
      return res.json({ configured: false });
    }
    const lastImport = await get<any>(
      "SELECT published_at AS publishedAt, title FROM blog_posts WHERE source = 'harbor' ORDER BY id DESC LIMIT 1",
    );
    const counts = await get<any>(
      "SELECT COUNT(*) AS total, SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) AS published FROM blog_posts WHERE source = 'harbor'",
    );
    let account: any = null;
    try { account = await harborGetAccount(); } catch (e: any) {
      return res.json({ configured: true, account: null, lastImport, counts, error: e.message });
    }
    res.json({ configured: true, account, lastImport, counts });
  });

  app.post("/api/admin/harbor/pull", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    if (!process.env.HARBOR_API_KEY) {
      return res.status(400).json({ error: "HARBOR_API_KEY is not set" });
    }
    try {
      const seenRows = await all<{ harbor_job_id: string }>(
        "SELECT harbor_job_id FROM blog_posts WHERE harbor_job_id IS NOT NULL",
      );
      const seen = new Set(seenRows.map(r => r.harbor_job_id));
      const fresh = await pullCompletedArticles(seen);

      let imported = 0, skipped = 0;
      const items: { id: string; slug: string; title: string }[] = [];
      for (const job of fresh) {
        if (!job.content || !job.title) { skipped++; continue; }
        const baseSlug = job.url_slug || job.slug || slugify(job.title);
        const slug = await uniqueBlogSlug(baseSlug);
        const tags = Array.isArray(job.tags) ? job.tags.join(',')
                   : Array.isArray(job.keywords) ? job.keywords.join(',')
                   : null;
        const excerpt = job.excerpt || job.meta_description || job.seo_description || null;
        const seoTitle = job.seo_title || job.title;
        const seoDescription = job.seo_description || job.meta_description || null;
        const ogImage = job.og_image || job.cover_image || null;

        await run(
          `INSERT INTO blog_posts
             (slug, title, excerpt, body_html, format, og_image, seo_title, seo_description, tags, author,
              status, published_at, source, harbor_job_id)
           VALUES (?, ?, ?, ?, 'html', ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP, 'harbor', ?)`,
          [slug, job.title, excerpt, job.content, ogImage, seoTitle, seoDescription, tags, 'Harbor', job.id],
        );
        imported++;
        items.push({ id: job.id, slug, title: job.title });
      }

      res.json({ imported, skipped, items });
    } catch (err: any) {
      // Don't propagate Harbor's own 401/403 — the browser would mistake it
      // for a failure of OUR auth gate. Map upstream auth/quota errors to 502
      // so the UI shows "Harbor rejected our key" instead of "you're signed out".
      if (err instanceof HarborError) {
        const upstream = err.status;
        const ourStatus = upstream === 401 || upstream === 403 ? 502 : (upstream >= 400 && upstream < 600 ? upstream : 502);
        return res.status(ourStatus).json({
          error: `Harbor API ${upstream}: ${err.message}`,
          code: err.code,
          upstreamStatus: upstream,
        });
      }
      res.status(500).json({ error: err.message });
    }
  });

  async function uniqueBlogSlug(base: string): Promise<string> {
    let slug = base;
    let n = 2;
    while (await get("SELECT 1 FROM blog_posts WHERE slug = ?", [slug])) {
      slug = `${base}-${n++}`;
      if (n > 50) { slug = `${base}-${Date.now()}`; break; }
    }
    return slug;
  }

  // ─── Internal promo articles ────────────────────────────────────────────────
  // Featured-repo posts: pick a real high-hitter repo and write a piece on it,
  // always closing with a CTA about building a personal RepoHive toolbox.
  app.get("/api/admin/blog/promo/suggest", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    // Top-scoring repos in the preloaded library that haven't been featured yet.
    const candidates = await all<any>(
      `SELECT r.id, r.owner, r.name, r.url, r.description, r.language, r.license,
              r.stars, r.forks, r.score, r.ai_analysis
       FROM repos r
       WHERE r.tenant_id = '__library__'
         AND r.id NOT IN (SELECT featured_repo_id FROM blog_posts WHERE featured_repo_id IS NOT NULL)
       ORDER BY r.score DESC, r.stars DESC
       LIMIT 12`,
    );
    res.json(candidates.map((r: any) => ({
      ...r,
      ai_analysis: r.ai_analysis ? safeParse(r.ai_analysis) : null,
    })));
  });

  function safeParse(s: string): any { try { return JSON.parse(s); } catch { return null; } }

  app.post("/api/admin/blog/promo", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const { repoId } = req.body ?? {};
    if (!repoId) return res.status(400).json({ error: "repoId is required" });
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "DEEPSEEK_API_KEY not set" });

    // Pull the richest copy of the repo (preloaded library has best metadata).
    const repo = await get<any>(
      `SELECT id, owner, name, url, description, language, license, stars, forks, issues, last_push, ai_analysis
       FROM repos WHERE id = ? ORDER BY (tenant_id = '__library__') DESC LIMIT 1`,
      [repoId],
    );
    if (!repo) return res.status(404).json({ error: "Repo not found" });

    const ai = repo.ai_analysis ? safeParse(repo.ai_analysis) : {};
    const demoUrl = ai?.demoUrl || null;
    const comparableApp = ai?.comparableApp || null;
    const productClass = ai?.productClass || null;
    const useCases = Array.isArray(ai?.useCases) ? ai.useCases.join('; ') : '';

    const SYSTEM_PROMPT = `You are the staff writer for the RepoHive blog, writing a featured-repo article — a deep look at one notable open-source repository, with a clear CTA at the end about using RepoHive to curate a personal toolbox of repos like it.

## Voice & Tone
- Opinionated, precise, peer-to-peer with technical readers (senior engineers, tech leads).
- Active voice. Sentences under 25 words for technical claims.
- No marketing fluff: no "game-changer", "revolutionary", "unlock", "leverage", "empower", "deep dive", "in today's fast-paced world".
- Dry wit acceptable; enthusiasm not.

## Structure (must follow)
- Opening: 2–3 sentences, no heading. State what the repo does and the specific problem it solves. Name the repo and link to it inline.
- Body: 4–5 H2 sections covering:
  1. What it actually does (concrete, technical)
  2. Why it stands out — cite real signals (stars, forks, recent activity, license, what it replaces if anything)
  3. Who it's for / when to reach for it
  4. Honest tradeoffs and where it doesn't fit
  5. (If demoUrl provided) How to try it in 5 minutes — concrete steps
- Include at least one fenced code block (install command, config snippet, or curl).
- Closing H2: "Build your own repo toolbox with RepoHive". 2–3 sentences explaining how RepoHive helps engineers track repos like this — AI scoring, classification (App Killer / SaaS Ready), comparisons, and a personal curated library. Include a link to https://repohive.app with anchor text "start your toolbox" or "explore RepoHive".

## Linking Rules
- Link to the GitHub repo at first mention using its URL.
- If a demo URL is provided, link to it in the "try it" section as "live demo".
- Use the comparableApp name when relevant ("an open-source alternative to <comparableApp>").

## SEO Requirements
- Title: 50–60 chars, includes the repo name (e.g. "<Repo>: <one-line value prop>")
- Slug: include the repo name, 3–6 words, lowercase, hyphens
- seo_title: 50–60 chars, repo name early
- seo_description: 140–160 chars, repo name + concrete benefit
- Tags: 3–5 — include "featured", repo language, and topic tags

## Hard Prohibitions
- No fabricated stats. Use only the numbers in the repo metadata provided.
- No generic "Conclusion" section that recaps.
- No padding to word count — minimum 900 words, target 1100–1300.`;

    const userPrompt = `Write a featured-repo article for RepoHive.

Repo: ${repo.id}
URL: ${repo.url}
Description: ${repo.description || '(none)'}
Language: ${repo.language || 'unknown'}
License: ${repo.license || 'unknown'}
Stars: ${repo.stars}
Forks: ${repo.forks}
Open issues: ${repo.issues}
Last pushed: ${repo.last_push}
RepoHive AI score (0-100): ${repo.score}
AI summary: ${ai?.summary || '(none)'}
Use cases: ${useCases || '(none provided)'}
Classification: ${productClass || 'unclassified'}${comparableApp ? `\nReplaces: ${comparableApp}` : ''}${demoUrl ? `\nDemo URL: ${demoUrl}` : ''}

Return ONLY a single valid JSON object (no markdown wrapper):
{
  "title": "Repo-name-first title 50-60 chars",
  "slug": "url-slug-with-repo-name",
  "excerpt": "One sentence under 155 chars",
  "seo_title": "Title tag 50-60 chars",
  "seo_description": "Meta description 140-160 chars",
  "tags": "featured,language,topic1,topic2",
  "author": "RepoHive Team",
  "body_md": "Full markdown 1100-1300 words following the structure rules. Include the repo link, real numbers from above, code block, and the closing CTA H2."
}`;

    try {
      const r = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 4000,
          temperature: 0.55,
          response_format: { type: 'json_object' },
        }),
      });
      if (!r.ok) return res.status(502).json({ error: `DeepSeek ${r.status}` });
      const data: any = await r.json();
      const { userId } = getTenant(req);
      trackUsage({ provider: 'deepseek', model: 'deepseek-chat', operation: 'blog-promo', tenantId: userId, inputUnits: data.usage?.prompt_tokens ?? 0, outputUnits: data.usage?.completion_tokens ?? 0, ok: true });
      const text: string = data.choices?.[0]?.message?.content || '';
      let draft: any;
      try { draft = JSON.parse(text); }
      catch {
        const m = text.match(/\{[\s\S]*\}/);
        if (!m) return res.status(502).json({ error: "AI returned no JSON" });
        draft = JSON.parse(m[0]);
      }
      // Return the draft plus the repo id — the admin saves it as a regular
      // blog post and we attach featured_repo_id at save time (below).
      res.json({ ...draft, featured_repo_id: repo.id, source: 'promo' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Sitemap & robots ────────────────────────────────────────────────────────
  const SITE_URL = process.env.APP_URL || 'https://repohive.app';

  app.get("/sitemap.xml", async (_req, res) => {
    const seoRows = await all<{ path: string }>("SELECT path FROM seo_pages WHERE noindex = 0");
    const blogRows = await all<{ slug: string; published_at: string }>(
      "SELECT slug, published_at FROM blog_posts WHERE status = 'published'",
    );
    const publicProjects = await all<{ public_slug: string }>(
      "SELECT public_slug FROM projects WHERE is_public = 1 AND public_slug IS NOT NULL",
    );

    const urls: string[] = [];
    const seen = new Set<string>();
    const add = (loc: string, lastmod?: string, changefreq?: string, priority?: string) => {
      if (seen.has(loc)) return;
      seen.add(loc);
      urls.push(`<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}${priority ? `<priority>${priority}</priority>` : ''}</url>`);
    };

    add(`${SITE_URL}/`, undefined, 'weekly', '1.0');
    for (const p of seoRows) add(`${SITE_URL}${p.path}`, undefined, 'weekly', '0.8');
    for (const b of blogRows) add(`${SITE_URL}/blog/${b.slug}`, b.published_at?.slice(0, 10), 'monthly', '0.7');
    for (const pr of publicProjects) add(`${SITE_URL}/p/${pr.public_slug}`, undefined, 'monthly', '0.5');

    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`);
  });

  app.get("/robots.txt", (_req, res) => {
    res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /app
Disallow: /api/
Sitemap: ${SITE_URL}/sitemap.xml
`);
  });

  // ─────────────────────────────────────────────────────────────────────────────

  return app;
}
