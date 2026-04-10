import React from 'react';
import { Link } from 'react-router-dom';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import {
  ArrowRight, Check, Brain, Flame, Terminal,
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

/* ── Hero mockup terminal ── */
function HeroMockup() {
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
          reposcout // workspace_v2.1.0
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ background: 'rgba(78,222,163,0.10)', color: TERTIARY, border: `1px solid rgba(78,222,163,0.20)` }}
          >
            1,247 repos indexed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left: repo list */}
        <div className="p-6 border-r" style={{ borderColor: GLASS_BORDER }}>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4" style={{ color: PRIMARY_CTR }} />
            <div
              className="flex-1 rounded-lg px-3 py-1.5 font-mono text-xs"
              style={{ background: '#020810', border: `1px solid rgba(77,142,255,0.25)`, color: PRIMARY }}
            >
              "auth library for my SaaS project"
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { name: 'supabase/auth-ui',    label: 'YOUR REPO', score: '98', highlight: true, delay: '0.10s' },
              { name: 'clerk/javascript',     label: 'SAAS READY', score: '95', highlight: false, delay: '0.25s' },
              { name: 'nextauthjs/next-auth', label: 'MIT',       score: '91', highlight: false, delay: '0.40s' },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3.5 rounded-lg"
                style={{
                  background: item.highlight ? `rgba(77,142,255,0.08)` : 'rgba(34,42,61,0.50)',
                  border: item.highlight ? `1px solid rgba(77,142,255,0.25)` : '1px solid rgba(66,71,84,0.10)',
                  animation: `card-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) ${item.delay} both`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
              >
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider mb-0.5" style={{ color: '#8c909f' }}>
                    {item.label}
                  </div>
                  <div className="text-sm font-mono font-bold" style={{ color: '#dae2fd' }}>{item.name}</div>
                </div>
                <div
                  className="text-[10px] font-mono font-bold w-10 text-center py-0.5 rounded"
                  style={{ background: `rgba(78,222,163,0.10)`, color: TERTIARY, border: `1px solid rgba(78,222,163,0.20)` }}
                >
                  {item.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: analysis panel */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4" style={{ color: PRIMARY_CTR }} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: PRIMARY_CTR }}>
              AI Analysis
            </span>
            <span
              className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded"
              style={{ background: 'rgba(78,222,163,0.10)', color: TERTIARY, border: `1px solid rgba(78,222,163,0.20)`, animation: 'badge-glow-pulse 2.2s ease-in-out 0.8s infinite' }}
            >
              LIVE
            </span>
          </div>

          <div
            className="rounded-lg p-4 mb-4"
            style={{ background: `rgba(77,142,255,0.06)`, border: `1px solid rgba(77,142,255,0.15)` }}
          >
            <div className="font-mono text-xs mb-3" style={{ color: PRIMARY }}>supabase/auth-ui</div>
            <div className="space-y-1.5 font-mono text-[10px]" style={{ color: '#c2c6d6' }}>
              <div className="flex justify-between"><span style={{ color: '#8c909f' }}>SaaS Ready</span><span style={{ color: TERTIARY }}>✓ YES</span></div>
              <div className="flex justify-between"><span style={{ color: '#8c909f' }}>License</span><span>Apache 2.0</span></div>
              <div className="flex justify-between"><span style={{ color: '#8c909f' }}>Maintained</span><span style={{ color: TERTIARY }}>Active (2d ago)</span></div>
              <div className="flex justify-between"><span style={{ color: '#8c909f' }}>Stars</span><span>3.2k ★</span></div>
            </div>
          </div>

          <div className="space-y-1 font-mono text-[10px]" style={{ color: '#424754' }}>
            <div>&gt; Embedding complete — 3072-dim vectors</div>
            <div style={{ color: PRIMARY_CTR }}>&gt; Monitoring: weekly staleness check</div>
            <div style={{ color: TERTIARY }}>&gt; API endpoint active — IDE plugin connected</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Pain points section ── */
const PAIN_POINTS = [
  {
    icon: <BookmarkX className="w-6 h-6" />,
    title: 'Stop losing repos in your bookmarks',
    desc: "You've saved hundreds of great repos across browser bookmarks, GitHub stars, Notion pages, and random text files. You never find them when you need them.",
    color: '#ff6b6b',
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: 'Know when a repo goes stale or dies',
    desc: "Archived, abandoned, license-changed, security issue. RepoScout monitors your list and alerts you before you build on a foundation that crumbles.",
    color: '#ffb4ab',
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: 'Find the right repo for your next build',
    desc: 'Describe what you need in plain English. We search your own curated list first, then the wider index — and score everything for SaaS readiness and maintenance health.',
    color: PRIMARY_CTR,
  },
];

/* ── Features list ── */
const FEATURES = [
  { icon: <Layers className="w-5 h-5" />, title: 'Bulk import', desc: 'Paste any GitHub URL — single repo, org page, or a list of 1,000. Everything ingested in minutes.', color: PRIMARY },
  { icon: <Brain className="w-5 h-5" />, title: 'AI intelligence', desc: 'DeepSeek analyses every repo: tech stack, SaaS readiness, maintenance health, category. Updated weekly.', color: PRIMARY_CTR },
  { icon: <Flame className="w-5 h-5" />, title: 'App Killers library', desc: '370+ pre-loaded OSS alternatives to expensive SaaS tools. Available on paid plans as a curated starting point.', color: AMBER },
  { icon: <Bell className="w-5 h-5" />, title: 'Staleness alerts', desc: 'Weekly checks for archived repos, license changes, dropped stars, and security flags. Know before your team does.', color: '#4edea3' },
  { icon: <Plug className="w-5 h-5" />, title: 'IDE & platform API', desc: 'One API key connects RepoScout to Replit, Bolt, Lovable, Base44, and Claude Code. Your repo library, in your flow.', color: '#c084fc' },
  { icon: <Users className="w-5 h-5" />, title: 'Team workspaces', desc: 'Studio plan gives your whole team a shared repo library. Add a project and get AI-curated repo recommendations.', color: '#60a5fa' },
];

/* ── IDE integration logos ── */
const IDE_INTEGRATIONS = ['Replit', 'Bolt', 'Lovable', 'Base44', 'Claude Code', 'Cursor'];

export function LandingPage() {
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
            Built for devs · designers · dev teams
          </div>

          <h1 className="font-mono font-black text-white leading-[0.92] tracking-tighter mb-8"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}>
            All your bookmarked repos.
            <br />
            <span style={{ color: 'rgba(173,198,255,0.55)' }}>Finally, under control.</span>
          </h1>

          <p className="text-lg leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: '#c2c6d6' }}>
            Add your repos. We analyse every one — architecture, SaaS readiness, license, maintenance health.
            Search with plain English. Get alerts when something goes stale.
            Connect your library to your IDE with one API key.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/sign-up"
              className="flex items-center gap-2 px-8 py-4 rounded-full font-mono font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: PRIMARY_CTR, color: ON_PRIMARY_CTR, boxShadow: '0 0 20px rgba(77,142,255,0.30)' }}
            >
              Add your repos free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/app"
              className="flex items-center gap-2 px-8 py-4 rounded-full font-mono font-bold text-sm transition-all hover:bg-white/5"
              style={{ border: `1px solid rgba(66,71,84,0.30)`, color: PRIMARY }}
            >
              See the demo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <HeroMockup />
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: PRIMARY_CTR }}>
              The Problem
            </div>
            <h2 className="font-mono font-black text-white tracking-tight leading-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Devs find great repos all day.
              <br />
              <span style={{ color: 'rgba(173,198,255,0.55)' }}>Then lose them forever.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p) => (
              <div
                key={p.title}
                className="p-8 rounded-xl"
                style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: `${p.color}18`, color: p.color }}
                >
                  {p.icon}
                </div>
                <h3 className="font-mono font-bold text-white text-lg mb-3">{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c2c6d6' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 py-24 px-6" style={{ background: 'rgba(19,27,46,0.50)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: TERTIARY }}>
            How it works
          </div>
          <h2 className="font-mono font-black text-white tracking-tight leading-tight mb-16"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Three steps to a smarter repo library.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Add your repos',
                desc: 'Paste any GitHub URL — or bulk import a list. Your bookmarks, GitHub stars, side project deps, anything. 25 free, 1,000+ on Solo.',
                color: PRIMARY_CTR,
              },
              {
                step: '02',
                title: 'We analyse everything',
                desc: 'DeepSeek reads every repo: tech stack, category, SaaS readiness score, maintenance health, license. All updated weekly automatically.',
                color: TERTIARY,
              },
              {
                step: '03',
                title: 'Search, monitor, connect',
                desc: 'Ask in plain English. Get staleness alerts. Use the API to pull your library into Replit, Bolt, Claude Code, or any IDE.',
                color: '#c084fc',
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center font-mono font-black text-2xl mb-6"
                  style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}
                >
                  {s.step}
                </div>
                <h3 className="font-mono font-bold text-white text-xl mb-3">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c2c6d6' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest mb-4" style={{ color: PRIMARY }}>
              What you get
            </div>
            <h2 className="font-mono font-black text-white tracking-tight leading-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Everything built for repo-heavy workflows.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-7 rounded-xl transition-all duration-200 group"
                style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${f.color}30`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = GLASS_BORDER; }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: `${f.color}15`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="font-mono font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c2c6d6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IDE / PLATFORM INTEGRATIONS ── */}
      <section className="relative z-10 py-24 px-6" style={{ background: 'rgba(19,27,46,0.50)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: '#c084fc' }}>
                API + IDE Integration
              </div>
              <h2 className="font-mono font-black text-white tracking-tight leading-tight"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
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

            <div
              className="rounded-xl p-6"
              style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
            >
              <div className="text-[10px] font-mono uppercase tracking-widest mb-5" style={{ color: '#8c909f' }}>
                Connect to any platform
              </div>
              <div className="grid grid-cols-2 gap-3">
                {IDE_INTEGRATIONS.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{ background: SURFACE_HIGH, border: '1px solid rgba(66,71,84,0.20)' }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: TERTIARY }} />
                    <span className="font-mono text-sm font-bold text-white">{name}</span>
                  </div>
                ))}
              </div>
              <div
                className="mt-5 p-4 rounded-lg font-mono text-xs space-y-1"
                style={{ background: '#020810', border: `1px solid rgba(77,142,255,0.15)` }}
              >
                <div style={{ color: '#424754' }}># Example API call</div>
                <div><span style={{ color: '#c084fc' }}>GET</span> <span style={{ color: PRIMARY }}>api.reposcout.io/v1/search</span></div>
                <div style={{ color: '#8c909f' }}>  ?q=auth+library+nextjs</div>
                <div style={{ color: '#8c909f' }}>  &scope=my_repos</div>
                <div style={{ color: TERTIARY }}># returns your curated list first</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRE-LOADED LIBRARY CALLOUT ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className="rounded-xl p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-10"
            style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: `1px solid rgba(173,198,255,0.15)` }}
          >
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" style={{ color: AMBER }} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: AMBER }}>
                  Paid Plan Bonus
                </span>
              </div>
              <h3 className="font-mono font-black text-white text-3xl md:text-4xl leading-tight tracking-tight">
                370+ curated repos, pre-loaded.
              </h3>
              <p className="text-base leading-relaxed" style={{ color: '#c2c6d6' }}>
                Solo and Studio plans unlock our hand-curated App Killers library — 370+ open source alternatives to the most expensive SaaS tools. Already analysed, scored, and ready to search. The ideal starting point for any dev stack audit.
              </p>
            </div>
            <div className="flex-none">
              <Link
                to="/pricing"
                className="flex items-center gap-2 px-8 py-4 rounded-full font-mono font-bold text-sm transition-all hover:scale-105"
                style={{ background: PRIMARY_CTR, color: ON_PRIMARY_CTR, boxShadow: '0 0 20px rgba(77,142,255,0.30)' }}
              >
                See plans <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-mono font-black text-white tracking-tight leading-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            Your repos deserve
            <br />
            <span style={{ color: PRIMARY }}>better than bookmarks.</span>
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: '#c2c6d6' }}>
            Free to start. Add 25 repos, run searches, see what it can do. No credit card.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/sign-up"
              className="flex items-center gap-2 px-10 py-4 rounded-full font-mono font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: PRIMARY_CTR, color: ON_PRIMARY_CTR, boxShadow: '0 0 24px rgba(77,142,255,0.35)' }}
            >
              Start free — no credit card <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="flex items-center gap-2 px-8 py-4 rounded-full font-mono font-bold text-sm transition-all hover:bg-white/5"
              style={{ border: `1px solid rgba(66,71,84,0.30)`, color: PRIMARY }}
            >
              View pricing <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
