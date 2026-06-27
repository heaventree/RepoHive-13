import React, { useEffect, useState } from 'react';
import { Plug, RefreshCw, Image, Trash2, Save, X, Plus, Sparkles, CheckCircle2, Circle } from 'lucide-react';

interface IntegrationRow {
  id: number;
  slug: string;
  name: string;
  domain: string | null;
  category: string;
  tagline: string | null;
  logoUrl: string | null;
  setupType: 'generic' | 'custom';
  status: 'live' | 'todo';
  sortOrder: number;
  updatedAt: string;
}

interface IntegrationFull extends IntegrationRow {
  description: string | null;
  setup_steps: string | null;
  seo_title: string | null;
  seo_description: string | null;
  body_md: string | null;
}

export const AdminIntegrations: React.FC = () => {
  const [rows, setRows] = useState<IntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [editing, setEditing] = useState<IntegrationFull | null>(null);
  const [filter, setFilter] = useState<'all' | 'live' | 'todo'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/admin/integrations').then(r => r.json());
      if (Array.isArray(d)) setRows(d);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const seed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/integrations/seed', { method: 'POST' });
      const d = await res.json();
      if (res.ok) await load();
      else alert(d.error || 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  const fetchLogo = async (id: number) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/integrations/${id}/fetch-logo`, { method: 'POST' });
      const d = await res.json();
      if (res.ok) await load();
      else alert(d.error || 'Logo fetch failed');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this connector? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/integrations/${id}`, { method: 'DELETE' });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = async (id: number) => {
    const d = await fetch(`/api/admin/integrations/${id}`).then(r => r.json());
    setEditing(d);
  };

  const openNew = () => {
    setEditing({
      id: 0, slug: '', name: '', domain: '', category: 'Vibe Coding Builder', tagline: '',
      logoUrl: null, setupType: 'generic', status: 'todo', sortOrder: rows.length + 1,
      updatedAt: '', description: '', setup_steps: '[]', seo_title: '', seo_description: '', body_md: '',
    });
  };

  const save = async (form: IntegrationFull) => {
    const res = await fetch('/api/admin/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.id || undefined,
        slug: form.slug, name: form.name, domain: form.domain, category: form.category,
        tagline: form.tagline, description: form.description, logo_url: form.logoUrl,
        setup_type: form.setupType, setup_steps: form.setup_steps, status: form.status,
        seo_title: form.seo_title, seo_description: form.seo_description, body_md: form.body_md,
        sort_order: form.sortOrder,
      }),
    });
    if (res.ok) {
      setEditing(null);
      await load();
    } else {
      alert((await res.json()).error || 'Save failed');
    }
  };

  const liveCount = rows.filter(r => r.status === 'live').length;
  const todoCount = rows.filter(r => r.status === 'todo').length;
  const visible = rows.filter(r => filter === 'all' ? true : r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {([['all', `All (${rows.length})`], ['live', `Live (${liveCount})`], ['todo', `To do (${todoCount})`]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                filter === id ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/40' : 'text-slate-500 hover:text-slate-200 border border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={seed}
            disabled={seeding}
            className="px-3 py-2 rounded-lg bg-purple-500/15 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold hover:bg-purple-500/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
            title="Insert the first-wave 25 connectors (skips slugs that already exist)"
          >
            <Sparkles className={`w-3.5 h-3.5 ${seeding ? 'animate-pulse' : ''}`} /> Seed first wave
          </button>
          <button
            onClick={openNew}
            className="px-3 py-2 rounded-lg bg-accent-blue/15 border border-accent-blue/40 text-accent-blue text-xs font-mono font-bold hover:bg-accent-blue/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> New connector
          </button>
          <button onClick={load} className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="glass-card rounded-lg p-6 shadow-xl">
        {loading ? (
          <p className="text-xs text-slate-600 italic font-mono">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-xs text-slate-600 italic font-mono">No connectors yet — seed the first wave or add one manually.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-slate-600 border-b border-border-main/40">
                  <th className="py-2 pr-4">Tool</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Setup</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Order</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r.id} className="border-b border-border-main/20 hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-white/5 border border-border-main/40 flex items-center justify-center flex-none overflow-hidden">
                          {r.logoUrl ? <img src={r.logoUrl} alt="" className="w-full h-full object-contain p-0.5" /> : <Plug className="w-3.5 h-3.5 text-slate-600" />}
                        </div>
                        <div>
                          <div className="text-slate-200">{r.name}</div>
                          <div className="text-[10px] text-slate-600">{r.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-400">{r.category}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${r.setupType === 'custom' ? 'text-purple-300 bg-purple-500/10 border border-purple-500/30' : 'text-slate-400 bg-white/5 border border-border-main/30'}`}>
                        {r.setupType}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`flex items-center gap-1.5 ${r.status === 'live' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {r.status === 'live' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-slate-500">{r.sortOrder}</td>
                    <td className="py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.domain && (
                          <button
                            onClick={() => fetchLogo(r.id)}
                            disabled={busyId === r.id}
                            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50"
                            title="Fetch logo from Brandfetch"
                          >
                            <Image className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(r.id)}
                          className="px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all text-[10px] font-bold uppercase"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          disabled={busyId === r.id}
                          className="p-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <EditModal row={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
};

function EditModal({ row, onClose, onSave }: { row: IntegrationFull; onClose: () => void; onSave: (form: IntegrationFull) => void }) {
  const [form, setForm] = useState<IntegrationFull>(row);
  const set = <K extends keyof IntegrationFull>(k: K, v: IntegrationFull[K]) => setForm(f => ({ ...f, [k]: v }));

  let steps: string[] = [];
  try { steps = JSON.parse(form.setup_steps || '[]'); } catch { steps = []; }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="glass-card rounded-lg p-6 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">
            {form.id ? `Edit · ${form.name || form.slug}` : 'New connector'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><input value={form.name} onChange={e => set('name', e.target.value)} className="input" /></Field>
          <Field label="Slug (blank = auto)"><input value={form.slug} onChange={e => set('slug', e.target.value)} className="input" /></Field>
          <Field label="Domain (for Brandfetch)"><input value={form.domain ?? ''} onChange={e => set('domain', e.target.value)} placeholder="example.com" className="input" /></Field>
          <Field label="Category"><input value={form.category} onChange={e => set('category', e.target.value)} className="input" /></Field>
          <Field label="Setup type">
            <select value={form.setupType} onChange={e => set('setupType', e.target.value as any)} className="input">
              <option value="generic">generic</option>
              <option value="custom">custom</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => set('status', e.target.value as any)} className="input">
              <option value="todo">todo</option>
              <option value="live">live</option>
            </select>
          </Field>
        </div>

        <Field label="Tagline"><input value={form.tagline ?? ''} onChange={e => set('tagline', e.target.value)} className="input w-full" /></Field>
        <Field label="Description (shown on the tool's detail page)">
          <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={3} className="input w-full" />
        </Field>
        <Field label="Setup steps (one per line)">
          <textarea
            value={steps.join('\n')}
            onChange={e => set('setup_steps', JSON.stringify(e.target.value.split('\n').map(s => s.trim()).filter(Boolean)))}
            rows={4}
            className="input w-full"
          />
        </Field>
        <Field label="SEO title"><input value={form.seo_title ?? ''} onChange={e => set('seo_title', e.target.value)} className="input w-full" /></Field>
        <Field label="SEO description"><input value={form.seo_description ?? ''} onChange={e => set('seo_description', e.target.value)} className="input w-full" /></Field>
        <Field label="Body copy (markdown — your 400-500 word piece)">
          <textarea value={form.body_md ?? ''} onChange={e => set('body_md', e.target.value)} rows={8} className="input w-full" />
        </Field>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-mono font-bold">Cancel</button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 rounded-lg bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-xs font-mono font-bold hover:bg-accent-blue/30 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      <style>{`.input { background: rgba(10,14,22,0.8); border: 1px solid var(--border-main, rgba(255,255,255,0.08)); border-radius: 5px; padding: 0.5rem 0.65rem; font-size: 0.75rem; color: #e2e8f0; font-family: monospace; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">{label}</div>
      {children}
    </label>
  );
}
