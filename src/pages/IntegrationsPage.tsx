import React from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Key, Terminal, Code2, Bot, Workflow, Shield } from 'lucide-react';

const TOOLS = [
  { name: 'Cursor',       blurb: 'Bring your curated repo brain into the AI IDE that&apos;s rewriting how you code.' },
  { name: 'Claude Code',  blurb: 'Give Claude a list of repos it&apos;s allowed to recommend — pre-vetted by you.' },
  { name: 'Replit',       blurb: 'Replit Agent can query your library to scaffold from components you already trust.' },
  { name: 'Lovable',      blurb: 'Lovable builds faster when it can read from a private library of proven primitives.' },
  { name: 'Bolt.new',     blurb: 'Wire RepoHive in as a knowledge source so generated apps reach for the right stack.' },
  { name: 'GitHub Copilot', blurb: 'Use RepoHive as the "ground truth" your prompts can reference by name.' },
];

export function IntegrationsPage() {
  return (
    <MarketingPage
      kicker="Integrations"
      title={<>Plug RepoHive into <span style={{ color: '#adc6ff' }}>any AI coding tool.</span></>}
      subtitle="RepoHive ships a simple authenticated HTTP API. Generate a key, paste it into the agent of your choice, and your hand-picked open-source library becomes the source of truth the AI builds with."
      seo={{
        title: 'Integrations — Connect RepoHive to Cursor, Claude, Copilot & More',
        description: 'Use RepoHive\'s REST API to wire your curated repo library into Cursor, Claude Code, Replit, Bolt, Lovable, and any other AI coding tool.',
        openGraph: { type: 'website', url: 'https://repohive.app/integrations', siteName: 'RepoHive' },
      }}
    >
      {/* The mental model */}
      <div
        className="rounded-2xl p-8 mb-16"
        style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="font-mono font-bold text-white text-lg uppercase tracking-widest mb-6">The idea</h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-400">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">1. Generate a key</span>
            </div>
            <p>In RepoHive → API → Generate. You get an <code className="text-blue-400">rh_…</code> key. Shown once; copy it.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">2. Paste it into your tool</span>
            </div>
            <p>Every agent has a "custom HTTP source" or "knowledge connector" slot. Drop the key + endpoint URL in.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">3. Ask in plain English</span>
            </div>
            <p>"Use a self-hostable Slack alternative." The agent queries your library and builds with what&apos;s there.</p>
          </div>
        </div>
      </div>

      {/* Tool cards */}
      <h2 className="font-mono font-black text-white text-2xl mb-8 text-center">Works with the agents you already use</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {TOOLS.map(t => (
          <div
            key={t.name}
            className="rounded-xl p-6"
            style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3 className="font-mono font-bold text-white text-lg mb-2 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" /> {t.name}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.blurb }} />
          </div>
        ))}
      </div>

      {/* Endpoint example */}
      <div
        className="rounded-2xl p-8 mb-16"
        style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="font-mono font-bold text-white text-lg uppercase tracking-widest mb-3 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-blue-400" /> What the API returns
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          A simple JSON list with everything an agent needs to reason about a repo — owner/name, URL, AI summary, category, tags, score, and stars.
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
        "enterpriseTier": true,
        "comparableApp": "Auth0"
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
          className="inline-block px-8 py-4 rounded-xl font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#4d8eff', color: '#00285d', boxShadow: '0 0 24px rgba(77,142,255,0.4)' }}
        >
          Get your API key
        </Link>
        <p className="text-xs text-slate-500 mt-3 font-mono">Solo and Studio plans. Free plan can preview without API access.</p>
      </div>
    </MarketingPage>
  );
}
