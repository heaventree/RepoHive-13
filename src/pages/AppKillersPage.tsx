import React from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Flame, Shield, Server, Zap, CheckCircle2, Search, Target, Bot } from 'lucide-react';

const KILLER_EXAMPLES = [
  { name: 'Supabase',  replaces: 'Firebase', cat: 'Backend / Auth / DB' },
  { name: 'Plausible', replaces: 'Google Analytics', cat: 'Analytics' },
  { name: 'Coolify',   replaces: 'Heroku / Vercel', cat: 'PaaS / Deploy' },
  { name: 'Cal.com',   replaces: 'Calendly', cat: 'Scheduling' },
  { name: 'Mattermost',replaces: 'Slack',    cat: 'Team chat' },
  { name: 'PostHog',   replaces: 'Mixpanel', cat: 'Product analytics' },
  { name: 'Outline',   replaces: 'Notion',   cat: 'Knowledge base' },
  { name: 'Trigger.dev', replaces: 'Zapier', cat: 'Background jobs' },
];

export function AppKillersPage() {
  return (
    <MarketingPage
      kicker="App Killers library"
      title={<>Start every build with <span style={{ color: '#fbbf24' }}>500+ proven OSS options.</span></>}
      subtitle="App Killers is a preloaded library of SaaS-replacement-ready repos — already analyzed, scored, and searchable inside RepoHive from day one. Already loaded into your account on paid plans, ready to use in search, projects, and AI-assisted builds."
      seo={{
        title: 'App Killers — Open Source Replacements for Paid SaaS',
        description: 'A preloaded library of 500+ production-grade open-source repos that can replace paid SaaS tools — already analyzed, scored, and searchable inside RepoHive.',
        openGraph: { type: 'website', url: 'https://repohive.app/app-killers', siteName: 'RepoHive' },
      }}
    >
      {/* The promise */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          icon={Shield}
          title="Production-grade only"
          body={<p>App Killers isn&apos;t a dump of side projects. Each repo is selected for real-world viability: active maintenance, meaningful community traction, clear licensing, and a believable path to production use.</p>}
        />
        <FeatureCard
          icon={Server}
          title="Mapped to the tools you already pay for"
          body={<p>Each App Killer is linked to the paid product it can replace (Coolify → Heroku, Supabase → Firebase, Plausible → GA) — so you go from &quot;we pay for X&quot; to &quot;here are the strongest open-source options&quot; in one step.</p>}
        />
        <FeatureCard
          icon={Zap}
          title="Doesn&apos;t count against your repo cap"
          body={<p>App Killers live alongside your own repos — searchable, comparable, projectable — but they don&apos;t eat into your plan&apos;s repo limit. They&apos;re a head start, not a charge.</p>}
        />
      </div>

      {/* How it fits the workflow — the missing link */}
      <h2 className="font-mono font-black text-white text-2xl mb-8 text-center">How App Killers fits your workflow</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          icon={Search}
          title="Search it directly"
          body={<p>Ask for what you need in plain English — &quot;self-hosted Slack alternative,&quot; &quot;Firebase replacement for a TypeScript SaaS,&quot; &quot;Calendly alternative with API access&quot; — and get matches instantly.</p>}
        />
        <FeatureCard
          icon={Target}
          title="Use it in project workspaces"
          body={<p>Create a project brief and let RepoHive surface relevant App Killers alongside your own imported repos — ranked and ready to pin.</p>}
        />
        <FeatureCard
          icon={Bot}
          title="Connect it to your AI builder"
          body={<p>Use integrations so tools like Lovable, Cursor, or Claude Code can search App Killers while helping you plan or generate a build.</p>}
        />
      </div>

      {/* Sample list */}
      <div
        className="rounded-lg p-8 mb-16"
        style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="font-mono font-bold text-white text-lg uppercase tracking-widest">A taste of the library</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {KILLER_EXAMPLES.map(k => (
            <div
              key={k.name}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-mono"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="min-w-0">
                <div className="text-white font-bold truncate">{k.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{k.cat}</div>
              </div>
              <div className="text-[11px] text-amber-300/80 flex-none">
                replaces <span className="text-amber-300">{k.replaces}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-6 italic">Just a sample — the full 500+ repo library is available in-app on paid plans.</p>
      </div>

      {/* What's in it for you */}
      <h2 className="font-mono font-black text-white text-2xl mb-8 text-center">Why App Killers is more than a repo list</h2>
      <div className="space-y-3 mb-16 max-w-3xl mx-auto">
        {[
          'Skip the discovery rabbit hole — start with a preloaded library of serious SaaS alternatives instead of searching GitHub from scratch.',
          'Build with stronger options on day one — every entry is already categorized, scored, and mapped to the commercial product it can replace.',
          'Use it inside the rest of RepoHive — search App Killers directly, pull them into project workspaces, and let your AI coding tools query them through integrations.',
          'Explore without polluting your repo cap — App Killers lives alongside your own library but doesn\'t consume your repo limit.',
        ].map((line, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
            <CheckCircle2 className="w-5 h-5 flex-none mt-0.5" style={{ color: '#4edea3' }} />
            <span>{line}</span>
          </div>
        ))}
      </div>

      {/* In practice */}
      <h2 className="font-mono font-black text-white text-2xl mb-8 text-center">What you can do with App Killers in practice</h2>
      <div className="space-y-3 mb-16 max-w-3xl mx-auto">
        {[
          'Replace a paid tool in a new product stack faster.',
          'Find self-hosted options before committing to SaaS spend.',
          'Give your AI builder a stronger set of OSS starting points.',
          'Use App Killers as fallback options when your own repo library is thin.',
          'Compare alternatives in projects without opening 30 GitHub tabs.',
        ].map((line, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
            <CheckCircle2 className="w-5 h-5 flex-none mt-0.5" style={{ color: '#4edea3' }} />
            <span>{line}</span>
          </div>
        ))}
      </div>

      {/* Plan note */}
      <div
        className="rounded-lg p-8 mb-16 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
      >
        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-none"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <Flame className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-mono font-bold text-amber-300 mb-1">Included in paid plans as a built-in head start</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Upgrade to Solo or Studio and get 500+ preloaded App Killers copied into your account — searchable,
            scored, and ready to use in search, projects, and AI integrations from day one. The free Explorer
            plan can browse and search the library read-only.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/pricing"
          className="inline-block px-8 py-4 rounded-md font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#4d8eff', color: '#00285d', boxShadow: '0 0 24px rgba(77,142,255,0.4)' }}
        >
          Unlock App Killers
        </Link>
      </div>
    </MarketingPage>
  );
}
