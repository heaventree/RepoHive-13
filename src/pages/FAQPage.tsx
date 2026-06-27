import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingPage } from '../components/marketing/MarketingPage';

const PRIMARY = '#adc6ff';
const GLASS_BG = 'rgba(15,23,42,0.82)';
const GLASS_BORDER = 'rgba(255,255,255,0.06)';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  category: string;
  items: FaqItem[];
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    category: 'Plans & billing',
    items: [
      { q: 'Is there really no credit card for the free plan?', a: 'Correct — Explorer is free indefinitely. 25 repos, full AI analysis, no time limit, no card on file.' },
      { q: 'Can I upgrade or downgrade at any time?', a: 'Yes. Upgrade immediately, downgrade at end of billing period. No contracts, cancel anytime.' },
      { q: 'What does the annual discount get me?', a: 'Annual billing on Solo or Studio drops the monthly rate by 20% — same features, paid once a year.' },
      { q: 'Do you charge extra for AI analysis?', a: 'No. AI analysis, re-analysis, and search are bundled into the plan price. Solo includes roughly $1–2/month of underlying AI cost per 1,000 repos analysed — we absorb it, you don\'t see a separate line item.' },
    ],
  },
  {
    category: 'Your repo library',
    items: [
      { q: 'What counts as a "repo" in my library?', a: 'Any GitHub repository you add via URL, individually or in bulk. The preloaded App Killers don\'t count against your plan\'s repo limit.' },
      { q: 'Can I import private repos?', a: 'Free is public repos only. Solo and Studio can also analyse private repos you have access to via GitHub.' },
      { q: 'What happens if I go over my repo limit?', a: 'You can keep browsing and searching what\'s already in your library — you just can\'t add new repos until you remove some or upgrade.' },
    ],
  },
  {
    category: 'AI analysis & scoring',
    items: [
      { q: 'What does AI analysis actually do to a repo?', a: 'Every repo is categorised, tagged, summarised in plain English, and scored across maintenance health, license, recency, and build-readiness.' },
      { q: 'What does "weekly re-analysis" mean?', a: 'On Solo, RepoHive checks your repos weekly for staleness signals: archive status, last commit date, star velocity, license changes, open CVEs. Studio runs this daily.' },
      { q: 'How does plain-English search work?', a: 'Search uses vector embeddings, not keyword matching — so a query like "Notion alternative for engineers" can surface a fitting repo even if it never uses those words.' },
    ],
  },
  {
    category: 'App Killers',
    items: [
      { q: 'What exactly is the App Killers library?', a: 'It\'s 500+ self-hostable, SaaS-ready open-source alternatives to expensive tools, preloaded into your account on Solo and Studio — already imported and already analysed, so there\'s nothing to set up.' },
      { q: 'Can Free plan users see App Killers?', a: 'Free can search and browse the App Killers library read-only. Full access — pinning, projects, and API access to it — is on Solo and Studio.' },
      { q: 'Do App Killers get re-analysed too?', a: 'Yes, on the same re-analysis cadence as your own library — weekly on Solo, daily on Studio.' },
    ],
  },
  {
    category: 'Project workspaces',
    items: [
      { q: 'How do project workspaces work?', a: 'Create a project, add a short brief describing what you\'re building, and RepoHive recommends the best-matching repos from your library — ranked, with a fit score and rationale.' },
      { q: 'Are project recommendations saved?', a: 'Yes. The brief, recommended repos, pinned shortlist, and notes all stay attached to the project so you can return to it anytime.' },
    ],
  },
  {
    category: 'API keys & integrations',
    items: [
      { q: 'Which IDEs and tools does the API support?', a: 'Any tool that supports custom HTTP calls — Replit, Bolt, Lovable, Base44, Claude Code, Cursor, and more. Full setup steps are generated per tool in your dashboard.' },
      { q: 'How many API keys do I get?', a: 'Solo includes 1 API key. Studio includes 25 (one per seat).' },
      { q: 'What can a connected tool actually do with my key?', a: 'It can query your imported repo library and the App Killers library in plain English, and pull back structured results — owner, URL, AI summary, category, tags, score — to use as build context.' },
    ],
  },
  {
    category: 'Teams (Studio)',
    items: [
      { q: 'How does the shared library work on Studio?', a: 'Studio gives the whole team one shared repo library — up to 10,000 repos. Any member can add repos, and everyone searches the same pool.' },
      { q: 'How many seats does Studio include?', a: 'Up to 25 members per team workspace.' },
    ],
  },
  {
    category: 'Security',
    items: [
      { q: 'How are API keys stored?', a: 'Keys are shown once at creation, then hashed — we never store the plaintext. You can revoke or rotate a key at any time.' },
      { q: 'Is access scoped per tenant?', a: 'Yes. Plan limits and data access are enforced at the API layer — a key only ever sees the library it belongs to.' },
    ],
  },
];

function FaqAccordion({ groupIndex, items, openKey, setOpenKey }: {
  groupIndex: number;
  items: FaqItem[];
  openKey: string | null;
  setOpenKey: (key: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((faq, i) => {
        const key = `${groupIndex}-${i}`;
        const isOpen = openKey === key;
        return (
          <div
            key={key}
            className="rounded-md overflow-hidden transition-all"
            style={{ background: GLASS_BG, backdropFilter: 'blur(20px)', border: GLASS_BORDER }}
          >
            <button
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
              onClick={() => setOpenKey(isOpen ? null : key)}
            >
              <span className="font-mono font-bold text-white text-sm">{faq.q}</span>
              <span
                className="text-xl flex-none transition-transform duration-200"
                style={{ color: PRIMARY, transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#c2c6d6' }}>
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FAQPage() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <MarketingPage
      kicker="FAQ"
      title={<>Everything about <span style={{ color: '#adc6ff' }}>how RepoHive works.</span></>}
      subtitle="Plans, your repo library, AI analysis, App Killers, integrations, and team workspaces — answered in detail."
      seo={{
        title: 'FAQ — RepoHive',
        description: 'Answers on RepoHive plans, repo limits, AI analysis and re-analysis, the App Killers library, API keys and integrations, and team workspaces.',
        openGraph: { type: 'website', url: 'https://repohive.app/faq', siteName: 'RepoHive' },
      }}
    >
      <div className="max-w-3xl mx-auto space-y-14">
        {FAQ_GROUPS.map((group, gi) => (
          <div key={group.category}>
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest mb-5" style={{ color: PRIMARY }}>
              {group.category}
            </h2>
            <FaqAccordion groupIndex={gi} items={group.items} openKey={openKey} setOpenKey={setOpenKey} />
          </div>
        ))}

        <div className="text-center pt-8">
          <p className="text-sm text-slate-500 mb-4">Still have a question?</p>
          <Link
            to="/pricing"
            className="inline-block px-8 py-4 rounded-md font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#4d8eff', color: '#00285d', boxShadow: '0 0 24px rgba(77,142,255,0.4)' }}
          >
            Back to pricing
          </Link>
        </div>
      </div>
    </MarketingPage>
  );
}
