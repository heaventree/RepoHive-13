# RepoHive — Replit Setup

## Overview
Multi-tenant SaaS for GitHub repository intelligence. Paste GitHub URLs, get AI-analyzed repo cards with scores, tags, integration notes, and semantic search. Deployed to **repohive.cloud** on Netlify.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS v4 (built to `dist/`)
- **Backend**: Express via `api-app.ts` (factory function) — runs as Netlify Function in prod, or `server.ts` thin wrapper in dev
- **Database**: Turso/libSQL (remote) with local file fallback — schema in `api-app.ts` `initSchema()`
- **Auth**: Clerk (`@clerk/react` + `@clerk/express`) — multi-tenant, enabled when valid `CLERK_SECRET_KEY` + `CLERK_PUBLISHABLE_KEY` are set
- **AI**: DeepSeek (analysis/expansion) + Gemini (embeddings) — server-side only
- **GitHub**: GitHub API — server-side only via `GITHUB_TOKEN`

## Workflow (Replit dev)
**Command**: `NODE_ENV=production tsx server.ts` (runs after `npm run build`)

In production (Netlify): `npm run build` → `dist/` static + `netlify/functions/api.ts` serverless function.

After changing source files, rebuild and restart the workflow.

## Multi-Tenancy & Plans
- Each user/org gets their own `tenant_id` from Clerk (`userId` or `orgId`)
- Dev fallback tenant: `dev-tenant` (when auth is disabled)
- Plans: `free` (100 repos), `solo` (500 repos, 100/mo, 1 API key), `studio` (5000 repos, 500/mo, 25 API keys)
- Shared App Killers library lives under `__library__` tenant, preloaded for Studio+

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/repos` | List tenant repos |
| POST | `/api/repos` | Save a repo |
| POST | `/api/ingest` | Fetch GitHub repo + AI analysis |
| POST | `/api/recommend` | AI/vector recommendations for a project |
| GET | `/api/search` | Full-text search |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/pinned` | Pinned repos for a project |
| POST | `/api/projects/:id/pin` | Pin a repo to a project |
| GET | `/api/subscription` | Tenant plan + usage |
| POST | `/api/subscription/plan` | Change plan |
| GET | `/api/keys` | List API keys |
| POST | `/api/keys` | Create API key |
| DELETE | `/api/keys/:id` | Delete API key |
| GET | `/api/admin/library` | Admin: list library repos |
| POST | `/api/admin/library/promote` | Admin: promote repo to library |
| POST | `/api/sweep` | AI analysis sweep |
| POST | `/api/embed/sweep` | Embedding sweep |
| GET | `/api/external/repos` | Public API (API-key auth) |

## Required Environment Variables
| Variable | Where | Notes |
|----------|-------|-------|
| `TURSO_AUTH_TOKEN` | Replit Secret | Turso database auth |
| `TURSO_DATABASE_URL` | Replit Env | `libsql://...turso.io` |
| `CLERK_SECRET_KEY` | Replit Secret | Must start with `sk_test_` or `sk_live_` |
| `CLERK_PUBLISHABLE_KEY` | Replit Env | Must start with `pk_test_` or `pk_live_` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Replit Env | Same value as CLERK_PUBLISHABLE_KEY (for frontend) |
| `DEEPSEEK_API_KEY` | Replit Secret | Repo analysis + brief expansion |
| `GEMINI_API_KEY` | Replit Secret | Vector embeddings |
| `GITHUB_TOKEN` | Replit Secret | GitHub API (avoids 60 req/hr limit) |
| `ADMIN_USER_IDS` | Replit Env | Comma-separated Clerk user IDs for library curation |

## Auth Notes
- Auth is enabled only when both `CLERK_SECRET_KEY` (starts `sk_`) and `CLERK_PUBLISHABLE_KEY` (starts `pk_`) have valid formats
- If invalid/missing, server runs in dev mode under `dev-tenant` — safe for local testing
- In the Replit Secrets panel, `CLERK_SECRET_KEY` value must be the actual key (not the variable name)

## Database Schema
- `repos` — ingested repositories with AI analysis JSON (tenant-scoped)
- `projects` — user-defined projects (tenant-scoped)
- `pinned_repos` — repos pinned to projects
- `project_recommendations` — saved AI recommendations
- `api_keys` — per-tenant API keys (hashed)
- `subscriptions` — tenant plan records
- `usage_tracking` — monthly additions per tenant
- `snapshots` — historical score/stars snapshots
- `config` — per-tenant key-value config

## Netlify Deployment
- `netlify.toml` — build: `npm run build`, publish: `dist`, functions: `netlify/functions`
- `netlify/functions/api.ts` — wraps `createApiApp()` with `serverless-http`
- `/api/*` → Netlify Function; everything else → `index.html` (SPA)

## User preferences
- App name: **RepoHive**, URL: **repohive.cloud**
- Deploy target: **Netlify** (not Replit deploy)
