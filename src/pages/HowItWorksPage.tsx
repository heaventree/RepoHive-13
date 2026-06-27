import React from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Activity, Boxes, Zap, BookOpen } from 'lucide-react';

export function HowItWorksPage() {
  return (
    <MarketingPage
      kicker="How it works"
      title={<>Turn scattered repos into <span style={{ color: '#adc6ff' }}>searchable build intelligence.</span></>}
      subtitle="Import the repos you save, star, fork, or already depend on. RepoHive analyzes them, scores them for real-world reuse, monitors them over time, and makes them searchable in plain English inside your workflow."
      seo={{
        title: 'How RepoHive Works | Import, Score, Search & Monitor Repos',
        description: 'Import the GitHub repos you already use, get them scored for maintenance health, license, and build-readiness, then search and monitor them in plain English.',
        openGraph: { type: 'website', url: 'https://repohive.app/how-it-works', siteName: 'RepoHive' },
      }}
    >
      {/* The four stages */}
      <div className="grid md:grid-cols-2 gap-6 mb-20">
        <FeatureCard
          icon={Boxes}
          title="1 — Add repos to your library"
          body={
            <>
              <p>Paste a GitHub URL, drop in a list, or bulk-import. We resolve canonical owner/name (no duplicates) and pull stars, forks, license, language, last-push date, and the README from the GitHub API.</p>
              <p>Public repos only on Free; Solo and Studio also analyse private repos you have access to.</p>
            </>
          }
        />
        <FeatureCard
          icon={Sparkles}
          title="2 — AI analysis runs automatically"
          body={
            <>
              <p>Every repo gets categorised (Frontend, Backend, AI/ML, DevOps, Database, Tooling, Mobile, Security, General), tagged, summarised in plain English, and scored across maintenance health, license, recency, and build-readiness — so you can judge fit fast.</p>
              <p>Cost stays predictable: we re-analyse on real change signals, not on a schedule.</p>
            </>
          }
        />
        <FeatureCard
          icon={Search}
          title="3 — Search in plain English"
          body={
            <>
              <p>Type what you want, not what you remember. Vector embeddings power semantic search, so "Notion alternative for engineers" surfaces docs platforms with technical chops — even if they don't contain those exact words.</p>
              <p>Filter by stars, language, license, and score on top.</p>
            </>
          }
        />
        <FeatureCard
          icon={Activity}
          title="4 — Stay current"
          body={
            <>
              <p>Staleness monitoring keeps an eye on your library: archive status and last-commit gaps. You get a heads-up before a dependency goes quiet on you.</p>
              <p>Runs weekly, on every plan.</p>
            </>
          }
        />
      </div>

      {/* The big idea */}
      <div
        className="rounded-lg p-10 mb-20 text-center"
        style={{ background: 'rgba(77,142,255,0.06)', border: '1px solid rgba(77,142,255,0.18)' }}
      >
        <Zap className="w-8 h-8 mx-auto mb-4" style={{ color: '#4d8eff' }} />
        <h2 className="font-mono font-black text-white text-2xl mb-4">The problem RepoHive fixes</h2>
        <p className="text-slate-300 leading-relaxed max-w-3xl mx-auto text-sm">
          Open source isn&apos;t the problem. Repo chaos is. You already have more useful repos than you can
          remember — buried in GitHub stars, old tabs, Slack messages, and past builds. RepoHive gives you one
          place to import them, analyse and score them, monitor them over time, and retrieve them by what they
          actually help you build, not by what they&apos;re called.
        </p>
      </div>

      {/* What you get */}
      <h2 className="font-mono font-black text-white text-2xl mb-8 text-center">What you can do with it</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          icon={Boxes}
          title="Project workspaces"
          body={<p>Group repos by project, add notes, save shortlists. RepoHive recommends the best fits from your library based on your project brief.</p>}
        />
        <FeatureCard
          icon={Zap}
          title="IDE & agent integration"
          body={<p>Generate API keys and let Cursor, Replit, Lovable, Bolt, or Claude Code search the repos you've imported as build context while they work.</p>}
        />
        <FeatureCard
          icon={BookOpen}
          title="Preloaded library"
          body={<p>Need a starting point too? Paid plans also include a 500+ repo preloaded library — high-scoring, production-grade open source, including 100+ App Killers (named replacements for specific paid tools) — ready to search from day one.</p>}
        />
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <Link
          to="/sign-up"
          className="inline-block px-8 py-4 rounded-md font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#4d8eff', color: '#00285d', boxShadow: '0 0 24px rgba(77,142,255,0.4)' }}
        >
          Start free — 25 repos
        </Link>
        <p className="text-xs text-slate-500 mt-3 font-mono">No credit card. Full AI analysis on every repo.</p>
      </div>
    </MarketingPage>
  );
}
