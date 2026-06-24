import React, { useState, useEffect } from 'react';
import { Terminal, Database, ShieldAlert, Search, Zap, Code, Command, CheckSquare, Layers, Users, Key, AlertTriangle, ArrowRight, Github } from 'lucide-react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap');

  .hacker-theme {
    font-family: 'Fira Code', monospace;
    background-color: #050505;
    color: #00ff41;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  .hacker-theme::before {
    content: " ";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    z-index: 50;
    background-size: 100% 2px, 3px 100%;
    pointer-events: none;
  }

  .hacker-glow {
    text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
  }
  
  .hacker-glow-amber {
    text-shadow: 0 0 5px rgba(255, 176, 0, 0.5);
  }

  .hacker-border {
    border: 1px solid #00ff41;
    box-shadow: inset 0 0 10px rgba(0, 255, 65, 0.1), 0 0 10px rgba(0, 255, 65, 0.1);
  }

  .hacker-border-amber {
    border: 1px solid #ffb000;
    box-shadow: inset 0 0 10px rgba(255, 176, 0, 0.1), 0 0 10px rgba(255, 176, 0, 0.1);
  }

  .hacker-bg {
    background-color: rgba(0, 255, 65, 0.05);
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .cursor-blink {
    animation: blink 1s step-end infinite;
  }

  /* Scrollbar */
  .hacker-theme::-webkit-scrollbar {
    width: 10px;
  }
  .hacker-theme::-webkit-scrollbar-track {
    background: #050505;
    border-left: 1px solid #00ff41;
  }
  .hacker-theme::-webkit-scrollbar-thumb {
    background: #00ff41;
  }
  
  ::selection {
    background: #00ff41;
    color: #050505;
  }
`;

function TerminalHero() {
  const [lines, setLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  
  const script = [
    "> repohive ingest https://github.com/supabase/auth-ui",
    "[i] Connecting to GitHub API...",
    "[i] Fetching repository metadata...",
    "[i] Stars: 3,241 | License: Apache 2.0",
    "[i] Running DeepSeek AI analysis...",
    "[+] SaaS readiness score: 98/100",
    "[+] Stack identified: React, TypeScript, Tailwind",
    "[i] Generating 3072-dim vector embeddings...",
    "[+] Ingestion complete. Search active in <40ms.",
    "> _"
  ];

  useEffect(() => {
    let currentLine = 0;
    let timeout: NodeJS.Timeout;

    const pushLine = () => {
      if (currentLine < script.length) {
        setLines(prev => [...prev, script[currentLine]]);
        currentLine++;
        timeout = setTimeout(pushLine, currentLine === 1 ? 800 : currentLine === script.length - 1 ? 200 : 600);
      } else {
        setIsTyping(false);
      }
    };

    timeout = setTimeout(pushLine, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="hacker-border bg-[#0a0a0a] p-6 rounded-sm w-full max-w-2xl font-mono text-sm leading-relaxed relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-6 border-b border-[#00ff41] bg-[#00ff41]/10 flex items-center px-4 justify-between">
        <span className="text-[#00ff41] text-xs">repohive_terminal_v1.4.2</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ff41]/50"></div>
          <div className="w-2 h-2 rounded-full bg-[#ffb000]/50"></div>
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
        </div>
      </div>
      <div className="mt-6">
        {lines.map((line, i) => (
          <div key={i} className={`mb-1 ${line.startsWith('>') ? 'text-[#00ff41] hacker-glow' : line.startsWith('[+]') ? 'text-[#00ff41]' : 'text-gray-400'}`}>
            {line === '> _' ? <span>&gt; <span className="inline-block w-2 h-4 bg-[#00ff41] cursor-blink align-middle"></span></span> : line}
          </div>
        ))}
        {isTyping && lines.length > 0 && lines[lines.length - 1] !== '> _' && (
          <div className="mb-1 text-[#00ff41]">
            <span className="inline-block w-2 h-4 bg-[#00ff41] cursor-blink align-middle"></span>
          </div>
        )}
      </div>
    </div>
  );
}

export function HackerTerminal() {
  return (
    <>
      <style>{STYLE}</style>
      <div className="hacker-theme text-[#00ff41]">
        
        {/* Navbar */}
        <nav className="border-b border-[#00ff41]/30 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-[#050505]/90 backdrop-blur z-40">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-[#00ff41] hacker-glow" />
            <span className="text-xl font-bold tracking-widest hacker-glow uppercase">REPOHIVE</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm text-[#00ff41]/70">
            <a href="#features" className="hover:text-[#00ff41] transition-colors">[ Features ]</a>
            <a href="#how-it-works" className="hover:text-[#00ff41] transition-colors">[ Workflow ]</a>
            <a href="#pricing" className="hover:text-[#00ff41] transition-colors">[ Pricing ]</a>
          </div>
          <button className="hacker-border px-4 py-2 text-sm hover:bg-[#00ff41] hover:text-[#050505] transition-all font-bold uppercase tracking-wider">
            INIT_SESSION
          </button>
        </nav>

        <main className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-32">
          
          {/* Hero */}
          <section className="flex flex-col lg:flex-row items-center gap-16 min-h-[70vh]">
            <div className="flex-1 space-y-8 z-10">
              <div className="inline-flex items-center gap-2 border border-[#ffb000] text-[#ffb000] px-3 py-1 text-xs uppercase tracking-widest hacker-glow-amber">
                <AlertTriangle className="w-4 h-4" />
                <span>System Online: 374+ Repos Analysed</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase leading-tight hacker-glow tracking-tight">
                All your repos.<br/>
                <span className="text-transparent" style={{ WebkitTextStroke: '1px #00ff41' }}>Under your control.</span>
              </h1>
              <p className="text-xl text-[#00ff41]/80 max-w-xl border-l-2 border-[#00ff41] pl-4">
                Analysed. Monitored. Searchable. <br/>
                Paste any GitHub URL and get AI-analyzed repo cards with scores, tags, and plain-English semantic search across your whole library.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="bg-[#00ff41] text-[#050505] px-8 py-3 font-bold uppercase tracking-wider hover:bg-[#00ff41]/80 transition-colors flex items-center gap-2">
                  <Terminal className="w-5 h-5" /> Start Ingestion
                </button>
                <button className="hacker-border px-8 py-3 text-[#00ff41] font-bold uppercase tracking-wider hover:bg-[#00ff41]/10 transition-colors">
                  Read The Docs
                </button>
              </div>
              
              <div className="flex gap-8 text-sm text-[#00ff41]/60 pt-8 border-t border-[#00ff41]/20">
                <div className="flex flex-col">
                  <span className="text-xl text-[#00ff41] font-bold hacker-glow">3,072</span>
                  <span className="uppercase text-xs tracking-wider">Vector Dimensions</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl text-[#ffb000] font-bold hacker-glow-amber">&lt;40ms</span>
                  <span className="uppercase text-xs tracking-wider">Search Latency</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl text-[#00ff41] font-bold hacker-glow">6</span>
                  <span className="uppercase text-xs tracking-wider">IDE Integrations</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full flex justify-end relative z-10">
              <TerminalHero />
            </div>
          </section>

          <div className="w-full text-center text-[#00ff41]/30 select-none">
            ========================================================================
          </div>

          {/* Pain Points */}
          <section id="problem" className="relative z-10">
            <h2 className="text-3xl font-bold uppercase mb-12 hacker-glow flex items-center gap-4">
              <span className="text-[#ffb000]">ERR_LOST_TRACK:</span> Why you need this
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Database />, title: "The Bookmark Graveyard", desc: "You find great repos, star them, and lose them forever in the abyss of browser bookmarks and Notion pages." },
                { icon: <ShieldAlert />, title: "Silent Deprecation", desc: "Dependencies get archived, abandoned, or change licenses while you aren't looking. You build on crumbling foundations." },
                { icon: <Search />, title: "Keyword Guessing", desc: "You know you saved an auth UI library last month, but can't remember the name. Standard search fails you." }
              ].map((point, i) => (
                <div key={i} className="border border-[#00ff41]/30 p-6 bg-[#050505] hover:bg-[#00ff41]/5 transition-colors group relative">
                  <div className="absolute top-0 right-0 p-2 text-[#00ff41]/30 text-xs font-bold">0{i+1}</div>
                  <div className="text-[#ffb000] mb-4 group-hover:hacker-glow-amber transition-all">{point.icon}</div>
                  <h3 className="text-lg font-bold uppercase mb-2 text-[#00ff41]">{point.title}</h3>
                  <p className="text-sm text-[#00ff41]/70 leading-relaxed">{point.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" className="relative z-10 py-12 hacker-border bg-[#00ff41]/5 p-8 md:p-12">
            <h2 className="text-2xl font-bold uppercase mb-8 hacker-glow text-center border-b border-[#00ff41]/30 pb-4">
              [ EXECUTE WORKFLOW ]
            </h2>
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-[#00ff41]/30 -z-10"></div>
              {[
                { step: "01. INGEST", icon: <Github />, desc: "Paste any GitHub URL. Single repo, org, or bulk list of 1,000. Ingested in minutes." },
                { step: "02. ANALYZE", icon: <Zap />, desc: "DeepSeek extracts tech stack, SaaS readiness, maintenance health, and category." },
                { step: "03. QUERY", icon: <Command />, desc: "Use plain-English semantic search across your curated library. Get instant answers." }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center bg-[#050505] p-6 border border-[#00ff41]/50">
                  <div className="w-12 h-12 rounded-none border border-[#00ff41] flex items-center justify-center bg-[#050505] mb-4 text-[#00ff41]">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold uppercase mb-2 tracking-wider">{step.step}</h3>
                  <p className="text-sm text-[#00ff41]/70">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="relative z-10">
            <h2 className="text-3xl font-bold uppercase mb-12 hacker-glow">
              {'>'} SYSTEM_CAPABILITIES
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Layers />, title: "Bulk Import", desc: "Paste any GitHub URL (single repo, org, or bulk list of 1000) → ingested in minutes." },
                { icon: <Zap />, title: "DeepSeek Analysis", desc: "Tech stack, SaaS readiness score, maintenance health, category — updated weekly." },
                { icon: <AlertTriangle />, title: "Staleness Alerts", desc: "Know the minute a dependency is archived, abandoned, license-changed, or has a security flag." },
                { icon: <Search />, title: "Semantic Search", desc: "Plain-English semantic search across YOUR curated library (vector embeddings, <40ms)." },
                { icon: <Code />, title: "App Killers Library", desc: "370+ pre-loaded OSS alternatives to expensive SaaS tools ready to deploy." },
                { icon: <Users />, title: "Team Workspaces", desc: "Shared repo library + AI-curated project recommendations for your entire crew." }
              ].map((f, i) => (
                <div key={i} className="border-l-2 border-[#00ff41] bg-[#00ff41]/5 p-6 hover:bg-[#00ff41]/10 transition-colors">
                  <div className="flex items-center gap-3 mb-3 text-[#ffb000]">
                    {f.icon}
                    <h3 className="text-[#00ff41] font-bold uppercase tracking-wider">{f.title}</h3>
                  </div>
                  <p className="text-sm text-[#00ff41]/70">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* IDE Integrations */}
          <section className="relative z-10 py-16 border-y border-[#00ff41]/30 text-center overflow-hidden flex flex-col items-center">
            <div className="text-sm uppercase tracking-widest text-[#00ff41]/60 mb-8">
              Connect to your environment via single API key
            </div>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center w-full max-w-4xl">
              {['Replit', 'Bolt', 'Lovable', 'Base44', 'Claude Code', 'Cursor'].map(ide => (
                <div key={ide} className="text-xl md:text-2xl font-bold text-[#00ff41]/40 hover:text-[#00ff41] hover:hacker-glow transition-all cursor-crosshair">
                  {ide}
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="relative z-10">
            <h2 className="text-3xl font-bold uppercase mb-12 hacker-glow text-center">
              ACCESS_TIERS
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free */}
              <div className="border border-[#00ff41]/30 p-8 bg-[#050505] flex flex-col">
                <h3 className="text-xl font-bold uppercase mb-2">Free</h3>
                <div className="text-4xl font-bold mb-6 text-[#00ff41]">$0<span className="text-sm font-normal text-[#00ff41]/60">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]/80"><CheckSquare className="w-4 h-4 text-[#00ff41] shrink-0" /> 100 Repositories</li>
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]/80"><CheckSquare className="w-4 h-4 text-[#00ff41] shrink-0" /> Basic AI Analysis</li>
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]/80"><CheckSquare className="w-4 h-4 text-[#00ff41] shrink-0" /> Semantic Search</li>
                </ul>
                <button className="w-full border border-[#00ff41] py-3 uppercase tracking-wider font-bold hover:bg-[#00ff41]/20 transition-colors">
                  Select_Free
                </button>
              </div>

              {/* Solo */}
              <div className="hacker-border bg-[#00ff41]/10 p-8 flex flex-col relative transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-[#00ff41] text-[#050505] text-xs font-bold px-3 py-1 uppercase tracking-widest">
                  Recommended
                </div>
                <h3 className="text-xl font-bold uppercase mb-2">Solo</h3>
                <div className="text-4xl font-bold mb-6 text-[#00ff41] hacker-glow">$15<span className="text-sm font-normal text-[#00ff41]/60">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]"><CheckSquare className="w-4 h-4 text-[#ffb000] shrink-0" /> 500 Repositories</li>
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]"><CheckSquare className="w-4 h-4 text-[#ffb000] shrink-0" /> 1 IDE API Key</li>
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]"><CheckSquare className="w-4 h-4 text-[#ffb000] shrink-0" /> App Killers Library</li>
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]"><CheckSquare className="w-4 h-4 text-[#ffb000] shrink-0" /> Staleness Alerts</li>
                </ul>
                <button className="w-full bg-[#00ff41] text-[#050505] py-3 uppercase tracking-wider font-bold hover:bg-[#00ff41]/80 transition-colors">
                  Select_Solo
                </button>
              </div>

              {/* Studio */}
              <div className="border border-[#00ff41]/30 p-8 bg-[#050505] flex flex-col">
                <h3 className="text-xl font-bold uppercase mb-2">Studio</h3>
                <div className="text-4xl font-bold mb-6 text-[#00ff41]">$49<span className="text-sm font-normal text-[#00ff41]/60">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]/80"><CheckSquare className="w-4 h-4 text-[#00ff41] shrink-0" /> 5000 Repositories</li>
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]/80"><CheckSquare className="w-4 h-4 text-[#00ff41] shrink-0" /> 25 IDE API Keys</li>
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]/80"><CheckSquare className="w-4 h-4 text-[#00ff41] shrink-0" /> Team Workspaces</li>
                  <li className="flex items-start gap-2 text-sm text-[#00ff41]/80"><CheckSquare className="w-4 h-4 text-[#00ff41] shrink-0" /> Priority Support</li>
                </ul>
                <button className="w-full border border-[#00ff41] py-3 uppercase tracking-wider font-bold hover:bg-[#00ff41]/20 transition-colors">
                  Select_Studio
                </button>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative z-10 text-center py-20 hacker-border bg-black/50">
            <h2 className="text-4xl font-bold uppercase mb-6 hacker-glow">Ready to compile?</h2>
            <p className="text-[#00ff41]/80 mb-8 max-w-xl mx-auto">
              Stop losing track of valuable open source. Build your ultimate personal registry today.
            </p>
            <button className="bg-[#00ff41] text-[#050505] px-10 py-4 font-bold uppercase tracking-widest text-lg hover:bg-[#00ff41]/80 transition-all flex items-center gap-3 mx-auto">
              Initialize Account <ArrowRight className="w-5 h-5" />
            </button>
          </section>

          {/* Footer */}
          <footer className="border-t border-[#00ff41]/30 pt-12 pb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
            <div className="flex items-center gap-2 text-[#00ff41]/60">
              <Terminal className="w-5 h-5" />
              <span className="font-bold tracking-widest uppercase">REPOHIVE</span>
              <span className="text-xs ml-2">© 2025 // SECURE</span>
            </div>
            <div className="flex gap-6 text-sm text-[#00ff41]/60">
              <a href="#" className="hover:text-[#00ff41] uppercase tracking-wider">Twitter</a>
              <a href="#" className="hover:text-[#00ff41] uppercase tracking-wider">GitHub</a>
              <a href="#" className="hover:text-[#00ff41] uppercase tracking-wider">Docs</a>
            </div>
          </footer>

        </main>
      </div>
    </>
  );
}
