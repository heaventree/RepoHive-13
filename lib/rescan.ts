// Shared rescan logic used by both the admin API endpoint (manual trigger)
// and the Netlify scheduled function (weekly automated run).

import "dotenv/config";
import { all, run } from "../db";

const LIBRARY_TENANT = "__library__";

function computeScore(stars: number, forks: number, issues: number, lastPush: string): number {
  const popularity  = Math.min(40, Math.round(Math.log10(stars + 1) * 16));
  const forkScore   = Math.min(15, Math.round(Math.log10(forks + 1) * 7));
  const issueRatio  = stars > 0 ? Math.min(1, issues / (stars * 0.1)) : 1;
  const issuePenalty = Math.round(issueRatio * 10);
  const monthsOld   = (Date.now() - new Date(lastPush).getTime()) / (1000 * 60 * 60 * 24 * 30);
  const recency     = monthsOld < 1 ? 20 : monthsOld < 6 ? 15 : monthsOld < 12 ? 10 : monthsOld < 24 ? 5 : 0;
  return Math.max(0, Math.min(90, popularity + forkScore - issuePenalty + recency));
}

async function fetchGH(path: string): Promise<any> {
  const headers: Record<string, string> = { "User-Agent": "RepoHive/2" };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

export interface RescanResult {
  processed: number;
  updated: number;
  archived: number;
  errors: number;
}

// Rescan the N oldest-updated user repos across all tenants, refreshing their
// GitHub stats (stars, forks, issues, last_push, score) without re-running AI
// analysis. Library-source copies are skipped — only the originals matter.
// Repos that 404 (deleted/renamed/private) are marked ARCHIVED.
export async function rescanOldestRepos(limit = 150): Promise<RescanResult> {
  const repos = await all<{ tenant_id: string; id: string }>(
    `SELECT tenant_id, id FROM repos
     WHERE source = 'user' AND tenant_id != ?
     ORDER BY updated_at ASC
     LIMIT ?`,
    [LIBRARY_TENANT, limit],
  );

  let updated = 0, archived = 0, errors = 0;
  for (const repo of repos) {
    try {
      const data = await fetchGH(`/repos/${repo.id}`);
      const stars    = data.stargazers_count ?? 0;
      const forks    = data.forks_count ?? 0;
      const issues   = data.open_issues_count ?? 0;
      const lastPush = data.pushed_at ?? new Date().toISOString();
      const score    = computeScore(stars, forks, issues, lastPush);
      await run(
        `UPDATE repos
         SET stars=?, forks=?, issues=?, last_push=?, score=?, updated_at=CURRENT_TIMESTAMP
         WHERE tenant_id=? AND id=?`,
        [stars, forks, issues, lastPush, score, repo.tenant_id, repo.id],
      );
      updated++;
    } catch (err: any) {
      if (err.message?.includes("404")) {
        // Repo deleted, renamed, or made private — preserve the record but flag it
        await run(
          "UPDATE repos SET status='ARCHIVED', updated_at=CURRENT_TIMESTAMP WHERE tenant_id=? AND id=?",
          [repo.tenant_id, repo.id],
        ).catch(() => {});
        archived++;
      } else {
        errors++;
      }
    }
  }

  return { processed: repos.length, updated, archived, errors };
}
