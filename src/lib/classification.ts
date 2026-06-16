// Shared product classification for repos.
//
// Two primary classifications are surfaced across the app:
//   - "app-killer": a production-ready, self-hostable app that is a credible
//     drop-in replacement for a SPECIFIC named commercial product
//     (e.g. Plausible → Google Analytics). Rendered in amber/orange.
//   - "saas-ready": a standalone, self-hostable SaaS-style application that you
//     can run as a service, but which doesn't cleanly replace one named product.
//     Rendered in cyan.
//
// Everything else (libraries, SDKs, bridges, plugins/extensions, CLI wrappers,
// inference-engine adapters, demos) is unclassified.
//
// The classification lives inside the repo's `ai_analysis` JSON. This helper is
// the single source of truth so every surface (cards, detail, compare, public
// pages, filters) agrees. It also reclassifies legacy records that only carry
// the older `enterpriseTier` flag.

export type ProductClass = 'app-killer' | 'saas-ready' | null;

export interface RepoClassification {
  kind: ProductClass;
  /** The named commercial product an app-killer replaces. Null otherwise. */
  comparableApp: string | null;
  /** A live demo / hosted homepage URL, when the analysis found one. */
  demoUrl: string | null;
}

function cleanString(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
}

function cleanUrl(v: unknown): string | null {
  const s = cleanString(v);
  return s && /^https?:\/\//i.test(s) ? s : null;
}

export function classifyRepo(aiData: any): RepoClassification {
  if (!aiData || typeof aiData !== 'object') {
    return { kind: null, comparableApp: null, demoUrl: null };
  }

  const comparableApp = cleanString(aiData.comparableApp);
  const demoUrl = cleanUrl(aiData.demoUrl);

  let kind: ProductClass = null;
  // Normalise spellings: 'saas_ready', 'SaaS Ready', 'app killer' all map.
  const raw = typeof aiData.productClass === 'string' ? aiData.productClass : null;
  const pc = raw ? raw.toLowerCase().trim().replace(/[\s_]+/g, '-') : null;

  if (pc === 'app-killer') {
    // A killer with no named product is really just a SaaS-ready app.
    kind = comparableApp ? 'app-killer' : 'saas-ready';
  } else if (pc === 'saas-ready') {
    kind = 'saas-ready';
  } else if (pc === 'none') {
    kind = null;
  } else if (aiData.enterpriseTier === true) {
    // Legacy records: only had enterpriseTier. Reclassify by whether they
    // actually name a product they replace.
    kind = comparableApp ? 'app-killer' : 'saas-ready';
  }

  return { kind, comparableApp, demoUrl };
}

export const isAppKiller = (aiData: any) => classifyRepo(aiData).kind === 'app-killer';
export const isSaasReady = (aiData: any) => classifyRepo(aiData).kind === 'saas-ready';
