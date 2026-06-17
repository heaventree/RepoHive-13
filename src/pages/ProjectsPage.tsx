import React from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Rocket, Sparkles, Target, ListChecks, Users, FileText } from 'lucide-react';

export function ProjectsPage() {
  return (
    <MarketingPage
      kicker="Project workspaces"
      title={<>Brief a project. <span style={{ color: '#adc6ff' }}>Get the right repos.</span></>}
      subtitle="Project workspaces turn your library into a recommender. Write a one-paragraph brief and RepoHive returns the best fits from what you (and your team) have curated — ranked, explained, and ready to pin."
    >
      {/* Hero card explaining the flow */}
      <div
        className="rounded-lg p-8 mb-16"
        style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="font-mono font-bold text-white text-lg uppercase tracking-widest mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" /> The recommendation flow
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-400">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">Write a brief</span>
            </div>
            <p>"A self-hosted CRM for a 12-person sales team, multi-tenant, Postgres backend, ideally TypeScript." A few sentences is enough.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">RepoHive matches</span>
            </div>
            <p>Briefs are expanded with synonyms and embedded, then compared against every repo in your library. Closest matches surface first.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">Review and pin</span>
            </div>
            <p>Each recommendation has a similarity score, rationale, and warnings (e.g. "high open-issue count"). Pin the keepers, add notes, archive the rest.</p>
          </div>
        </div>
      </div>

      {/* What's special */}
      <h2 className="font-mono font-black text-white text-2xl mb-8 text-center">Why this beats searching GitHub</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <FeatureCard
          icon={Sparkles}
          title="Search what something does, not what it&apos;s called"
          body={
            <>
              <p>GitHub search rewards exact keywords. RepoHive recommends by meaning. "Cron alternative without Vercel" works.</p>
              <p>Short, vague briefs are auto-expanded into richer descriptions before matching, so you don&apos;t need to be a search-fu wizard.</p>
            </>
          }
        />
        <FeatureCard
          icon={ListChecks}
          title="Constraints that actually apply"
          body={
            <>
              <p>Set hard minimums (stars, language, license) and they&apos;re respected. The rest is a confidence-weighted blend of relevance and quality score.</p>
              <p>Each recommendation explains itself in a sentence, so you can decide fast without re-reading every README.</p>
            </>
          }
        />
        <FeatureCard
          icon={Rocket}
          title="Project memory"
          body={
            <>
              <p>Pinned repos and notes stay with the project. Six months later, when you&apos;re asked "why did we pick that auth library?", the answer is one click away.</p>
            </>
          }
        />
        <FeatureCard
          icon={Users}
          title="Team-shared on Studio"
          body={
            <>
              <p>On Studio, projects and recommendations belong to the team workspace. Everyone sees the same shortlist, the same notes, the same rationale.</p>
              <p>Up to 25 members per team.</p>
            </>
          }
        />
      </div>

      {/* Example */}
      <div
        className="rounded-lg p-8 mb-16"
        style={{ background: 'rgba(77,142,255,0.06)', border: '1px solid rgba(77,142,255,0.18)' }}
      >
        <p className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-3">A real-shaped example</p>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          <em>Brief:</em> "Headless CMS for a small marketing team. Must support image uploads,
          live preview, and integrate cleanly with Next.js. Self-hosted, MIT or Apache."
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          <em>What RepoHive returns from a 500-repo library:</em> the three CMSes that semantically match your
          brief (not just contain the word "CMS"), each with a 0–100 fit score, a one-sentence rationale,
          warnings if the issue count is high, and a pin button. Total time: about 8 seconds.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/sign-up"
          className="inline-block px-8 py-4 rounded-xl font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#4d8eff', color: '#00285d', boxShadow: '0 0 24px rgba(77,142,255,0.4)' }}
        >
          Try project workspaces
        </Link>
        <p className="text-xs text-slate-500 mt-3 font-mono">Included on every plan, including the free Explorer.</p>
      </div>
    </MarketingPage>
  );
}
