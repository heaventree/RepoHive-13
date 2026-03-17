import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import net from "net";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "reposcout.db");
const db = new Database(dbPath);

console.log(`Database initialized at: ${dbPath}`);

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS repos (
    id TEXT PRIMARY KEY,
    owner TEXT,
    name TEXT,
    url TEXT UNIQUE,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Safety check for existing databases
try {
  db.exec("ALTER TABLE repos ADD COLUMN ai_analysis TEXT");
} catch (e) {
  // Column likely already exists
}

db.exec(`
  CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_id TEXT,
    score INTEGER,
    stars INTEGER,
    issues INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(repo_id) REFERENCES repos(id)
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    constraints TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pinned_repos (
    project_id INTEGER,
    repo_id TEXT,
    notes TEXT,
    PRIMARY KEY(project_id, repo_id),
    FOREIGN KEY(project_id) REFERENCES projects(id),
    FOREIGN KEY(repo_id) REFERENCES repos(id)
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "24678", 10);

  app.use(express.json());

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

  async function fetchGitHub(path: string) {
    const headers: Record<string, string> = { 'User-Agent': 'RepoScout/2' };
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com${path}`, { headers });
    if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`);
    return res.json() as Promise<any>;
  }

  // POST /api/ingest
  app.post("/api/ingest", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url is required" });

    const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (!match) return res.status(400).json({ error: "Not a valid GitHub URL" });
    const [, owner, repoName] = match;

    try {
      const data = await fetchGitHub(`/repos/${owner}/${repoName}`);

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
        const rm = await fetchGitHub(`/repos/${owner}/${repoName}/readme`);
        readme = Buffer.from(rm.content, 'base64').toString('utf8').slice(0, 5000);
      } catch (_) {}

      const aiAnalysis = {
        category,
        tags: [language, ...topics.slice(0, 4)].filter(Boolean) as string[],
        summary: desc || `${owner}/${repoName}`,
        useCases: topics.slice(0, 3).map((t: string) =>
          t.split('-').map((w: string) => w[0]?.toUpperCase() + w.slice(1)).join(' ')
        ).filter(Boolean),
        integrationNotes: []
      };

      const id = `${owner}/${repoName}`;
      const stmt = db.prepare(`
        INSERT INTO repos (id, owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, ai_analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          stars=excluded.stars, forks=excluded.forks, issues=excluded.issues,
          last_push=excluded.last_push, score=excluded.score,
          readme=excluded.readme, ai_analysis=excluded.ai_analysis,
          updated_at=CURRENT_TIMESTAMP
      `);
      stmt.run(id, owner, repoName, data.html_url, stars, forks, issues, language, license, lastPush, desc, readme, score, JSON.stringify(aiAnalysis));
      db.prepare("INSERT INTO snapshots (repo_id, score, stars, issues) VALUES (?, ?, ?, ?)").run(id, score, stars, issues);

      console.log(`Ingested ${id} — score: ${score}, category: ${category}`);
      res.json({ success: true, id, score, category });
    } catch (err: any) {
      console.error(`Ingest failed for ${owner}/${repoName}:`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/recommend
  app.post("/api/recommend", (req, res) => {
    const { brief = '', repos = [], constraints } = req.body;
    const keywords = brief.toLowerCase().split(/\W+/).filter((w: string) => w.length > 3);
    const scored = (repos as any[]).map(repo => {
      let fit = repo.score ?? 0;
      const text = [repo.id, repo.description, repo.language].join(' ').toLowerCase();
      keywords.forEach((kw: string) => { if (text.includes(kw)) fit += 8; });
      if (constraints?.language && repo.language?.toLowerCase() === constraints.language.toLowerCase()) fit += 15;
      if (constraints?.minStars && repo.stars < constraints.minStars) fit = 0;
      return { repoId: repo.id, fitScore: Math.min(99, fit), rationale: `Matches ${keywords.filter((k: string) => [repo.id, repo.description || '', repo.language || ''].join(' ').toLowerCase().includes(k)).join(', ') || 'general criteria'} in brief.`, warnings: (repo.open_issues_count > 500 ? ['High open issue count'] : []) };
    });
    scored.sort((a: any, b: any) => b.fitScore - a.fitScore);
    res.json(scored.slice(0, 10));
  });

  // API Routes
  app.get("/api/repos", (req, res) => {
    const repos = db.prepare("SELECT * FROM repos ORDER BY score DESC").all();
    console.log(`Fetching repos: found ${repos.length} records`);
    res.json(repos);
  });

  app.post("/api/repos", (req, res) => {
    const { owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, aiAnalysis } = req.body;
    const id = `${owner}/${name}`;
    console.log(`Attempting to save repo: ${id}`);
    
    try {
      const stmt = db.prepare(`
        INSERT INTO repos (id, owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, ai_analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          stars=excluded.stars,
          forks=excluded.forks,
          issues=excluded.issues,
          last_push=excluded.last_push,
          score=excluded.score,
          readme=excluded.readme,
          ai_analysis=excluded.ai_analysis,
          updated_at=CURRENT_TIMESTAMP
      `);
      stmt.run(id, owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, JSON.stringify(aiAnalysis));
      
      // Create snapshot
      db.prepare("INSERT INTO snapshots (repo_id, score, stars, issues) VALUES (?, ?, ?, ?)")
        .run(id, score, stars, issues);

      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/repos/:owner/:name", (req, res) => {
    const id = `${req.params.owner}/${req.params.name}`;
    const repo = db.prepare("SELECT * FROM repos WHERE id = ?").get(id);
    const snapshots = db.prepare("SELECT * FROM snapshots WHERE repo_id = ? ORDER BY timestamp DESC LIMIT 10").all(id);
    res.json({ ...repo, snapshots });
  });

  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects").all();
    res.json(projects);
  });

  app.post("/api/projects", (req, res) => {
    const { name, description, constraints } = req.body;
    const result = db.prepare("INSERT INTO projects (name, description, constraints) VALUES (?, ?, ?)")
      .run(name, description, JSON.stringify(constraints));
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/projects/:id", (req, res) => {
    const { name, description, constraints } = req.body;
    db.prepare("UPDATE projects SET name = ?, description = ?, constraints = ? WHERE id = ?")
      .run(name, description, JSON.stringify(constraints), req.params.id);
    res.json({ success: true });
  });

  app.get("/api/projects/:id/pinned", (req, res) => {
    const pinned = db.prepare(`
      SELECT r.*, p.notes 
      FROM repos r 
      JOIN pinned_repos p ON r.id = p.repo_id 
      WHERE p.project_id = ?
    `).all(req.params.id);
    res.json(pinned);
  });

  app.post("/api/projects/:id/pin", (req, res) => {
    const { repo_id, notes } = req.body;
    db.prepare("INSERT OR REPLACE INTO pinned_repos (project_id, repo_id, notes) VALUES (?, ?, ?)")
      .run(req.params.id, repo_id, notes);
    res.json({ success: true });
  });

  app.get("/api/config", (req, res) => {
    const config = db.prepare("SELECT * FROM config").all();
    const configMap = config.reduce((acc: any, curr: any) => {
      acc[curr.key] = JSON.parse(curr.value);
      return acc;
    }, {});
    res.json(configMap);
  });

  app.post("/api/config", (req, res) => {
    const { key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)")
      .run(key, JSON.stringify(value));
    res.json({ success: true });
  });

  // External API for agents (e.g., Replit)
  app.get("/api/external/repos", (req, res) => {
    const { q, minScore, limit = 20, apiKey } = req.query;
    
    // Validate API Key
    const storedKey = db.prepare("SELECT value FROM config WHERE key = ?").get("external_api_key");
    if (!storedKey || JSON.parse(storedKey.value) !== apiKey) {
      return res.status(401).json({ error: "Invalid or missing API Key" });
    }

    let query = "SELECT id, owner, name, url, score, language, stars, description, ai_analysis FROM repos WHERE 1=1";
    const params: any[] = [];

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
      const repos = db.prepare(query).all(...params);
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });

    // Intercept Vite's HMR client script — prevents WebSocket crash on Replit.
    // Even with hmr:false, Vite injects /@vite/client into HTML. That script
    // tries to open a WebSocket, which Replit's proxy doesn't support. Return a
    // stub module that implements the HMR API as no-ops so the app boots cleanly.
    app.use((req, res, next) => {
      if (req.path === "/@vite/client") {
        res.setHeader("Content-Type", "application/javascript");
        return res.send(`
export function createHotContext() {
  return {
    accept: () => {},
    dispose: () => {},
    prune: () => {},
    decline: () => {},
    invalidate: () => {},
    on: () => {},
    off: () => {},
    send: () => {},
    data: {},
  };
}
export function injectQuery(url) { return url; }
export function updateStyle(id, content) {
  let el = document.getElementById('vite-style-' + id);
  if (!el) {
    el = document.createElement('style');
    el.id = 'vite-style-' + id;
    document.head.appendChild(el);
  }
  el.textContent = content;
}
export function removeStyle(id) {
  const el = document.getElementById('vite-style-' + id);
  if (el) el.remove();
}
`);
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    // Serve hashed assets with long cache — filenames change on rebuild
    app.use("/assets", express.static(path.join(__dirname, "dist/assets"), {
      maxAge: "1y",
      immutable: true,
    }));
    // Never cache index.html — it references hashed asset filenames
    app.use(express.static(path.join(__dirname, "dist"), {
      setHeaders(res, filePath) {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        }
      },
    }));
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
