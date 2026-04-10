import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Zap } from 'lucide-react';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

/* ── Stitch-faithful palette ── */
const PRIMARY        = '#adc6ff'; // periwinkle — text highlights
const PRIMARY_CTR    = '#4d8eff'; // vivid blue — buttons / active
const ON_PRIMARY_CTR = '#00285d'; // dark navy — text on blue buttons
const TERTIARY       = '#4edea3'; // emerald — checkmarks
const GLASS_BG       = 'rgba(15,23,42,0.82)';
const GLASS_BORDER   = 'rgba(255,255,255,0.06)';
const SURFACE_LOW    = '#131b2e';
const SURFACE_CTR    = '#171f33';

function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full"
        style={{ background: 'rgba(79,70,229,0.12)', filter: 'blur(120px)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
        style={{ background: 'rgba(124,58,237,0.10)', filter: 'blur(150px)' }} />
    </div>
  );
}

const PLANS = [
  {
    tier: 'TIER_01',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    cta: 'Initialize Node',
    ctaStyle: 'ghost' as const,
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
    name: 'Pro',
    monthlyPrice: 49,
    annualPrice: 39,
    cta: 'Elevate Access',
    ctaStyle: 'primary' as const,
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
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    cta: 'Talk to Us',
    ctaStyle: 'ghost' as const,
    desc: 'For enterprises with custom data and compliance requirements.',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Custom vector indexing', included: true },
      { label: 'Dedicated infrastructure', included: true },
      { label: 'Gemini vector search', included: true },
      { label: 'Project workspaces', included: true },
      { label: 'SSO + SCIM provisioning', included: true },
      { label: 'API white-labeling', included: true },
      { label: 'Priority support + SLA', included: true },
    ],
  },
];

export function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen relative" style={{ background: '#0b1326', color: '#dae2fd' }}>
      <Orbs />
      <MarketingNav />

      <div className="relative z-10 pt-40 pb-24 px-6">
        <div className="max-w-6xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span
                className="font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full"
                style={{ color: PRIMARY, border: `1px solid rgba(173,198,255,0.2)`, background: 'rgba(173,198,255,0.05)' }}
              >
                Global Infrastructure Pricing
              </span>
            </div>
            <h1
              className="font-mono font-black tracking-tight leading-tight mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              The Cost of{' '}
              <span style={{ color: PRIMARY }}>Intelligence</span>
            </h1>
            <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
              From lone operators to global engineering orgs. Tier up as your data intensity scales.
            </p>

            {/* Billing toggle */}
            <div className="flex justify-center mt-8">
              <div
                className="flex items-center p-1.5 rounded-full gap-1"
                style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
              >
                {(['monthly', 'annual'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className="px-6 py-2 rounded-full font-mono text-xs font-bold tracking-widest uppercase transition-all"
                    style={billing === b
                      ? { background: PRIMARY_CTR, color: ON_PRIMARY_CTR }
                      : { color: '#8c909f' }
                    }
                  >
                    {b === 'annual' ? 'Annual (−20%)' : 'Monthly'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Pricing cards ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {PLANS.map((plan) => {
              const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
              const isFeatured = !!plan.featured;

              return (
                <div
                  key={plan.tier}
                  className={`relative flex flex-col transition-all duration-300 rounded-xl p-10 ${
                    isFeatured ? 'scale-105 z-10' : 'hover:bg-white/[0.02]'
                  }`}
                  style={{
                    background: GLASS_BG,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isFeatured
                      ? `2px solid rgba(173,198,255,0.30)`
                      : `1px solid rgba(255,255,255,0.05)`,
                    boxShadow: isFeatured
                      ? '0 0 24px rgba(77,142,255,0.25)'
                      : 'none',
                  }}
                >
                  {isFeatured && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full whitespace-nowrap"
                      style={{ background: PRIMARY_CTR }}
                    >
                      <span className="font-mono text-[10px] font-black tracking-widest uppercase" style={{ color: ON_PRIMARY_CTR }}>
                        Recommended
                      </span>
                    </div>
                  )}

                  {/* Tier label */}
                  <div className="mb-8">
                    <h3
                      className="font-mono text-xs tracking-widest uppercase mb-2"
                      style={{ color: isFeatured ? PRIMARY : '#8c909f' }}
                    >
                      {plan.tier}
                    </h3>
                    <h4 className="font-mono text-3xl font-bold tracking-tight text-white">{plan.name}</h4>
                  </div>

                  {/* Price */}
                  <div className="mb-10">
                    {price === null ? (
                      <>
                        <span className="font-mono text-4xl font-black tracking-tighter text-white">Custom</span>
                        <span className="font-mono text-xs uppercase tracking-widest text-slate-500 ml-2">/ managed</span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-5xl font-black tracking-tighter text-white">${price}</span>
                        <span className="font-mono text-xs uppercase tracking-widest text-slate-500 ml-2">/ month</span>
                        {billing === 'annual' && price > 0 && (
                          <div className="text-[10px] font-mono mt-1" style={{ color: TERTIARY }}>
                            Billed annually — ${price * 12}/yr
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-12 flex-grow">
                    {plan.features.map((f) => (
                      <li key={f.label} className={`flex items-center gap-3 text-sm ${f.included ? (isFeatured ? 'text-white' : '#c2c6d6') : 'text-slate-600'}`}>
                        {f.included ? (
                          <Check className="w-[18px] h-[18px] flex-none" style={{ color: TERTIARY }} />
                        ) : (
                          <X className="w-[18px] h-[18px] flex-none text-slate-700" />
                        )}
                        <span style={{ color: f.included ? (isFeatured ? '#dae2fd' : '#c2c6d6') : '#475569' }}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to={price === null ? '#' : '/sign-up'}
                    className="w-full text-center py-4 rounded-xl font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
                    style={plan.ctaStyle === 'primary'
                      ? { background: PRIMARY_CTR, color: ON_PRIMARY_CTR, boxShadow: '0 0 15px rgba(77,142,255,0.4)' }
                      : { background: '#2d3449', color: PRIMARY }
                    }
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* ── System status bar ── */}
          <div
            className="mt-16 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-none"
                style={{ background: `rgba(78,222,163,0.1)`, border: `1px solid rgba(78,222,163,0.2)` }}
              >
                <Zap className="w-5 h-5" style={{ color: TERTIARY }} />
              </div>
              <div>
                <div className="text-sm font-mono font-bold text-white">Grid Operational Stability</div>
                <div className="text-xs text-slate-500 mt-0.5">All nodes reporting nominal performance. Latency at 4ms global average.</div>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider whitespace-nowrap"
              style={{ background: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.2)', color: TERTIARY }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: TERTIARY }} />
              Live_Pulse
            </div>
          </div>

        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
