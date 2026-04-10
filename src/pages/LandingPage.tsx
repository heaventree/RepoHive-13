import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import {
  ArrowRight, Check, Brain, Flame,
  ChevronRight, Bell, BookmarkX, Layers, Plug, Search, Users
} from 'lucide-react';

/* ── Stitch palette ── */
const PRIMARY        = '#adc6ff';
const PRIMARY_CTR    = '#4d8eff';
const ON_PRIMARY_CTR = '#00285d';
const TERTIARY       = '#4edea3';
const GLASS_BG       = 'rgba(15,23,42,0.82)';
const GLASS_BORDER   = 'rgba(255,255,255,0.06)';
const SURFACE_HIGH   = '#222a3d';
const AMBER          = '#ffb4ab';

/* ─────────────────────────────────────────────
   Animated hero card
   Phases:  0 = typing URL
            1 = processing logs
            2 = results listing
            3 = brief pause then reset
───────────────────────────────────────────── */
const DEMO_URL  = 'github.com/supabase/auth-ui';
const LOG_LINES = [
  { text: '→ Fetching repository metadata…',       color: '#8c909f' },
  { text: '  Stars: 3,241  ·  License: Apache 2.0', color: '#8c909f' },
  { text: '→ Running DeepSeek AI analysis…',        color: PRIMARY_CTR },
  { text: '  SaaS ready: YES  ·  Category: Auth',   color: '#c2c6d6' },
  { text: '→ Generating 3072-dim embeddings…',      color: PRIMARY_CTR },
  { text: '✓ Index updated — search active',        color: TERTIARY },
];
const DEMO_RESULTS = [
  { name: 'supabase/auth-ui',    score: '98', tag: 'JUST ADDED', tagColor: PRIMARY_CTR,   hl: true },
  { name: 'clerk/javascript',     score: '94', tag: 'IN LIBRARY', tagColor: '#8c909f',     hl: false },
  { name: 'nextauthjs/next-auth', score: '91', tag: 'IN LIBRARY', tagColor: '#8c909f',     hl: false },
];

function AnimatedHeroCard() {
  const [phase, setPhase]     = useState<0|1|2|3>(0);
  const [typed, setTyped]     = useState('');
  const [logs, setLogs]       = useState<typeof LOG_LINES>([]);
  const [results, setResults] = useState<typeof DEMO_RESULTS>([]);
  const [cursor, setCursor]   = useState(true);

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  // Phase driver
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (phase === 0) {
      setTyped('');
      setLogs([]);
      setResults([]);
      let i = 0;
      const iv = setInterval(() => {
        setTyped(DEMO_URL.slice(0, i + 1));
        i++;
        if (i >= DEMO_URL.length) {
          clearInterval(iv);
          timers.push(setTimeout(() => setPhase(1), 700));
        }
      }, 52);
      return () => { clearInterval(iv); timers.forEach(clearTimeout); };
    }

    if (phase === 1) {
      LOG_LINES.forEach((line, i) => {
        timers.push(setTimeout(() => {
          setLogs(prev => [...prev, line]);
          if (i === LOG_LINES.length - 1) {
            timers.push(setTimeout(() => setPhase(2), 500));
          }
        }, i * 370));
      });
      return () => timers.forEach(clearTimeout);
    }

    if (phase === 2) {
      DEMO_RESULTS.forEach((r, i) => {
        timers.push(setTimeout(() => setResults(prev => [...prev, r]), i * 420));
      });
      timers.push(setTimeout(() => setPhase(3), DEMO_RESULTS.length * 420 + 2800));
      return () => timers.forEach(clearTimeout);
    }

    if (phase === 3) {
      timers.push(setTimeout(() => setPhase(0), 900));
      return () => timers.forEach(clearTimeout);
    }
  }, [phase]);

  return (
    <div
      className="rounded-xl overflow-hidden w-full"
      style={{
        background: 'rgba(6,14,32,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 0 0 1px rgba(77,142,255,0.08), 0 32px 64px rgba(0,0,0,0.55)',
      }}
    >
      {/* ── Chrome bar ── */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b"
        style={{ borderColor: GLASS_BORDER, background: 'rgba(2,8,16,0.70)' }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f56' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        <span className="ml-3 text-[9px] font-mono uppercase tracking-widest" style={{ color: '#424754' }}>
          reposcout / workspace
        </span>
        <span
          className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded"
          style={{ background: 'rgba(78,222,163,0.10)', color: TERTIARY, border: '1px solid rgba(78,222,163,0.20)', animation: 'badge-glow-pulse 2.2s ease-in-out 1s infinite' }}
        >
          LIVE
        </span>
      </div>

      {/* ── URL input area ── */}
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: GLASS_BORDER }}>
        <div className="text-[9px] font-mono uppercase tracking-widest mb-1.5" style={{ color: '#424754' }}>
          Add repo URL
        </div>
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5"
          style={{
            background: '#020810',
            border: `1px solid ${phase === 0 ? 'rgba(77,142,255,0.45)' : 'rgba(78,222,163,0.35)'}`,
            boxShadow: phase === 0 ? '0 0 0 2px rgba(77,142,255,0.10)' : '0 0 0 2px rgba(78,222,163,0.08)',
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
          }}
        >
          <Search className="w-3.5 h-3.5 flex-none" style={{ color: phase === 0 ? PRIMARY_CTR : TERTIARY }} />
          <span className="font-mono text-xs" style={{ color: phase === 0 ? '#dae2fd' : TERTIARY }}>
            {typed}
            {phase === 0 && <span style={{ opacity: cursor ? 1 : 0, borderRight: `2px solid ${PRIMARY_CTR}`, marginLeft: 1 }}>&nbsp;</span>}
            {phase > 0 && phase < 3 && typed === DEMO_URL && (
              <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(78,222,163,0.10)', color: TERTIARY, border: '1px solid rgba(78,222,163,0.20)' }}>
                {phase === 1 ? 'PROCESSING…' : 'INDEXED ✓'}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* ── Processing log ── */}
      {(phase === 1 || (phase >= 2 && logs.length > 0)) && (
        <div className="px-4 py-3 border-b font-mono text-[10px] space-y-1" style={{ borderColor: GLASS_BORDER, minHeight: 80 }}>
          {logs.map((l, i) => (
            <div
              key={i}
              style={{ color: l.color, animation: 'card-fade-up 0.3s ease both' }}
            >
              {l.text}
            </div>
          ))}
          {phase === 1 && (
            <div className="flex gap-1 mt-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: PRIMARY_CTR,
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Results list ── */}
      <div className="p-4 space-y-2" style={{ minHeight: 160 }}>
        {phase >= 2 && results.length > 0 && (
          <>
            <div className="text-[9px] font-mono uppercase tracking-widest mb-3" style={{ color: '#424754' }}>
              Your library — search results
            </div>
            {results.map((item, i) => (
              <div
                key={item.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                style={{
                  background: item.hl ? 'rgba(77,142,255,0.10)' : 'rgba(34,42,61,0.50)',
                  border: item.hl ? '1px solid rgba(77,142,255,0.30)' : '1px solid rgba(66,71,84,0.12)',
                  animation: `card-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both`,
                  animationDelay: `${i * 0.12}s`,
                }}
              >
                <div>
                  <span
                    className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded mr-2"
                    style={{ background: `${item.tagColor}18`, color: item.tagColor, border: `1px solid ${item.tagColor}35` }}
                  >
                    {item.tag}
                  </span>
                  <div className="text-xs font-mono font-bold mt-1" style={{ color: '#dae2fd' }}>{item.name}</div>
                </div>
                <div
                  className="text-[11px] font-mono font-black w-10 text-center py-1 rounded"
                  style={{ background: 'rgba(78,222,163,0.10)', color: TERTIARY, border: '1px solid rgba(78,222,163,0.22)' }}
                >
                  {item.score}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Idle state before results appear */}
        {(phase === 0 || (phase === 1 && results.length === 0)) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(77,142,255,0.07)', border: '1px solid rgba(77,142,255,0.12)' }}>
              <Search className="w-4 h-4" style={{ color: PRIMARY_CTR, opacity: 0.5 }} />
            </div>
            <div className="text-[10px] font-mono" style={{ color: '#424754' }}>
              {phase === 0 ? 'Paste a GitHub URL above to begin' : 'Analysing…'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Background orbs ── */
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

/* ── Pain points ── */
const PAIN_POINTS = [
  { icon: <BookmarkX className="w-6 h-6" />, title: 'Stop losing repos in your bookmarks',    desc: "You've saved hundreds of great repos across browser bookmarks, GitHub stars, Notion pages, and random text files. You never find them when you need them.", color: '#ff6b6b' },
  { icon: <Bell className="w-6 h-6" />,       title: 'Know when a repo goes stale or dies',   desc: "Archived, abandoned, license-changed, security issue. RepoScout monitors your list and alerts you before you build on a foundation that crumbles.",     color: AMBER },
  { icon: <Search className="w-6 h-6" />,     title: 'Find the right repo for your next build', desc: 'Describe what you need in plain English. We search your own curated list first — scored for SaaS readiness, maintenance health, and license.',        color: PRIMARY_CTR },
];

/* ── Features ── */
const FEATURES = [
  { icon: <Layers className="w-5 h-5" />, title: 'Bulk import',        desc: 'Paste any GitHub URL — single repo, org, or a list of 1,000. Everything ingested in minutes.',                                       color: PRIMARY },
  { icon: <Brain className="w-5 h-5" />,  title: 'AI intelligence',    desc: 'DeepSeek analyses every repo: tech stack, SaaS readiness, maintenance health, category. Updated weekly.',                             color: PRIMARY_CTR },
  { icon: <Flame className="w-5 h-5" />,  title: 'App Killers',        desc: '370+ pre-loaded OSS alternatives to expensive SaaS tools. Available on Solo and Studio as a curated starting point.',                color: AMBER },
  { icon: <Bell className="w-5 h-5" />,   title: 'Staleness alerts',   desc: 'Weekly checks for archived repos, license changes, dropped stars, and security flags. Know before your team does.',                   color: TERTIARY },
  { icon: <Plug className="w-5 h-5" />,   title: 'IDE & platform API', desc: 'One API key connects RepoScout to Replit, Bolt, Lovable, Base44, and Claude Code. Your repo library, in your flow.',                 color: '#c084fc' },
  { icon: <Users className="w-5 h-5" />,  title: 'Team workspaces',    desc: 'Studio plan gives your whole team a shared repo library. Add a project and get AI-curated recommendations.',                        color: '#60a5fa' },
];

const IDE_INTEGRATIONS = ['Replit', 'Bolt', 'Lovable', 'Base44', 'Claude Code', 'Cursor'];

const STATS = [
  { value: '374+',    label: 'Repos analysed' },
  { value: '3,072',   label: 'Vector dimensions' },
  { value: '<40ms',   label: 'Search latency' },
  { value: '6 tools', label: 'IDE integrations' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen relative" style={{ background: '#0b1326', color: '#dae2fd' }}>
      <Orbs />
      <MarketingNav />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative z-10 pt-36 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ── Left: copy ── */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7 font-mono text-[10px] uppercase tracking-widest"
                style={{ background: SURFACE_HIGH, border: 'rgba(66,71,84,0.25)', color: '#c2c6d6' }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: TERTIARY }} />
                For devs · designers · dev teams
              </div>

              {/* Large headline */}
              <h1 className="font-mono font-black text-white tracking-tight text-[42px] leading-[1.08] mb-3">
                All Your Repos.<br />Under Your Control.
              </h1>

              {/* One-line sub-headline */}
              <p className="font-mono font-bold text-[17px] whitespace-nowrap mb-7" style={{ color: PRIMARY }}>
                Analysed. Monitored. Searchable.
              </p>

              {/* Body copy */}
              <p className="text-[15px] leading-relaxed mb-8 max-w-lg" style={{ color: '#c2c6d6' }}>
                Add your repos and we do the rest — AI analysis, SaaS readiness scoring, staleness alerts, and plain-English semantic search across your entire library. Connect it all to your IDE with one API key.
              </p>

              {/* Quick benefits */}
              <div className="space-y-2.5 mb-9">
                {[
                  "Don't lose repos buried in browser bookmarks",
                  "Know the minute a dependency goes stale or dies",
                  "Search your library by intent, not by name",
                  "One API key — works in Replit, Bolt, Claude Code",
                ].map((b) => (
                  <div key={b} className="flex items-center gap-3 text-sm" style={{ color: '#dae2fd' }}>
                    <Check className="w-4 h-4 flex-none" style={{ color: TERTIARY }} />
                    {b}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/sign-up"
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-mono font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{ background: PRIMARY_CTR, color: ON_PRIMARY_CTR, boxShadow: '0 0 20px rgba(77,142,255,0.30)' }}
                >
                  Add your repos free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/app"
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-mono font-bold text-sm transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(66,71,84,0.30)', color: PRIMARY }}
                >
                  See the demo <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <p className="mt-5 text-[11px] font-mono" style={{ color: '#424754' }}>
                Free forever · No credit card · 374 repos already analysed
              </p>
            </div>

            {/* ── Right: animated card ── */}
            <div className="w-full">
              <AnimatedHeroCard />
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-xl"
            style={{ background: GLASS_BORDER }}>
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center py-5 px-4"
                style={{ background: GLASS_BG, backdropFilter: 'blur(20px)' }}>
                <span className="font-mono font-black text-2xl text-white">{s.value}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest mt-1" style={{ color: '#8c909f' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PAIN POINTS
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: PRIMARY_CTR }}>
              The Problem
            </div>
            <h2 className="font-mono font-black text-white tracking-tight leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Devs find great repos all day.<br />
              <span style={{ color: 'rgba(173,198,255,0.50)' }}>Then lose them forever.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p) => (
              <div key={p.title} className="p-8 rounded-xl"
                style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: `${p.color}18`, color: p.color }}>{p.icon}</div>
                <h3 className="font-mono font-bold text-white text-lg mb-3">{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c2c6d6' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6" style={{ background: 'rgba(19,27,46,0.50)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: TERTIARY }}>
            How it works
          </div>
          <h2 className="font-mono font-black text-white tracking-tight leading-tight mb-16"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            Three steps to a smarter repo library.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Add your repos',         desc: 'Paste any GitHub URL — or bulk import a list. Your bookmarks, GitHub stars, side project deps. 25 free, 1,000+ on Solo.', color: PRIMARY_CTR },
              { step: '02', title: 'We analyse everything',  desc: 'DeepSeek reads every repo: tech stack, category, SaaS readiness, maintenance health, license. All updated weekly.', color: TERTIARY },
              { step: '03', title: 'Search, monitor, build', desc: 'Ask in plain English. Get staleness alerts. Pull your library into Replit, Bolt, or Claude Code via API.', color: '#c084fc' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center font-mono font-black text-2xl mb-6"
                  style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
                  {s.step}
                </div>
                <h3 className="font-mono font-bold text-white text-xl mb-3">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c2c6d6' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: PRIMARY }}>What you get</div>
            <h2 className="font-mono font-black text-white tracking-tight leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Everything built for repo-heavy workflows.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-7 rounded-xl transition-all duration-200"
                style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${f.color}30`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = GLASS_BORDER; }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: `${f.color}15`, color: f.color }}>{f.icon}</div>
                <h3 className="font-mono font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c2c6d6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          IDE INTEGRATIONS
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6" style={{ background: 'rgba(19,27,46,0.50)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: '#c084fc' }}>API + IDE Integration</div>
              <h2 className="font-mono font-black text-white tracking-tight leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)' }}>
                Your repo library,<br />
                <span style={{ color: 'rgba(192,132,252,0.60)' }}>inside every tool you use.</span>
              </h2>
              <p className="text-base leading-relaxed" style={{ color: '#c2c6d6' }}>
                One API key. Connect RepoScout to any platform that supports custom context — Replit, Bolt, Lovable, Base44, Claude Code, Cursor. Ask your AI assistant to find repos from your own curated list.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  'Pull your full repo index into any AI coding tool',
                  'Search by project context — "auth lib for my Next.js SaaS"',
                  '25 API keys on Studio plan for your whole team',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm" style={{ color: '#dae2fd' }}>
                    <Check className="w-[18px] h-[18px] flex-none" style={{ color: TERTIARY }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-6" style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}>
              <div className="text-[10px] font-mono uppercase tracking-widest mb-5" style={{ color: '#8c909f' }}>Connect to any platform</div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {IDE_INTEGRATIONS.map((name) => (
                  <div key={name} className="flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{ background: SURFACE_HIGH, border: '1px solid rgba(66,71,84,0.20)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: TERTIARY }} />
                    <span className="font-mono text-sm font-bold text-white">{name}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-lg font-mono text-xs space-y-1"
                style={{ background: '#020810', border: '1px solid rgba(77,142,255,0.15)' }}>
                <div style={{ color: '#424754' }}># Example API call</div>
                <div><span style={{ color: '#c084fc' }}>GET</span> <span style={{ color: PRIMARY }}>api.reposcout.io/v1/search</span></div>
                <div style={{ color: '#8c909f' }}>  ?q=auth+library+nextjs&amp;scope=my_repos</div>
                <div style={{ color: TERTIARY }}># Returns your curated list first</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRE-LOADED LIBRARY CALLOUT
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-10"
            style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: '1px solid rgba(173,198,255,0.15)' }}>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" style={{ color: AMBER }} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: AMBER }}>Paid Plan Bonus</span>
              </div>
              <h3 className="font-mono font-black text-white leading-tight tracking-tight"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}>
                370+ curated repos, pre-loaded.
              </h3>
              <p className="text-base leading-relaxed" style={{ color: '#c2c6d6' }}>
                Solo and Studio plans unlock our hand-curated App Killers library — 370+ open source alternatives to the most expensive SaaS tools. Already analysed, scored, and ready to search.
              </p>
            </div>
            <div className="flex-none">
              <Link to="/pricing"
                className="flex items-center gap-2 px-8 py-4 rounded-full font-mono font-bold text-sm transition-all hover:scale-105"
                style={{ background: PRIMARY_CTR, color: ON_PRIMARY_CTR, boxShadow: '0 0 20px rgba(77,142,255,0.30)' }}>
                See plans <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-mono font-black text-white tracking-tight leading-tight mb-6"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            Your repos deserve<br />
            <span style={{ color: PRIMARY }}>better than bookmarks.</span>
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: '#c2c6d6' }}>
            Free to start. Add 25 repos, run searches, see what it can do. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/sign-up"
              className="flex items-center gap-2 px-10 py-4 rounded-full font-mono font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: PRIMARY_CTR, color: ON_PRIMARY_CTR, boxShadow: '0 0 24px rgba(77,142,255,0.35)' }}>
              Start free — no credit card <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing"
              className="flex items-center gap-2 px-8 py-4 rounded-full font-mono font-bold text-sm transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(66,71,84,0.30)', color: PRIMARY }}>
              View pricing <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
