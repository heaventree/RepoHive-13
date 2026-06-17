import React, { useEffect, useState } from 'react';
import {
  FileText, Sparkles, Save, RefreshCw, AlertCircle, CheckCircle2, Plus,
  Settings as SettingsIcon, Trash2, Edit3, Eye, Zap, Globe, Search, Loader,
  Ship, Star, GitFork, Wand2,
} from 'lucide-react';

interface SeoPage {
  path: string;
  label: string | null;
  title: string | null;
  description: string | null;
  og_image: string | null;
  keywords: string | null;
  noindex: number;
  ai_score: number | null;
  ai_suggestions: string | null;
  last_audited_at: string | null;
  updated_at: string;
}

interface BlogRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  status: 'draft' | 'published';
  source: string | null;
  format: string | null;
  featuredRepoId: string | null;
  publishedAt: string | null;
  updatedAt: string;
}

type Sub = 'pages' | 'settings' | 'blog' | 'harbor' | 'promo';

export const AdminSEO: React.FC = () => {
  const [sub, setSub] = useState<Sub>('pages');
  // Draft handed off from the promo generator, picked up by BlogPanel's editor.
  const [pendingDraft, setPendingDraft] = useState<Partial<BlogPost> | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1">
        {([
          { id: 'pages',    label: 'Pages',    icon: FileText },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
          { id: 'blog',     label: 'Blog',     icon: Edit3 },
          { id: 'harbor',   label: 'Harbor',   icon: Ship },
          { id: 'promo',    label: 'Promo',    icon: Wand2 },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
              sub === t.id
                ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/40'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {sub === 'pages' && <PagesPanel />}
      {sub === 'settings' && <SettingsPanel />}
      {sub === 'blog' && (
        <BlogPanel
          pendingDraft={pendingDraft}
          onPendingDraftConsumed={() => setPendingDraft(null)}
        />
      )}
      {sub === 'harbor' && <HarborPanel />}
      {sub === 'promo' && (
        <PromoPanel
          onDraftReady={(draft) => { setPendingDraft(draft); setSub('blog'); }}
        />
      )}
    </div>
  );
};

function scoreColor(score: number | null | undefined): string {
  if (score == null) return 'text-slate-600';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

// ─── Pages panel ──────────────────────────────────────────────────────────────
function PagesPanel() {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [editing, setEditing] = useState<SeoPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/admin/seo/pages').then(r => r.json());
      if (Array.isArray(d)) setPages(d);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const audit = async (path: string) => {
    setBusy(path);
    try {
      const r = await fetch('/api/admin/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      if (!r.ok) alert((await r.json()).error || 'Audit failed');
      await load();
    } finally { setBusy(null); }
  };

  const applySuggestions = async (path: string) => {
    if (!window.confirm('Overwrite title, description, and keywords with the AI suggestions?')) return;
    setBusy(path);
    try {
      await fetch('/api/admin/seo/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      await load();
    } finally { setBusy(null); }
  };

  if (editing) return <PageEditor page={editing} onSave={async () => { await load(); setEditing(null); }} onCancel={() => setEditing(null)} />;

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent-blue" /> SEO Pages ({pages.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing({
              path: '', label: null, title: null, description: null,
              og_image: null, keywords: null, noindex: 0, ai_score: null,
              ai_suggestions: null, last_audited_at: null, updated_at: '',
            })}
            className="px-3 py-1.5 rounded-lg bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-xs font-mono font-bold hover:bg-accent-blue/30 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add page
          </button>
          <button onClick={load} className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      {loading ? <p className="text-xs text-slate-600 italic font-mono">Loading…</p> : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-slate-600 border-b border-border-main/40">
                <th className="py-2 pr-3">Path</th>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3 text-center">AI Score</th>
                <th className="py-2 pr-3">Audited</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.path} className="border-b border-border-main/20 hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-3">
                    <div className="text-accent-blue">{p.path}</div>
                    {p.label && <div className="text-[10px] text-slate-600">{p.label}</div>}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-300 max-w-[200px] truncate" title={p.title ?? ''}>{p.title || <span className="text-slate-700 italic">—</span>}</td>
                  <td className="py-2.5 pr-3 text-slate-400 max-w-[260px] truncate" title={p.description ?? ''}>{p.description || <span className="text-slate-700 italic">—</span>}</td>
                  <td className={`py-2.5 pr-3 text-center font-black ${scoreColor(p.ai_score)}`}>{p.ai_score ?? '—'}</td>
                  <td className="py-2.5 pr-3 text-slate-500 text-[10px]">{p.last_audited_at ? new Date(p.last_audited_at).toLocaleDateString() : <span className="text-slate-700 italic">never</span>}</td>
                  <td className="py-2.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => audit(p.path)}
                        disabled={busy === p.path}
                        title="Run AI audit"
                        className="p-1.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 disabled:opacity-50"
                      >
                        {busy === p.path ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </button>
                      {p.ai_suggestions && (
                        <button
                          onClick={() => applySuggestions(p.path)}
                          title="Apply AI suggestions"
                          className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => setEditing(p)} className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PageEditor({ page, onSave, onCancel }: { page: SeoPage; onSave: () => void; onCancel: () => void }) {
  const [f, setF] = useState(page);
  const [saving, setSaving] = useState(false);
  const suggestions = (() => { try { return page.ai_suggestions ? JSON.parse(page.ai_suggestions) : null; } catch { return null; } })();

  const save = async () => {
    if (!f.path) return alert('Path required');
    setSaving(true);
    try {
      await fetch('/api/admin/seo/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: f.path, label: f.label, title: f.title, description: f.description,
          og_image: f.og_image, keywords: f.keywords, noindex: f.noindex,
        }),
      });
      onSave();
    } finally { setSaving(false); }
  };

  const Field = ({ label, value, onChange, help, type = 'text', multiline }: any) => (
    <label className="block">
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">{label}</div>
      {multiline
        ? <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} rows={3} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />
        : <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />}
      {help && <div className="text-[10px] text-slate-600 mt-1">{help}</div>}
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-accent-blue" /> Edit SEO — {f.path || 'new page'}
        </h3>
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-white font-mono">← Back to list</button>
      </div>

      <div className="glass-card rounded-2xl p-6 shadow-xl space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="URL path" value={f.path} onChange={(v: string) => setF({ ...f, path: v })} help="e.g. /pricing — must start with /" />
          <Field label="Label" value={f.label} onChange={(v: string) => setF({ ...f, label: v })} help="Friendly name shown in admin only" />
        </div>
        <Field label="Page title" value={f.title} onChange={(v: string) => setF({ ...f, title: v })} help={`${(f.title ?? '').length} chars — aim for 50-60`} />
        <Field label="Meta description" value={f.description} onChange={(v: string) => setF({ ...f, description: v })} multiline help={`${(f.description ?? '').length} chars — aim for 140-160`} />
        <Field label="Keywords" value={f.keywords} onChange={(v: string) => setF({ ...f, keywords: v })} help="Comma-separated, 5-8 high-intent terms" />
        <Field label="OG image URL" value={f.og_image} onChange={(v: string) => setF({ ...f, og_image: v })} help="Absolute URL to a 1200×630 PNG/JPG" />
        <label className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <input type="checkbox" checked={!!f.noindex} onChange={e => setF({ ...f, noindex: e.target.checked ? 1 : 0 })} />
          noindex (hide from search engines)
        </label>

        <div className="flex items-center gap-2 pt-2">
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-accent-blue text-white font-mono text-xs font-bold hover:bg-accent-blue/80 disabled:opacity-50 flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {suggestions && (
        <div className="glass-card rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white font-mono">AI Suggestions</h4>
            <span className={`text-2xl font-black font-mono ml-auto ${scoreColor(suggestions.score)}`}>{suggestions.score}<span className="text-xs text-slate-600">/100</span></span>
          </div>
          {suggestions.issues?.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">Issues</div>
              <ul className="space-y-1">
                {suggestions.issues.map((i: string, idx: number) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2"><AlertCircle className="w-3 h-3 text-amber-400 flex-none mt-0.5" /> {i}</li>
                ))}
              </ul>
            </div>
          )}
          {suggestions.suggestions && (
            <div className="space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Recommended</div>
              {(['title', 'description', 'keywords'] as const).map(k => (
                <div key={k}>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">{k}</div>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-200 font-mono">{suggestions.suggestions[k]}</div>
                    <button
                      onClick={() => setF({ ...f, [k]: suggestions.suggestions[k] })}
                      className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono hover:bg-emerald-500/30"
                    >Apply</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {suggestions.rationale && <p className="text-[11px] text-slate-500 italic mt-4 font-mono">{suggestions.rationale}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────
function SettingsPanel() {
  const [s, setS] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/seo/settings').then(r => r.json()).then(d => { setS(d || {}); setLoading(false); });
  }, []);

  const save = async () => {
    await fetch('/api/admin/seo/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <p className="text-xs text-slate-600 italic font-mono p-6">Loading…</p>;

  const FIELDS: Array<{ key: string; label: string; help: string }> = [
    { key: 'GA4_ID',                       label: 'Google Analytics 4 measurement ID', help: 'Starts with G-… Injected as gtag.js on every page.' },
    { key: 'GTM_ID',                       label: 'Google Tag Manager container ID',   help: 'Starts with GTM-… Loads the GTM snippet on every page.' },
    { key: 'SEARCH_CONSOLE_VERIFICATION',  label: 'Search Console verification token',  help: 'The content="..." value from the meta-tag verification method.' },
    { key: 'DEFAULT_OG_IMAGE',             label: 'Default Open Graph image URL',       help: 'Used when a page has no custom og:image.' },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
        <SettingsIcon className="w-4 h-4 text-accent-blue" /> Site-wide SEO settings
      </h3>
      {FIELDS.map(f => (
        <label key={f.key} className="block">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">{f.label}</div>
          <input
            type="text"
            value={s[f.key] ?? ''}
            onChange={e => setS({ ...s, [f.key]: e.target.value })}
            className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono"
          />
          <div className="text-[10px] text-slate-600 mt-1">{f.help}</div>
        </label>
      ))}
      <div className="flex items-center gap-2 pt-2">
        <button onClick={save} className="px-4 py-2 rounded-lg bg-accent-blue text-white font-mono text-xs font-bold hover:bg-accent-blue/80 flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> Save settings
        </button>
        {saved && <span className="text-xs text-emerald-400 font-mono flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Saved</span>}
      </div>
    </div>
  );
}

// ─── Blog panel ───────────────────────────────────────────────────────────────
interface BlogPost {
  id?: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string | null;
  og_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  tags: string | null;
  author: string | null;
  status: 'draft' | 'published';
  source?: string | null;
  format?: string | null;
  featured_repo_id?: string | null;
}

function BlogPanel({ pendingDraft, onPendingDraftConsumed }: {
  pendingDraft?: Partial<BlogPost> | null;
  onPendingDraftConsumed?: () => void;
}) {
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/admin/blog').then(r => r.json());
      if (Array.isArray(d)) setPosts(d);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (pendingDraft) {
      setEditing({
        slug: '', title: '', excerpt: '', body_md: '', og_image: '', seo_title: '', seo_description: '',
        tags: '', author: '', status: 'draft',
        ...pendingDraft,
      } as BlogPost);
      onPendingDraftConsumed?.();
    }
  }, [pendingDraft]);

  const openNew = () => setEditing({
    slug: '', title: '', excerpt: '', body_md: '', og_image: '', seo_title: '', seo_description: '', tags: '', author: '', status: 'draft',
  });

  const openEdit = async (id: number) => {
    const p = await fetch(`/api/admin/blog/${id}`).then(r => r.json());
    setEditing(p);
  };

  const del = async (id: number) => {
    if (!window.confirm('Delete this post?')) return;
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    await load();
  };

  if (editing) return <BlogEditor post={editing} onSave={async () => { await load(); setEditing(null); }} onCancel={() => setEditing(null)} />;

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-accent-blue" /> Blog Posts ({posts.length})
        </h3>
        <button onClick={openNew} className="px-3 py-1.5 rounded-lg bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-xs font-mono font-bold hover:bg-accent-blue/30 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New post
        </button>
      </div>

      {loading ? <p className="text-xs text-slate-600 italic font-mono">Loading…</p> : posts.length === 0 ? (
        <p className="text-xs text-slate-600 italic font-mono">No posts yet. Create one or use the AI draft generator.</p>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-slate-600 border-b border-border-main/40">
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Slug</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Published</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} className="border-b border-border-main/20 hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-3 text-slate-200 max-w-[300px] truncate" title={p.title}>{p.title}</td>
                  <td className="py-2.5 pr-3 text-accent-blue">/blog/{p.slug}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                      p.source === 'harbor' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : p.source === 'promo' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-700 text-slate-400'
                    }`}>{p.source || 'manual'}</span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${p.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}`}>{p.status}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-slate-500 text-[10px]">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}</td>
                  <td className="py-2.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      {p.status === 'published' && <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"><Eye className="w-3.5 h-3.5" /></a>}
                      <button onClick={() => openEdit(p.id)} className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => del(p.id)} className="p-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BlogEditor({ post, onSave, onCancel }: { post: BlogPost; onSave: () => void; onCancel: () => void }) {
  const [f, setF] = useState(post);
  const [saving, setSaving] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false);
  const [draftTopic, setDraftTopic] = useState('');
  const [draftKeywords, setDraftKeywords] = useState('');

  const save = async () => {
    if (!f.title) return alert('Title required');
    setSaving(true);
    try {
      await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      onSave();
    } finally { setSaving(false); }
  };

  const aiDraft = async () => {
    if (!draftTopic) return alert('Enter a topic');
    setDraftBusy(true);
    try {
      const r = await fetch('/api/admin/blog/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: draftTopic, keywords: draftKeywords }),
      });
      if (!r.ok) { alert((await r.json()).error || 'Draft failed'); return; }
      const d = await r.json();
      setF({ ...f, ...d, status: f.status });
    } finally { setDraftBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-accent-blue" /> {f.id ? 'Edit post' : 'New post'}
        </h3>
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-white font-mono">← Back to list</button>
      </div>

      {!f.id && (
        <div className="glass-card rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">AI draft</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input value={draftTopic} onChange={e => setDraftTopic(e.target.value)} placeholder="Topic — e.g. 'best open-source Calendly alternatives'" className="bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-purple-400 focus:outline-none font-mono" />
            <input value={draftKeywords} onChange={e => setDraftKeywords(e.target.value)} placeholder="Target keywords (optional)" className="bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-purple-400 focus:outline-none font-mono" />
          </div>
          <button onClick={aiDraft} disabled={draftBusy} className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold hover:bg-purple-500/30 disabled:opacity-50 flex items-center gap-1.5">
            {draftBusy ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {draftBusy ? 'Generating…' : 'Generate draft with DeepSeek'}
          </button>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 shadow-xl space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Title</div>
            <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />
          </label>
          <label className="block">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Slug</div>
            <input value={f.slug} onChange={e => setF({ ...f, slug: e.target.value })} placeholder="auto-from-title" className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />
          </label>
        </div>
        <label className="block">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Excerpt</div>
          <textarea value={f.excerpt ?? ''} onChange={e => setF({ ...f, excerpt: e.target.value })} rows={2} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />
        </label>
        <label className="block">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Body (Markdown)</div>
          <textarea value={f.body_md ?? ''} onChange={e => setF({ ...f, body_md: e.target.value })} rows={18} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />
        </label>
        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Tags (csv)</div>
            <input value={f.tags ?? ''} onChange={e => setF({ ...f, tags: e.target.value })} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />
          </label>
          <label className="block">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Author</div>
            <input value={f.author ?? ''} onChange={e => setF({ ...f, author: e.target.value })} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />
          </label>
          <label className="block">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">Status</div>
            <select value={f.status} onChange={e => setF({ ...f, status: e.target.value as 'draft' | 'published' })} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono">
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>
        </div>
        <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-border-main/20">
          <label className="block">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">SEO Title (override)</div>
            <input value={f.seo_title ?? ''} onChange={e => setF({ ...f, seo_title: e.target.value })} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />
          </label>
          <label className="block">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">OG image URL</div>
            <input value={f.og_image ?? ''} onChange={e => setF({ ...f, og_image: e.target.value })} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />
          </label>
        </div>
        <label className="block">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">SEO Description (override)</div>
          <textarea value={f.seo_description ?? ''} onChange={e => setF({ ...f, seo_description: e.target.value })} rows={2} className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-xs text-slate-200 focus:border-accent-blue focus:outline-none font-mono" />
        </label>

        <div className="flex items-center gap-2 pt-2">
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-accent-blue text-white font-mono text-xs font-bold hover:bg-accent-blue/80 disabled:opacity-50 flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save post'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Harbor panel ───────────────────────────────────────────────────────────
// Harbor owns discovery + writing; we only import finished articles and
// auto-publish them. No generation is triggered from here — pull only.
interface HarborStatus {
  configured: boolean;
  account?: { articles_remaining: number; articles_monthly_limit: number; plan: string } | null;
  lastImport?: { publishedAt: string | null; title: string } | null;
  counts?: { total: number; published: number } | null;
  error?: string;
}

function HarborPanel() {
  const [status, setStatus] = useState<HarborStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; items: { id: string; slug: string; title: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/admin/harbor/status').then(r => r.json());
      setStatus(d);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const pull = async () => {
    setPulling(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch('/api/admin/harbor/pull', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Pull failed'); return; }
      setResult(d);
      await load();
    } catch {
      setError('Network error');
    } finally { setPulling(false); }
  };

  if (loading) return <p className="text-xs text-slate-600 italic font-mono p-6">Loading…</p>;

  if (!status?.configured) return (
    <div className="glass-card rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Ship className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">Harbor</h3>
      </div>
      <p className="text-xs text-slate-400 font-mono">
        HARBOR_API_KEY is not set. Add it to the server environment to enable importing Harbor articles.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
            <Ship className="w-4 h-4 text-cyan-400" /> Harbor import
          </h3>
          <button onClick={load} className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <div className="p-3 rounded-lg bg-bg-dark border border-border-main">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">Plan</div>
            <div className="text-sm text-slate-200 font-mono">{status.account?.plan ?? '—'}</div>
          </div>
          <div className="p-3 rounded-lg bg-bg-dark border border-border-main">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">Articles remaining</div>
            <div className="text-sm text-slate-200 font-mono">
              {status.account ? `${status.account.articles_remaining} / ${status.account.articles_monthly_limit}` : '—'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-bg-dark border border-border-main">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">Imported so far</div>
            <div className="text-sm text-slate-200 font-mono">{status.counts?.total ?? 0} ({status.counts?.published ?? 0} published)</div>
          </div>
        </div>

        {status.lastImport && (
          <p className="text-[11px] text-slate-500 font-mono mb-4">
            Last import: <span className="text-slate-300">{status.lastImport.title}</span>
            {status.lastImport.publishedAt && ` · ${new Date(status.lastImport.publishedAt).toLocaleString()}`}
          </p>
        )}

        {status.error && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-none mt-0.5" />
              <div className="text-[11px] text-amber-300 font-mono">
                <div className="font-bold mb-1">Harbor API rejected the key</div>
                <div className="text-amber-200/80">{status.error}</div>
                <div className="text-amber-200/60 mt-2">Check that HARBOR_API_KEY is set correctly in the server environment and that the key is still valid in Harbor.</div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={pull}
          disabled={pulling}
          className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/30 disabled:opacity-50 flex items-center gap-1.5"
        >
          {pulling ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Ship className="w-3.5 h-3.5" />}
          {pulling ? 'Pulling…' : 'Pull from Harbor now'}
        </button>

        {error && <p className="text-[11px] text-red-400 font-mono mt-3 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}

        {result && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-[11px] text-emerald-300 font-mono mb-2">
              Imported {result.imported}, skipped {result.skipped}.
            </p>
            {result.items.length > 0 && (
              <ul className="space-y-1">
                {result.items.map(i => (
                  <li key={i.id} className="text-[11px] font-mono">
                    <a href={`/blog/${i.slug}`} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">{i.title}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Promo panel ─────────────────────────────────────────────────────────────
// Pick a high-hitter repo from the library and write an internal promo
// article about it, closing with a CTA to build a RepoHive toolbox.
interface PromoCandidate {
  id: string;
  owner: string;
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  score: number | null;
  ai_analysis: any;
}

function PromoPanel({ onDraftReady }: { onDraftReady: (draft: Partial<BlogPost>) => void }) {
  const [candidates, setCandidates] = useState<PromoCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/admin/blog/promo/suggest').then(r => r.json());
      if (Array.isArray(d)) setCandidates(d);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const feature = async (repoId: string) => {
    setGenerating(repoId);
    setError(null);
    try {
      const r = await fetch('/api/admin/blog/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Generation failed'); return; }
      onDraftReady(d);
    } catch {
      setError('Network error');
    } finally { setGenerating(null); }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-400" /> Featured-repo candidates
        </h3>
        <button onClick={load} className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <p className="text-[11px] text-slate-500 font-mono mb-4">
        Top-scoring repos that haven't been featured yet. Pick one — DeepSeek writes a piece on it with a CTA to build a RepoHive toolbox.
      </p>

      {error && <p className="text-[11px] text-red-400 font-mono mb-4 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {error}</p>}

      {loading ? <p className="text-xs text-slate-600 italic font-mono">Loading…</p> : candidates.length === 0 ? (
        <p className="text-xs text-slate-600 italic font-mono">No candidates left — every high-scoring repo has been featured.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {candidates.map(c => (
            <div key={c.id} className="p-4 rounded-lg bg-bg-dark border border-border-main flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-blue font-mono hover:underline truncate">{c.owner}/{c.name}</a>
                {c.score != null && <span className="text-[10px] font-mono text-emerald-400">{c.score}/100</span>}
              </div>
              <p className="text-[11px] text-slate-400 font-mono line-clamp-2">{c.description || '—'}</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {c.stars}</span>
                <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {c.forks}</span>
                {c.language && <span>{c.language}</span>}
              </div>
              <button
                onClick={() => feature(c.id)}
                disabled={generating === c.id}
                className="mt-1 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-mono font-bold hover:bg-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {generating === c.id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                {generating === c.id ? 'Writing…' : 'Feature this repo'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
