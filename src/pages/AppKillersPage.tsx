import React from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Flame, Shield, Server, Zap, CheckCircle2 } from 'lucide-react';

const ACCENT = '#0000FF';
const HAIRLINE = '#E5E5E5';

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
      title={<>Open source <span style={{ color: ACCENT }}>that replaces your SaaS bill.</span></>}
      subtitle="A hand-curated set of production-grade open-source projects that are credible self-hosted replacements for the paid software your stack runs on. Already analysed, scored, embedded — search them in your library on day one."
      seo={{
        title: 'App Killers — Open Source Replacements for Paid SaaS',
        description: 'Browse RepoHive\'s curated App Killers: self-hosted, production-ready open-source alternatives to Slack, Firebase, Heroku, Calendly, and 100+ more.',
        openGraph: { type: 'website', url: 'https://repohive.app/app-killers', siteName: 'RepoHive' },
      }}
    >
      {/* The promise */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          icon={Shield}
          title="Production-grade only"
          body={<p>Every entry is vetted: live development, active maintainers, a real community, OSI-approved license, and a self-host story you can actually follow. No abandoned weekend projects.</p>}
        />
        <FeatureCard
          icon={Server}
          title="Maps the SaaS you actually pay for"
          body={<p>Every App Killer is tagged with the commercial product it replaces (Coolify → Heroku, Supabase → Firebase, Plausible → GA), so you can audit your stack and find the open-source alternative instantly.</p>}
        />
        <FeatureCard
          icon={Zap}
          title="Doesn&apos;t count against your repo cap"
          body={<p>App Killers live alongside your own repos — searchable, comparable, projectable — but they don&apos;t eat into your plan&apos;s repo limit. They&apos;re a gift, not a charge.</p>}
        />
      </div>

      {/* Sample list */}
      <div
        className="rounded-md p-8 mb-16 bg-white border"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-5 h-5" style={{ color: ACCENT }} />
          <h2 className="font-bold text-black text-lg">A taste of the library</h2>
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
        <p className="text-xs text-gray-500 mt-6 italic">A small slice of 500+ entries. The full catalogue is in the app.</p>
      </div>

      {/* What's in it for you */}
      <h2 className="font-bold tracking-tight text-black text-2xl mb-8 text-center">Why this matters</h2>
      <div className="space-y-3 mb-16 max-w-3xl mx-auto">
        {[
          'Audit your SaaS spend — find the open-source replacement for every paid tool you use.',
          'Self-host when you care about data ownership; let RepoHive surface the credible options.',
          'Pitch and compare: every entry has an AI-generated summary, scoring, and a "replaces" pointer.',
          'Stay current: staleness monitoring flags App Killers that lose their maintainers before you commit.',
        ].map((line, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
            <CheckCircle2 className="w-5 h-5 flex-none mt-0.5" style={{ color: ACCENT }} />
            <span>{line}</span>
          </div>
        ))}
      </div>

      {/* Plan note */}
      <div
        className="rounded-md p-8 mb-16 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#FAFAFA] border"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="w-12 h-12 rounded flex items-center justify-center flex-none border border-black">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-black mb-1">Included with Solo and Studio</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            The App Killers library is automatically copied into your account when you upgrade. The free Explorer
            plan lets you sample the rest of RepoHive; App Killers ship with paid plans because the curation work
            is what you&apos;re paying for.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/pricing"
          className="inline-block px-8 py-4 rounded font-bold bg-black text-white hover:bg-[#0000FF] transition-colors"
        >
          See plans
        </Link>
      </div>
    </MarketingPage>
  );
}
