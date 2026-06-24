---
name: RepoHive public read API gap
description: Why the blog/integrations/public-project marketing pages render empty.
---

# Public read API gap

The public-facing marketing pages (blog, integrations directory + tool detail, shared public project) were built to fetch **public GET** endpoints, but the backend only ships their **admin** counterparts. Public requests fall through to the SPA catch-all and return `200 text/html`, so the pages catch the JSON-parse failure and show graceful empty / "not found" states.

**Why it matters:** Seeing these pages empty is expected, not a bug in the front-end. The front-end already handles the data shapes correctly — the missing piece is server-side. This predates the marketing reskin (the integrations page was already wired to a non-existent public endpoint before blog/public-project routes existed), so treat "build the public read endpoints" as deliberate deferred backend work, not a regression to chase in the UI.
