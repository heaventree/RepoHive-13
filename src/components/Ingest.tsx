import React, { useRef, useState } from 'react';
import {
  Rocket,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  RotateCcw,
  Zap,
  Sparkles,
  Square,
  PartyPopper,
  X,
} from 'lucide-react';

interface IngestProps {
  onComplete: () => void;
}

interface StreamItem {
  id: string;
  status: 'FETCHING' | 'ANALYZING' | 'SCORING' | 'COMPLETE' | 'FAILED' | 'STOPPED';
  progress: number;
  error?: string;
  removing?: boolean;
}

interface Summary {
  added: number;
  failed: number;
  stopped: boolean;
}

export const Ingest: React.FC<IngestProps> = ({ onComplete }) => {
  const [urls, setUrls] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<StreamItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [cleaned, setCleaned] = useState(false);
  const [cleanFailed, setCleanFailed] = useState(false);

  const abortRef = useRef(false);
  const removeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const repoCount = urls.split('\n').filter(u => u.trim().startsWith('http')).length;

  /* ── Schedule auto-vanish for a finished card ── */
  const scheduleRemove = (id: string) => {
    const t = setTimeout(() => {
      // Fade out first
      setStream(prev => prev.map(item => item.id === id ? { ...item, removing: true } : item));
      // Then delete from list
      setTimeout(() => {
        setStream(prev => prev.filter(item => item.id !== id));
      }, 450);
      removeTimers.current.delete(id);
    }, 5000);
    removeTimers.current.set(id, t);
  };

  /* ── URL helpers ── */
  function extractGitHubUrls(text: string): string[] {
    const decoded = text.replace(
      /https?:\/\/(?:www\.)?youtube\.com\/redirect\?[^\s"']*/g,
      (match) => {
        try {
          const q = new URL(match).searchParams.get('q');
          return q ? decodeURIComponent(q) : match;
        } catch { return match; }
      }
    );
    const matches = decoded.match(/https?:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/g) || [];
    return matches.map(u => u.replace(/\.+$/, ''));
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData('text/html');
    if (!html) return;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const hrefs = Array.from(doc.querySelectorAll('a[href]')).map(a => (a as HTMLAnchorElement).href);
    const fromHrefs = hrefs.flatMap(h => extractGitHubUrls(h));
    if (fromHrefs.length === 0) return;
    e.preventDefault();
    const existing = urls.trim() ? urls.trim().split('\n') : [];
    setUrls([...new Set([...existing, ...fromHrefs])].join('\n'));
  };

  const handleCleanPaste = () => {
    const valid = [...new Set(extractGitHubUrls(urls))];
    if (valid.length === 0) {
      setCleanFailed(true);
      setTimeout(() => setCleanFailed(false), 1800);
      return;
    }
    setUrls(valid.join('\n'));
    setCleaned(true);
    setTimeout(() => setCleaned(false), 1800);
  };

  /* ── Kill switch ── */
  const handleStop = () => {
    abortRef.current = true;
  };

  /* ── Main scan ── */
  const handleInitiate = async () => {
    const urlList = [...new Set(urls.split('\n').map(u => u.trim()).filter(u => u.startsWith('http')))];
    if (urlList.length === 0) return;

    // Clear any lingering timers from previous run
    removeTimers.current.forEach(t => clearTimeout(t));
    removeTimers.current.clear();

    abortRef.current = false;
    setSummary(null);
    setIsScanning(true);
    setStream(urlList.map(url => ({
      id: url.split('/').slice(-2).join('/'),
      status: 'FETCHING',
      progress: 10,
    })));

    const CONCURRENCY = 5;
    let added = 0;
    let failed = 0;

    const processUrl = async (url: string) => {
      if (abortRef.current) {
        const id = url.split('/').slice(-2).join('/');
        setStream(prev => prev.map(item => item.id === id ? { ...item, status: 'STOPPED', progress: 0 } : item));
        scheduleRemove(id);
        return;
      }

      const id = url.split('/').slice(-2).join('/');
      setStream(prev => prev.map(item => item.id === id ? { ...item, status: 'ANALYZING', progress: 40 } : item));

      try {
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || res.statusText);
        }
        setStream(prev => prev.map(item => item.id === id ? { ...item, status: 'SCORING', progress: 80 } : item));
        await new Promise(r => setTimeout(r, 200));
        setStream(prev => prev.map(item => item.id === id ? { ...item, status: 'COMPLETE', progress: 100 } : item));
        added++;
        scheduleRemove(id);
      } catch (error: any) {
        setStream(prev => prev.map(item => item.id === id ? { ...item, status: 'FAILED', error: error.message, progress: 0 } : item));
        failed++;
        scheduleRemove(id);
      }
    };

    for (let i = 0; i < urlList.length; i += CONCURRENCY) {
      if (abortRef.current) {
        // Mark remaining queued items as STOPPED
        const remaining = urlList.slice(i + CONCURRENCY);
        setStream(prev => prev.map(item =>
          remaining.includes(`https://github.com/${item.id}`) || item.status === 'FETCHING'
            ? { ...item, status: 'STOPPED', progress: 0 }
            : item
        ));
        break;
      }
      await Promise.all(urlList.slice(i, i + CONCURRENCY).map(processUrl));
    }

    setIsScanning(false);
    setSummary({ added, failed, stopped: abortRef.current });
  };

  const handleDismissSummary = () => {
    setSummary(null);
    setStream([]);
    setUrls('');
    removeTimers.current.forEach(t => clearTimeout(t));
    removeTimers.current.clear();
  };

  const getStatusLabel = (status: string) => {
    if (status === 'FETCHING')  return 'Queued…';
    if (status === 'ANALYZING') return 'AI analysis…';
    if (status === 'SCORING')   return 'Computing score…';
    if (status === 'COMPLETE')  return 'Added to library';
    if (status === 'STOPPED')   return 'Cancelled';
    return 'Failed';
  };

  const activeCount  = stream.filter(s => !['COMPLETE','FAILED','STOPPED'].includes(s.status)).length;
  const addedCount   = stream.filter(s => s.status === 'COMPLETE').length;
  const failedCount  = stream.filter(s => s.status === 'FAILED').length;

  return (
    <main className="flex-1 overflow-auto custom-scrollbar relative">

      {/* ── Completion notification ── */}
      {summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl p-8 text-center shadow-2xl"
            style={{
              background: 'rgba(15,23,42,0.96)',
              border: summary.stopped
                ? '1px solid rgba(251,191,36,0.30)'
                : summary.failed > 0
                ? '1px solid rgba(239,68,68,0.30)'
                : '1px solid rgba(16,185,129,0.30)',
              boxShadow: summary.stopped
                ? '0 0 40px rgba(251,191,36,0.12)'
                : summary.failed > 0
                ? '0 0 40px rgba(239,68,68,0.10)'
                : '0 0 40px rgba(16,185,129,0.15)',
            }}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: summary.stopped
                  ? 'rgba(251,191,36,0.10)'
                  : summary.failed === 0
                  ? 'rgba(16,185,129,0.10)'
                  : 'rgba(239,68,68,0.08)',
              }}
            >
              {summary.stopped ? (
                <Square className="w-7 h-7 text-amber-400" />
              ) : summary.failed === 0 ? (
                <PartyPopper className="w-7 h-7 text-emerald-400" />
              ) : (
                <AlertCircle className="w-7 h-7 text-red-400" />
              )}
            </div>

            <h3 className="text-white font-bold text-xl mb-2 font-mono tracking-tight">
              {summary.stopped ? 'Scan stopped' : summary.failed === 0 ? 'All done!' : 'Scan complete'}
            </h3>

            <p className="text-slate-400 text-sm mb-1">
              <span className="text-emerald-400 font-bold">{summary.added}</span> repo{summary.added !== 1 ? 's' : ''} added to your library
            </p>
            {summary.failed > 0 && (
              <p className="text-slate-400 text-sm mb-1">
                <span className="text-red-400 font-bold">{summary.failed}</span> failed
              </p>
            )}
            {summary.stopped && (
              <p className="text-slate-500 text-xs mt-1">Remaining repos were not processed.</p>
            )}

            <button
              onClick={handleDismissSummary}
              className="mt-7 w-full py-3 rounded-xl font-mono font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: summary.stopped
                  ? 'rgba(251,191,36,0.15)'
                  : summary.failed === 0
                  ? 'rgba(16,185,129,0.15)'
                  : 'rgba(239,68,68,0.12)',
                color: summary.stopped ? '#fbbf24' : summary.failed === 0 ? '#34d399' : '#f87171',
                border: summary.stopped
                  ? '1px solid rgba(251,191,36,0.25)'
                  : summary.failed === 0
                  ? '1px solid rgba(16,185,129,0.25)'
                  : '1px solid rgba(239,68,68,0.20)',
              }}
            >
              OK — clear board
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-6 flex flex-col h-full">
        {/* Page Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Bulk Import</h1>
          </div>
          <span className="text-slate-500 text-sm">— Paste GitHub URLs and AI will analyse, score and categorise every repo in seconds.</span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">

          {/* ── Live Monitor ── */}
          <div className="flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  {isScanning && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60" />}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Live Monitor</p>
                  <p className="text-slate-500 text-xs mt-0.5">Real-time ingestion status</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <div className="px-3 py-1.5 rounded-full text-xs font-bold font-mono border" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}>
                    {activeCount} active
                  </div>
                )}
                {addedCount > 0 && (
                  <div className="px-3 py-1.5 rounded-full text-xs font-bold font-mono border" style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                    {addedCount} added
                  </div>
                )}
                {failedCount > 0 && (
                  <div className="px-3 py-1.5 rounded-full text-xs font-bold font-mono border" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                    {failedCount} failed
                  </div>
                )}
              </div>
            </div>

            {/* Stream list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {stream.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Rocket className="w-7 h-7 text-slate-600" />
                  </div>
                  <p className="text-slate-500 font-medium">No scans running</p>
                  <p className="text-slate-700 text-sm mt-1">Results will stream here in real time</p>
                </div>
              ) : stream.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border p-4"
                  style={{
                    transition: 'opacity 0.45s ease, transform 0.45s ease, max-height 0.45s ease',
                    opacity: item.removing ? 0 : 1,
                    transform: item.removing ? 'translateY(-8px) scale(0.97)' : 'none',
                    maxHeight: item.removing ? '0px' : '120px',
                    overflow: 'hidden',
                    background: item.status === 'COMPLETE'
                      ? 'rgba(16,185,129,0.04)'
                      : item.status === 'FAILED'
                      ? 'rgba(239,68,68,0.05)'
                      : item.status === 'STOPPED'
                      ? 'rgba(251,191,36,0.04)'
                      : 'rgba(16,185,129,0.06)',
                    borderColor: item.status === 'COMPLETE'
                      ? 'rgba(16,185,129,0.25)'
                      : item.status === 'FAILED'
                      ? 'rgba(239,68,68,0.30)'
                      : item.status === 'STOPPED'
                      ? 'rgba(251,191,36,0.20)'
                      : 'rgba(16,185,129,0.20)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{item.id.split('/')[1]}</p>
                      <p className="text-slate-500 font-mono text-xs truncate mt-0.5">{item.id}</p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      {item.status === 'COMPLETE' ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      ) : item.status === 'FAILED' ? (
                        <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        </div>
                      ) : item.status === 'STOPPED' ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                          <X className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500">{item.error || getStatusLabel(item.status)}</span>
                      <span className="text-slate-400">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.progress}%`,
                          background: item.status === 'FAILED'
                            ? 'linear-gradient(90deg, #ef4444, #f87171)'
                            : item.status === 'STOPPED'
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : 'linear-gradient(90deg, #10b981, #34d399)',
                          boxShadow: item.status === 'FAILED'
                            ? '0 0 8px rgba(239,68,68,0.5)'
                            : item.status === 'STOPPED'
                            ? '0 0 8px rgba(251,191,36,0.4)'
                            : '0 0 8px rgba(16,185,129,0.6)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── URL Input ── */}
          <div className="flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <p className="text-white font-semibold text-lg">Paste URLs</p>
                <p className="text-slate-500 text-xs mt-0.5">One GitHub repository per line</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  <span className="text-indigo-300 font-bold text-sm">{repoCount}</span> repos
                </span>
                <button
                  onClick={handleCleanPaste}
                  disabled={!urls.trim() || isScanning}
                  title="Extract GitHub URLs from messy paste"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                    cleaned
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : cleanFailed
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {cleaned ? 'Cleaned!' : cleanFailed ? 'No URLs' : 'Clean'}
                </button>
                <button
                  onClick={() => setUrls('')}
                  disabled={isScanning}
                  title="Clear list"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Kill switch — only shown while scanning */}
                {isScanning ? (
                  <button
                    onClick={handleStop}
                    title="Stop scan"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs tracking-wide transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.35)',
                      color: '#f87171',
                      boxShadow: '0 0 12px rgba(239,68,68,0.15)',
                    }}
                  >
                    <Square className="w-3.5 h-3.5" />
                    STOP
                  </button>
                ) : (
                  <button
                    onClick={handleInitiate}
                    disabled={repoCount === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    style={{
                      background: repoCount === 0
                        ? 'rgba(99,102,241,0.2)'
                        : 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
                      boxShadow: repoCount > 0 ? '0 0 20px rgba(79,70,229,0.4)' : 'none',
                    }}
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    SCAN
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1">
              <textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                onPaste={handlePaste}
                disabled={isScanning}
                className="custom-scrollbar w-full h-full min-h-64 text-slate-200 font-mono text-sm px-6 py-5 resize-none leading-7 placeholder-slate-600 outline-none disabled:opacity-50"
                style={{ background: 'transparent' }}
                placeholder="https://github.com/facebook/react&#10;https://github.com/vercel/next.js&#10;https://github.com/torvalds/linux"
                spellCheck={false}
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};
