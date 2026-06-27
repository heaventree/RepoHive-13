import React from 'react';
import { MarketingPage, FeatureCard } from '../components/marketing/MarketingPage';
import { Link } from 'react-router-dom';
import { Rocket, Sparkles, Target, ListChecks, Users, FileText } from 'lucide-react';

const ACCENT = '#FF5C00';
const HAIRLINE = '#E5E5E5';

export function ProjectsPage() {
  return (
    <MarketingPage
      kicker="Project workspaces"
      title={<>Describe what you're building. <span style={{ color: ACCENT }}>Get the repos that fit.</span></>}
      subtitle="Your library is the inventory. A Project turns it into a recommender: write a sentence about what you need, and RepoHive ranks the best matches from everything you've curated — scored, explained, and ready to pin. No more re-reading forty READMEs to make one decision."
    >
      {/* Hero card explaining the flow */}
      <div
        className="rounded-md p-8 mb-16 bg-white border"
        style={{ borderColor: HAIRLINE }}
      >
        <h2 className="font-bold text-black text-lg mb-6 flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: ACCENT }} /> From a one-line brief to a shortlist
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" style={{ color: ACCENT }} />
              <span className="text-black font-bold">1. Brief it</span>
            </div>
            <p>&ldquo;A self-hosted CRM for a 12-person sales team, multi-tenant, Postgres, ideally TypeScript.&rdquo; A sentence is plenty.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
              <span className="text-black font-bold">2. RepoHive matches</span>
            </div>
            <p>Your brief is expanded with synonyms, embedded, and compared against every repo in your library. The closest fits surface first — in seconds.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="w-4 h-4" style={{ color: ACCENT }} />
              <span className="text-black font-bold">3. Pin the keepers</span>
            </div>
            <p>Each hit comes with a fit score, a one-line reason, and warnings like &ldquo;high open-issue count.&rdquo; Pin the winners, note why, archive the rest.</p>
          </div>
        </div>
      </div>

      {/* What's special */}
      <h2 className="font-bold tracking-tight text-black text-2xl mb-8 text-center">Why it beats searching GitHub at 1am</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <FeatureCard
          icon={Sparkles}
          title="Search by meaning, not keywords"
          body={
            <>
              <p>GitHub rewards the exact word. RepoHive understands intent — &ldquo;cron alternative I can self-host&rdquo; finds the right tool even if it never says &ldquo;cron.&rdquo;</p>
              <p>Vague briefs get auto-expanded before matching, so you don&apos;t have to be a search-fu wizard to get a good shortlist.</p>
            </>
          }
        />
        <FeatureCard
          icon={ListChecks}
          title="Constraints that actually stick"
          body={
            <>
              <p>Set hard floors — minimum stars, language, license — and they&apos;re enforced. Everything else is a confidence-weighted blend of relevance and quality score.</p>
              <p>Every recommendation explains itself in one sentence, so you decide in seconds, not afternoons.</p>
            </>
          }
        />
        <FeatureCard
          icon={Rocket}
          title="Decisions that don't evaporate"
          body={
            <>
              <p>Pinned repos and notes live with the project. Six months later, when someone asks &ldquo;why did we pick that auth library?&rdquo;, the answer — and the rejected alternatives — is one click away.</p>
            </>
          }
        />
        <FeatureCard
          icon={Users}
          title="One shortlist for the whole team"
          body={
            <>
              <p>On Studio, projects and recommendations belong to the team workspace. Everyone sees the same shortlist, the same notes, the same rationale — no more &ldquo;wait, which repo did we agree on?&rdquo;</p>
              <p>Up to 25 members per team.</p>
            </>
          }
        />
      </div>

      {/* Example */}
      <div
        className="rounded-md p-8 mb-16 bg-[#FAFAFA] border"
        style={{ borderColor: HAIRLINE }}
      >
        <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: ACCENT }}>What it feels like</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          <em>You type:</em> &ldquo;Headless CMS for a small marketing team. Image uploads, live preview, clean
          Next.js integration. Self-hosted, MIT or Apache.&rdquo;
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          <em>RepoHive returns, in about 8 seconds:</em> the three CMSes from your library that actually match the
          brief — not just the ones with &ldquo;CMS&rdquo; in the name — each with a 0–100 fit score, a one-line
          rationale, a warning if the issue tracker is on fire, and a pin button. Decision made before your coffee
          lands.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/sign-up"
          className="inline-block px-8 py-4 rounded font-bold bg-black text-white hover:bg-[#FF5C00] transition-colors"
        >
          Try project workspaces
        </Link>
        <p className="text-xs text-gray-500 mt-3 font-mono">Available on the Solo and Studio plans.</p>
      </div>
    </MarketingPage>
  );
}
