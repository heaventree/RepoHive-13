// Server-side Harbor API client.
//
// Harbor (https://outgoing-oyster-428.convex.site/v1) runs Harbor's discovery
// + writing engine. We do NOT drive the writer from our prompts — Harbor picks
// topics, writes the article, generates images, fixes heading hierarchy.
// Our role is to *import* what Harbor has already produced and publish it.
//
// The key lives in HARBOR_API_KEY (server env only). Never expose it to the
// browser.

const HARBOR_BASE = "https://outgoing-oyster-428.convex.site/v1";

export interface HarborJob {
  id: string;
  type: "article" | "landing_page" | "rework" | "research";
  status: "queued" | "generating" | "completed" | "failed";
  created_at: number;
  updated_at: number;
  title?: string;
  content?: string;
  word_count?: number;
  error?: string;
  // Harbor populates these when the article has been generated.
  seo_title?: string;
  seo_description?: string;
  meta_description?: string;
  excerpt?: string;
  slug?: string;
  url_slug?: string;
  cover_image?: string;
  og_image?: string;
  tags?: string[];
  keywords?: string[];
}

export interface HarborListResponse<T> {
  data: T[];
  next_cursor?: string | null;
}

export class HarborError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function harborFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiKey = process.env.HARBOR_API_KEY;
  if (!apiKey) {
    throw new HarborError(500, "missing_api_key", "HARBOR_API_KEY is not set");
  }
  const res = await fetch(`${HARBOR_BASE}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const err = (data as any)?.error;
    throw new HarborError(res.status, err?.code || "unknown", err?.message || `HTTP ${res.status}`);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return null; }
}

export async function listArticles(opts: { limit?: number; cursor?: string } = {}): Promise<HarborListResponse<HarborJob>> {
  const qs = new URLSearchParams();
  if (opts.limit) qs.set("limit", String(opts.limit));
  if (opts.cursor) qs.set("cursor", opts.cursor);
  const suffix = qs.toString() ? `?${qs}` : "";
  return harborFetch<HarborListResponse<HarborJob>>(`/articles${suffix}`);
}

export async function getArticle(id: string): Promise<HarborJob> {
  return harborFetch<HarborJob>(`/articles/${encodeURIComponent(id)}`);
}

export async function getAccount(): Promise<{ articles_remaining: number; articles_monthly_limit: number; plan: string }> {
  return harborFetch(`/account`);
}

// Pull every completed Harbor article we haven't already imported, page by
// page. Stops as soon as a page contains no new ids — Harbor returns newest
// first, so once we hit known territory there's nothing else to find.
export async function pullCompletedArticles(seenIds: Set<string>, maxPages = 5): Promise<HarborJob[]> {
  const out: HarborJob[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < maxPages; page++) {
    const resp = await listArticles({ limit: 25, cursor });
    const completed = resp.data.filter(j => j.status === "completed" && !seenIds.has(j.id));
    if (completed.length === 0) break;
    out.push(...completed);
    if (!resp.next_cursor) break;
    cursor = resp.next_cursor;
  }
  return out;
}
