# RepoScout — Replit Setup

## Overview
GitHub repository scouting tool. Paste GitHub URLs, get AI-analyzed repo cards with scores, tags, and integration notes. Built on Vite + React + Express + SQLite.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS v4 (built to `dist/`)
- **Backend**: Express on port 5000, serving static `dist/` in production
- **Database**: SQLite (`reposcout.db`) — persistent across restarts
- **AI**: Gemini API (server-side only, via `GEMINI_API_KEY` secret)
- **GitHub**: GitHub API (server-side only, via `GITHUB_TOKEN` secret)

## Workflow
**Command**: `npm run build && NODE_ENV=production tsx server.ts`

Vite builds the React app into `dist/`, then Express serves it statically. This avoids Vite's dev-server WebSocket (which causes "Upgrade Required" in Replit's preview proxy).

After changing source files, restart the workflow to rebuild.

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/repos` | List all repos |
| POST | `/api/repos` | Save a repo |
| GET | `/api/repos/:id` | Get one repo |
| PUT | `/api/repos/:id` | Update a repo |
| DELETE | `/api/repos/:id` | Delete a repo |
| POST | `/api/ingest` | Fetch GitHub repo + AI analysis (server-side) |
| POST | `/api/recommend` | AI recommendations for a project (server-side) |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/config` | Get server config/health |
| GET | `/api/search` | Search repos |

## Security
- `GEMINI_API_KEY` and `GITHUB_TOKEN` are **server-side only** — never sent to the browser
- No Supabase, no client-side auth
- All API calls from components go to `/api/*` endpoints

## Required Secrets
- `GEMINI_API_KEY` — set in Replit Secrets panel (already configured)
- `GITHUB_TOKEN` — optional but recommended (avoids 60 req/hr unauthenticated limit)

## Database Schema
- `repos` — ingested repositories with AI analysis JSON
- `projects` — user-defined projects with repo associations
- `ingest_queue` — URL queue for bulk ingest resumability
