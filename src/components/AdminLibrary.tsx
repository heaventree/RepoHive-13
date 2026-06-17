import React, { useEffect, useMemo, useState } from 'react';
import { Crown, Flame, Plus, Trash2, RefreshCw, Search, CheckCircle2 } from 'lucide-react';
import { classifyRepo } from '../lib/classification';

interface LibraryRepo {
  id: string;
  owner: string;
  name: string;
  url: string;
  score: number;
  language: string | null;
  stars: number;
  ai_analysis: string | null;
  embedded: number;
}

interface OwnRepo {
  id: string;
  name: string;
  language: string | null;
  stars: number;
  score: number;
  source: string;
}

function isAppKiller(aiAnalysis: string | null): boolean {
  try { return classifyRepo(JSON.parse(aiAnalysis ?? '')).kind === 'app-killer'; } catch { return false; }
}

// Admin-only curation screen for the preloaded "App Killers" library: shows
// what subscribers receive on upgrade, lets the admin promote repos from their
// own library into it, and remove ones that no longer belong.
export const AdminLibrary: React.FC = () => {
  const [library, setLibrary] = useState<LibraryRepo[]>([]);
  const [ownRepos, setOwnRepos] = useState<OwnRepo[]>([]);
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [lib, own] = await Promise.all([
        fetch('/api/admin/library').then(r => r.json()),
        fetch('/api/repos').then(r => r.json()),
      ]);
      if (Array.isArray(lib)) setLibrary(lib);
      if (Array.isArray(own)) setOwnRepos(own);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const promote = async (repoId: string) => {
    setBusy(repoId);
    try {
      const res = await fetch('/api/admin/library/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      });
      const data = await res.json();
      if (res.ok) { flash(`${repoId} added to preloaded library`); await load(); }
      else flash(data.error || 'Promote failed');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (repoId: string) => {
    if (!window.confirm(`Remove ${repoId} from the preloaded library?\n\nSubscribers who already received it keep their copy.`)) return;
    setBusy(repoId);
    try {
      const res = await fetch(`/api/admin/library/${repoId}`, { method: 'DELETE' });
      if (res.ok) { flash(`${repoId} removed`); await load(); }
    } finally {
      setBusy(null);
    }
  };

  const libraryIds = useMemo(() => new Set(library.map(r => r.id)), [library]);
  const promotable = useMemo(
    () => ownRepos
      .filter(r => !libraryIds.has(r.id))
      .filter(r => !filter || r.id.toLowerCase().includes(filter.toLowerCase())),
    [ownRepos, libraryIds, filter],
  );
  const filteredLibrary = useMemo(
    () => library.filter(r => !filter || r.id.toLowerCase().includes(filter.toLowerCase())),
    [library, filter],
  );
  const killerCount = useMemo(() => library.filter(r => isAppKiller(r.ai_analysis)).length, [library]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="glass-header p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 font-mono uppercase tracking-widest">
          <Crown className="w-4 h-4 text-amber-400" /> Admin · Preloaded Library
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-3xl font-bold text-white font-mono tracking-tight">App Killers Curation</h2>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-full text-slate-300" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {library.length} preloaded
            </span>
            <span className="px-2.5 py-1 rounded-full text-amber-300" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Flame className="w-3 h-3 inline mr-1 -mt-0.5" />{killerCount} app killers
            </span>
            <button
              onClick={load}
              className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-mono mt-2">
          Repos in this list are copied into every Solo and Studio subscriber's library on upgrade. They never count against a subscriber's repo cap.
        </p>
      </div>

      {notice && (
        <div className="mx-6 mt-4 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-mono text-emerald-300"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="p-6 space-y-8 max-w-6xl mx-auto w-full">
        {/* Filter */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter by owner/name…"
            className="w-full bg-bg-dark border border-border-main rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-blue/50"
          />
        </div>

        {/* Promote from own library */}
        <div className="glass-card rounded-lg p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1 font-mono flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent-blue" /> Promote from your library
          </h3>
          <p className="text-xs text-slate-500 font-mono mb-4">
            Repos you've added that aren't in the preloaded set yet ({promotable.length}).
          </p>
          {promotable.length === 0 ? (
            <p className="text-xs text-slate-600 italic font-mono">Nothing to promote — every repo in your library is already preloaded.</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {promotable.slice(0, 100).map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-bg-dark/50 border border-border-main/30 text-sm font-mono">
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="text-slate-200 truncate">{r.id}</span>
                    <span className="text-[10px] text-slate-600 flex-none">{r.language ?? '—'} · ★{r.stars}</span>
                  </div>
                  <button
                    onClick={() => promote(r.id)}
                    disabled={busy !== null}
                    className="flex-none px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider text-accent-blue bg-accent-blue/10 border border-accent-blue/30 hover:bg-accent-blue/20 transition-all disabled:opacity-50"
                  >
                    {busy === r.id ? '…' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current preloaded library */}
        <div className="glass-card rounded-lg p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1 font-mono flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" /> Preloaded library contents
          </h3>
          <p className="text-xs text-slate-500 font-mono mb-4">
            {filteredLibrary.length} shown. Removing here does not touch copies subscribers already received.
          </p>
          {loading ? (
            <p className="text-xs text-slate-600 italic font-mono">Loading…</p>
          ) : filteredLibrary.length === 0 ? (
            <p className="text-xs text-slate-600 italic font-mono">
              The preloaded library is empty — run the seed migration or promote repos above.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-[28rem] overflow-y-auto custom-scrollbar pr-1">
              {filteredLibrary.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-bg-dark/50 border border-border-main/30 text-sm font-mono">
                  <div className="min-w-0 flex items-center gap-3">
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-slate-200 truncate hover:text-accent-blue transition-colors">{r.id}</a>
                    {isAppKiller(r.ai_analysis) && (
                      <span className="flex-none text-[10px] text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10">
                        <Flame className="w-2.5 h-2.5 inline -mt-0.5" /> killer
                      </span>
                    )}
                    <span className="text-[10px] text-slate-600 flex-none">
                      {r.language ?? '—'} · ★{r.stars} · score {r.score}{r.embedded ? '' : ' · no embedding'}
                    </span>
                  </div>
                  <button
                    onClick={() => remove(r.id)}
                    disabled={busy !== null}
                    className="flex-none p-1.5 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    title="Remove from preloaded library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
