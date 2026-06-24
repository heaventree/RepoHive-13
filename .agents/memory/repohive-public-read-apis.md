---
name: RepoHive public read API gap
description: Marketing pages fetch public GET endpoints that are not implemented server-side.
---

# Public read API gap

The marketing/front-end pages fetch **public** GET endpoints that do not exist in `api-app.ts`:
- `GET /api/blog`, `GET /api/blog/:slug` (BlogIndexPage, BlogPostPage)
- `GET /api/integrations`, `GET /api/integrations/:slug` (IntegrationsPage, IntegrationToolPage)
- `GET /api/p/:slug` (PublicProjectPage)

Only **admin** counterparts exist (`/api/admin/blog*`, `/api/admin/integrations*`). Requests to the public paths fall through to the SPA catch-all and return `200 text/html`, so `r.json()` throws and the pages show graceful empty / "not found" states.

**Why:** This predates the front-end reskin — `IntegrationsPage` was already routed and fetching `/api/integrations` before blog/public-project routes were added. The read APIs were apparently never built (or were removed), leaving admin-only write/seed endpoints.

**How to apply:** If asked why the blog/integrations/public-project pages are empty, the fix is backend: implement the public read endpoints in `api-app.ts` (tenant-scoped for `/api/p/:slug`, library/global for blog & integrations) returning JSON. The front-end already handles the data shape and degrades safely without it.
