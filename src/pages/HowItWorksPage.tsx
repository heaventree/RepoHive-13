import React from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Activity, Boxes, Zap, BookOpen } from 'lucide-react';

export function HowItWorksPage() {
  return (
    <MarketingPage
      kicker="How it works"
      title={<>From a folder of GitHub URLs to <span style={{ color: '#adc6ff' }}>a queryable repo brain.</span></>}
      subtitle="RepoHive turns the open-source repos you care about into an AI-indexed, searchable library so you can find the right one in seconds — not the wrong one after an afternoon of tabs."
      seo={{
        title: 'How It Works',
        description: 'RepoHive ingests GitHub repos, scores them with AI, builds vector embeddings, and lets you search in plain English. Here\'s exactly how.',
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
              <p>Every repo gets categorised (Frontend, Backend, AI/ML, DevOps, Database, Tooling, Mobile, Security, General), tagged, summarised in plain English, and assigned a quality score. We also flag App Killers — open-source replacements for known paid SaaS products.</p>
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
              <p>Staleness monitoring keeps an eye on your library: archive status, last-commit gaps, open CVEs, sudden star-velocity changes, license drift. You get a heads-up before a dependency surprises you.</p>
              <p>Weekly on Solo, daily on Studio.</p>
            </>
          }
        />
      </div>

      {/* The big idea */}
      <div
        className="rounded-2xl p-10 mb-20 text-center"
        style={{ background: 'rgba(77,142,255,0.06)', border: '1px solid rgba(77,142,255,0.18)' }}
      >
        <Zap className="w-8 h-8 mx-auto mb-4" style={{ color: '#4d8eff' }} />
        <h2 className="font-mono font-black text-white text-2xl mb-4">The problem RepoHive fixes</h2>
        <p className="text-slate-300 leading-relaxed max-w-3xl mx-auto text-sm">
          Open source is the most valuable inventory in software, and almost nobody manages it. You bookmark
          repos, lose them in Slack, rediscover them six months later, and ship the wrong dependency anyway.
          RepoHive is the workbench you should have had: a private library where every repo is analysed,
          scored, monitored, and findable by what it <em>does</em>, not by what it&apos;s called.
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
          icon={BookOpen}
          title="App Killers library"
          body={<p>A hand-curated set of production-grade open-source alternatives to expensive SaaS, included on every paid plan.</p>}
        />
        <FeatureCard
          icon={Zap}
          title="IDE & agent integration"
          body={<p>Generate API keys and let Cursor, Replit, Lovable, Bolt, or Claude Code query your library as a source of truth while they build.</p>}
        />
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <Link
          to="/sign-up"
          className="inline-block px-8 py-4 rounded-xl font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#4d8eff', color: '#00285d', boxShadow: '0 0 24px rgba(77,142,255,0.4)' }}
        >
          Start free — 25 repos
        </Link>
        <p className="text-xs text-slate-500 mt-3 font-mono">No credit card. Full AI analysis on every repo.</p>
      </div>
    </MarketingPage>
  );
}
