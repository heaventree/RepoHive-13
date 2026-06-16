// Shared reclassification sweep — used by both the admin API (frontend-driven
// manual run) and the Netlify scheduled function (periodic auto-run).
//
// Why batched + stateless: the API runs as a single Netlify Function. A
// fire-and-forget background loop is frozen the moment the response is sent,
// and in-memory progress doesn't survive between invocations. So instead each
// call processes a small, awaited batch and persists results to the DB; callers
// repeat until nothing remains. Progress is always derived from the DB.

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

// A repo needs a (normal) reclassify when its analysis predates the current
// classifier — i.e. it has no productClass, or an older classifierVersion.
function needsReclassify(ai: any): boolean {
  if (!ai || typeof ai !== 'object') return true;
  if (typeof ai.productClass !== 'string') return true;
  const v = typeof ai.classifierVersion === 'number' ? ai.classifierVersion : 0;
  return v < CLASSIFIER_VERSION;
}

// In force mode we want to re-analyse everything, so the marker is "was this
// repo processed during the current drive?" — tracked via reclassifiedAt.
function processedSince(ai: any, since: string): boolean {
  const at = typeof ai?.reclassifiedAt === 'string' ? ai.reclassifiedAt : null;
  return !!at && at >= since;
}

export interface ReclassifyStats {
  total: number;
  pending: number;
  classified: number;
  classifierVersion: number;
}

// DB-derived progress for the admin status panel.
export async function reclassifyStats(): Promise<ReclassifyStats> {
  const rows = await all<{ ai_analysis: string | null }>("SELECT ai_analysis FROM repos");
  let pending = 0;
  for (const r of rows) {
    if (needsReclassify(parse(r.ai_analysis))) pending++;
  }
  return {
    total: rows.length,
    pending,
    classified: rows.length - pending,
    classifierVersion: CLASSIFIER_VERSION,
  };
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

// Process repos that still need work — up to `limit`, and only while under the
// time budget — awaiting each so the result is persisted before we return.
// Returns how many remain so the caller can loop. The time budget is what keeps
// a single request under the Netlify function timeout (DeepSeek calls are slow).
export async function reclassifyBatch(opts: ReclassifyBatchOpts = {}): Promise<ReclassifyBatchResult> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100);
  const maxMs = Math.min(Math.max(opts.maxMs ?? 7000, 1000), 20000);
  const force = !!opts.forceSince;
  const start = Date.now();

  const rows = await all<RepoRow>("SELECT tenant_id, id, description, language, readme, ai_analysis FROM repos");

  const candidates = rows.filter(r => {
    const ai = parse(r.ai_analysis);
    return force ? !processedSince(ai, opts.forceSince!) : needsReclassify(ai);
  });

  let processed = 0, updated = 0, failed = 0;

  for (const repo of candidates) {
    if (processed >= limit || Date.now() - start >= maxMs) break;
    processed++;
    try {
      const existing = parse(repo.ai_analysis);
      const topics = Array.isArray(existing.tags) ? existing.tags : [];
      const { parsed } = await analyzeRepo(repo.id, repo.description || '', repo.language, topics, repo.readme);
      const now = new Date().toISOString();
      if (parsed) {
        const merged = { ...existing, ...parsed, classifierVersion: CLASSIFIER_VERSION, reclassifiedAt: now };
        await run("UPDATE repos SET ai_analysis = ? WHERE tenant_id = ? AND id = ?", [JSON.stringify(merged), repo.tenant_id, repo.id]);
        updated++;
      } else {
        // No usable result (e.g. missing API key). Still stamp the attempt so the
        // sweep converges instead of spinning on the same un-analysable repo.
        const merged = { ...existing, classifierVersion: CLASSIFIER_VERSION, reclassifiedAt: now };
        await run("UPDATE repos SET ai_analysis = ? WHERE tenant_id = ? AND id = ?", [JSON.stringify(merged), repo.tenant_id, repo.id]);
        failed++;
      }
    } catch (err: any) {
      console.warn(`[reclassify] ${repo.id} failed: ${err.message}`);
      failed++;
    }
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
