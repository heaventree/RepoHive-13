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
try { db.exec("ALTER TABLE repos ADD COLUMN ai_analysis TEXT"); } catch {}
try { db.exec("ALTER TABLE repos ADD COLUMN enterpriseTier INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE repos ADD COLUMN comparableApp TEXT"); } catch {}
try { db.exec("ALTER TABLE repos ADD COLUMN embedding TEXT"); } catch {}

// ── Vector helpers ──────────────────────────────────────────────────────────
const embeddingCache = new Map<string, number[]>();

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'models/gemini-embedding-001', content: { parts: [{ text: text.slice(0, 4000) }] } })
      }
    );
    const data = await res.json();
    return data.embedding?.values ?? null;
  } catch { return null; }
}

// Expand a short brief into a richer description so the embedding
// captures synonyms and related concepts (e.g. "CRM" → full feature list).
async function expandBrief(brief: string): Promise<string> {
  const words = brief.trim().split(/\s+/).length;
  if (words > 20) return brief; // already detailed enough
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return brief;
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: `Expand this software project description into 3-4 sentences covering what it does, its key features, typical use cases, and related technical concepts. Be specific and use relevant technical terminology. Project: "${brief}"`
        }],
        max_tokens: 200,
        temperature: 0.2
      })
    });
    const data = await res.json();
    const expanded = data.choices?.[0]?.message?.content?.trim();
    return expanded ? `${brief}\n\n${expanded}` : brief;
  } catch { return brief; }
}

function buildEmbedText(repo: any, ai: any = {}): string {
  return [repo.name, repo.description, ai.summary, (ai.tags || []).join(' '), ai.category].filter(Boolean).join(' ');
}

function loadEmbeddingCache() {
  const rows = db.prepare("SELECT id, embedding FROM repos WHERE embedding IS NOT NULL").all() as any[];
  embeddingCache.clear();
  for (const row of rows) {
    try { embeddingCache.set(row.id, JSON.parse(row.embedding)); } catch {}
  }
  console.log(`Vector cache: ${embeddingCache.size} embeddings loaded`);
}
// ────────────────────────────────────────────────────────────────────────────

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

  CREATE TABLE IF NOT EXISTS project_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    repo_id TEXT NOT NULL,
    fit_score INTEGER,
    rationale TEXT,
    mode TEXT,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, repo_id),
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

  // Load vector cache on startup
  loadEmbeddingCache();

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

  // Resolve a truncated repo name by searching GitHub for owner + partial name
  async function resolveRepo(owner: string, partial: string): Promise<any | null> {
    try {
      const headers: Record<string, string> = { 'User-Agent': 'RepoScout/2' };
      if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      const q = encodeURIComponent(`user:${owner} ${partial} in:name`);
      const res = await fetch(`https://api.github.com/search/repositories?q=${q}&per_page=1&sort=stars`, { headers });
      if (!res.ok) return null;
      const data: any = await res.json();
      const hit = data.items?.[0];
      // Only accept if owner matches and repo name starts with the partial string
      if (hit && hit.owner?.login?.toLowerCase() === owner.toLowerCase()
               && hit.name?.toLowerCase().startsWith(partial.toLowerCase())) {
        return hit;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function deepseekAnalyze(id: string, description: string, language: string | null, topics: string[], readme: string | null, fallbackCategory: string): Promise<any> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return null;

    const prompt = `You are a software repository analyst. Analyze this GitHub repository and return a JSON object.

Repository: ${id}
Language: ${language || 'unknown'}
Topics: ${topics.join(', ') || 'none'}
Description: ${description || 'none'}
README (first 2000 chars): ${(readme || '').slice(0, 2000)}

Return ONLY valid JSON with this exact structure:
{
  "category": "one of: Frontend, Backend, AI/ML, DevOps, Database, Tooling, Mobile, Security, General",
  "tags": ["array", "of", "3-6", "relevant", "tech", "tags"],
  "summary": "2-3 sentence plain English summary of what this repo does and who it's for",
  "useCases": ["3-5 specific use case strings"],
  "integrationNotes": [
    { "platform": "e.g. Next.js", "match": "Perfect Match or Good Fit", "description": "one sentence" }
  ],
  "enterpriseTier": true or false — true if this repo is production-ready, self-hostable, and a credible open-source replacement for a known paid SaaS product (e.g. Coolify replaces Heroku/Vercel, Supabase replaces Firebase, Plausible replaces Google Analytics),
  "comparableApp": "Name of the well-known paid product this replaces, or null if none"
}`;

    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.3
        })
      });
      if (!res.ok) {
        console.warn(`DeepSeek API error ${res.status}: ${res.statusText}`);
        return null;
      }
      const data: any = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`DeepSeek analyzed ${id} → ${parsed.category}`);
      return parsed;
    } catch (err: any) {
      console.warn(`DeepSeek analysis failed for ${id}: ${err.message}`);
      return null;
    }
  }

  // POST /api/ingest
  app.post("/api/ingest", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url is required" });

    const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
    if (!match) return res.status(400).json({ error: "Not a valid GitHub URL" });
    const [, owner, repoName] = match;

    try {
      let data: any;
      try {
        data = await fetchGitHub(`/repos/${owner}/${repoName}`);
      } catch (err: any) {
        if (err.message?.includes('404')) {
          // Repo name may be truncated — try GitHub search to resolve it
          const resolved = await resolveRepo(owner, repoName);
          if (!resolved) throw err; // still fail if nothing found
          console.log(`Resolved truncated "${owner}/${repoName}" → "${resolved.full_name}"`);
          data = resolved;
        } else {
          throw err;
        }
      }

      // Always use GitHub's canonical casing to avoid duplicates
      const canonicalOwner = data.owner?.login ?? owner;
      const canonicalName  = data.name ?? repoName;
      const id = `${canonicalOwner}/${canonicalName}`;

      // Check for duplicates
      const existing = db.prepare('SELECT id FROM repos WHERE id = ?').get(id);
      if (existing) return res.status(409).json({ error: `Repo ${id} already exists in library` });

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
        const rm = await fetchGitHub(`/repos/${canonicalOwner}/${canonicalName}/readme`);
        readme = Buffer.from(rm.content, 'base64').toString('utf8').slice(0, 5000);
      } catch (_) {}

      const fallbackAnalysis = {
        category,
        tags: [language, ...topics.slice(0, 4)].filter(Boolean) as string[],
        summary: desc || id,
        useCases: topics.slice(0, 3).map((t: string) =>
          t.split('-').map((w: string) => w[0]?.toUpperCase() + w.slice(1)).join(' ')
        ).filter(Boolean),
        integrationNotes: []
      };

      const aiResult = await deepseekAnalyze(id, desc, language, topics, readme, category);
      const aiAnalysis = aiResult ?? fallbackAnalysis;

      const stmt = db.prepare(`
        INSERT INTO repos (id, owner, name, url, stars, forks, issues, language, license, last_push, description, readme, score, ai_analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          stars=excluded.stars, forks=excluded.forks, issues=excluded.issues,
          last_push=excluded.last_push, score=excluded.score,
          readme=excluded.readme, ai_analysis=excluded.ai_analysis,
          updated_at=CURRENT_TIMESTAMP
      `);
      stmt.run(id, canonicalOwner, canonicalName, data.html_url, stars, forks, issues, language, license, lastPush, desc, readme, score, JSON.stringify(aiAnalysis));
      db.prepare("INSERT INTO snapshots (repo_id, score, stars, issues) VALUES (?, ?, ?, ?)").run(id, score, stars, issues);

      console.log(`Ingested ${id} — score: ${score}, category: ${category}`);
      res.json({ success: true, id, score, category });
    } catch (err: any) {
      console.error(`Ingest failed for ${owner}/${repoName}:`, err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/recommend — vector search with keyword fallback
  app.post("/api/recommend", async (req, res) => {
    const { brief = '', constraints, projectId } = req.body;
    const repos = db.prepare("SELECT id, owner, name, url, stars, forks, issues, language, license, last_push, description, score FROM repos").all() as any[];

    const applyFilters = (repo: any, rawScore: number) => {
      if (constraints?.minStars && repo.stars < constraints.minStars) return 0;
      if (constraints?.language && repo.language?.toLowerCase() !== constraints.language.toLowerCase()) rawScore *= 0.6;
      return rawScore;
    };

    // ── Vector path ──────────────────────────────────────────────────────────
    if (embeddingCache.size > 0) {
      // Expand short briefs so "CRM" becomes a full feature description
      const queryText = await expandBrief(brief);
      const briefEmb = await generateEmbedding(queryText);
      if (briefEmb) {
        // Compute raw cosine similarities for all repos with embeddings
        const rawScored = repos
          .filter(r => embeddingCache.has(r.id))
          .map(repo => ({
            repo,
            sim: cosineSimilarity(briefEmb, embeddingCache.get(repo.id)!)
          }));

        // Hard minimum: exclude repos below this similarity floor entirely.
        // Observed for gemini-embedding-001: unrelated content scores ~0.55–0.62,
        // genuinely relevant content scores 0.65+. The 0.63 cutoff sits cleanly
        // in the gap, so irrelevant results simply don't appear.
        const SIM_FLOOR = 0.63;

        rawScored.sort((a, b) => b.sim - a.sim);
        const qualifying = rawScored.filter(r => r.sim >= SIM_FLOOR);
        const top = qualifying.slice(0, 10);
        const maxSim = rawScored[0]?.sim ?? 0;

        console.log(`Vector recommend: ${qualifying.length} repos above floor (top sim: ${Math.round(maxSim * 100)}%, expanded: ${queryText.length > brief.length})`);

        // If nothing passes the floor, return an empty array — the frontend will
        // tell the user their library lacks relevant repos for this topic.
        if (top.length === 0) {
          if (projectId) saveRecommendations(projectId, []);
          return res.json([]);
        }

        // Calibrate using absolute thresholds for gemini-embedding-001.
        //   sim ≥ 0.82 → 95–97  (exceptional)
        //   sim ≥ 0.72 → 75–94  (strong)
        //   sim ≥ 0.65 → 55–74  (moderate)
        //   sim ≥ 0.63 → 45–54  (low but above floor)
        const calibrate = (sim: number): number => {
          if (sim >= 0.82) return Math.round(95 + ((sim - 0.82) / 0.18) * 2);
          if (sim >= 0.72) return Math.round(75 + ((sim - 0.72) / 0.10) * 19);
          if (sim >= 0.65) return Math.round(55 + ((sim - 0.65) / 0.07) * 19);
          return Math.round(45 + ((sim - 0.63) / 0.02) * 9);  // 45–53
        };

        const label = (sim: number) =>
          sim >= 0.82 ? 'Strongest match' : sim >= 0.72 ? 'Strong match' : sim >= 0.65 ? 'Moderate match' : 'Closest match';

        const results = top.map(({ repo, sim }) => {
          const baseScore = calibrate(sim);
          const fitScore = Math.round(applyFilters(repo, baseScore));
          const pct = Math.round(sim * 100);
          return {
            repoId: repo.id,
            fitScore,
            rationale: `${label(sim)} · ${pct}% semantic similarity to your project brief.`,
            warnings: repo.issues > 500 ? ['High open issue count'] : [],
            _mode: 'vector'
          };
        });

        results.sort((a, b) => b.fitScore - a.fitScore);
        if (projectId) saveRecommendations(projectId, results);
        return res.json(results);
      }
    }

    // ── Keyword fallback ─────────────────────────────────────────────────────
    const keywords = brief.toLowerCase().split(/\W+/).filter((w: string) => w.length > 3);
    const scored = repos.map(repo => {
      let fit = repo.score ?? 0;
      const text = [repo.id, repo.description, repo.language].join(' ').toLowerCase();
      keywords.forEach((kw: string) => { if (text.includes(kw)) fit += 8; });
      const matches = keywords.filter((k: string) => text.includes(k));
      return {
        repoId: repo.id,
        fitScore: Math.round(applyFilters(repo, Math.min(99, fit))),
        rationale: `Keyword match on: ${matches.join(', ') || 'general criteria'}.`,
        warnings: repo.issues > 500 ? ['High open issue count'] : [],
        _mode: 'keyword'
      };
    });
    scored.sort((a: any, b: any) => b.fitScore - a.fitScore);
    const kwResults = scored.slice(0, 10);
    if (projectId) saveRecommendations(projectId, kwResults);
    res.json(kwResults);
  });

  function saveRecommendations(projectId: number, recs: any[]) {
    const stmt = db.prepare(`
      INSERT INTO project_recommendations (project_id, repo_id, fit_score, rationale, mode)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(project_id, repo_id) DO UPDATE SET
        fit_score=excluded.fit_score,
        rationale=excluded.rationale,
        mode=excluded.mode,
        saved_at=CURRENT_TIMESTAMP
    `);
    for (const r of recs) {
      try { stmt.run(projectId, r.repoId, r.fitScore, r.rationale, r._mode); } catch {}
    }
  }

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

      // Generate embedding asynchronously (don't block the response)
      const embedText = buildEmbedText({ name, description }, aiAnalysis || {});
      generateEmbedding(embedText).then(emb => {
        if (emb) {
          db.prepare("UPDATE repos SET embedding = ? WHERE id = ?").run(JSON.stringify(emb), id);
          embeddingCache.set(id, emb);
        }
      }).catch(() => {});
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

  app.get("/api/projects/:id/recommendations", (req, res) => {
    const recs = db.prepare(`
      SELECT pr.repo_id, pr.fit_score, pr.rationale, pr.mode, pr.saved_at
      FROM project_recommendations pr
      WHERE pr.project_id = ?
      ORDER BY pr.fit_score DESC
    `).all(req.params.id) as any[];
    res.json(recs.map(r => ({
      repoId: r.repo_id,
      fitScore: r.fit_score,
      rationale: r.rationale,
      _mode: r.mode,
      savedAt: r.saved_at,
      warnings: []
    })));
  });

  app.delete("/api/projects/:id/recommendations/:repoId(*)", (req, res) => {
    db.prepare("DELETE FROM project_recommendations WHERE project_id = ? AND repo_id = ?")
      .run(req.params.id, req.params.repoId);
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

  // Background sweep: re-analyze repos missing enterpriseTier field
  let sweepStatus: { running: boolean; total: number; done: number; failed: number } = { running: false, total: 0, done: 0, failed: 0 };

  app.get("/api/sweep/status", (_req, res) => {
    res.json(sweepStatus);
  });

  app.post("/api/sweep", async (_req, res) => {
    if (sweepStatus.running) return res.json({ message: 'Sweep already running', ...sweepStatus });

    const allRepos: any[] = db.prepare("SELECT id, description, language, readme, ai_analysis FROM repos").all();
    const needsUpdate = allRepos.filter(r => {
      try {
        const a = r.ai_analysis ? JSON.parse(r.ai_analysis) : {};
        return typeof a.enterpriseTier === 'undefined';
      } catch { return true; }
    });

    sweepStatus = { running: true, total: needsUpdate.length, done: 0, failed: 0 };
    res.json({ message: `Sweep started for ${needsUpdate.length} repos`, total: needsUpdate.length });

    // Run in background — do not await
    (async () => {
      for (const repo of needsUpdate) {
        try {
          let existing: any = {};
          try { existing = repo.ai_analysis ? JSON.parse(repo.ai_analysis) : {}; } catch {}

          const topics = existing.tags || [];
          const category = existing.category || 'General';

          const fresh = await deepseekAnalyze(repo.id, repo.description || '', repo.language, topics, repo.readme, category);
          if (fresh) {
            const merged = { ...existing, ...fresh };
            db.prepare("UPDATE repos SET ai_analysis = ? WHERE id = ?")
              .run(JSON.stringify(merged), repo.id);
            console.log(`Sweep updated ${repo.id} → enterpriseTier: ${fresh.enterpriseTier}, replaces: ${fresh.comparableApp}`);
          }
          sweepStatus.done++;
        } catch (err: any) {
          console.warn(`Sweep failed for ${repo.id}: ${err.message}`);
          sweepStatus.failed++;
          sweepStatus.done++;
        }
        // Small pause to avoid rate-limiting
        await new Promise(r => setTimeout(r, 200));
      }
      sweepStatus.running = false;
      console.log(`Sweep complete — ${sweepStatus.total} processed, ${sweepStatus.failed} failed`);
    })();
  });

  // ── Embedding sweep endpoints ────────────────────────────────────────────────
  let embedSweepStatus = { running: false, total: 0, done: 0, failed: 0 };

  app.get("/api/embed/status", (_req, res) => {
    const total = (db.prepare("SELECT COUNT(*) as c FROM repos").get() as any).c;
    res.json({ ...embedSweepStatus, embedded: embeddingCache.size, total });
  });

  app.post("/api/embed/sweep", async (_req, res) => {
    if (embedSweepStatus.running) return res.json({ message: 'Embed sweep already running', ...embedSweepStatus });

    const repos: any[] = db.prepare("SELECT id, name, description, ai_analysis FROM repos WHERE embedding IS NULL").all();
    embedSweepStatus = { running: true, total: repos.length, done: 0, failed: 0 };
    res.json({ message: `Embedding sweep started for ${repos.length} repos`, total: repos.length });

    (async () => {
      for (const repo of repos) {
        try {
          let ai: any = {};
          try { ai = repo.ai_analysis ? JSON.parse(repo.ai_analysis) : {}; } catch {}
          const text = buildEmbedText(repo, ai);
          const emb = await generateEmbedding(text);
          if (emb) {
            db.prepare("UPDATE repos SET embedding = ? WHERE id = ?").run(JSON.stringify(emb), repo.id);
            embeddingCache.set(repo.id, emb);
            console.log(`Embedded ${repo.id} (cache: ${embeddingCache.size})`);
          }
          embedSweepStatus.done++;
        } catch (e: any) {
          console.warn(`Embed failed for ${repo.id}: ${e.message}`);
          embedSweepStatus.failed++;
          embedSweepStatus.done++;
        }
        await new Promise(r => setTimeout(r, 250));
      }
      embedSweepStatus.running = false;
      console.log(`Embedding sweep complete — ${embeddingCache.size} total in cache`);
    })();
  });
  // ─────────────────────────────────────────────────────────────────────────────

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
