import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Zap } from 'lucide-react';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

/* ── Stitch palette ── */
const PRIMARY        = '#adc6ff';
const PRIMARY_CTR    = '#4d8eff';
const ON_PRIMARY_CTR = '#00285d';
const TERTIARY       = '#4edea3';
const GLASS_BG       = 'rgba(15,23,42,0.82)';
const GLASS_BORDER   = 'rgba(255,255,255,0.06)';
const SURFACE_HIGH   = '#222a3d';

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
    tier: 'FREE',
    name: 'Explorer',
    monthlyPrice: 0,
    annualPrice: 0,
    cta: 'Start Free',
    ctaStyle: 'ghost' as const,
    desc: 'For devs who want to try RepoScout before committing.',
    note: null,
    features: [
      { label: '25 repos in your library',                     included: true },
      { label: 'AI analysis on all your repos',                included: true },
      { label: 'Plain-English semantic search',                included: true },
      { label: 'Public repos only',                            included: true },
      { label: 'Pre-loaded App Killers library (370+ repos)',  included: false },
      { label: 'Staleness monitoring & alerts',                included: false },
      { label: 'API key for IDE integration',                  included: false },
      { label: 'Project workspaces',                           included: false },
    ],
  },
  {
    tier: 'SOLO',
    name: 'Solo',
    monthlyPrice: 19,
    annualPrice: 15,
    cta: 'Go Solo',
    ctaStyle: 'primary' as const,
    featured: true,
    desc: 'For individual devs and designers with serious repo habits.',
    note: 'Includes ~$1–2/month in AI costs per 1,000 repos analysed.',
    features: [
      { label: '1,000 repos in your library',                  included: true },
      { label: 'AI analysis + weekly re-analysis',             included: true },
      { label: 'Plain-English semantic search',                included: true },
      { label: 'Public + private repos',                       included: true },
      { label: 'Pre-loaded App Killers library (370+ repos)',  included: true },
      { label: 'Staleness monitoring & alerts',                included: true },
      { label: '1 API key for IDE integration',                included: true },
      { label: 'Project workspaces',                           included: true },
    ],
  },
  {
    tier: 'STUDIO',
    name: 'Studio',
    monthlyPrice: 49,
    annualPrice: 39,
    cta: 'Go Studio',
    ctaStyle: 'ghost' as const,
    desc: 'For dev teams sharing a curated repo intelligence layer.',
    note: 'Up to 25 seats. Shared library pool, each member can add repos.',
    features: [
      { label: '10,000 repos shared library',                  included: true },
      { label: 'AI analysis + daily re-analysis',              included: true },
      { label: 'Plain-English semantic search',                included: true },
      { label: 'Public + private repos',                       included: true },
      { label: 'Pre-loaded App Killers library (370+ repos)',  included: true },
      { label: 'Staleness monitoring & alerts',                included: true },
      { label: '25 API keys (one per seat)',                   included: true },
      { label: 'Project workspaces + team collaboration',      included: true },
    ],
  },
];

/* ── Small FAQ for trust ── */
const FAQS = [
  {
    q: 'Is there really no credit card for the free plan?',
    a: 'Correct — Explorer is free indefinitely. 25 repos, full AI analysis, no time limit.',
  },
  {
    q: 'What counts as a "repo" in my library?',
    a: 'Any GitHub repository you add via URL. Pre-loaded App Killers repos don\'t count against your limit.',
  },
  {
    q: 'What does "weekly re-analysis" mean?',
    a: 'RepoScout checks your repos every week for staleness signals: archive status, last commit date, star velocity, license changes, open CVEs.',
  },
  {
    q: 'Which IDEs does the API support?',
    a: 'Any tool that supports custom HTTP calls — Replit, Bolt, Lovable, Base44, Claude Code, Cursor. Full API docs ship with your key.',
  },
  {
    q: 'Can I upgrade or downgrade at any time?',
    a: 'Yes. Upgrade immediately, downgrade at end of billing period. No contracts, cancel anytime.',
  },
];

export function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
                style={{ color: PRIMARY, border: `1px solid rgba(173,198,255,0.20)`, background: 'rgba(173,198,255,0.05)' }}
              >
                Simple, honest pricing
              </span>
            </div>
            <h1
              className="font-mono font-black tracking-tight leading-tight mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              Your repo library.
              <br />
              <span style={{ color: PRIMARY }}>Your price point.</span>
            </h1>
            <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
              Free forever for individuals getting started. Solo for serious devs. Studio for teams who need a shared intelligence layer.
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
                  className={`relative flex flex-col rounded-xl p-10 transition-all duration-300 ${
                    isFeatured ? 'scale-105 z-10' : 'hover:bg-white/[0.02]'
                  }`}
                  style={{
                    background: GLASS_BG,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: isFeatured
                      ? `2px solid rgba(173,198,255,0.30)`
                      : `1px solid rgba(255,255,255,0.05)`,
                    boxShadow: isFeatured ? '0 0 24px rgba(77,142,255,0.25)' : 'none',
                  }}
                >
                  {isFeatured && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full whitespace-nowrap"
                      style={{ background: PRIMARY_CTR }}
                    >
                      <span className="font-mono text-[10px] font-black tracking-widest uppercase" style={{ color: ON_PRIMARY_CTR }}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Tier label + name */}
                  <div className="mb-8">
                    <h3
                      className="font-mono text-xs tracking-widest uppercase mb-2"
                      style={{ color: isFeatured ? PRIMARY : '#8c909f' }}
                    >
                      {plan.tier}
                    </h3>
                    <h4 className="font-mono text-3xl font-bold tracking-tight text-white">{plan.name}</h4>
                    <p className="text-xs leading-relaxed mt-2" style={{ color: '#8c909f' }}>{plan.desc}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <span className="font-mono font-black tracking-tighter text-white" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                      {price === 0 ? 'Free' : `$${price}`}
                    </span>
                    {price > 0 && (
                      <span className="font-mono text-xs uppercase tracking-widest ml-2" style={{ color: '#8c909f' }}>
                        / month {billing === 'annual' ? '· billed annually' : ''}
                      </span>
                    )}
                    {plan.note && (
                      <p className="text-[10px] font-mono mt-2 leading-relaxed" style={{ color: '#424754' }}>
                        {plan.note}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-start gap-3 text-sm">
                        {f.included ? (
                          <Check className="w-[18px] h-[18px] flex-none mt-0.5" style={{ color: TERTIARY }} />
                        ) : (
                          <X className="w-[18px] h-[18px] flex-none mt-0.5 text-slate-700" />
                        )}
                        <span style={{ color: f.included ? (isFeatured ? '#dae2fd' : '#c2c6d6') : '#475569' }}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to="/sign-up"
                    className="w-full text-center py-4 rounded-xl font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
                    style={plan.ctaStyle === 'primary'
                      ? { background: PRIMARY_CTR, color: ON_PRIMARY_CTR, boxShadow: '0 0 15px rgba(77,142,255,0.40)' }
                      : { background: SURFACE_HIGH, color: PRIMARY }
                    }
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* ── Value callout ── */}
          <div
            className="mt-12 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ background: 'rgba(77,142,255,0.05)', border: '1px solid rgba(77,142,255,0.15)' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-none" style={{ background: 'rgba(77,142,255,0.10)' }}>
              <Zap className="w-5 h-5" style={{ color: PRIMARY_CTR }} />
            </div>
            <div>
              <p className="text-sm font-mono font-bold" style={{ color: PRIMARY }}>No analysis limits, no hidden throttles</p>
              <p className="text-xs leading-relaxed mt-1" style={{ color: '#c2c6d6' }}>
                Every repo you add gets full AI analysis, weekly staleness monitoring, and vector search indexing — included in your plan, no add-ons required. What you see is what you get.
              </p>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="mt-24">
            <h2 className="font-mono font-black text-white text-3xl text-center mb-12 tracking-tight">
              Common questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden transition-all"
                  style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
                >
                  <button
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-mono font-bold text-white text-sm">{faq.q}</span>
                    <span
                      className="text-xl flex-none transition-transform duration-200"
                      style={{
                        color: PRIMARY,
                        transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                      }}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#c2c6d6' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── System status ── */}
          <div
            className="mt-16 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-none"
                style={{ background: 'rgba(78,222,163,0.10)', border: `1px solid rgba(78,222,163,0.20)` }}>
                <Zap className="w-5 h-5" style={{ color: TERTIARY }} />
              </div>
              <div>
                <div className="text-sm font-mono font-bold text-white">Infrastructure Operational</div>
                <div className="text-xs text-slate-500 mt-0.5">All nodes nominal. 374 repos indexed. API latency avg 40ms.</div>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider whitespace-nowrap"
              style={{ background: 'rgba(78,222,163,0.10)', border: '1px solid rgba(78,222,163,0.20)', color: TERTIARY }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: TERTIARY }} />
              All Systems Live
            </div>
          </div>

        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
