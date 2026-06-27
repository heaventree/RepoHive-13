// Shared reclassification sweep — used by both the admin API (frontend-driven
// manual run) and the Netlify scheduled function (periodic auto-run).
//
// Why batched + stateless: the API runs as a single Netlify Function. A
// fire-and-forget background loop is frozen the moment the response is sent,
// and in-memory progress doesn't survive between invocations. So instead each
// call processes a small, awaited batch and persists results to the DB; callers
// repeat until nothing remains. Progress is always derived from the DB.
//
// Work is de-duplicated by repo id: the same repo can exist as several rows
// (the owner's copy, the preloaded __library__ copy, other tenants' copies).
// We analyse each unique id once and write the result to every copy, so the
// counts reflect real repos and every surface that reads a copy stays in sync.

import "dotenv/config";
import { all, run } from "../db";
import { analyzeRepo, CLASSIFIER_VERSION } from "./analyze";

interface RepoRow {
  tenant_id: string;
  id: string;
  description: string | null;
  language: string | null;
  readme: string | null;
  ai_analysis: string | null;
}

function parse(json: string | null): any {
  try { return json ? JSON.parse(json) : {}; } catch { return {}; }
}

// Convergence is version-based: a repo is "done" once stamped at the current
// classifier version, regardless of the outcome. This guarantees the sweep
// always drains (a repo that errors is still stamped, so it won't spin), and a
// prompt change (CLASSIFIER_VERSION bump) re-queues everything exactly once.
function needsReclassify(ai: any): boolean {
  const v = typeof ai?.classifierVersion === 'number' ? ai.classifierVersion : 0;
  return v < CLASSIFIER_VERSION;
}

function processedSince(ai: any, since: string): boolean {
  const at = typeof ai?.reclassifiedAt === 'string' ? ai.reclassifiedAt : null;
  return !!at && at >= since;
}

// Group every row by repo id; keep the richest analysis as the representative.
function groupById(rows: RepoRow[]): Map<string, RepoRow[]> {
  const map = new Map<string, RepoRow[]>();
  for (const r of rows) {
    const list = map.get(r.id);
    if (list) list.push(r); else map.set(r.id, [r]);
  }
  return map;
}

export interface ReclassifyStats {
  total: number;
  pending: number;
  classified: number;
  classifierVersion: number;
}

// DB-derived progress for the admin status panel — de-duplicated by repo id.
// A repo counts as pending if ANY of its copies is still stale, so the number
// reflects work that remains across all tenants (not just the first copy seen).
export async function reclassifyStats(): Promise<ReclassifyStats> {
  const rows = await all<{ id: string; ai_analysis: string | null }>("SELECT id, ai_analysis FROM repos");
  const pendingById = new Map<string, boolean>();
  for (const r of rows) {
    const stale = needsReclassify(parse(r.ai_analysis));
    pendingById.set(r.id, (pendingById.get(r.id) ?? false) || stale);
  }

  let pending = 0;
  for (const isPending of pendingById.values()) if (isPending) pending++;
  return {
    total: pendingById.size,
    pending,
    classified: pendingById.size - pending,
    classifierVersion: CLASSIFIER_VERSION,
  };
}

// Effective productClass distribution (de-duplicated by id), mirroring how the
// UI buckets repos: an "app-killer" with no named product counts as saas-ready.
export interface ReclassifyDistribution {
  appKiller: number;
  saasReady: number;
  none: number;
  unclassified: number;
}

export async function reclassifyDistribution(): Promise<ReclassifyDistribution> {
  const rows = await all<{ id: string; ai_analysis: string | null }>("SELECT id, ai_analysis FROM repos");
  const byId = new Map<string, any>();
  for (const r of rows) if (!byId.has(r.id)) byId.set(r.id, parse(r.ai_analysis));

  const dist: ReclassifyDistribution = { appKiller: 0, saasReady: 0, none: 0, unclassified: 0 };
  for (const ai of byId.values()) {
    const raw = typeof ai?.productClass === 'string' ? ai.productClass : null;
    const pc = raw ? raw.toLowerCase().trim().replace(/[\s_]+/g, '-') : null;
    const hasComparable = typeof ai?.comparableApp === 'string' && ai.comparableApp.trim().length > 0;
    if (pc === 'app-killer') (hasComparable ? dist.appKiller++ : dist.saasReady++);
    else if (pc === 'saas-ready') dist.saasReady++;
    else if (pc === 'none') dist.none++;
    else dist.unclassified++;
  }
  return dist;
}

// Per-tenant breakdown — answers "did the user's tenant actually receive the
// new classifications?" Picks one effective kind per (tenant, id) the same way
// the UI's classifyRepo() does.
export interface TenantBreakdownRow {
  tenant_id: string;
  total: number;
  appKiller: number;
  saasReady: number;
  none: number;
  unclassified: number;
  sampleSaasReady: string[];
}

export async function reclassifyTenantBreakdown(): Promise<TenantBreakdownRow[]> {
  const rows = await all<{ tenant_id: string; id: string; ai_analysis: string | null }>(
    "SELECT tenant_id, id, ai_analysis FROM repos"
  );
  const byTenant = new Map<string, TenantBreakdownRow>();
  for (const r of rows) {
    let row = byTenant.get(r.tenant_id);
    if (!row) {
      row = { tenant_id: r.tenant_id, total: 0, appKiller: 0, saasReady: 0, none: 0, unclassified: 0, sampleSaasReady: [] };
      byTenant.set(r.tenant_id, row);
    }
    row.total++;
    const ai = parse(r.ai_analysis);
    const raw = typeof ai?.productClass === 'string' ? ai.productClass : null;
    const pc = raw ? raw.toLowerCase().trim().replace(/[\s_]+/g, '-') : null;
    const hasComparable = typeof ai?.comparableApp === 'string' && ai.comparableApp.trim().length > 0;
    const kind = pc === 'app-killer'
      ? (hasComparable ? 'app-killer' : 'saas-ready')
      : pc === 'saas-ready' ? 'saas-ready'
      : pc === 'none' ? 'none' : null;
    if (kind === 'app-killer') row.appKiller++;
    else if (kind === 'saas-ready') {
      row.saasReady++;
      if (row.sampleSaasReady.length < 5) row.sampleSaasReady.push(r.id);
    }
    else if (kind === 'none') row.none++;
    else row.unclassified++;
  }
  return [...byTenant.values()].sort((a, b) => b.total - a.total);
}

export interface ReclassifyBatchResult {
  processed: number;
  updated: number;
  failed: number;
  remaining: number;
}

export interface ReclassifyBatchOpts {
  limit?: number;
  /** Wall-clock budget (ms). Stops early so the request returns before the
   *  serverless function times out, however slow DeepSeek is. */
  maxMs?: number;
  /** When set, re-analyse every repo not yet processed at/after this ISO time. */
  forceSince?: string | null;
}

// Process unique repos that still need work — up to `limit`, and only while
// under the time budget — awaiting each so the result is persisted before we
// return. Every processed repo is stamped (success or failure) so the sweep
// always converges. Returns how many remain so the caller can loop.
export async function reclassifyBatch(opts: ReclassifyBatchOpts = {}): Promise<ReclassifyBatchResult> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100);
  const maxMs = Math.min(Math.max(opts.maxMs ?? 7000, 1000), 20000);
  const force = !!opts.forceSince;
  const start = Date.now();

  const rows = await all<RepoRow>("SELECT tenant_id, id, description, language, readme, ai_analysis FROM repos");
  const byId = groupById(rows);

  // A group is a candidate if ANY of its copies still needs work — so a stale
  // user-tenant copy isn't skipped just because the __library__ copy was
  // already classified (the bug that left tenant copies unclassified).
  const candidates = [...byId.values()].filter(group =>
    group.some(row => {
      const ai = parse(row.ai_analysis);
      return force ? !processedSince(ai, opts.forceSince!) : needsReclassify(ai);
    })
  );

  let processed = 0, updated = 0, failed = 0;

  for (const group of candidates) {
    if (processed >= limit || Date.now() - start >= maxMs) break;
    processed++;

    const rep = group.find(r => r.description || r.readme) || group[0];
    const now = new Date().toISOString();
    let classFields: any = { classifierVersion: CLASSIFIER_VERSION, reclassifiedAt: now };

    try {
      const existing = parse(rep.ai_analysis);
      const topics = Array.isArray(existing.tags) ? existing.tags : [];
      const { parsed } = await analyzeRepo(rep.id, rep.description || '', rep.language, topics, rep.readme);
      if (parsed) {
        classFields = { ...parsed, ...classFields };
        updated++;
      } else {
        // No usable result (e.g. missing API key). Still stamped, so it converges.
        failed++;
      }
    } catch (err: any) {
      console.warn(`[reclassify] ${rep.id} failed: ${err.message}`);
      classFields = { ...classFields, classifyError: String(err.message).slice(0, 200) };
      failed++;
    }

    // Write the new classification onto every copy of this repo, preserving
    // each row's own pre-existing analysis fields.
    for (const row of group) {
      const merged = { ...parse(row.ai_analysis), ...classFields };
      await run("UPDATE repos SET ai_analysis = ? WHERE tenant_id = ? AND id = ?", [JSON.stringify(merged), row.tenant_id, row.id]);
    }

    // Gentle pacing to stay under DeepSeek rate limits.
    await new Promise(r => setTimeout(r, 120));
  }

  return {
    processed,
    updated,
    failed,
    remaining: Math.max(0, candidates.length - processed),
  };
}

// Drains the entire backlog in batches, up to a safety cap on iterations.
// Used by the scheduled function. Each batch is awaited and persisted, so even
// if the function is killed mid-run the next schedule resumes where it left off.
export async function reclassifyDrain(maxBatches = 40, limit = 25): Promise<ReclassifyBatchResult> {
  const totals: ReclassifyBatchResult = { processed: 0, updated: 0, failed: 0, remaining: 0 };
  for (let i = 0; i < maxBatches; i++) {
    const r = await reclassifyBatch({ limit, maxMs: 20000 });
    totals.processed += r.processed;
    totals.updated += r.updated;
    totals.failed += r.failed;
    totals.remaining = r.remaining;
    if (r.processed === 0 || r.remaining === 0) break;
  }
  return totals;
}
