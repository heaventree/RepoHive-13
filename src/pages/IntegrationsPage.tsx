import React, { useEffect, useState } from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Key, Terminal, Bot, Workflow, Shield, Plug, ArrowRight } from 'lucide-react';

const ACCENT = '#FF5C00';
const HAIRLINE = '#E5E5E5';

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
      className="rounded-md p-6 flex flex-col gap-3 bg-white border transition-colors hover:border-black group"
      style={{ borderColor: HAIRLINE }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded border border-black flex items-center justify-center flex-none overflow-hidden">
          {tool.logoUrl ? <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-1.5" /> : <Plug className="w-4 h-4 text-black" />}
        </div>
        <h3 className="font-bold text-black text-base flex-1 tracking-tight">{tool.name}</h3>
        {tool.setupType === 'custom' && (
          <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded text-[#FF5C00] bg-gray-100 border flex-none" style={{ borderColor: HAIRLINE }}>Guided</span>
        )}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed flex-1">{tool.tagline}</p>
      <span className="text-xs font-mono text-[#FF5C00] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      title={<>Plug RepoHive into <span style={{ color: ACCENT }}>any AI coding tool.</span></>}
      subtitle="RepoHive ships a simple authenticated HTTP API. Generate a key, paste it into the agent of your choice, and your hand-picked open-source library becomes the source of truth the AI builds with."
      seo={{
        title: 'Integrations — Connect RepoHive to Cursor, Claude, Copilot & More',
        description: 'Use RepoHive\'s REST API to wire your curated repo library into Cursor, Claude Code, Replit, Bolt, Lovable, and any other AI coding tool.',
        openGraph: { type: 'website', url: 'https://repohive.app/integrations', siteName: 'RepoHive' },
      }}
    >
      {/* The mental model */}
      <div className="rounded-md p-8 mb-16 bg-white border" style={{ borderColor: HAIRLINE }}>
        <h2 className="font-mono font-bold text-black text-lg uppercase tracking-widest mb-6">The idea</h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-[#FF5C00]" />
              <span className="text-black font-bold">1. Generate a key</span>
            </div>
            <p>In RepoHive → API → Generate. You get an <code className="font-mono text-[#FF5C00]">rh_…</code> key. Shown once; copy it.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-[#FF5C00]" />
              <span className="text-black font-bold">2. Paste it into your tool</span>
            </div>
            <p>Every agent has a "custom HTTP source" or "knowledge connector" slot. Drop the key + endpoint URL in.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-[#FF5C00]" />
              <span className="text-black font-bold">3. Ask in plain English</span>
            </div>
            <p>"Use a self-hostable Slack alternative." The agent queries your library and builds with what&apos;s there.</p>
          </div>
        </div>
      </div>

      {/* Tool cards */}
      <h2 className="font-bold text-black text-2xl mb-2 text-center tracking-tight">Works with the agents you already use</h2>
      <p className="text-sm text-gray-500 text-center mb-10 max-w-xl mx-auto">
        {tools.length > 0 ? `${tools.length} connectors and counting — click any tool for exact setup steps.` : 'Loading the connector directory…'}
      </p>
      {categories.map(cat => (
        <div key={cat} className="mb-14">
          <h3 className="font-mono font-bold text-[#FF5C00] text-sm uppercase tracking-widest mb-5">{cat}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.filter(t => t.category === cat).map(t => <React.Fragment key={t.slug}><ToolCard tool={t} /></React.Fragment>)}
          </div>
        </div>
      ))}

      {/* Endpoint example */}
      <div className="rounded-md p-8 mb-16 bg-white border" style={{ borderColor: HAIRLINE }}>
        <h2 className="font-mono font-bold text-black text-lg uppercase tracking-widest mb-3 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-[#FF5C00]" /> What the API returns
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          A simple JSON list with everything an agent needs to reason about a repo — owner/name, URL, AI summary, category, tags, score, and stars.
        </p>
        <pre className="text-[12px] font-mono p-4 rounded overflow-x-auto bg-[#FAFAFA] border text-gray-700"
          style={{ borderColor: HAIRLINE }}>
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
            <p>Keys are <strong className="text-black">shown once, then hashed</strong> — we never store the plaintext. Revoke any key at any time, and rotate when you want. Studio plans get 25 keys (one per seat).</p>
            <p>Plan limits are enforced at the API layer too: a key only sees the library it belongs to, scoped to its tenant.</p>
          </>
        }
      />

      {/* CTA */}
      <div className="text-center mt-16">
        <Link
          to="/sign-up"
          className="inline-block px-8 py-4 rounded font-mono text-sm font-bold tracking-widest uppercase bg-black text-white transition-colors hover:bg-[#FF5C00] active:scale-[0.98]"
        >
          Get your API key
        </Link>
        <p className="text-xs text-gray-500 mt-3 font-mono">Solo and Studio plans. Free plan can preview without API access.</p>
      </div>
    </MarketingPage>
  );
}
