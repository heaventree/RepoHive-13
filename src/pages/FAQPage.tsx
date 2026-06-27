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
    category: 'Getting started',
    items: [
      { q: 'What is RepoHive, in one sentence?', a: "RepoHive is a place to bring the GitHub repos you've found — bookmarks, stars, side-project deps — and turn them into a searchable, AI-analysed library you can use to build faster." },
      { q: 'Do I bring my own repos, or does RepoHive come with repos already loaded?', a: "Both, but they're separate things. Your library starts empty — you import the repos you care about. Solo and Studio plans additionally get App Killers, a separate 500+ repo bonus library, preloaded into the account as a head start. They never mix with or replace your own library." },
      { q: 'Which version-control platforms does RepoHive support?', a: "GitHub only, for now. That covers the vast majority of public and private open-source work, and it's where we're focused. Other platforms aren't ruled out, but there's no committed timeline." },
    ],
  },
  {
    category: 'Importing & library management',
    items: [
      { q: 'How do I add a repo?', a: 'Paste a GitHub URL — a single repo, an entire org, or a list of up to 1,000 at once. Everything is ingested and analysed automatically.' },
      { q: 'Can I import private repos?', a: 'Free is public repos only. Solo and Studio can also analyse private repos you have access to via GitHub.' },
      { q: "What happens if I go over my plan's repo limit?", a: "You can still browse, search, and use everything already in your library — you just can't add new repos until you remove some or upgrade." },
      { q: 'Can I remove a repo from my library?', a: "Yes, any time. Removing a repo only affects your library — it has no effect on the actual GitHub repository or its author." },
    ],
  },
  {
    category: 'Repo analysis & scoring',
    items: [
      { q: 'What does AI analysis actually look at?', a: "Each repo's description, primary language, GitHub topics, and the first part of its README. From that, RepoHive generates a plain-English summary, category tags, and a score covering maintenance health, license, recency, and SaaS-replacement readiness." },
      { q: "Does RepoHive read through a repo's full source code?", a: "No. Analysis works from the repo's metadata and README, not a line-by-line code review. It's enough to judge fit, category, and health signals — it isn't a substitute for actually reading the code you plan to depend on." },
      { q: 'How often is a repo re-analysed?', a: 'Daily, on every plan — so scores and summaries stay current as a project evolves.' },
      { q: 'How does plain-English search work?', a: 'Search uses vector embeddings, not keyword matching, so a query like "Notion alternative for engineers" can surface a fitting repo even if it never uses those words.' },
    ],
  },
  {
    category: 'Trust, quality & limitations',
    items: [
      { q: 'Does RepoHive guarantee that a repo is safe, working, or production-ready?', a: "No. RepoHive scores and summarizes repos to help you judge them faster — it doesn't test, certify, or vouch for any of them. Treat every score as a starting point for your own evaluation, not a stamp of approval." },
      { q: "What happens if a repo I imported doesn't work?", a: "That's between you and the repo's maintainer, not RepoHive. We surface signals (commit recency, archive status, license, AI-generated quality scoring) to help you judge a repo before you commit to it, but we don't fix, patch, or support third-party code." },
      { q: 'Who is responsible for maintaining and supporting the repos in my library?', a: "Each repo's own author or maintainer — exactly as it works on GitHub today. RepoHive is a layer for organizing, scoring, and searching repos you discover; it isn't a fork, a mirror, or a support channel for them." },
      { q: 'Are App Killers held to a different standard?', a: "No. App Killers go through the same automated scoring as anything in your own library — preloaded and already analysed, not separately vetted or guaranteed." },
    ],
  },
  {
    category: 'Security & risk',
    items: [
      { q: 'Does RepoHive scan repos for security vulnerabilities?', a: "Not at this time. We don't currently run dependency or vulnerability scanning against imported repos — it's something we're evaluating, but it can get expensive to run well at scale, so there's no committed timeline." },
      { q: 'So how do I know a repo is safe to use?', a: "Use RepoHive's signals — maintenance health, license, last-commit recency, archive status — as a first filter, then apply your own due diligence (reading the code, checking issues, running your own security tooling) before depending on anything in production." },
      { q: 'How are my API keys stored?', a: "Keys are shown once at creation, then hashed — we never store the plaintext. You can revoke or rotate a key at any time." },
      { q: 'Is my library data isolated from other accounts?', a: "Yes. Plan limits and data access are enforced at the API layer — a key only ever sees the library it belongs to." },
    ],
  },
  {
    category: 'Search, projects & recommendations',
    items: [
      { q: 'How do project workspaces work?', a: "Create a project, write a short brief describing what you're building, and RepoHive ranks the best-matching repos from your own library — with a fit score and a plain-English rationale for each." },
      { q: 'Will App Killers show up in my project recommendations?', a: "Not automatically. Recommendations are scoped to the repos in your own library. If you want an App Killers repo considered, search or browse it into your library first." },
      { q: 'Are project recommendations saved?', a: 'Yes. The brief, ranked repos, pinned shortlist, and notes all stay attached to the project so you can return to it anytime.' },
    ],
  },
  {
    category: 'Integrations & API',
    items: [
      { q: 'Which tools can connect to my library?', a: 'Any tool that supports custom HTTP calls — Replit, Bolt, Lovable, Base44, Claude Code, Cursor, and more. Setup steps are generated per tool right in your dashboard.' },
      { q: 'What can a connected tool actually do with my key?', a: "It can search your imported repo library in plain English and pull back structured results — owner, URL, AI summary, category, tags, score — to use as build context while it works." },
      { q: 'How many API keys do I get?', a: 'Explorer includes none. Solo includes 1 key. Studio includes 25 (one per seat).' },
    ],
  },
  {
    category: 'Billing & plans',
    items: [
      { q: 'Is there really no credit card for the free plan?', a: 'Correct — Explorer is free indefinitely. 25 repos, full AI analysis, no time limit, no card on file.' },
      { q: 'Can I upgrade or downgrade at any time?', a: 'Yes. Upgrade immediately, downgrade at the end of your billing period. No contracts, cancel anytime.' },
      { q: 'What does App Killers cost on top of my plan?', a: "Nothing extra. It's included automatically the moment you're on Solo or Studio — there's no separate add-on fee." },
      { q: 'Do you charge extra for AI analysis?', a: "No. AI analysis, re-analysis, and search are bundled into the plan price — no separate usage line item." },
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
      subtitle="Getting started, your repo library, analysis and scoring, trust and limitations, security, projects, integrations, and billing — answered in detail."
      seo={{
        title: 'FAQ — RepoHive',
        description: 'Answers on importing and managing your repo library, how AI analysis and scoring work, trust and security limitations, App Killers, project recommendations, API access, and billing.',
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
