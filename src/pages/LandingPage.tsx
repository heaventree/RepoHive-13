import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import {
  ArrowRight, Check, Zap, GitBranch, Brain, Flame,
  Terminal, Shield, Activity, ChevronRight
} from 'lucide-react';

const SURFACE = 'rgba(23,31,51,1)';
const SURFACE_LOW = 'rgba(19,27,46,1)';
const BORDER = 'rgba(255,255,255,0.06)';

function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute top-1/2 -right-48 w-[700px] h-[700px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(100px)' }} />
      <div className="absolute -bottom-48 left-1/3 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(80px)' }} />
    </div>
  );
}

function HeroTerminal() {
  return (
    <div
      className="w-full max-w-4xl mx-auto mt-16 rounded-2xl overflow-hidden"
      style={{ background: 'rgba(11,19,38,0.8)', border: BORDER, boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: BORDER }}>
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
        <span className="ml-3 text-[10px] font-mono text-slate-600 uppercase tracking-widest">reposcout // intelligence_interface_v2.1.0</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left: App Killers panel */}
        <div className="p-6 border-r" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">App Killers</span>
          </div>
          <div className="space-y-2">
            {[
              { kills: 'Sentry replacement', name: 'GlitchTip', badge: 'VERIFIED', score: '97' },
              { kills: 'Intercom replacement', name: 'Chatwoot', badge: 'STABLE', score: '91' },
              { kills: 'Firebase replacement', name: 'Supabase', badge: 'STABLE', score: '89' },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg group"
                style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}
              >
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-600 mb-0.5">{item.kills}</div>
                  <div className="text-sm font-mono font-bold text-white">{item.name}</div>
                </div>
                <div className="text-right">
                  <div
                    className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    {item.badge}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Score {item.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI analysis terminal */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400">AI Analysis</span>
            <span
              className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              LIVE_SYNC
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs mb-4">
            <div className="text-slate-600">&gt; QUERY: "Enterprise-ready auth system"</div>
            <div
              className="p-3 rounded-lg border-l-2"
              style={{ background: 'rgba(59,130,246,0.06)', borderLeftColor: '#3b82f6' }}
            >
              <span className="text-slate-400">MATCH: </span>
              <span className="text-blue-400 font-bold">SuperTokens</span>
              <span className="text-slate-600"> (Score: 0.97)</span>
              <div className="mt-1 text-[10px] text-slate-600">High commit velocity, SOC2 patterns, MIT license</div>
            </div>
            <div
              className="p-3 rounded-lg border-l-2"
              style={{ background: 'rgba(255,255,255,0.02)', borderLeftColor: 'rgba(255,255,255,0.1)' }}
            >
              <span className="text-slate-500">MATCH: </span>
              <span className="text-slate-300">Auth.js</span>
              <span className="text-slate-600"> (Score: 0.88)</span>
              <div className="mt-1 text-[10px] text-slate-600">Vast community, issue velocity slowing Q3</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-600 uppercase">Vector Index</span>
              <span className="text-[10px] font-mono text-slate-500">374 / 374</span>
            </div>
            <div className="w-full rounded-full h-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full bg-blue-500 w-full" />
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-700 leading-relaxed">
              &gt; Indexing 374 repositories...<br />
              &gt; Gemini embeddings: 3072-dim vectors<br />
              &gt; Index ready — semantic search active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureIngestVisual() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: SURFACE_LOW, border: BORDER }}
    >
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: BORDER }}>
        <Terminal className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">bulk_ingest.log</span>
      </div>
      <div className="p-4 font-mono text-xs space-y-1.5">
        {[
          { line: '> Queuing microsoft/vscode', color: 'text-slate-400' },
          { line: '> Queuing vercel/next.js', color: 'text-slate-400' },
          { line: '> Queuing supabase/supabase', color: 'text-slate-400' },
          { line: '✓ microsoft/vscode — saved (42.1k ★)', color: 'text-emerald-500' },
          { line: '✓ vercel/next.js — saved (121k ★)', color: 'text-emerald-500' },
          { line: '↻ Embedding vectors… 3/3 complete', color: 'text-blue-400' },
          { line: '✓ AI analysis complete — 3 repos indexed', color: 'text-emerald-500' },
        ].map((item, i) => (
          <div key={i} className={item.color}>{item.line}</div>
        ))}
        <div className="pt-2 border-t mt-2" style={{ borderColor: BORDER }}>
          <div className="flex items-center justify-between">
            <span className="text-slate-700">No API token required for public repos.</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              FREE TIER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureVectorVisual() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: SURFACE_LOW, border: BORDER }}
    >
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: BORDER }}>
        <Brain className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">vector_search</span>
      </div>
      <div className="p-4 space-y-3">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
        >
          <span className="text-slate-600">&gt;</span>
          <span className="text-blue-300">"lightweight CRM for B2B SaaS teams"</span>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Twenty', score: '96', tag: 'STRONGEST', color: '#3b82f6' },
            { name: 'Monica', score: '84', tag: 'STRONG', color: '#3b82f6' },
            { name: 'Erxes', score: '71', tag: 'MODERATE', color: '#3b82f6' },
          ].map((r) => (
            <div key={r.name} className="flex items-center gap-3 font-mono text-xs">
              <div
                className="flex-none w-10 text-center text-[10px] font-bold rounded py-0.5"
                style={{ background: `rgba(59,130,246,0.1)`, color: r.color }}
              >
                {r.score}
              </div>
              <div className="flex-1 text-slate-300">{r.name}</div>
              <div
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
                style={{ background: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                {r.tag}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[10px] font-mono text-slate-700 pt-2 border-t" style={{ borderColor: BORDER }}>
          Powered by DeepSeek + Gemini · 3072-dim embeddings
        </div>
      </div>
    </div>
  );
}

const APP_KILLERS = [
  {
    kills: 'Google Analytics Killer',
    name: 'Plausible',
    desc: 'Privacy-first, fully GDPR compliant, no cookies. Drop-in replacement with better dashboards.',
    savings: '$19–49/mo',
  },
  {
    kills: 'Firebase Killer',
    name: 'Supabase',
    desc: 'Open source Postgres with auth, storage, and realtime. Scales to millions without vendor lock-in.',
    savings: '$200+/mo',
  },
  {
    kills: 'Slack Killer',
    name: 'Mattermost',
    desc: 'Self-hosted team collaboration. Enterprise-grade security with full data ownership.',
    savings: '$15/user',
  },
];

export function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen relative" style={{ background: '#0b1326', color: '#c2c6d6' }}>
      <Orbs />
      <MarketingNav />

      {/* ── HERO ── */}
      <section className="relative z-10 pt-40 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 font-mono text-[10px] uppercase tracking-widest text-slate-400"
            style={{ background: 'rgba(255,255,255,0.04)', border: BORDER }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Status: Active · 374 repos indexed
          </div>

          <h1
            className="font-mono font-black text-white leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
          >
            Your OSS<br />
            intelligence layer.
          </h1>
          <p
            className="font-mono font-bold leading-snug mb-10"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', color: 'rgba(194,198,214,0.45)' }}
          >
            Know what to build,<br />what to buy, what to kill.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              to="/sign-up"
              className="flex items-center gap-2 px-6 py-3 rounded-full font-mono font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 24px rgba(59,130,246,0.35)' }}
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/app"
              className="flex items-center gap-2 px-6 py-3 rounded-full font-mono font-bold text-sm text-slate-300 transition-all hover:text-white hover:bg-white/5"
              style={{ border: BORDER }}
            >
              Open dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <HeroTerminal />
      </section>

      {/* ── FEATURE: BULK INGEST ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <FeatureIngestVisual />
          </div>
          <div className="order-1 md:order-2 space-y-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400">Data Acquisition</div>
            <h2 className="font-mono font-black text-white text-4xl md:text-5xl leading-tight">
              Bulk Ingest.<br />
              <span style={{ color: 'rgba(173,198,255,0.55)' }}>URL to Archive.</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Point the engine at any GitHub URL — single repo, org, or a list of hundreds. Metadata, stars, commit velocity, license, and readme pulled automatically. No API tokens required for public repos.
            </p>
            <div className="space-y-3">
              {[
                'Paste URLs one at a time or in bulk',
                'Live progress monitor with per-repo status badges',
                'Auto-embed new repos into vector index on save',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500 flex-none" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE: AI ANALYSIS ── */}
      <section className="relative z-10 py-24 px-6" style={{ background: 'rgba(23,31,51,0.4)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Intelligence Layer</div>
            <h2 className="font-mono font-black text-white text-4xl md:text-5xl leading-tight">
              AI Analysis.<br />
              <span style={{ color: 'rgba(78,222,163,0.5)' }}>Hybrid Vector Search.</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              DeepSeek extracts architecture, tech stack, and maintenance signals from each repo. Gemini builds 3072-dimension semantic embeddings so you can query your entire library with plain English — not keywords.
            </p>
            <div className="space-y-3">
              {[
                '"Find a React CRM with MIT license under 5k stars"',
                '"Enterprise-grade auth with SOC2 patterns"',
                '"Lightweight Postgres alternative for edge deployments"',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-none" />
                  <span className="text-sm font-mono text-slate-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <FeatureVectorVisual />
          </div>
        </div>
      </section>

      {/* ── FEATURE: APP KILLERS ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-4">Strategic Disruption</div>
            <h2 className="font-mono font-black text-white text-4xl md:text-5xl leading-tight">The App Killers.</h2>
            <p className="text-slate-400 text-base mt-4 max-w-xl mx-auto">
              Stop paying SaaS tax. We surface open-source alternatives that match or exceed your current vendor stack — with scoring, license check, and community health built in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {APP_KILLERS.map((item) => (
              <div
                key={item.name}
                className="group p-6 rounded-xl flex flex-col gap-4 transition-all hover:border-amber-500/30 cursor-pointer"
                style={{ background: SURFACE_LOW, border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-500/70 mb-2">{item.kills}</div>
                  <div className="text-xl font-mono font-bold text-white">{item.name}</div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">{item.desc}</p>
                <div
                  className="pt-4 border-t flex items-center justify-between"
                  style={{ borderColor: BORDER }}
                >
                  <span className="text-[10px] font-mono text-slate-600">Saves ≈ {item.savings}</span>
                  <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-amber-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section className="relative z-10 py-24 px-6" style={{ background: 'rgba(23,31,51,0.4)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-14">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-3">Pricing</div>
              <h2 className="font-mono font-black text-white text-4xl leading-tight">Choose your tier.</h2>
            </div>
            {/* Billing toggle */}
            <div
              className="flex items-center p-1 rounded-full gap-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: BORDER }}
            >
              {(['monthly', 'annual'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all ${
                    billing === b ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  style={billing === b ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' } : {}}
                >
                  {b === 'annual' ? 'Annual (−20%)' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tier: 'TIER_01', name: 'Hobbyist', price: 0, featured: false,
                features: ['50 repos ingested', 'Basic AI analysis', 'Public repos only', 'App Killers view'],
              },
              {
                tier: 'TIER_02', name: 'Professional', price: billing === 'monthly' ? 49 : 39, featured: true,
                features: ['Unlimited bulk ingest', 'DeepSeek AI analysis', 'Gemini vector search', 'App Killer engine', 'Project workspaces', 'API access'],
              },
              {
                tier: 'TIER_03', name: 'Sentinel', price: null, featured: false,
                features: ['Everything in Pro', 'Custom vector indexing', 'Dedicated infrastructure', 'SSO + SCIM', 'SLA + priority support'],
              },
            ].map((plan) => (
              <div
                key={plan.tier}
                className={`relative rounded-xl p-7 flex flex-col gap-5 transition-all ${plan.featured ? 'scale-[1.02]' : ''}`}
                style={{
                  background: plan.featured ? 'rgba(23,31,51,1)' : SURFACE_LOW,
                  border: plan.featured
                    ? '1px solid rgba(59,130,246,0.4)'
                    : BORDER,
                  boxShadow: plan.featured ? '0 0 40px rgba(59,130,246,0.12)' : 'none',
                }}
              >
                {plan.featured && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-widest text-white"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                  >
                    Recommended
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-mono text-slate-600 mb-1">{plan.tier}</div>
                  <div className="text-lg font-mono font-bold text-white">{plan.name}</div>
                  <div className="mt-3">
                    {plan.price === null ? (
                      <span className="text-3xl font-mono font-black text-white">Custom</span>
                    ) : plan.price === 0 ? (
                      <span className="text-3xl font-mono font-black text-white">$0<span className="text-sm text-slate-500 font-normal">/mo</span></span>
                    ) : (
                      <span className="text-3xl font-mono font-black text-white">${plan.price}<span className="text-sm text-slate-500 font-normal">/mo</span></span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-none" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.price === null ? '/contact' : '/sign-up'}
                  className={`w-full text-center py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                    plan.featured
                      ? 'text-white hover:opacity-90'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                  style={plan.featured
                    ? { background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 16px rgba(59,130,246,0.3)' }
                    : { border: BORDER }
                  }
                >
                  {plan.price === null ? 'Talk to us' : plan.price === 0 ? 'Get started' : 'Go Pro'}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/pricing" className="text-xs font-mono text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-4">
              See full pricing breakdown →
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
