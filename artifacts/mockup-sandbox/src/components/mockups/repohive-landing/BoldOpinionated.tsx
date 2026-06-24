import React, { useEffect, useState } from 'react';
import {
  ArrowRight, Check, Brain, Flame,
  ChevronRight, Bell, BookmarkX, Layers, Plug, Search, Users, ShieldAlert, Code2, Zap, TerminalSquare
} from 'lucide-react';

/* ── Inline CSS ── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700;800;900&display=swap');

  .bold-op-wrapper {
    font-family: 'Geist', sans-serif;
    background-color: #000000;
    color: #ededed;
    --accent: #a3e635; /* Lime accent */
    --accent-glow: rgba(163, 230, 53, 0.4);
    --surface: #111111;
    --surface-border: #222222;
  }

  .bold-op-wrapper h1, .bold-op-wrapper h2, .bold-op-wrapper h3, .bold-op-wrapper .font-mono {
    font-family: 'Geist Mono', monospace;
  }

  .bold-op-glow-text {
    color: #fff;
    text-shadow: 0 0 40px rgba(255,255,255,0.4);
  }

  .bold-op-accent-text {
    color: var(--accent);
  }

  .bold-op-button {
    background: #fff;
    color: #000;
    transition: all 0.2s ease;
  }
  .bold-op-button:hover {
    background: #e5e5e5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255,255,255,0.15);
  }

  .bold-op-button-secondary {
    background: #111;
    color: #fff;
    border: 1px solid #333;
    transition: all 0.2s ease;
  }
  .bold-op-button-secondary:hover {
    background: #222;
    border-color: #555;
  }

  .bold-op-card {
    background: var(--surface);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  .bold-op-card:hover {
    border-color: #444;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
  }

  /* Animated terminal */
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  .bold-op-scanline {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to bottom, transparent, var(--accent-glow), transparent);
    animation: scanline 4s linear infinite;
    pointer-events: none;
    opacity: 0.5;
  }
  
  .bold-op-gradient-bg {
    background: radial-gradient(circle at 50% 0%, rgba(163, 230, 53, 0.15) 0%, transparent 60%);
  }
`;

function AnimatedTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const sequence = [
      "> repohive ingest github.com/shadcn/ui",
      "[INFO] Fetching repository metadata...",
      "[SUCCESS] Found 42,109 stars. License: MIT",
      "[INFO] Running DeepSeek analysis...",
      "→ Tech Stack: React, Tailwind, Radix UI",
      "→ Category: UI Component Library",
      "→ SaaS Readiness: 98/100 (Highly Recommended)",
      "[INFO] Generating 3072-dimensional vector embeddings...",
      "[SUCCESS] Indexed successfully. Search latency: 34ms."
    ];

    let i = 0;
    const interval = setInterval(() => {
      setLines(prev => {
        if (i >= sequence.length) {
          clearInterval(interval);
          return prev;
        }
        return [...prev, sequence[i++]];
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-lg overflow-hidden border border-[#333] bg-[#0a0a0a] shadow-2xl font-mono text-[13px] leading-relaxed w-full max-w-2xl mx-auto h-[320px]">
      <div className="flex items-center px-4 py-3 border-b border-[#222] bg-[#111]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-4 text-[#888] text-xs">repohive — bash</div>
      </div>
      <div className="p-5 relative h-[calc(100%-48px)] overflow-hidden">
        <div className="bold-op-scanline" />
        <div className="space-y-2 text-[#ccc]">
          {lines.map((line, i) => (
            <div key={i} className={
              line.startsWith('>') ? 'text-white font-bold' :
              line.includes('[SUCCESS]') ? 'text-[#a3e635]' :
              line.includes('→') ? 'text-[#888] pl-4' : 'text-[#888]'
            }>
              {line}
            </div>
          ))}
          {lines.length < 9 && <div className="w-2 h-4 bg-[#a3e635] animate-pulse mt-2" />}
        </div>
      </div>
    </div>
  );
}

export function BoldOpinionated() {
  return (
    <div className="bold-op-wrapper min-h-screen relative selection:bg-[#a3e635] selection:text-black">
      <style>{styles}</style>
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#222] bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#a3e635] rounded-sm transform rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 bg-black transform -rotate-45" />
            </div>
            <span className="font-mono font-bold text-lg tracking-tight text-white">RepoHive</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#888]">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Integrations</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Changelog</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium text-[#888] hover:text-white transition-colors">Log in</a>
            <button className="bold-op-button px-4 py-2 rounded-md font-medium text-sm">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative bold-op-gradient-bg">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111] border border-[#333] text-xs font-mono text-[#a3e635] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
            RepoHive 2.0 is live
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-tight max-w-4xl mx-auto">
            All your repos. <br />
            <span className="bold-op-accent-text">Under your control.</span>
          </h1>
          <p className="text-xl text-[#888] mb-10 max-w-2xl mx-auto leading-relaxed">
            Analysed. Monitored. Searchable. Paste GitHub URLs and get AI-analyzed repo cards with scores, tags, and plain-English semantic search across your whole library.
          </p>
          <div className="flex items-center justify-center gap-4 mb-20">
            <button className="bold-op-button px-6 py-3 rounded-md font-semibold flex items-center gap-2 text-base">
              Start Building <ArrowRight className="w-4 h-4" />
            </button>
            <button className="bold-op-button-secondary px-6 py-3 rounded-md font-semibold flex items-center gap-2 text-base">
              <TerminalSquare className="w-4 h-4" /> View Docs
            </button>
          </div>

          <AnimatedTerminal />

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-[#666] font-mono text-sm">
            <div className="flex items-center gap-2"><span className="text-white font-bold">374+</span> repos analysed</div>
            <div className="flex items-center gap-2"><span className="text-white font-bold">3,072</span> vector dimensions</div>
            <div className="flex items-center gap-2"><span className="text-white font-bold">&lt;40ms</span> search latency</div>
            <div className="flex items-center gap-2"><span className="text-white font-bold">6</span> IDE integrations</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 border-t border-[#111]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Devs find great repos. <br />
                <span className="text-[#666]">Then lose them forever.</span>
              </h2>
              <p className="text-[#888] text-lg leading-relaxed mb-8">
                You’ve saved hundreds of great repos across browser bookmarks, GitHub stars, Notion pages, and random text files. You never find them when you need them, or worse, you build on a foundation that crumbles.
              </p>
              <div className="space-y-4">
                {[
                  { icon: BookmarkX, text: "Stop losing repos in your scattered bookmarks." },
                  { icon: ShieldAlert, text: "Know immediately when a dependency goes stale or dies." },
                  { icon: Search, text: "Find the right repo by intent, not by exact name." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-[#111] border border-[#222]">
                    <div className="w-10 h-10 rounded bg-[#222] flex items-center justify-center text-[#a3e635]">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-white">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#a3e635]/20 to-transparent blur-3xl rounded-full" />
              <div className="relative bg-[#0a0a0a] border border-[#333] p-6 rounded-xl shadow-2xl">
                <div className="space-y-4">
                  {/* Fake repo cards */}
                  {[
                    { name: 'drizzle-team/drizzle-orm', status: 'Healthy', color: '#a3e635' },
                    { name: 'tannerlinsley/react-query', status: 'Healthy', color: '#a3e635' },
                    { name: 'some-random/abandoned-lib', status: 'Archived', color: '#ef4444' }
                  ].map((repo, i) => (
                    <div key={i} className="p-4 rounded border border-[#222] bg-[#111] flex justify-between items-center">
                      <div className="font-mono text-sm text-white">{repo.name}</div>
                      <div className="text-xs px-2 py-1 rounded bg-black border border-[#333]" style={{ color: repo.color }}>
                        {repo.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-[#050505] border-y border-[#111]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-[#888] text-lg max-w-2xl mx-auto">Three steps from a messy bookmarks folder to a highly-indexed intelligence library.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Add your repos', desc: 'Paste any GitHub URL or bulk import a list of 1,000. Ingested in minutes.' },
              { step: '02', title: 'AI Analysis', desc: 'DeepSeek analyzes tech stack, SaaS readiness, and maintenance health.' },
              { step: '03', title: 'Search & Build', desc: 'Semantic search across your library and connect directly to your IDE.' }
            ].map((s, i) => (
              <div key={i} className="bold-op-card p-8 relative overflow-hidden">
                <div className="text-6xl font-black text-[#111] absolute -top-4 -right-4 select-none">{s.step}</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-[#888] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Core Infrastructure.</h2>
            <p className="text-[#888] text-lg max-w-2xl">Everything you need to manage your personal repository intelligence.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Layers, title: "Bulk Ingestion", desc: "Paste a single repo, an org, or a raw text list of 1000 URLs. We parse and index them instantly." },
              { icon: Brain, title: "DeepSeek Analysis", desc: "Every repo gets a SaaS readiness score, category tag, and maintenance health check. Updated weekly." },
              { icon: Bell, title: "Staleness Alerts", desc: "Get notified the minute a dependency is archived, abandoned, or flags a security vulnerability." },
              { icon: Search, title: "Semantic Search", desc: "Vector embeddings (<40ms latency) let you search by plain English intent, not just keyword matches." },
              { icon: Flame, title: "App Killers Library", desc: "Access 370+ pre-loaded OSS alternatives to expensive SaaS tools. Never pay for standard infrastructure again." },
              { icon: Users, title: "Team Workspaces", desc: "Share your curated library with your team and get AI-recommended projects based on your stack." }
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-[#222] bg-[#0a0a0a] hover:bg-[#111] transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-[#111] border border-[#333] flex items-center justify-center text-[#888] group-hover:text-[#a3e635] transition-colors mb-6">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IDE Integrations */}
      <section className="py-24 px-6 border-y border-[#111] bg-[#050505] overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-12">One API Key. Every IDE.</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-12 items-center">
            {['Replit', 'Bolt', 'Lovable', 'Base44', 'Claude Code', 'Cursor'].map((ide) => (
              <div key={ide} className="flex items-center gap-2 text-xl font-bold text-[#444] hover:text-white transition-colors cursor-pointer">
                <Code2 className="w-6 h-6" /> {ide}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple Pricing.</h2>
            <p className="text-[#888] text-lg">Start for free. Scale when you need API access.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "$0", repos: "100", api: "0", feat: "Basic analysis" },
              { name: "Solo", price: "$12", repos: "500", api: "1", feat: "Full API access + App Killers", highlight: true },
              { name: "Studio", price: "$49", repos: "5000", api: "25", feat: "Team workspaces" }
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl p-8 border ${p.highlight ? 'border-[#a3e635] bg-[#0a0a0a]' : 'border-[#222] bg-[#050505]'}`}>
                <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                <div className="text-4xl font-black text-white mb-6">{p.price}<span className="text-lg text-[#666] font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-[#888]"><Check className="w-4 h-4 text-[#a3e635]" /> {p.repos} repos limit</li>
                  <li className="flex items-center gap-3 text-[#888]"><Check className="w-4 h-4 text-[#a3e635]" /> {p.api} API keys</li>
                  <li className="flex items-center gap-3 text-[#888]"><Check className="w-4 h-4 text-[#a3e635]" /> {p.feat}</li>
                </ul>
                <button className={`w-full py-3 rounded-md font-bold transition-colors ${p.highlight ? 'bg-[#a3e635] text-black hover:bg-[#8cc629]' : 'bg-[#222] text-white hover:bg-[#333]'}`}>
                  Get {p.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA & Footer */}
      <section className="py-24 px-6 border-t border-[#222] bg-[#0a0a0a] text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-[#a3e635] to-transparent opacity-50" />
        <div className="max-w-3xl mx-auto relative z-10">
          <Zap className="w-12 h-12 mx-auto text-[#a3e635] mb-6" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Stop losing your tools.</h2>
          <p className="text-xl text-[#888] mb-10">Join developers organizing their infra stack with RepoHive.</p>
          <button className="bold-op-button px-8 py-4 rounded-md font-bold text-lg flex items-center gap-2 mx-auto">
            Get Started For Free <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-[#111] bg-black text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#a3e635] rounded-sm transform rotate-45 flex items-center justify-center">
              <div className="w-1 h-1 bg-black transform -rotate-45" />
            </div>
            <span className="font-mono font-bold text-sm text-white">RepoHive</span>
          </div>
          <div className="text-[#666] text-sm font-mono">
            © {new Date().getFullYear()} RepoHive Inc. Built for builders.
          </div>
        </div>
      </footer>

    </div>
  );
}
