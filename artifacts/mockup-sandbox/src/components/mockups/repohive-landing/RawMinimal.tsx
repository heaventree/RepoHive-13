import React from 'react';
import { ArrowRight, Search, Activity, Box, Database, Zap, BookOpen, ShieldAlert, Check, Terminal } from 'lucide-react';

export function RawMinimal() {
  return (
    <div className="font-['Space_Grotesk',sans-serif] bg-[#FAFAFA] text-black min-h-screen selection:bg-[#0000FF] selection:text-white flex flex-col">
      <style dangerouslySetInlineStyle={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .rm-border { border-color: #E5E5E5; }
        .rm-border-b { border-bottom: 1px solid #E5E5E5; }
        .rm-border-t { border-top: 1px solid #E5E5E5; }
        .rm-border-l { border-left: 1px solid #E5E5E5; }
        .rm-border-r { border-right: 1px solid #E5E5E5; }
      `}} />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 rm-border-b bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          <span className="font-bold text-lg tracking-tight">RepoHive</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          <a href="#how" className="hover:text-black transition-colors">How it works</a>
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium hover:text-[#0000FF] transition-colors hidden md:block">Log in</button>
          <button className="text-sm font-bold bg-black text-white px-4 py-2 rounded hover:bg-[#0000FF] transition-colors">
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 py-24 md:py-32 flex flex-col items-center text-center rm-border-b bg-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-widest bg-gray-100 rm-border rounded-full mb-8">
          <span className="w-2 h-2 bg-[#0000FF] rounded-full animate-pulse"></span>
          Now indexing 374+ Repos
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] max-w-5xl mb-6">
          All your repos.<br />Under your control.
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 font-medium">
          Paste any GitHub URL. Get AI-analyzed cards with scores, tags, and plain-English semantic search across your whole library.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button className="flex items-center gap-2 text-base font-bold bg-black text-white px-6 py-3.5 rounded hover:bg-[#0000FF] transition-colors">
            Add your repos <ArrowRight className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 text-base font-bold bg-white text-black border border-black px-6 py-3.5 rounded hover:bg-gray-50 transition-colors">
            View Demo
          </button>
        </div>
      </header>

      {/* Stats Marquee */}
      <div className="flex items-center overflow-hidden py-4 rm-border-b bg-[#FAFAFA] text-xs font-mono uppercase tracking-widest text-gray-500 whitespace-nowrap">
        <div className="flex animate-marquee gap-12">
          <span>374+ repos analysed</span> •
          <span>3,072 vector dimensions</span> •
          <span>&lt;40ms search latency</span> •
          <span>6 IDE integrations</span> •
          <span>374+ repos analysed</span> •
          <span>3,072 vector dimensions</span> •
          <span>&lt;40ms search latency</span> •
          <span>6 IDE integrations</span>
        </div>
      </div>

      {/* Mockup Section */}
      <section className="p-6 md:p-12 rm-border-b bg-white flex justify-center">
        <div className="w-full max-w-5xl border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-md overflow-hidden bg-white">
          <div className="flex items-center px-4 py-3 rm-border-b bg-gray-50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full border border-black"></div>
              <div className="w-3 h-3 rounded-full border border-black"></div>
              <div className="w-3 h-3 rounded-full border border-black"></div>
            </div>
            <div className="mx-auto text-xs font-mono text-gray-400">repohive / library</div>
          </div>
          <div className="p-4 md:p-6 grid gap-4">
            <div className="flex items-center gap-3 p-3 rm-border rounded focus-within:border-black transition-colors bg-white">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by intent, e.g. 'auth for react'..." className="w-full text-sm outline-none font-medium placeholder-gray-400" />
            </div>
            
            <div className="flex flex-col border border-gray-200 rounded divide-y divide-gray-200 overflow-x-auto">
              <div className="flex items-center justify-between p-4 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[600px]">
                <div className="w-1/3">Repository</div>
                <div className="w-1/4">Category</div>
                <div className="w-1/4">Health</div>
                <div className="w-[100px] text-right">Score</div>
              </div>
              
              {[
                { repo: 'supabase/auth-ui', cat: 'Authentication', health: 'Excellent', score: 98, color: '#0000FF' },
                { repo: 'clerk/javascript', cat: 'Authentication', health: 'Excellent', score: 95, color: '#0000FF' },
                { repo: 'drizzle-orm/drizzle', cat: 'Database ORM', health: 'Good', score: 88, color: 'black' },
                { repo: 'shadcn-ui/ui', cat: 'Component Library', health: 'Excellent', score: 99, color: '#0000FF' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 text-sm font-medium hover:bg-gray-50 min-w-[600px] transition-colors">
                  <div className="w-1/3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    {item.repo}
                  </div>
                  <div className="w-1/4 text-gray-500">{item.cat}</div>
                  <div className="w-1/4 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    {item.health}
                  </div>
                  <div className="w-[100px] text-right font-mono font-bold" style={{ color: item.color }}>{item.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6 rm-border-b bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 md:w-2/3">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">You collect repos.<br/>Then you lose them.</h2>
            <p className="text-gray-500 text-lg">Devs find great tools, star them on GitHub, save them in Notion, and then completely forget they exist when it's time to build.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            <div>
              <div className="w-10 h-10 border border-black flex items-center justify-center rounded mb-4">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl mb-2">The Black Hole</h3>
              <p className="text-gray-600 text-sm leading-relaxed">You've saved hundreds of great repos across browser bookmarks and GitHub stars. You never find them when you need them.</p>
            </div>
            <div>
              <div className="w-10 h-10 border border-black flex items-center justify-center rounded mb-4 bg-black text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl mb-2">Silent Decay</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Archived, abandoned, license-changed. You don't know until you've already built your foundation on a dead project.</p>
            </div>
            <div>
              <div className="w-10 h-10 border border-black flex items-center justify-center rounded mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl mb-2">Keyword Hell</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Searching by repo name doesn't work when you're looking for a solution. You need to search by intent, not exact match.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 rm-border-b bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-center">Three steps to control.</h2>
          
          <div className="grid md:grid-cols-3 gap-0 border border-black rounded-md overflow-hidden">
            <div className="p-8 md:p-10 rm-border-b md:rm-border-b-0 md:rm-border-r bg-white hover:bg-gray-50 transition-colors">
              <div className="text-4xl font-mono font-bold text-gray-300 mb-6">01</div>
              <h3 className="text-2xl font-bold mb-3">Add repos</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Paste any GitHub URL. Single repo, org, or a bulk list of 1000. Ingested in minutes.</p>
            </div>
            <div className="p-8 md:p-10 rm-border-b md:rm-border-b-0 md:rm-border-r bg-white hover:bg-gray-50 transition-colors">
              <div className="text-4xl font-mono font-bold text-gray-300 mb-6">02</div>
              <h3 className="text-2xl font-bold mb-3">AI Analysis</h3>
              <p className="text-gray-500 text-sm leading-relaxed">DeepSeek reads every repo: tech stack, SaaS readiness, maintenance health. Updated weekly.</p>
            </div>
            <div className="p-8 md:p-10 bg-white hover:bg-gray-50 transition-colors">
              <div className="text-4xl font-mono font-bold text-[#0000FF] mb-6">03</div>
              <h3 className="text-2xl font-bold mb-3">Search & Build</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Ask in plain English. Get staleness alerts. Pull your library into your IDE via API.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 rm-border-b bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Core Infrastructure.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
            {[
              { title: "Semantic Search", desc: "Plain-English search across YOUR curated library. Vector embeddings, <40ms response time.", icon: <Search className="w-5 h-5"/> },
              { title: "Staleness Alerts", desc: "Know the minute a dependency is archived, abandoned, license-changed, or has a security flag.", icon: <Activity className="w-5 h-5"/> },
              { title: "App Killers Library", desc: "370+ pre-loaded OSS alternatives to expensive SaaS tools, ready to deploy.", icon: <Database className="w-5 h-5"/> },
              { title: "Team Workspaces", desc: "Shared repo library + AI-curated project recommendations for the whole studio.", icon: <Box className="w-5 h-5"/> }
            ].map((f, i) => (
              <div key={i} className="bg-[#FAFAFA] p-8 md:p-12 flex flex-col hover:bg-white transition-colors">
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

      {/* Integrations */}
      <section className="py-20 px-6 rm-border-b bg-white overflow-hidden flex flex-col items-center">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8 text-center">Connects to your workflow</h2>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-2xl md:text-3xl font-bold text-gray-300">
          <span className="hover:text-black transition-colors cursor-default">Replit</span>
          <span className="hover:text-black transition-colors cursor-default">Bolt</span>
          <span className="hover:text-black transition-colors cursor-default">Lovable</span>
          <span className="hover:text-black transition-colors cursor-default">Base44</span>
          <span className="hover:text-black transition-colors cursor-default">Claude Code</span>
          <span className="hover:text-black transition-colors cursor-default">Cursor</span>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 rm-border-b bg-[#FAFAFA]">
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
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-gray-400"/> 100 repos</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-gray-400"/> Basic AI analysis</li>
              </ul>
              <button className="w-full py-3 border border-black font-bold rounded hover:bg-black hover:text-white transition-colors">Current Plan</button>
            </div>
            
            {/* Solo */}
            <div className="border-2 border-[#0000FF] bg-white p-8 flex flex-col relative shadow-[8px_8px_0px_0px_rgba(0,0,255,0.1)]">
              <div className="absolute top-0 right-0 bg-[#0000FF] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">Most Popular</div>
              <h3 className="text-xl font-bold mb-1">Solo</h3>
              <p className="text-gray-500 text-sm mb-6">For the serious builder.</p>
              <div className="text-4xl font-bold mb-8">$12<span className="text-lg text-gray-400 font-medium">/mo</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-[#0000FF]"/> 500 repos</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-[#0000FF]"/> 1 API key for IDEs</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-[#0000FF]"/> App Killers library</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-[#0000FF]"/> Priority search latency</li>
              </ul>
              <button className="w-full py-3 bg-[#0000FF] text-white font-bold rounded hover:bg-blue-700 transition-colors">Upgrade to Solo</button>
            </div>
            
            {/* Studio */}
            <div className="border border-black bg-white p-8 flex flex-col">
              <h3 className="text-xl font-bold mb-1">Studio</h3>
              <p className="text-gray-500 text-sm mb-6">For teams and agencies.</p>
              <div className="text-4xl font-bold mb-8">$49<span className="text-lg text-gray-400 font-medium">/mo</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-gray-400"/> 5,000 repos</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-gray-400"/> 25 API keys</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="w-4 h-4 text-gray-400"/> Shared workspaces</li>
              </ul>
              <button className="w-full py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition-colors">Get Studio</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Footer */}
      <footer className="bg-black text-white px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Ready to index?</h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl">Join the developers organizing their intelligence. Free forever for your first 100 repos.</p>
        <button className="text-lg font-bold bg-white text-black px-8 py-4 rounded hover:bg-[#0000FF] hover:text-white transition-colors mb-24">
          Start your library
        </button>
        
        <div className="w-full max-w-6xl rm-border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-white" />
            <span className="text-white font-bold">RepoHive</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <div>© 2024 RepoHive Inc.</div>
        </div>
      </footer>
    </div>
  );
}
