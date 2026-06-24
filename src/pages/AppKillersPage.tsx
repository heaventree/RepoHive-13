import React from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Flame, Target, Layers, Library, CheckCircle2 } from 'lucide-react';

const ACCENT = '#FF5C00';
const HAIRLINE = '#E5E5E5';

const KILLER_EXAMPLES = [
  { name: 'invoiceninja', replaces: 'QuickBooks', cat: 'Invoicing / billing' },
  { name: 'cal.com',      replaces: 'Calendly',   cat: 'Scheduling' },
  { name: 'supabase',     replaces: 'Firebase',   cat: 'Backend / auth / DB' },
  { name: 'twenty',       replaces: 'Salesforce', cat: 'CRM' },
  { name: 'plausible',    replaces: 'Google Analytics', cat: 'Analytics' },
  { name: 'mattermost',   replaces: 'Slack',      cat: 'Team chat' },
];

const SAAS_EXAMPLES = [
  { name: 'novu', cat: 'Notification infrastructure' },
  { name: 'medusa', cat: 'Commerce engine' },
  { name: 'trigger.dev', cat: 'Background jobs' },
];

export function AppKillersPage() {
  return (
    <MarketingPage
      kicker="Classification"
      title={<>When open source <span style={{ color: ACCENT }}>kills a paid tool.</span></>}
      subtitle="App Killer isn't a separate library — it's a label RepoHive's AI puts on repos in your own library. When it can match a repo to a specific paid product it replaces, that's an App Killer. The strong ones it can't pin to a named competitor get tagged White-label SaaS Ready."
      seo={{
        title: 'App Killers — How RepoHive Classifies Your Repos',
        description: 'App Killer is a classification RepoHive\'s AI assigns to repos that can replace a specific paid SaaS product. Repos it can\'t match get tagged White-label SaaS Ready.',
        openGraph: { type: 'website', url: 'https://repohive.app/app-killers', siteName: 'RepoHive' },
      }}
    >
      {/* The two labels */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          icon={Target}
          title="How a repo earns it"
          body={<p>During analysis the AI compares each repo&apos;s capabilities against the commercial products people actually pay for. Find a clear match and it&apos;s an <strong>App Killer</strong>, tagged with the tool it replaces — &ldquo;replaces QuickBooks&rdquo;, &ldquo;replaces Calendly&rdquo;.</p>}
        />
        <FeatureCard
          icon={Layers}
          title="When it's SaaS Ready instead"
          body={<p>Plenty of repos are production-grade, active and well-licensed but don&apos;t map to one named competitor. Those get labeled <strong>White-label SaaS Ready</strong> — a foundation solid enough to ship as your own product.</p>}
        />
        <FeatureCard
          icon={Library}
          title="It's still just your library"
          body={<p>App Killers aren&apos;t a bonus shelf or a separate catalogue. They&apos;re your repos, classified. Same search, same scoring, same projects — the label just tells you what each one is worth replacing.</p>}
        />
      </div>

      {/* App Killer examples */}
      <div
        className="rounded-md p-8 mb-8 bg-white border"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-5 h-5" style={{ color: ACCENT }} />
          <h2 className="font-bold text-black text-lg">Tagged as App Killers</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {KILLER_EXAMPLES.map(k => (
            <div
              key={k.name}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded text-sm font-mono bg-[#FAFAFA] border"
              style={{ borderColor: HAIRLINE }}
            >
              <div className="min-w-0">
                <div className="text-black font-bold truncate">{k.name}</div>
                <div className="text-[11px] text-gray-500 truncate">{k.cat}</div>
              </div>
              <div className="text-[11px] text-gray-500 flex-none">
                replaces <span className="font-bold" style={{ color: ACCENT }}>{k.replaces}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SaaS Ready examples */}
      <div
        className="rounded-md p-8 mb-16 bg-white border"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-5 h-5 text-black" />
          <h2 className="font-bold text-black text-lg">Tagged White-label SaaS Ready</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {SAAS_EXAMPLES.map(k => (
            <div
              key={k.name}
              className="px-4 py-3 rounded text-sm font-mono bg-[#FAFAFA] border"
              style={{ borderColor: HAIRLINE }}
            >
              <div className="text-black font-bold truncate">{k.name}</div>
              <div className="text-[11px] text-gray-500 truncate">{k.cat}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-6 italic">Strong, productizable repos with no single paid tool to point at — yet.</p>
      </div>

      {/* What's in it for you */}
      <h2 className="font-bold tracking-tight text-black text-2xl mb-8 text-center">Why the label matters</h2>
      <div className="space-y-3 mb-16 max-w-3xl mx-auto">
        {[
          'Audit your SaaS spend — see which of the repos you already track can replace a tool you pay for every month.',
          'Self-host with confidence: App Killers come with the synopsis, score and license you need to commit.',
          'Spot a product idea: a SaaS-Ready repo is a head start on something you could launch yourself.',
          'Stay current: staleness scoring flags a killer that loses its maintainers before you build on it.',
        ].map((line, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
            <CheckCircle2 className="w-5 h-5 flex-none mt-0.5" style={{ color: ACCENT }} />
            <span>{line}</span>
          </div>
        ))}
      </div>

      {/* Seed note */}
      <div
        className="rounded-md p-8 mb-16 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#FAFAFA] border"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="w-12 h-12 rounded flex items-center justify-center flex-none border border-black">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-black mb-1">Start with a seed library</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Paid plans begin with a set of already-analyzed, already-classified repos so you can explore App
            Killers from minute one instead of staring at an empty shelf. On every plan, everything you paste
            gets the exact same treatment — synopsis, score, and label.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/sign-up"
          className="inline-block px-8 py-4 rounded font-bold bg-black text-white hover:bg-[#FF5C00] transition-colors"
        >
          Classify your repos
        </Link>
      </div>
    </MarketingPage>
  );
}
