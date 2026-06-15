import React, { useEffect, useState } from 'react';
import { Crown, Users, LayoutDashboard, Flame, RefreshCw, Boxes, KeyRound, Rocket, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { AdminLibrary } from './AdminLibrary';
import { AdminCosts } from './AdminCosts';

interface AdminStats {
  tenants: number;
  planDistribution: Record<string, number>;
  userRepos: number;
  libraryCopies: number;
  librarySize: number;
  reposAddedThisMonth: number;
  apiKeys: number;
  projects: number;
  period: string;
}

interface TenantRow {
  tenant_id: string;
  plan: string;
  status: string;
  updated_at: string;
  user_repos: number;
  library_copies: number;
  added_this_month: number;
  api_keys: number;
  email: string | null;
  name: string | null;
  isOrg: boolean;
}

const PLAN_COLORS: Record<string, string> = {
  free: '#8c909f',
  solo: '#4d8eff',
  studio: '#c084fc',
};

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
        <Icon className="w-3.5 h-3.5 text-accent-blue" /> {label}
      </div>
      <div className="text-3xl font-black font-mono text-white">{value}</div>
      {sub && <div className="text-[11px] font-mono text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [rescanRunning, setRescanRunning] = useState(false);
  const [rescanResult, setRescanResult] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { if (d && !d.error) setStats(d); }).catch(() => {});
  }, []);

  const runRescan = async () => {
    if (!window.confirm('Run rescan now? This refreshes GitHub stats for up to 150 oldest user repos. Uses GitHub API quota.')) return;
    setRescanRunning(true);
    setRescanResult(null);
    try {
      const res = await fetch('/api/admin/rescan?limit=150', { method: 'POST' });
      const d = await res.json();
      if (res.ok) setRescanResult(`Done — ${d.updated} updated, ${d.archived} archived, ${d.errors} errors out of ${d.processed} processed.`);
      else setRescanResult(`Failed: ${d.error}`);
    } catch (e: any) {
      setRescanResult(`Failed: ${e.message}`);
    } finally {
      setRescanRunning(false);
    }
  };

  if (!stats) return <p className="text-xs text-slate-600 italic font-mono p-6">Loading stats…</p>;

  const planEntries = (['free', 'solo', 'studio'] as const).map(p => ({
    plan: p, count: stats.planDistribution[p] ?? 0,
  }));
  const paid = planEntries.filter(p => p.plan !== 'free').reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Accounts" value={stats.tenants} sub={`${paid} on paid plans`} />
        <StatCard icon={Boxes} label="User repos" value={stats.userRepos} sub={`+ ${stats.libraryCopies} library copies`} />
        <StatCard icon={TrendingUp} label={`Added in ${stats.period}`} value={stats.reposAddedThisMonth} sub="counts against monthly quotas" />
        <StatCard icon={Flame} label="Preloaded library" value={stats.librarySize} sub="repos in the App Killers set" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={KeyRound} label="API keys" value={stats.apiKeys} sub="active across all accounts" />
        <StatCard icon={Rocket} label="Projects" value={stats.projects} sub="workspaces created" />
        <div className="glass-card rounded-2xl p-6 shadow-xl col-span-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-4">
            <LayoutDashboard className="w-3.5 h-3.5 text-accent-blue" /> Plan distribution
          </div>
          <div className="space-y-2.5">
            {planEntries.map(({ plan, count }) => {
              const pct = stats.tenants ? Math.round((count / stats.tenants) * 100) : 0;
              return (
                <div key={plan} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-14 uppercase tracking-wider" style={{ color: PLAN_COLORS[plan] }}>{plan}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PLAN_COLORS[plan] }} />
                  </div>
                  <span className="w-16 text-right text-slate-400">{count} · {pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Maintenance actions */}
      <div className="glass-card rounded-2xl p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">
              <Zap className="w-3.5 h-3.5 text-accent-blue" /> Maintenance
            </div>
            <h3 className="text-sm font-bold text-white font-mono mb-1">Rescan oldest repos now</h3>
            <p className="text-[11px] text-slate-500 font-mono max-w-md leading-relaxed">
              Refreshes GitHub stats (stars, forks, issues, last push) for the 150 user repos with the oldest <code>updated_at</code>.
              Runs automatically every Sunday at 00:00 UTC.
            </p>
            {rescanResult && <p className="text-[11px] font-mono mt-2 text-emerald-400">{rescanResult}</p>}
          </div>
          <button
            onClick={runRescan}
            disabled={rescanRunning}
            className="px-4 py-2 rounded-lg bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-xs font-mono font-bold hover:bg-accent-blue/30 transition-all disabled:opacity-50 flex items-center gap-1.5 flex-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rescanRunning ? 'animate-spin' : ''}`} />
            {rescanRunning ? 'Running…' : 'Run now'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TenantsTable() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetch('/api/admin/tenants').then(r => r.json());
      if (Array.isArray(d)) setTenants(d);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changePlan = async (tenantId: string, plan: string) => {
    if (!window.confirm(`Set ${tenantId} to the ${plan.toUpperCase()} plan?\n\nUpgrading to a paid plan also copies the preloaded library into the account.`)) return;
    setBusy(tenantId);
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) await load();
      else alert((await res.json()).error || 'Plan change failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
          <Users className="w-4 h-4 text-accent-blue" /> Accounts ({tenants.length})
        </h3>
        <button onClick={load} className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {loading ? (
        <p className="text-xs text-slate-600 italic font-mono">Loading…</p>
      ) : tenants.length === 0 ? (
        <p className="text-xs text-slate-600 italic font-mono">No accounts yet.</p>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-slate-600 border-b border-border-main/40">
                <th className="py-2 pr-4">Account</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Repos</th>
                <th className="py-2 pr-4 text-right">+Month</th>
                <th className="py-2 pr-4 text-right">Keys</th>
                <th className="py-2 pr-4">Updated</th>
                <th className="py-2">Set plan</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.tenant_id} className="border-b border-border-main/20 hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-4">
                    <div className="text-slate-200">{t.email ?? t.name ?? (t.isOrg ? 'Team workspace' : '—')}</div>
                    <div className="text-[10px] text-slate-600 truncate max-w-[180px]" title={t.tenant_id}>{t.tenant_id}</div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"
                      style={{ color: PLAN_COLORS[t.plan] ?? '#8c909f', background: `${PLAN_COLORS[t.plan] ?? '#8c909f'}18`, border: `1px solid ${PLAN_COLORS[t.plan] ?? '#8c909f'}35` }}>
                      {t.plan}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={t.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}>{t.status}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-slate-300">
                    {t.user_repos}<span className="text-slate-600"> +{t.library_copies} lib</span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-slate-300">{t.added_this_month}</td>
                  <td className="py-2.5 pr-4 text-right text-slate-300">{t.api_keys}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{(t.updated_at || '').slice(0, 10)}</td>
                  <td className="py-2.5">
                    <select
                      value={t.plan}
                      disabled={busy !== null}
                      onChange={e => changePlan(t.tenant_id, e.target.value)}
                      className="bg-bg-dark border border-border-main rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none disabled:opacity-50"
                    >
                      <option value="free">free</option>
                      <option value="solo">solo</option>
                      <option value="studio">studio</option>
                    </select>
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

// Admin home: overview stats, account management, and the preloaded-library
// curation screen, in one tabbed view. Every API it calls is admin-gated
// server-side; this component only renders when /api/admin/status says so.
export const AdminDashboard: React.FC = () => {
  const [section, setSection] = useState<'overview' | 'users' | 'library' | 'costs'>('overview');

  const sections = [
    { id: 'overview' as const, icon: LayoutDashboard, label: 'Overview' },
    { id: 'users' as const,    icon: Users,           label: 'Accounts' },
    { id: 'costs' as const,    icon: DollarSign,      label: 'AI Costs' },
    { id: 'library' as const,  icon: Flame,           label: 'Preloaded Library' },
  ];

  if (section === 'library') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <SectionTabs sections={sections} active={section} onChange={setSection} />
        <AdminLibrary />
      </div>
    );
  }

  if (section === 'costs') {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <SectionTabs sections={sections} active={section} onChange={setSection} />
        <div className="glass-header p-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 font-mono uppercase tracking-widest">
            <Crown className="w-4 h-4 text-purple-400" /> Admin
          </div>
          <h2 className="text-3xl font-bold text-white font-mono tracking-tight">AI Cost Monitoring</h2>
        </div>
        <div className="p-6 max-w-6xl mx-auto w-full">
          <AdminCosts />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <SectionTabs sections={sections} active={section} onChange={setSection} />
      <div className="glass-header p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 font-mono uppercase tracking-widest">
          <Crown className="w-4 h-4 text-purple-400" /> Admin
        </div>
        <h2 className="text-3xl font-bold text-white font-mono tracking-tight">
          {section === 'overview' ? 'Platform Overview' : 'Account Management'}
        </h2>
      </div>
      <div className="p-6 max-w-6xl mx-auto w-full">
        {section === 'overview' ? <Overview /> : <TenantsTable />}
      </div>
    </div>
  );
};

function SectionTabs({ sections, active, onChange }: {
  sections: { id: 'overview' | 'users' | 'costs' | 'library'; icon: React.ComponentType<{ className?: string }>; label: string }[];
  active: string;
  onChange: (s: 'overview' | 'users' | 'costs' | 'library') => void;
}) {
  return (
    <div className="flex-none flex items-center gap-1 px-6 pt-4">
      {sections.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
            active === id
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40'
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
