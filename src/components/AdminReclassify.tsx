import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Stats {
  total: number;
  pending: number;
  classified: number;
  classifierVersion: number;
}

interface BatchResult {
  processed: number;
  updated: number;
  failed: number;
  remaining: number;
  since?: string | null;
}

// Admin panel for the global reclassification sweep. The backend processes the
// work in small awaited batches (serverless-safe); this component drives the
// loop — repeatedly POSTing until nothing remains — and shows live progress.
export const AdminReclassify: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<'normal' | 'force' | null>(null);
  const [progress, setProgress] = useState({ processed: 0, updated: 0, failed: 0, remaining: 0 });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const cancelRef = useRef(false);

  const loadStats = async () => {
    try {
      const r = await fetch('/api/admin/reclassify/status');
      if (r.ok) setStats(await r.json());
    } catch {}
  };

  useEffect(() => { loadStats(); }, []);

  const run = async (force: boolean) => {
    setError(null);
    setDone(false);
    setRunning(true);
    setMode(force ? 'force' : 'normal');
    cancelRef.current = false;
    const totals = { processed: 0, updated: 0, failed: 0, remaining: 0 };
    const since = force ? new Date().toISOString() : null;

    try {
      // Loop batches until the backlog is drained (or the user stops / it stalls).
      for (let i = 0; i < 1000; i++) {
        if (cancelRef.current) break;
        const qs = new URLSearchParams();
        if (force && since) { qs.set('force', 'true'); qs.set('since', since); }
        const r = await fetch(`/api/admin/reclassify?${qs.toString()}`, { method: 'POST' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const result: BatchResult = await r.json();

        totals.processed += result.processed;
        totals.updated += result.updated;
        totals.failed += result.failed;
        totals.remaining = result.remaining;
        setProgress({ ...totals });

        if (result.processed === 0 || result.remaining === 0) break;
      }
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Sweep failed');
    } finally {
      setRunning(false);
      setMode(null);
      loadStats();
    }
  };

  const stop = () => { cancelRef.current = true; };

  const total = progress.processed + progress.remaining;
  const pct = total > 0 ? Math.round((progress.processed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-blue" /> Reclassification Sweep
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Re-runs the AI analysis on every repo whose classification predates the
              current engine (v{stats?.classifierVersion ?? '—'}). Use this after the
              classification rules change. "Force rescan" re-analyses everything,
              regardless of state. Runs in batches — keep this tab open until it finishes.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-none">
            {running ? (
              <button
                onClick={stop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold font-mono uppercase hover:bg-red-500/20"
              >
                Stop
              </button>
            ) : (
              <>
                <button
                  onClick={() => run(false)}
                  disabled={running}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-blue/15 border border-accent-blue/40 text-accent-blue text-xs font-bold font-mono uppercase hover:bg-accent-blue/25 disabled:opacity-40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Run Now
                </button>
                <button
                  onClick={() => run(true)}
                  disabled={running}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono uppercase hover:bg-amber-500/20 disabled:opacity-40"
                >
                  Force Rescan All
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 mb-4">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono mb-4">
          <Stat label="Total repos" value={String(stats?.total ?? '—')} />
          <Stat label="Pending" value={String(stats?.pending ?? '—')} accent={(stats?.pending ?? 0) > 0 ? 'text-amber-300' : 'text-emerald-400'} />
          <Stat label="Classified" value={String(stats?.classified ?? '—')} />
          <Stat label="Engine" value={`v${stats?.classifierVersion ?? '—'}`} />
        </div>

        {(running || progress.processed > 0) && (
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-accent-blue transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>
                {running ? (mode === 'force' ? 'Force rescanning…' : 'Reclassifying…') : 'Last run'} —
                {' '}{progress.processed} processed, {progress.updated} updated, {progress.failed} failed
              </span>
              <span>{progress.remaining} remaining</span>
            </div>
          </div>
        )}

        {done && !running && progress.failed === 0 && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-3">
            <CheckCircle2 className="w-4 h-4" /> Sweep complete.
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-6">
        <h4 className="text-sm font-bold text-white font-mono mb-2">Automatic schedule</h4>
        <p className="text-xs text-slate-500">
          A Netlify scheduled function drains the backlog automatically every day at
          02:00 UTC, so the library stays current even if no one runs it manually.
          Newly ingested repos are already classified at ingest time — this sweep is
          only for back-filling existing repos after a rules change.
        </p>
      </div>
    </div>
  );
};

function Stat({ label, value, accent = 'text-slate-300' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-bg-panel/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-0.5">{label}</div>
      <div className={`text-sm font-bold ${accent}`}>{value}</div>
    </div>
  );
}
