import React, { useEffect, useState, useCallback } from 'react';
import { DollarSign, Zap, AlertTriangle, RefreshCw, Activity, BarChart2, Settings2, CheckCircle, XCircle } from 'lucide-react';

interface CostTotals { costUsd: number; calls: number; failedCalls?: number; }
interface ModelRow {
  provider: string; model: string; operation: string;
  calls: number; input_units: number; output_units: number; cost_usd: number; failed: number;
}
interface DayRow { day: string; cost_usd: number; calls: number; }
interface EventRow {
  id: number; provider: string; model: string; operation: string; tenant_id: string | null;
  input_units: number; output_units: number; cost_usd: number; ok: number; recorded_at: string;
}
interface CostData {
  allTime: CostTotals;
  thisMonth: { period: string; costUsd: number; calls: number; };
  byModel: ModelRow[];
  daily: DayRow[];
  recent: EventRow[];
  budgetUsd: number | null;
}

const PROVIDER_COLORS: Record<string, string> = {
  deepseek: '#4d8eff',
  gemini:   '#34d399',
  github:   '#a78bfa',
};

function fmt(v: number, decimals = 4): string {
  return v === 0 ? '$0.00' : `$${v.toFixed(decimals)}`;
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 2)}%`, background: color }} />
    </div>
  );
}

function SparkBar({ days, maxCost }: { days: DayRow[]; maxCost: number }) {
  if (days.length === 0) return (
    <div className="h-20 flex items-center justify-center text-xs text-slate-600 font-mono italic">No data yet</div>
  );
  return (
    <div className="flex items-end gap-px h-20">
      {days.map(d => {
        const pct = maxCost > 0 ? (d.cost_usd / maxCost) * 100 : 0;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center group relative">
            <div
              className="w-full rounded-t transition-all"
              style={{ height: `${Math.max(pct, 2)}%`, background: 'rgba(77,142,255,0.6)' }}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 whitespace-nowrap text-[9px] font-mono bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300">
              {d.day.slice(5)} · {fmt(d.cost_usd)} · {d.calls} calls
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const AdminCosts: React.FC = () => {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);
  const [budgetMsg, setBudgetMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/admin/costs').then(r => r.json());
      if (d && !d.error) {
        setData(d);
        setBudgetInput(d.budgetUsd != null ? String(d.budgetUsd) : '');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveBudget = async () => {
    setSavingBudget(true);
    setBudgetMsg(null);
    try {
      const budgetUsd = budgetInput.trim() === '' ? null : parseFloat(budgetInput);
      await fetch('/api/admin/costs/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetUsd }),
      });
      setBudgetMsg('Saved');
      await load();
    } catch { setBudgetMsg('Error'); }
    finally { setSavingBudget(false); }
  };

  if (loading) return <p className="text-xs text-slate-600 italic font-mono p-6">Loading cost data…</p>;
  if (!data) return <p className="text-xs text-slate-500 italic font-mono p-6">Failed to load cost data.</p>;

  const maxDailyCost = Math.max(...data.daily.map(d => d.cost_usd), 0.000001);
  const totalByModel = data.byModel.reduce((s, r) => s + r.cost_usd, 0) || 1;
  const overBudget = data.budgetUsd != null && data.thisMonth.costUsd >= data.budgetUsd;
  const nearBudget = data.budgetUsd != null && !overBudget && data.thisMonth.costUsd >= data.budgetUsd * 0.8;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'All-time spend',   value: fmt(data.allTime.costUsd, 4),   sub: `${data.allTime.calls} calls` },
          { icon: Activity,   label: `${data.thisMonth.period} spend`, value: fmt(data.thisMonth.costUsd, 4), sub: `${data.thisMonth.calls} calls this month` },
          { icon: Zap,        label: 'Failed calls',     value: String(data.allTime.failedCalls ?? 0), sub: 'across all providers' },
          { icon: BarChart2,  label: 'Models tracked',   value: String(new Set(data.byModel.map(r => r.model)).size), sub: `${data.byModel.length} operation types` },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="glass-card rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
              <Icon className="w-3.5 h-3.5 text-accent-blue" /> {label}
            </div>
            <div className="text-2xl font-black font-mono text-white">{value}</div>
            {sub && <div className="text-[11px] font-mono text-slate-500 mt-1">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Budget warning + config */}
      {(overBudget || nearBudget) && (
        <div className={`rounded-xl p-4 flex items-center gap-3 border text-sm font-mono ${overBudget ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
          <AlertTriangle className="w-4 h-4 flex-none" />
          {overBudget
            ? `Monthly budget exceeded — spent ${fmt(data.thisMonth.costUsd)} of ${fmt(data.budgetUsd!)} budget.`
            : `Approaching monthly budget — ${Math.round((data.thisMonth.costUsd / data.budgetUsd!) * 100)}% used (${fmt(data.thisMonth.costUsd)} of ${fmt(data.budgetUsd!)}).`}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily spend chart */}
        <div className="glass-card rounded-2xl p-5 shadow-xl col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-accent-blue" /> Daily spend — last 30 days
            </div>
            <button onClick={load} className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <SparkBar days={data.daily} maxCost={maxDailyCost} />
          <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
            <span>{data.daily[0]?.day?.slice(5) ?? ''}</span>
            <span>{data.daily[data.daily.length - 1]?.day?.slice(5) ?? ''}</span>
          </div>
        </div>

        {/* Budget config */}
        <div className="glass-card rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-4">
            <Settings2 className="w-3.5 h-3.5 text-accent-blue" /> Monthly budget alert
          </div>
          <p className="text-[11px] text-slate-500 font-mono mb-3">Set a USD threshold — a warning banner appears when you hit 80% or 100%.</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                placeholder="e.g. 10.00"
                className="w-full pl-6 pr-2 py-1.5 bg-bg-dark border border-border-main rounded text-sm text-slate-200 font-mono focus:outline-none focus:border-accent-blue"
              />
            </div>
            <button
              onClick={saveBudget}
              disabled={savingBudget}
              className="px-3 py-1.5 rounded bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-xs font-mono hover:bg-accent-blue/30 transition-all disabled:opacity-50"
            >
              {savingBudget ? '…' : 'Save'}
            </button>
          </div>
          {budgetMsg && <p className="text-[11px] font-mono mt-2 text-emerald-400">{budgetMsg}</p>}
          {data.budgetUsd != null && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>This month</span><span>{Math.round((data.thisMonth.costUsd / data.budgetUsd) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((data.thisMonth.costUsd / data.budgetUsd) * 100, 100)}%`,
                    background: overBudget ? '#f87171' : nearBudget ? '#fbbf24' : '#4d8eff',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Per-model breakdown */}
      <div className="glass-card rounded-2xl p-5 shadow-xl">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-4">
          <Zap className="w-3.5 h-3.5 text-accent-blue" /> Cost by provider / model / operation
        </div>
        {data.byModel.length === 0 ? (
          <p className="text-xs text-slate-600 italic font-mono">No AI calls recorded yet. Costs appear after the first ingest or recommendation.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-slate-600 border-b border-border-main/40">
                  <th className="py-2 pr-4">Provider</th>
                  <th className="py-2 pr-4">Model</th>
                  <th className="py-2 pr-4">Operation</th>
                  <th className="py-2 pr-4 text-right">Calls</th>
                  <th className="py-2 pr-4 text-right">Input units</th>
                  <th className="py-2 pr-4 text-right">Output units</th>
                  <th className="py-2 pr-4 text-right">Failed</th>
                  <th className="py-2 pr-4 text-right">Cost (USD)</th>
                  <th className="py-2">Share</th>
                </tr>
              </thead>
              <tbody>
                {data.byModel.map((row, i) => {
                  const color = PROVIDER_COLORS[row.provider] ?? '#8c909f';
                  const pct = (row.cost_usd / totalByModel) * 100;
                  return (
                    <tr key={i} className="border-b border-border-main/20 hover:bg-white/[0.02]">
                      <td className="py-2 pr-4">
                        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase" style={{ color, background: `${color}18`, border: `1px solid ${color}35` }}>{row.provider}</span>
                      </td>
                      <td className="py-2 pr-4 text-slate-300">{row.model}</td>
                      <td className="py-2 pr-4 text-slate-500">{row.operation}</td>
                      <td className="py-2 pr-4 text-right text-slate-300">{row.calls.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right text-slate-400">{row.input_units.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right text-slate-400">{row.output_units.toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right">
                        {row.failed > 0
                          ? <span className="text-red-400">{row.failed}</span>
                          : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-2 pr-4 text-right text-slate-200 tabular-nums">{fmt(row.cost_usd)}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <MiniBar pct={pct} color={color} />
                          <span className="text-slate-600 w-8 text-right">{Math.round(pct)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent event log */}
      <div className="glass-card rounded-2xl p-5 shadow-xl">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-4">
          <Activity className="w-3.5 h-3.5 text-accent-blue" /> Recent events (last 50)
        </div>
        {data.recent.length === 0 ? (
          <p className="text-xs text-slate-600 italic font-mono">No events yet.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar max-h-64">
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0" style={{ background: 'rgba(15,23,42,0.9)' }}>
                <tr className="text-left text-[10px] uppercase tracking-widest text-slate-600 border-b border-border-main/40">
                  <th className="py-1.5 pr-3">When</th>
                  <th className="py-1.5 pr-3">Provider</th>
                  <th className="py-1.5 pr-3">Operation</th>
                  <th className="py-1.5 pr-3">Tenant</th>
                  <th className="py-1.5 pr-3 text-right">In</th>
                  <th className="py-1.5 pr-3 text-right">Out</th>
                  <th className="py-1.5 pr-3 text-right">Cost</th>
                  <th className="py-1.5">OK</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map(ev => (
                  <tr key={ev.id} className="border-b border-border-main/10 hover:bg-white/[0.02]">
                    <td className="py-1.5 pr-3 text-slate-500">{ev.recorded_at.slice(0, 16).replace('T', ' ')}</td>
                    <td className="py-1.5 pr-3">
                      <span style={{ color: PROVIDER_COLORS[ev.provider] ?? '#8c909f' }}>{ev.provider}</span>
                    </td>
                    <td className="py-1.5 pr-3 text-slate-400">{ev.operation}</td>
                    <td className="py-1.5 pr-3 text-slate-600 max-w-[120px] truncate" title={ev.tenant_id ?? ''}>{ev.tenant_id?.slice(0, 16) ?? '—'}</td>
                    <td className="py-1.5 pr-3 text-right text-slate-400">{ev.input_units.toLocaleString()}</td>
                    <td className="py-1.5 pr-3 text-right text-slate-400">{ev.output_units.toLocaleString()}</td>
                    <td className="py-1.5 pr-3 text-right tabular-nums text-slate-300">{fmt(ev.cost_usd, 6)}</td>
                    <td className="py-1.5">
                      {ev.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
