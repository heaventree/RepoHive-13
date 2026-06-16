import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SweepStatus {
  running: boolean;
  total: number;
  done: number;
  failed: number;
  startedAt: string | null;
  finishedAt: string | null;
  trigger: 'manual' | 'auto' | null;
}

// Admin panel for the global reclassification sweep — re-runs AI analysis
// across every tenant so the library picks up changes to the classification
// engine (productClass / comparableApp / demoUrl). Auto-runs once a day in
// the background; this UI lets an admin force it on demand.
export const AdminReclassify: React.FC = () => {
  const [status, setStatus] = useState<SweepStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const r = await fetch('/api/admin/reclassify/status');
      if (r.ok) setStatus(await r.json());
    } catch {}
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const start = async (force: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/reclassify${force ? '?force=true' : ''}`, { method: 'POST' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to start sweep');
    } finally {
      setBusy(false);
    }
  };

  const pct = status && status.total > 0 ? Math.round((status.done / status.total) * 100) : 0;
  const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleString() : '—';

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-blue" /> Reclassification Sweep
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Re-runs the AI analysis on every repo that doesn't yet have the current
              classification (productClass). Use this after tweaking the classification
              prompt so the library reflects the new rules. Force-rescan re-analyses
              everything regardless of state.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-none">
            <button
              onClick={() => start(false)}
              disabled={busy || status?.running}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-blue/15 border border-accent-blue/40 text-accent-blue text-xs font-bold font-mono uppercase hover:bg-accent-blue/25 disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status?.running ? 'animate-spin' : ''}`} />
              Run Now
            </button>
            <button
              onClick={() => start(true)}
              disabled={busy || status?.running}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono uppercase hover:bg-amber-500/20 disabled:opacity-40"
            >
              Force Rescan All
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 mb-4">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {status && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <Stat label="Status" value={status.running ? 'Running' : (status.startedAt ? 'Idle' : 'Never run')} accent={status.running ? 'text-accent-blue' : 'text-slate-300'} />
              <Stat label="Processed" value={`${status.done} / ${status.total}`} />
              <Stat label="Failed" value={String(status.failed)} accent={status.failed > 0 ? 'text-amber-300' : 'text-slate-300'} />
              <Stat label="Trigger" value={status.trigger ?? '—'} />
            </div>

            {status.running && (
              <div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-accent-blue transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">{pct}%</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-500 pt-2 border-t border-white/5">
              <div>Started: <span className="text-slate-300">{fmt(status.startedAt)}</span></div>
              <div>Finished: <span className="text-slate-300">{fmt(status.finishedAt)}</span></div>
            </div>

            {!status.running && status.finishedAt && status.failed === 0 && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Last sweep completed cleanly.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="glass-card rounded-xl p-6">
        <h4 className="text-sm font-bold text-white font-mono mb-2">Automatic schedule</h4>
        <p className="text-xs text-slate-500">
          A background timer reruns this sweep every <code className="text-slate-300">RECLASSIFY_INTERVAL_HOURS</code> hours
          (default <span className="text-slate-300">24</span>). Set the env var to <code className="text-slate-300">0</code> to disable auto-runs.
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
