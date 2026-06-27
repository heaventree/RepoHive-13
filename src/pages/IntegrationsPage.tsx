import React, { useEffect, useState } from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Key, Terminal, Bot, Workflow, Shield, Plug, ArrowRight } from 'lucide-react';

interface IntegrationListItem {
  slug: string;
  name: string;
  domain: string | null;
  category: string;
  tagline: string | null;
  logoUrl: string | null;
  setupType: 'generic' | 'custom';
}

function ToolCard({ tool }: { tool: IntegrationListItem }) {
  return (
    <Link
      to={`/integrations/${tool.slug}`}
      className="rounded-md p-6 flex flex-col gap-3 transition-all hover:border-white/20 group"
      style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-none overflow-hidden">
          {tool.logoUrl ? <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-1.5" /> : <Plug className="w-4 h-4 text-slate-500" />}
        </div>
        <h3 className="font-mono font-bold text-white text-base flex-1">{tool.name}</h3>
        {tool.setupType === 'custom' && (
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded text-purple-300 bg-purple-500/10 border border-purple-500/30 flex-none">Guided</span>
        )}
      </div>
      <p className="text-sm text-slate-400 leading-relaxed flex-1">{tool.tagline}</p>
      <span className="text-xs font-mono text-accent-blue flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        See setup steps <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}

export function IntegrationsPage() {
  const [tools, setTools] = useState<IntegrationListItem[]>([]);

  useEffect(() => {
    fetch('/api/integrations').then(r => r.json()).then(d => { if (Array.isArray(d)) setTools(d); }).catch(() => {});
  }, []);

  const categories = Array.from(new Set(tools.map(t => t.category)));

  return (
    <MarketingPage
      kicker="Integrations"
      title={<>Give your AI build tool <span style={{ color: '#adc6ff' }}>a repo memory.</span></>}
      subtitle="Pick your build tool inside RepoHive, generate a ready-made connection snippet, and connect it in minutes. Once live, tools like Lovable, Cursor, Replit, or Claude Code can search your saved repo library and use it as build context — instead of starting from a blank prompt."
      seo={{
        title: 'Integrations — Connect Your Repo Library to Lovable, Cursor, Claude Code & More',
        description: 'Pick your AI build tool, generate a connection snippet from your RepoHive dashboard, and let it search your saved repos for build context.',
        openGraph: { type: 'website', url: 'https://repohive.app/integrations', siteName: 'RepoHive' },
      }}
    >
      {/* The mental model */}
      <div
        className="rounded-lg p-8 mb-16"
        style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="font-mono font-bold text-white text-lg uppercase tracking-widest mb-6">How the integration flow works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-400">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">1. Pick your build tool</span>
            </div>
            <p>Inside your RepoHive dashboard, choose the platform you want to connect — Lovable, Cursor, Replit, Bolt, or Claude Code.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">2. Get your connection snippet</span>
            </div>
            <p>We generate the API key and setup snippet your tool needs, so you&apos;re not wiring this from scratch.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">3. Build with live repo context</span>
            </div>
            <p>Your AI tool can now query your library in plain English, surface the best-matching repos, and use them while it builds.</p>
          </div>
        </div>
      </div>

      {/* Use-case scenario */}
      <div
        className="rounded-lg p-8 mb-16"
        style={{ background: 'rgba(77,142,255,0.06)', border: '1px solid rgba(77,142,255,0.18)' }}
      >
        <p className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-3">Example: building a project management tool in Lovable</p>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          You tell Lovable what you&apos;re building. Lovable queries your RepoHive library for relevant
          repos — task boards, auth systems, notification layers, file upload tools, self-hosted
          collaboration apps. RepoHive returns the strongest matches from the repos you&apos;ve already
          saved and analyzed.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          From there, Lovable can review the options, weigh fit and warnings, and build using repo patterns
          you&apos;ve already vetted — instead of starting from a blank prompt.
        </p>
      </div>

      {/* Why this matters */}
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h2 className="font-mono font-black text-white text-2xl mb-4">Why this matters</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          AI coding tools are powerful, but they&apos;re often missing your actual stack memory. RepoHive
          gives them access to the repos you&apos;ve already collected, evaluated, and want to reuse — so
          they can start from signal instead of starting from scratch.
        </p>
      </div>

      {/* Tool cards */}
      <h2 className="font-mono font-black text-white text-2xl mb-2 text-center">Works with the agents you already use</h2>
      <p className="text-sm text-slate-500 text-center mb-10 max-w-xl mx-auto">
        {tools.length > 0 ? `${tools.length} connectors and counting — click any tool for exact setup steps.` : 'Loading the connector directory…'}
      </p>
      {categories.map(cat => (
        <div key={cat} className="mb-14">
          <h3 className="font-mono font-bold text-blue-300 text-sm uppercase tracking-widest mb-5">{cat}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.filter(t => t.category === cat).map(t => <React.Fragment key={t.slug}><ToolCard tool={t} /></React.Fragment>)}
          </div>
        </div>
      ))}

      {/* Endpoint example */}
      <div
        className="rounded-lg p-8 mb-16"
        style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="font-mono font-bold text-white text-lg uppercase tracking-widest mb-3 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-blue-400" /> What your AI tool gets back
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          RepoHive returns structured repo intelligence your build tool can actually use — owner/name, URL, AI summary, category, tags, score, and stars for every match.
        </p>
        <pre className="text-[12px] font-mono p-4 rounded overflow-x-auto"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', color: '#adc6ff' }}>
{`GET https://repohive.cloud/api/external/repos?apiKey=rh_xxxxx&q=auth

{
  "count": 6,
  "repos": [
    {
      "id": "supabase/auth",
      "owner": "supabase", "name": "auth",
      "url": "https://github.com/supabase/auth",
      "score": 87, "language": "Go", "stars": 14200,
      "description": "JWT-based user management API.",
      "ai_analysis": {
        "category": "Security",
        "tags": ["auth", "jwt", "oauth"],
        "summary": "Drop-in self-hostable auth server …",
        "productClass": "app-killer",
        "comparableApp": "Auth0",
        "demoUrl": null,
        "enterpriseTier": true
      }
    },
    …
  ]
}`}
        </pre>
      </div>

      {/* Security */}
      <FeatureCard
        icon={Shield}
        title="API keys, done properly"
        body={
          <>
            <p>Keys are <strong className="text-white">shown once, then hashed</strong> — we never store the plaintext. Revoke any key at any time, and rotate when you want. Studio plans get 25 keys (one per seat).</p>
            <p>Plan limits are enforced at the API layer too: a key only sees the library it belongs to, scoped to its tenant.</p>
          </>
        }
      />

      {/* CTA */}
      <div className="text-center mt-16">
        <Link
          to="/sign-up"
          className="inline-block px-8 py-4 rounded-md font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#4d8eff', color: '#00285d', boxShadow: '0 0 24px rgba(77,142,255,0.4)' }}
        >
          Generate your integration
        </Link>
        <p className="text-xs text-slate-500 mt-3 font-mono">Solo and Studio plans. Free plan can preview without API access.</p>
      </div>
    </MarketingPage>
  );
}
