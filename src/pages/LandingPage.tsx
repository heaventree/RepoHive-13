import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { ArrowRight, Check, Brain, Flame, Terminal, ChevronRight } from 'lucide-react';

/* ── Stitch-faithful palette ── */
const PRIMARY        = '#adc6ff'; // periwinkle — text highlights
const PRIMARY_CTR    = '#4d8eff'; // vivid blue — buttons / active
const ON_PRIMARY_CTR = '#00285d';
const TERTIARY       = '#4edea3'; // vivid emerald — checkmarks
const GLASS_BG       = 'rgba(15,23,42,0.82)';
const GLASS_BORDER   = 'rgba(255,255,255,0.06)';
const SURFACE_LOW    = '#131b2e';
const SURFACE_CTR    = '#171f33';
const SURFACE_HIGH   = '#222a3d';

function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full"
        style={{ background: 'rgba(79,70,229,0.12)', filter: 'blur(120px)' }} />
      <div className="absolute top-1/2 -right-48 w-[800px] h-[800px] rounded-full"
        style={{ background: 'rgba(124,58,237,0.10)', filter: 'blur(150px)' }} />
      <div className="absolute -bottom-48 left-1/4 w-[700px] h-[700px] rounded-full"
        style={{ background: 'rgba(6,182,212,0.08)', filter: 'blur(120px)' }} />
    </div>
  );
}

/* ── Hero terminal mockup ── */
function HeroTerminal() {
  return (
    <div
      className="w-full max-w-5xl mx-auto mt-16 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(6,14,32,0.80)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: GLASS_BORDER,
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: GLASS_BORDER }}>
        <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f56' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        <span className="ml-4 text-[10px] font-mono uppercase tracking-widest" style={{ color: '#424754' }}>
          Sentinel_Interface_v2.1.0
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left: App Killers */}
        <div className="p-6 border-r" style={{ borderColor: GLASS_BORDER }}>
          <div className="flex items-center gap-2 mb-5">
            <Flame className="w-4 h-4" style={{ color: '#ffb4ab' }} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: '#ffb4ab' }}>
              App Killers
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { kills: 'Sentry replacement', name: 'GlitchTip', badge: 'VERIFIED', delay: '0.10s', highlight: true },
              { kills: 'Intercom replacement', name: 'Chatwoot', badge: 'STABLE', delay: '0.25s', highlight: false },
              { kills: 'Firebase replacement', name: 'Supabase', badge: 'STABLE', delay: '0.40s', highlight: false },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3.5 rounded-lg group cursor-default"
                style={{
                  background: item.highlight ? 'rgba(147,0,10,0.10)' : 'rgba(34,42,61,0.50)',
                  border: item.highlight ? '1px solid rgba(255,180,171,0.20)' : '1px solid rgba(66,71,84,0.10)',
                  animation: `card-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) ${item.delay} both`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-2px)';
                  el.style.boxShadow = item.highlight
                    ? '0 6px 20px rgba(147,0,10,0.20)'
                    : '0 6px 20px rgba(0,0,0,0.25)';
                  el.style.borderColor = item.highlight ? 'rgba(255,180,171,0.40)' : 'rgba(66,71,84,0.30)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                  el.style.borderColor = item.highlight ? 'rgba(255,180,171,0.20)' : 'rgba(66,71,84,0.10)';
                }}
              >
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider mb-0.5" style={{ color: '#8c909f' }}>
                    {item.kills}
                  </div>
                  <div className="text-sm font-mono font-bold" style={{ color: '#dae2fd' }}>{item.name}</div>
                </div>
                <span
                  className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(78,222,163,0.10)',
                    color: TERTIARY,
                    border: `1px solid rgba(78,222,163,0.20)`,
                    animation: item.badge === 'VERIFIED'
                      ? 'badge-glow-pulse 2.2s ease-in-out 0.8s infinite'
                      : undefined,
                  }}
                >
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI analysis */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Brain className="w-4 h-4" style={{ color: PRIMARY_CTR }} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: PRIMARY_CTR }}>
              Intelligence Node
            </span>
            <span
              className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded"
              style={{ background: 'rgba(78,222,163,0.10)', color: TERTIARY, border: `1px solid rgba(78,222,163,0.20)` }}
            >
              LIVE_SYNC
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs mb-5">
            <div style={{ color: '#424754' }}>&gt; QUERY: "Enterprise-ready auth system"</div>
            <div
              className="p-3 rounded-lg border-l-2"
              style={{ background: `rgba(77,142,255,0.08)`, borderLeftColor: PRIMARY_CTR }}
            >
              <span style={{ color: '#8c909f' }}>MATCH: </span>
              <span className="font-bold" style={{ color: PRIMARY_CTR }}>SuperTokens</span>
              <span style={{ color: '#424754' }}> (Score: 0.97)</span>
              <div className="mt-1 text-[10px]" style={{ color: '#424754' }}>High commit velocity, SOC2 patterns, MIT license</div>
            </div>
            <div
              className="p-3 rounded-lg border-l-2"
              style={{ background: 'rgba(255,255,255,0.02)', borderLeftColor: 'rgba(66,71,84,0.3)' }}
            >
              <span style={{ color: '#8c909f' }}>MATCH: </span>
              <span style={{ color: '#c2c6d6' }}>Auth.js</span>
              <span style={{ color: '#424754' }}> (Score: 0.88)</span>
            </div>
          </div>

          <div className="pt-4 border-t" style={{ borderColor: GLASS_BORDER }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase" style={{ color: '#424754' }}>Vector Index</span>
              <span className="text-[10px] font-mono" style={{ color: '#8c909f' }}>374 / 374</span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: SURFACE_HIGH }}>
              <div className="h-full rounded-full w-full" style={{ background: PRIMARY_CTR, boxShadow: `0 0 8px rgba(77,142,255,0.6)` }} />
            </div>
            <div className="mt-3 font-mono text-[10px] leading-relaxed" style={{ color: 'rgba(77,142,255,0.60)' }}>
              &gt; Analysing repository metadata...<br />
              &gt; 374 active nodes indexed<br />
              &gt; sustainability score: 9.4/10
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feature: Bulk Ingest visual ── */
function FeatureIngestVisual() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
    >
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: GLASS_BORDER, background: SURFACE_HIGH }}>
        <Terminal className="w-3.5 h-3.5" style={{ color: '#8c909f' }} />
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#8c909f' }}>bulk_ingest.log</span>
      </div>
      <div className="p-5 font-mono text-xs space-y-1.5">
        {[
          { line: '> Queuing microsoft/vscode', color: '#8c909f' },
          { line: '> Queuing vercel/next.js', color: '#8c909f' },
          { line: '> Queuing supabase/supabase', color: '#8c909f' },
          { line: '✓ microsoft/vscode — saved (42.1k ★)', color: TERTIARY },
          { line: '✓ vercel/next.js — saved (121k ★)', color: TERTIARY },
          { line: '↻ Embedding vectors… 3/3 complete', color: PRIMARY_CTR },
          { line: '✓ AI analysis complete — 3 repos indexed', color: TERTIARY },
        ].map((item, i) => (
          <div key={i} style={{ color: item.color }}>{item.line}</div>
        ))}
        <div className="pt-3 mt-1 border-t flex items-center justify-between" style={{ borderColor: GLASS_BORDER }}>
          <span style={{ color: '#424754' }}>No API token required for public repos.</span>
          <span
            className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ background: 'rgba(78,222,163,0.10)', color: TERTIARY, border: `1px solid rgba(78,222,163,0.20)` }}
          >
            Free Tier
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Feature: Vector Search visual ── */
function FeatureVectorVisual() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
    >
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: GLASS_BORDER, background: SURFACE_HIGH }}>
        <Brain className="w-3.5 h-3.5" style={{ color: '#8c909f' }} />
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#8c909f' }}>vector_search</span>
      </div>
      <div className="p-5 space-y-3">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-mono text-xs"
          style={{ background: `rgba(77,142,255,0.08)`, border: `1px solid rgba(77,142,255,0.15)` }}
        >
          <span style={{ color: '#424754' }}>&gt;</span>
          <span style={{ color: PRIMARY }}>"lightweight CRM for B2B SaaS teams"</span>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Twenty', score: '96', tag: 'STRONGEST' },
            { name: 'Monica', score: '84', tag: 'STRONG' },
            { name: 'Erxes', score: '71', tag: 'MODERATE' },
          ].map((r) => (
            <div key={r.name} className="flex items-center gap-3 font-mono text-xs">
              <div
                className="flex-none w-10 text-center text-[10px] font-bold rounded py-0.5"
                style={{ background: `rgba(77,142,255,0.12)`, color: PRIMARY_CTR }}
              >
                {r.score}
              </div>
              <div className="flex-1" style={{ color: '#c2c6d6' }}>{r.name}</div>
              <div
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
                style={{ background: `rgba(77,142,255,0.10)`, color: PRIMARY, border: `1px solid rgba(173,198,255,0.20)` }}
              >
                {r.tag}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[10px] font-mono pt-3 border-t" style={{ borderColor: GLASS_BORDER, color: '#424754' }}>
          Powered by DeepSeek + Gemini · 3072-dim embeddings
        </div>
      </div>
    </div>
  );
}

const APP_KILLERS = [
  { kills: 'Google Analytics Killer', name: 'Plausible',  desc: 'Privacy-first analytics. GDPR compliant, no cookies, better dashboards.', savings: '$19–49/mo' },
  { kills: 'Firebase Killer',         name: 'Supabase',   desc: 'Open source Postgres with auth, storage, and realtime. No vendor lock-in.', savings: '$200+/mo' },
  { kills: 'Slack Killer',            name: 'Mattermost', desc: 'Self-hosted team collaboration. Enterprise-grade security, full data ownership.', savings: '$15/user' },
];

export function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen relative" style={{ background: '#0b1326', color: '#dae2fd' }}>
      <Orbs />
      <MarketingNav />

      {/* ── HERO ── */}
      <section className="relative z-10 pt-40 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 font-mono text-[10px] uppercase tracking-widest"
            style={{ background: SURFACE_HIGH, border: `1px solid rgba(66,71,84,0.20)`, color: '#c2c6d6' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: TERTIARY }} />
            System Status: Active · 374 repos indexed
          </div>

          <h1 className="font-mono font-black text-white leading-[0.95] tracking-tighter mb-8"
            style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
            Your OSS intelligence layer.<br />
            <span style={{ color: 'rgba(194,198,214,0.50)' }}>Know what to build, what to buy, what to kill.</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/sign-up"
              className="flex items-center gap-2 px-8 py-4 rounded-full font-mono font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: PRIMARY_CTR, color: ON_PRIMARY_CTR, boxShadow: '0 0 20px rgba(77,142,255,0.30)' }}
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/app"
              className="flex items-center gap-2 px-8 py-4 rounded-full font-mono font-bold text-sm transition-all hover:bg-white/5"
              style={{ border: `1px solid rgba(66,71,84,0.30)`, color: PRIMARY }}
            >
              See it live <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <HeroTerminal />
      </section>

      {/* ── FEATURE: BULK INGEST ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1"><FeatureIngestVisual /></div>
          <div className="order-1 md:order-2 space-y-5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>Data Acquisition</div>
            <h2 className="font-mono font-black text-white text-4xl md:text-5xl leading-tight tracking-tight">
              Bulk Ingest.<br />
              <span style={{ color: 'rgba(173,198,255,0.55)' }}>From URL to Archive.</span>
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#c2c6d6' }}>
              Point the engine at any GitHub URL — single repo, org, or a list of hundreds. Metadata, stars, commit velocity, license, and readme pulled automatically. No API tokens required for public repos.
            </p>
            <div className="space-y-3.5 pt-2">
              {[
                'Paste URLs one at a time or in bulk',
                'Live progress monitor with per-repo status badges',
                'Auto-embed new repos into vector index on save',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm" style={{ color: '#dae2fd' }}>
                  <Check className="w-[18px] h-[18px] flex-none" style={{ color: TERTIARY }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE: AI ANALYSIS ── */}
      <section className="relative z-10 py-24 px-6" style={{ background: 'rgba(19,27,46,0.50)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: TERTIARY }}>Intelligence Layer</div>
            <h2 className="font-mono font-black text-white text-4xl md:text-5xl leading-tight tracking-tight">
              AI Analysis.<br />
              <span style={{ color: 'rgba(78,222,163,0.55)' }}>Hybrid Vector Search.</span>
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#c2c6d6' }}>
              DeepSeek extracts architecture, tech stack, and maintenance signals from each repo. Gemini builds 3072-dimension semantic embeddings so you can query your entire library with plain English — not keywords.
            </p>
            <div className="space-y-3 pt-2">
              {[
                '"Find a React CRM with MIT license under 5k stars"',
                '"Enterprise-grade auth with SOC2 patterns"',
                '"Lightweight Postgres alternative for edge deployments"',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check className="w-[18px] h-[18px] flex-none" style={{ color: TERTIARY }} />
                  <span className="text-sm font-mono" style={{ color: '#c2c6d6' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div><FeatureVectorVisual /></div>
        </div>
      </section>

      {/* ── APP KILLERS ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: '#ffb4ab' }}>
              Strategic Disruption
            </div>
            <h2 className="font-mono font-black text-white text-4xl md:text-6xl leading-tight tracking-tighter">
              The App Killers.
            </h2>
            <p className="text-base mt-4 max-w-xl mx-auto leading-relaxed" style={{ color: '#c2c6d6' }}>
              Stop overpaying for SaaS. We identify the precise open-source alternatives that match — or exceed — the capabilities of your current vendor stack.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {APP_KILLERS.map((item) => (
              <div
                key={item.name}
                className="group p-8 rounded-xl flex flex-col transition-all duration-300"
                style={{
                  background: GLASS_BG,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,180,171,0.30)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)'; }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ background: 'rgba(147,0,10,0.10)' }}>
                  <Flame className="w-5 h-5" style={{ color: '#ffb4ab' }} />
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: '#ffb4ab' }}>
                  {item.kills}
                </div>
                <div className="text-2xl font-mono font-bold text-white mb-4">{item.name}</div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: '#c2c6d6' }}>{item.desc}</p>
                <div className="pt-6 border-t mt-6 flex items-center justify-between" style={{ borderColor: GLASS_BORDER }}>
                  <span className="text-[10px] font-mono" style={{ color: '#8c909f' }}>SAVINGS: {item.savings}</span>
                  <ArrowRight className="w-4 h-4 transition-colors" style={{ color: '#424754' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section className="relative z-10 py-24 px-6" style={{ background: 'rgba(19,27,46,0.50)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-14">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: PRIMARY }}>
                Scaling Intelligence
              </div>
              <h2 className="font-mono font-black text-white text-4xl leading-tight tracking-tight">
                Choose your node power.
              </h2>
            </div>
            <div
              className="flex items-center p-1.5 rounded-full"
              style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
            >
              {(['monthly', 'annual'] as const).map((b) => (
                <button key={b} onClick={() => setBilling(b)}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                tier: 'TIER_01', name: 'Hobbyist', price: 0, featured: false,
                cta: 'Get Started', ctaStyle: 'ghost',
                features: ['50 repos ingested', 'Basic AI analysis', 'Public repos only', 'App Killers view'],
              },
              {
                tier: 'TIER_02', name: 'Professional', price: billing === 'monthly' ? 49 : 39, featured: true,
                cta: 'Go Pro', ctaStyle: 'primary',
                features: ['Unlimited bulk ingest', 'DeepSeek AI analysis', 'Gemini vector search', 'App Killer engine', 'Project workspaces', 'API access'],
              },
              {
                tier: 'TIER_03', name: 'Sentinel', price: null, featured: false,
                cta: 'Contact Sales', ctaStyle: 'ghost',
                features: ['Everything in Pro', 'Custom vector indexing', 'Dedicated infra', 'SSO + SCIM', 'SLA + priority support'],
              },
            ].map((plan) => (
              <div
                key={plan.tier}
                className={`relative rounded-xl p-8 flex flex-col ${plan.featured ? 'scale-105 z-10' : ''}`}
                style={{
                  background: GLASS_BG,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: plan.featured ? `2px solid rgba(173,198,255,0.30)` : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: plan.featured ? '0 0 24px rgba(77,142,255,0.25)' : 'none',
                }}
              >
                {plan.featured && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-widest whitespace-nowrap"
                    style={{ background: PRIMARY_CTR, color: ON_PRIMARY_CTR }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: plan.featured ? PRIMARY : '#8c909f' }}>
                    {plan.tier}
                  </div>
                  <div className="font-mono text-2xl font-bold text-white">{plan.name}</div>
                </div>
                <div className="mb-8">
                  <span className="font-mono text-4xl font-black text-white">
                    {plan.price === null ? 'Custom' : `$${plan.price}`}
                  </span>
                  {plan.price !== null && (
                    <span className="font-mono text-xs uppercase tracking-widest ml-1" style={{ color: '#8c909f' }}>/mo</span>
                  )}
                </div>
                <ul className="space-y-3.5 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm" style={{ color: plan.featured ? '#dae2fd' : '#c2c6d6' }}>
                      <Check className="w-[18px] h-[18px] flex-none" style={{ color: TERTIARY }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.price === null ? '#' : '/sign-up'}
                  className="w-full text-center py-3 rounded-xl font-mono text-sm font-bold uppercase tracking-widest transition-all"
                  style={plan.ctaStyle === 'primary'
                    ? { background: PRIMARY_CTR, color: ON_PRIMARY_CTR, boxShadow: '0 0 15px rgba(77,142,255,0.40)' }
                    : { background: SURFACE_HIGH, color: PRIMARY }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/pricing"
              className="text-xs font-mono hover:underline underline-offset-4 transition-colors"
              style={{ color: '#8c909f' }}>
              See full pricing breakdown →
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
