import React from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Rocket, Sparkles, Target, ListChecks, Users, FileText } from 'lucide-react';

export function ProjectsPage() {
  return (
    <MarketingPage
      kicker="Project workspaces"
      title={<>Describe the project. <span style={{ color: '#adc6ff' }}>RepoHive finds the repos.</span></>}
      subtitle="Create a project in your dashboard, add a short brief, and RepoHive recommends the best-matching repos from your library — ranked, explained, and saved so you can return anytime. Pin the keepers, add notes, and come back whenever you need them."
      seo={{
        title: 'Project Workspaces | Saved Repo Shortlists for Every Build',
        description: 'Brief a project, get matching repos from your imported library, and keep the shortlist, notes, and rationale saved in your dashboard for next time.',
        openGraph: { type: 'website', url: 'https://repohive.app/projects', siteName: 'RepoHive' },
      }}
    >
      {/* Hero card explaining the flow */}
      <div
        className="rounded-lg p-8 mb-16"
        style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="font-mono font-bold text-white text-lg uppercase tracking-widest mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" /> How project workspaces work
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-400">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">1 — Create a project</span>
            </div>
            <p>Start a new project in your dashboard and add a short brief: "A self-hosted CRM for a 12-person sales team, multi-tenant, Postgres backend, ideally TypeScript." A few sentences is enough.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">2 — RepoHive finds the best matches</span>
            </div>
            <p>RepoHive interprets your brief, expands the meaning behind it, and matches it against the repos in your library to surface the strongest fits first.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold">3 — Save the shortlist</span>
            </div>
            <p>Each match has a fit score, rationale, and warnings (e.g. "high open-issue count"). Pin the keepers, add notes, archive the rest — your project stays saved in your dashboard so you can return any time.</p>
          </div>
        </div>
      </div>

      {/* Dashboard persistence — the differentiator */}
      <div
        className="rounded-lg p-8 mb-16 text-center"
        style={{ background: 'rgba(77,142,255,0.06)', border: '1px solid rgba(77,142,255,0.18)' }}
      >
        <h2 className="font-mono font-black text-white text-2xl mb-4">Saved in your dashboard, ready when you come back</h2>
        <p className="text-slate-300 leading-relaxed max-w-3xl mx-auto text-sm">
          Every project workspace keeps the brief, recommended repos, pinned shortlist, notes, and decision
          context together. Start a project today, come back next week, or revisit it six months later
          without losing the thread.
        </p>
      </div>

      {/* What's special */}
      <h2 className="font-mono font-black text-white text-2xl mb-8 text-center">Why this is better than starting from scratch every time</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <FeatureCard
          icon={Rocket}
          title="Your stack decisions stop disappearing"
          body={
            <>
              <p>Repo choices usually vanish into Slack threads, bookmarks, or someone's memory. Project workspaces keep the repos, notes, and rationale tied to the build.</p>
              <p>Six months later, when you&apos;re asked "why did we pick that auth library?", the answer is one click away.</p>
            </>
          }
        />
        <FeatureCard
          icon={Sparkles}
          title="Find by intent, not exact phrasing"
          body={
            <>
              <p>Describe the product you want to build, not the repo name you can&apos;t remember. "Cron alternative without Vercel" works — RepoHive matches by meaning, so vague or natural-language briefs still return useful results.</p>
            </>
          }
        />
        <FeatureCard
          icon={ListChecks}
          title="Filter for real constraints"
          body={
            <>
              <p>Need a specific language, license, or a minimum trust threshold? Apply hard filters so the shortlist actually fits your build requirements.</p>
              <p>Every match includes a fit score, rationale, and warning signals so you can evaluate faster without opening 20 tabs.</p>
            </>
          }
        />
        <FeatureCard
          icon={Users}
          title="Team-shared on Studio"
          body={
            <>
              <p>On Studio, projects and recommendations belong to the team workspace. Everyone sees the same shortlist, the same notes, the same rationale — pulled from the repos your team has imported.</p>
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
          <em>What RepoHive returns:</em> a ranked shortlist from your imported repo library — the CMSes that
          semantically match your brief (not just contain the word "CMS"), each with a 0–100 fit score, a
          one-sentence rationale, and warnings if the issue count is high — all saved inside the project so
          you can review, pin, and revisit later. Total time: about 8 seconds.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/sign-up"
          className="inline-block px-8 py-4 rounded-md font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#4d8eff', color: '#00285d', boxShadow: '0 0 24px rgba(77,142,255,0.4)' }}
        >
          Try project workspaces
        </Link>
        <p className="text-xs text-slate-500 mt-3 font-mono">Included on every plan, including the free Explorer.</p>
      </div>
    </MarketingPage>
  );
}
