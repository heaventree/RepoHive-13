import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Search, Activity, Box, Flame,
  ShieldAlert, Check, Terminal,
} from 'lucide-react';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { IngestPipeline } from '../components/marketing/IngestPipeline';

const ACCENT = '#FF5C00';
const HAIRLINE = '#E5E5E5';

const PROBLEMS = [
  { icon: <Box className="w-5 h-5" />,        dark: false, title: 'The Black Hole',  desc: "You've saved hundreds of great repos across browser bookmarks and GitHub stars. You never find them when you need them." },
  { icon: <ShieldAlert className="w-5 h-5" />, dark: true,  title: 'Silent Decay',    desc: "Archived, abandoned, license-changed. You don't know until you've already built your foundation on a dead project." },
  { icon: <Search className="w-5 h-5" />,      dark: false, title: 'Keyword Hell',    desc: "Searching by repo name doesn't work when you're looking for a solution. You need to search by what it does, not exact match." },
];

const STEPS = [
  { n: '01', title: 'Paste in bulk',     desc: 'Drop one GitHub URL or paste a thousand. RepoHive queues every repo and pulls stars, forks, license, language and last-push from the GitHub API.', accent: false },
  { n: '02', title: 'Analyze & score',   desc: 'The AI writes a plain-English synopsis and scores each repo on stars, forks and commit activity — so you instantly see what is active and what has gone stale.', accent: false },
  { n: '03', title: 'Classify & search', desc: 'Every repo gets auto-labeled — App Killer or white-label SaaS-ready — then made searchable by what it does. Ask in plain English, get the right repo.', accent: true },
];

const FEATURES = [
  { title: 'Semantic search',          desc: 'Plain-English search across YOUR library. Vector embeddings, sub-40ms response. Find a repo by what it does, not what it is called.', icon: <Search className="w-5 h-5" /> },
  { title: 'Health & staleness scores', desc: 'Every repo scored on stars, forks and update cadence. Know the minute something is archived, abandoned or license-changed.', icon: <Activity className="w-5 h-5" /> },
  { title: 'App Killer classification', desc: 'The AI flags repos that can replace a paid tool you are paying for — tagged with the product they kill, like "replaces Calendly".', icon: <Flame className="w-5 h-5" /> },
  { title: 'Projects & team workspaces', desc: 'Brief a project, get ranked repo recommendations from your library. Share the shortlist with up to 25 teammates.', icon: <Box className="w-5 h-5" /> },
];

const INTEGRATIONS = ['Replit', 'Bolt', 'Lovable', 'Base44', 'Claude Code', 'Cursor'];

const MARQUEE = ['1,200+ repos analyzed', 'App Killer vs SaaS-ready', '3,072 vector dimensions', '<40ms search latency', '6 IDE integrations'];

export function LandingPage() {
  return (
    <div
      className="bg-[#FAFAFA] text-black min-h-screen selection:bg-[#FF5C00] selection:text-white flex flex-col"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* ── Nav ── */}
      <MarketingNav />

      {/* ── Hero ── */}
      <header
        className="px-6 py-24 md:py-32 flex flex-col items-center text-center bg-white border-b"
        style={{ borderColor: HAIRLINE }}
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-widest bg-gray-100 rounded-full mb-8 border"
          style={{ borderColor: HAIRLINE }}
        >
          <span className="w-2 h-2 bg-[#FF5C00] rounded-full animate-pulse" />
          1,200+ repos analyzed
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] max-w-5xl mb-6">
          All your repos.<br />
          <span style={{ color: ACCENT }}>Scored, classified, searchable.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 font-medium">
          Paste hundreds of GitHub URLs at once. RepoHive analyzes every one, writes a synopsis, scores it on
          stars, forks and activity, then labels it — App Killer or white-label SaaS-ready — in a library you
          can search in plain English.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/sign-up"
            className="flex items-center gap-2 text-base font-bold bg-black text-white px-6 py-3.5 rounded hover:bg-[#FF5C00] transition-colors"
          >
            Add your repos <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#demo"
            className="flex items-center gap-2 text-base font-bold bg-white text-black border border-black px-6 py-3.5 rounded hover:bg-gray-50 transition-colors"
          >
            See it run
          </a>
        </div>
      </header>

      {/* ── Stats marquee ── */}
      <div
        className="flex items-center overflow-hidden py-4 bg-[#FAFAFA] text-xs font-mono uppercase tracking-widest text-gray-500 whitespace-nowrap border-b"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="flex animate-marquee gap-12 pl-12 shrink-0">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="flex items-center gap-12">
              {item} <span aria-hidden>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Live ingestion pipeline ── */}
      <section
        id="demo"
        className="p-6 md:p-12 bg-white flex flex-col items-center border-b scroll-mt-20"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="text-center mb-10 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Watch a repo go through the engine</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ingest → analyze → score → classify.
          </h2>
        </div>
        <IngestPipeline />
      </section>

      {/* ── Problem ── */}
      <section className="py-24 px-6 bg-[#FAFAFA] border-b" style={{ borderColor: HAIRLINE }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 md:w-2/3">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              You collect repos.<br />Then you lose them.
            </h2>
            <p className="text-gray-500 text-lg">
              Devs find great tools, star them on GitHub, save them in Notion, and then completely forget they exist when it's time to build.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            {PROBLEMS.map((p) => (
              <div key={p.title}>
                <div
                  className={`w-10 h-10 border border-black flex items-center justify-center rounded mb-4 ${
                    p.dark ? 'bg-black text-white' : ''
                  }`}
                >
                  {p.icon}
                </div>
                <h3 className="font-bold text-xl mb-2">{p.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-24 px-6 bg-white border-b" style={{ borderColor: HAIRLINE }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-center">
            Three steps to control.
          </h2>
          <div className="grid md:grid-cols-3 gap-0 border border-black rounded-md overflow-hidden">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className={`p-8 md:p-10 bg-white hover:bg-gray-50 transition-colors ${
                  i < STEPS.length - 1 ? 'border-b md:border-b-0 md:border-r border-black' : ''
                }`}
              >
                <div className={`text-4xl font-mono font-bold mb-6 ${s.accent ? 'text-[#FF5C00]' : 'text-gray-300'}`}>
                  {s.n}
                </div>
                <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-[#FAFAFA] border-b" style={{ borderColor: HAIRLINE }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Core Infrastructure.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-[#FAFAFA] p-8 md:p-12 flex flex-col hover:bg-white transition-colors">
                <div className="w-10 h-10 border border-black flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="py-20 px-6 bg-white overflow-hidden flex flex-col items-center border-b" style={{ borderColor: HAIRLINE }}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 text-center">
          Connects to your workflow
        </h2>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-2xl md:text-3xl font-bold text-gray-300">
          {INTEGRATIONS.map((name) => (
            <span key={name} className="hover:text-black transition-colors cursor-default">{name}</span>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 bg-[#FAFAFA] border-b" style={{ borderColor: HAIRLINE }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple Pricing.</h2>
            <p className="text-gray-500 text-lg">Start for free. Scale when you need API access.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="border border-black bg-white p-8 flex flex-col">
              <h3 className="text-xl font-bold mb-1">Free</h3>
              <p className="text-gray-500 text-sm mb-6">For the casual collector.</p>
              <div className="text-4xl font-bold mb-8">$0<span className="text-lg text-gray-400 font-medium">/mo</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-gray-400" /> 100 repos</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-gray-400" /> Full AI analysis & scoring</li>
              </ul>
              <Link
                to="/sign-up"
                className="w-full py-3 border border-black font-bold rounded hover:bg-black hover:text-white transition-colors text-center"
              >
                Start free
              </Link>
            </div>

            {/* Solo */}
            <div className="border-2 border-[#FF5C00] bg-white p-8 flex flex-col relative shadow-[8px_8px_0px_0px_rgba(255,92,0,0.1)]">
              <div className="absolute top-0 right-0 bg-[#FF5C00] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-1">Solo</h3>
              <p className="text-gray-500 text-sm mb-6">For the serious builder.</p>
              <div className="text-4xl font-bold mb-8">$19<span className="text-lg text-gray-400 font-medium">/mo</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-[#FF5C00]" /> 500 repos</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-[#FF5C00]" /> 1 API key for IDEs</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-[#FF5C00]" /> Seed App Killer library</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-[#FF5C00]" /> Priority search latency</li>
              </ul>
              <Link
                to="/pricing"
                className="w-full py-3 bg-[#FF5C00] text-white font-bold rounded hover:bg-[#CC4A00] transition-colors text-center"
              >
                Upgrade to Solo
              </Link>
            </div>

            {/* Studio */}
            <div className="border border-black bg-white p-8 flex flex-col">
              <h3 className="text-xl font-bold mb-1">Studio</h3>
              <p className="text-gray-500 text-sm mb-6">For teams and agencies.</p>
              <div className="text-4xl font-bold mb-8">$49<span className="text-lg text-gray-400 font-medium">/mo</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-gray-400" /> 5,000 repos</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-gray-400" /> 25 API keys</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-gray-400" /> Shared workspaces</li>
              </ul>
              <Link
                to="/pricing"
                className="w-full py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition-colors text-center"
              >
                Get Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / Footer ── */}
      <footer className="bg-black text-white px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Ready to index?</h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl">
          Join the developers organizing their intelligence. Free forever for your first 100 repos.
        </p>
        <Link
          to="/sign-up"
          className="text-lg font-bold bg-white text-black px-8 py-4 rounded hover:bg-[#FF5C00] hover:text-white transition-colors mb-24"
        >
          Start your library
        </Link>

        <div className="w-full max-w-6xl border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-white" />
            <span className="text-white font-bold">RepoHive</span>
          </div>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/integrations" className="hover:text-white transition-colors">Integrations</Link>
          </div>
          <div>© {new Date().getFullYear()} RepoHive Inc.</div>
        </div>
      </footer>
    </div>
  );
}
