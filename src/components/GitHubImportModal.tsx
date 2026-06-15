import React, { useState, useEffect } from 'react';
import { X, Github, Search, ChevronRight, ChevronLeft, Loader, CheckSquare, Square, AlertCircle, CheckCircle, Star } from 'lucide-react';

interface StarredRepo {
  id: string; owner: string; name: string; url: string;
  stars: number; forks: number; issues: number;
  language: string | null; license: string | null;
  last_push: string; description: string | null;
}

interface ImportStatus { [repoId: string]: 'pending' | 'importing' | 'done' | 'exists' | 'error'; }

interface GitHubImportModalProps {
  existingRepoIds: Set<string>;
  onClose: () => void;
  onImported: (count: number) => void;
}

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({ existingRepoIds, onClose, onImported }) => {
  const [step, setStep] = useState<'username' | 'select' | 'importing'>('username');
  const [username, setUsername] = useState('');
  const [page, setPage] = useState(1);
  const [starred, setStarred] = useState<StarredRepo[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState<ImportStatus>({});
  const [importDone, setImportDone] = useState(false);

  const fetchPage = async (user: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github/stars?username=${encodeURIComponent(user)}&page=${p}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to fetch starred repos'); return; }
      const repos: StarredRepo[] = data;
      setStarred(prev => p === 1 ? repos : [...prev, ...repos]);
      setHasMore(repos.length === 100);
      setPage(p);
      setStep('select');
    } catch { setError('Network error — please try again'); }
    finally { setLoading(false); }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    fetchPage(username.trim(), 1);
  };

  const loadMore = () => fetchPage(username, page + 1);

  const filtered = starred.filter(r =>
    !filter || r.id.toLowerCase().includes(filter.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(filter.toLowerCase()) ||
    (r.language || '').toLowerCase().includes(filter.toLowerCase())
  );

  const toggleRepo = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const importable = filtered.filter(r => !existingRepoIds.has(r.id));
    const allSelected = importable.every(r => selected.has(r.id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) importable.forEach(r => next.delete(r.id));
      else importable.forEach(r => next.add(r.id));
      return next;
    });
  };

  const runImport = async () => {
    const toImport = starred.filter(r => selected.has(r.id));
    if (toImport.length === 0) return;
    setStep('importing');

    const initial: ImportStatus = {};
    toImport.forEach(r => { initial[r.id] = 'pending'; });
    setStatus(initial);

    let imported = 0;
    for (const repo of toImport) {
      setStatus(prev => ({ ...prev, [repo.id]: 'importing' }));
      try {
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: repo.url }),
        });
        const data = await res.json();
        if (res.status === 409) {
          setStatus(prev => ({ ...prev, [repo.id]: 'exists' }));
        } else if (res.ok) {
          setStatus(prev => ({ ...prev, [repo.id]: 'done' }));
          imported++;
        } else {
          setStatus(prev => ({ ...prev, [repo.id]: 'error' }));
        }
      } catch {
        setStatus(prev => ({ ...prev, [repo.id]: 'error' }));
      }
    }
    setImportDone(true);
    onImported(imported);
  };

  const importableSelected = Array.from(selected).filter(id => !existingRepoIds.has(id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl" style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-main/30">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-slate-300" />
            <h2 className="text-base font-bold text-white font-mono">Import starred repos</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Step 1: username */}
          {step === 'username' && (
            <div>
              <p className="text-sm text-slate-400 mb-4">Enter a GitHub username to load their public starred repos. You can then pick which ones to add to your library.</p>
              <form onSubmit={handleUsernameSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    autoFocus
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. torvalds"
                    className="w-full pl-9 pr-3 py-2 bg-bg-dark border border-border-main rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-accent-blue placeholder-slate-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="px-4 py-2 rounded-lg bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-sm font-mono font-bold hover:bg-accent-blue/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Load stars
                </button>
              </form>
              {error && <p className="mt-3 text-sm text-red-400 font-mono flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
            </div>
          )}

          {/* Step 2: select */}
          {step === 'select' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-slate-300 font-mono">
                    <span className="text-white font-bold">{starred.length}</span> starred repos for <span className="text-accent-blue">@{username}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{importableSelected.length} selected to import</p>
                </div>
                <button onClick={() => { setStep('username'); setStarred([]); setSelected(new Set()); }} className="text-[11px] text-slate-500 hover:text-slate-300 font-mono flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5" /> Change user
                </button>
              </div>

              {/* Filter */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="Filter by name, language, description…"
                  className="w-full pl-8 pr-3 py-1.5 bg-bg-dark border border-border-main rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-accent-blue placeholder-slate-600"
                />
              </div>

              {/* Select all */}
              <button onClick={toggleAll} className="text-[11px] font-mono text-slate-500 hover:text-slate-300 mb-2 flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5" />
                {filtered.filter(r => !existingRepoIds.has(r.id)).every(r => selected.has(r.id)) ? 'Deselect all' : 'Select all importable'}
              </button>

              {/* Repo list */}
              <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {filtered.map(r => {
                  const alreadyIn = existingRepoIds.has(r.id);
                  const isSelected = selected.has(r.id);
                  return (
                    <button
                      key={r.id}
                      onClick={() => !alreadyIn && toggleRepo(r.id)}
                      disabled={alreadyIn}
                      className={`w-full text-left flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                        alreadyIn ? 'opacity-40 cursor-not-allowed border-transparent' :
                        isSelected ? 'bg-accent-blue/10 border-accent-blue/30' : 'border-transparent hover:bg-white/[0.03] hover:border-border-main/40'
                      }`}
                    >
                      <div className="flex-none mt-0.5">
                        {alreadyIn
                          ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                          : isSelected
                            ? <CheckSquare className="w-4 h-4 text-accent-blue" />
                            : <Square className="w-4 h-4 text-slate-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-slate-200 truncate">{r.id}</span>
                          {r.language && <span className="text-[9px] font-mono text-slate-500 flex-none">{r.language}</span>}
                          <span className="flex items-center gap-0.5 text-[9px] font-mono text-amber-500 flex-none ml-auto">
                            <Star className="w-2.5 h-2.5" />{r.stars?.toLocaleString()}
                          </span>
                        </div>
                        {r.description && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{r.description}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Load more */}
              {hasMore && (
                <button onClick={loadMore} disabled={loading} className="mt-3 w-full py-2 text-[11px] font-mono text-slate-500 hover:text-slate-300 border border-border-main/30 rounded-lg flex items-center justify-center gap-1.5">
                  {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  Load more (page {page + 1})
                </button>
              )}

              {error && <p className="mt-2 text-xs text-red-400 font-mono">{error}</p>}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">{importableSelected.length} repos will be ingested (quota applies)</span>
                <button
                  onClick={runImport}
                  disabled={importableSelected.length === 0}
                  className="px-4 py-2 rounded-lg bg-accent-blue text-white text-sm font-mono font-bold hover:bg-accent-blue/80 transition-all disabled:opacity-40"
                >
                  Import {importableSelected.length > 0 ? importableSelected.length : ''} repos
                </button>
              </div>
            </div>
          )}

          {/* Step 3: importing */}
          {step === 'importing' && (
            <div>
              <p className="text-sm text-slate-400 font-mono mb-4">
                {importDone ? 'Import complete.' : 'Importing — this may take a moment…'}
              </p>
              <div className="space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {Object.entries(status).map(([id, s]) => (
                  <div key={id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-white/[0.02] border border-border-main/20">
                    <div className="flex-none">
                      {s === 'importing' && <Loader className="w-3.5 h-3.5 text-accent-blue animate-spin" />}
                      {s === 'done'      && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                      {s === 'exists'    && <CheckCircle className="w-3.5 h-3.5 text-slate-500" />}
                      {s === 'error'     && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                      {s === 'pending'   && <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />}
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 flex-1 truncate">{id}</span>
                    <span className="text-[10px] font-mono text-slate-600">
                      {s === 'done' ? 'added' : s === 'exists' ? 'already in library' : s === 'error' ? 'failed' : s === 'importing' ? 'importing…' : ''}
                    </span>
                  </div>
                ))}
              </div>
              {importDone && (
                <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-lg bg-accent-blue text-white font-mono font-bold text-sm hover:bg-accent-blue/80 transition-all">
                  Done
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
