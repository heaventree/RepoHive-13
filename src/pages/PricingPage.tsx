import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Zap } from 'lucide-react';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

const BORDER = 'rgba(255,255,255,0.06)';
const SURFACE_LOW = 'rgba(19,27,46,1)';
const SURFACE = 'rgba(23,31,51,1)';

function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(80px)' }} />
    </div>
  );
}

const PLANS = [
  {
    tier: 'TIER_01',
    name: 'Hobbyist',
    monthlyPrice: 0,
    annualPrice: 0,
    cta: 'Initialize node',
    ctaStyle: 'ghost',
    desc: 'For individuals exploring OSS intelligence.',
    features: [
      { label: '50 repos ingested', included: true },
      { label: 'Basic AI analysis', included: true },
      { label: 'App Killers view', included: true },
      { label: 'Public repos only', included: true },
      { label: 'Vector semantic search', included: false },
      { label: 'Project workspaces', included: false },
      { label: 'API access', included: false },
      { label: 'Private repos', included: false },
    ],
  },
  {
    tier: 'TIER_02',
    name: 'Professional',
    monthlyPrice: 49,
    annualPrice: 39,
    cta: 'Elevate access',
    ctaStyle: 'primary',
    featured: true,
    desc: 'For engineering teams running serious build vs buy analysis.',
    features: [
      { label: 'Unlimited bulk ingest', included: true },
      { label: 'DeepSeek AI analysis', included: true },
      { label: 'App Killers engine', included: true },
      { label: 'Public + private repos', included: true },
      { label: 'Gemini vector search', included: true },
      { label: 'Project workspaces', included: true },
      { label: 'API access', included: true },
      { label: 'Priority support', included: false },
    ],
  },
  {
    tier: 'TIER_03',
    name: 'Sentinel',
    monthlyPrice: null,
    annualPrice: null,
    cta: 'Talk to us',
    ctaStyle: 'ghost',
    desc: 'For enterprises with custom data and compliance requirements.',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Custom vector indexing', included: true },
      { label: 'Dedicated infrastructure', included: true },
      { label: 'Public + private repos', included: true },
      { label: 'Gemini vector search', included: true },
      { label: 'Project workspaces', included: true },
      { label: 'SSO + SCIM provisioning', included: true },
      { label: 'Priority support + SLA', included: true },
    ],
  },
];

export function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen relative" style={{ background: '#0b1326', color: '#c2c6d6' }}>
      <Orbs />
      <MarketingNav />

      <div className="relative z-10 pt-40 pb-24 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 font-mono text-[10px] uppercase tracking-widest text-slate-500"
              style={{ background: 'rgba(255,255,255,0.03)', border: BORDER }}
            >
              Global Infrastructure Pricing
            </div>
            <h1 className="font-mono font-black text-white text-5xl md:text-6xl leading-tight tracking-tight mb-4">
              The Cost of{' '}
              <span style={{ color: 'rgba(173,198,255,0.7)' }}>Intelligence</span>
            </h1>
            <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
              From lone operators to global engineering orgs. Tier up as your data intensity scales.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-12">
            <div
              className="flex items-center p-1 rounded-full gap-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: BORDER }}
            >
              {(['monthly', 'annual'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-5 py-2 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${
                    billing === b ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                  }`}
                  style={billing === b
                    ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.35)' }
                    : {}}
                >
                  {b === 'annual' ? 'Annual  −20%' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>

          {/* Tier cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan) => {
              const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;

              return (
                <div
                  key={plan.tier}
                  className={`relative rounded-2xl p-7 flex flex-col gap-6 ${plan.featured ? 'md:-mt-4 md:mb-4' : ''}`}
                  style={{
                    background: plan.featured ? SURFACE : SURFACE_LOW,
                    border: plan.featured
                      ? '1px solid rgba(59,130,246,0.35)'
                      : BORDER,
                    boxShadow: plan.featured
                      ? '0 0 50px rgba(59,130,246,0.1), 0 20px 40px rgba(0,0,0,0.4)'
                      : 'none',
                  }}
                >
                  {plan.featured && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-widest text-white whitespace-nowrap"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                    >
                      Recommended
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] font-mono text-slate-700 mb-1">{plan.tier}</div>
                    <div className="text-xl font-mono font-bold text-white mb-1">{plan.name}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{plan.desc}</p>
                  </div>

                  <div>
                    {price === null ? (
                      <div>
                        <span className="text-4xl font-mono font-black text-white">Custom</span>
                        <span className="text-sm text-slate-600 ml-1 font-mono">/ managed</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-mono font-black text-white">${price}</span>
                        <span className="text-sm text-slate-600 ml-1 font-mono">/ month</span>
                        {billing === 'annual' && price > 0 && (
                          <div className="text-[10px] font-mono text-emerald-500 mt-0.5">
                            Billed annually (${price * 12}/yr)
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.label} className={`flex items-center gap-2.5 text-sm ${f.included ? 'text-slate-400' : 'text-slate-700'}`}>
                        {f.included
                          ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-none" />
                          : <X className="w-3.5 h-3.5 text-slate-800 flex-none" />
                        }
                        {f.label}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={price === null ? '#' : '/sign-up'}
                    className={`w-full text-center py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-95 ${
                      plan.ctaStyle === 'primary'
                        ? 'text-white hover:opacity-90'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    style={plan.ctaStyle === 'primary'
                      ? { background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }
                      : { border: BORDER }
                    }
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* System status bar */}
          <div
            className="mt-16 rounded-xl p-5 flex items-center justify-between"
            style={{ background: SURFACE_LOW, border: BORDER }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-mono font-bold text-white">Grid Operational Stability</div>
                <div className="text-xs text-slate-500">All nodes reporting nominal performance. Latency at 4ms global average.</div>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-emerald-400"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live_Pulse
            </div>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
