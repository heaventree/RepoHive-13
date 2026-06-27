import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader,
  Database,
  Flame,
  Plug,
  Layers
} from 'lucide-react';

interface SubscriptionInfo {
  plan: string;
  planName: string;
  limits: {
    repoCap: number;
    monthlyAdditions: number;
    apiKeys: number;
    preloadedLibrary: boolean;
  };
  usage: {
    repos: number;
    additionsThisMonth: number;
    apiKeys: number;
    period: string;
  };
  billing: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    hasPaymentMethod: boolean;
  };
}

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case 'past_due':
    case 'unpaid':
      return { text: 'Payment issue', color: 'text-amber-400' };
    default:
      return { text: 'Active', color: 'text-accent-green' };
  }
}

export const BillingSettings: React.FC = () => {
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/subscription')
      .then(res => res.json())
      .then(data => { if (data.plan) setSub(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openPortal = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Could not open the billing portal.');
      }
    } catch {
      setError('Network error — please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="w-6 h-6 text-accent-blue animate-spin" />
      </div>
    );
  }

  const status = sub ? statusLabel(sub.billing.status) : null;
  const periodEndLabel = sub?.billing.currentPeriodEnd
    ? new Date(sub.billing.currentPeriodEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="glass-header p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 font-mono uppercase tracking-widest">
          <CreditCard className="w-4 h-4" /> Billing
        </div>
        <h2 className="text-3xl font-bold text-white font-mono tracking-tight">Subscription & Plan</h2>
      </div>

      <div className="p-6 space-y-8 max-w-5xl mx-auto w-full">
        {error && (
          <div className="bg-accent-red/10 border border-accent-red/30 p-4 rounded-sm flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-accent-red mt-0.5 flex-none" />
            <p className="text-sm text-accent-red font-mono">{error}</p>
          </div>
        )}

        <div className="glass-card rounded-lg p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-3 font-mono">
                <CreditCard className="w-6 h-6 text-accent-blue" /> {sub?.planName ?? 'Explorer'} plan
              </h3>
              {status && (
                <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${status.color}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> {status.text}
                </div>
              )}
              {sub?.billing.cancelAtPeriodEnd && periodEndLabel && (
                <p className="text-xs text-amber-400 font-mono mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Cancels on {periodEndLabel} — you keep full access until then.
                </p>
              )}
              {!sub?.billing.cancelAtPeriodEnd && periodEndLabel && sub?.plan !== 'free' && (
                <p className="text-xs text-slate-500 font-mono mt-2">Renews on {periodEndLabel}.</p>
              )}
            </div>

            {sub?.billing.hasPaymentMethod ? (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="px-5 py-3 bg-slate-800 border border-slate-700 rounded text-white font-mono text-sm font-bold uppercase tracking-widest hover:bg-slate-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {portalLoading ? <Loader className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Manage billing
              </button>
            ) : (
              <a
                href="/pricing"
                className="px-5 py-3 rounded font-mono text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90"
                style={{ background: '#4d8eff', color: '#00285d' }}
              >
                Upgrade plan
              </a>
            )}
          </div>

          <p className="text-[10px] text-slate-500 font-mono mt-4 italic">
            Manage billing opens Stripe's secure customer portal — update your card, view invoices, or cancel.
            Cancelling keeps your plan active through the period you've already paid for.
          </p>
        </div>

        {sub && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-lg p-5 flex items-center gap-4">
              <Database className="w-6 h-6 text-accent-blue flex-none" />
              <div>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Repo library</p>
                <p className="text-sm font-bold text-white font-mono">
                  {sub.usage.repos} / {sub.limits.repoCap === Infinity ? '∞' : sub.limits.repoCap.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="glass-card rounded-lg p-5 flex items-center gap-4">
              <Plug className="w-6 h-6 text-accent-blue flex-none" />
              <div>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">API keys</p>
                <p className="text-sm font-bold text-white font-mono">{sub.usage.apiKeys} / {sub.limits.apiKeys}</p>
              </div>
            </div>
            <div className="glass-card rounded-lg p-5 flex items-center gap-4">
              <Flame className="w-6 h-6 text-amber-400 flex-none" />
              <div>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">App Killers</p>
                <p className="text-sm font-bold text-white font-mono">{sub.limits.preloadedLibrary ? 'Included' : 'Not on this plan'}</p>
              </div>
            </div>
          </div>
        )}

        {sub?.plan === 'free' && (
          <div className="bg-accent-blue/5 border border-accent-blue/20 p-6 rounded-sm flex gap-4 items-start backdrop-blur-sm">
            <Layers className="w-6 h-6 text-accent-blue mt-0.5 flex-none" />
            <div>
              <h4 className="text-base font-bold text-white mb-1">Want more repos, App Killers, and an API key?</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-mono">
                Upgrade to Solo or Studio for a bigger library, the 500+ preloaded App Killers,
                staleness monitoring, and IDE integrations. <a href="/pricing" className="text-accent-blue hover:underline">See plans →</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
