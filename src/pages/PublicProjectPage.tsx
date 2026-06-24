import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Rocket, ExternalLink, Star, Calendar, Loader, AlertCircle, ArrowRight, Flame, Server, Terminal } from 'lucide-react';
import { classifyRepo } from '../lib/classification';
import { SEO } from '../lib/seo';

const ACCENT = '#0000FF';
const HAIRLINE = '#E5E5E5';

interface PublicRec {
  repo_id: string;
  fit_score: number;
  rationale: string;
  name: string;
  owner: string;
  url: string;
  stars: number;
  language: string | null;
  license: string | null;
  description: string | null;
  ai_analysis: string | null;
  score: number;
}

interface PublicProject {
  project: { name: string; description: string; constraints: any; createdAt: string; };
  recommendations: PublicRec[];
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-[#0000FF]';
  if (score >= 40) return 'text-black';
  return 'text-gray-400';
}

export const PublicProjectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/p/${slug}`).then(async r => {
      const d = await r.json();
      if (!r.ok) setError(d.error || 'Project not found');
      else setData(d);
    }).catch(() => setError('Network error')).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <Loader className="w-6 h-6 text-[#0000FF] animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-[#FAFAFA]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
        <h1 className="text-xl font-bold text-black mb-2">Project not found</h1>
        <p className="text-sm text-gray-500 mb-6">{error || 'The project may have been unpublished.'}</p>
        <Link to="/" className="px-4 py-2 rounded bg-black text-white text-sm font-bold hover:bg-[#0000FF] transition-colors">← Back to RepoHive</Link>
      </div>
    );
  }

  const aiOf = (json: string | null) => { try { return json ? JSON.parse(json) : {}; } catch { return {}; } };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black selection:bg-[#0000FF] selection:text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <SEO
        title={data.project.name}
        description={data.project.description || `A curated list of ${data.recommendations.length} open-source repos for ${data.project.name}.`}
        openGraph={{
          type: 'website',
          title: `${data.project.name} — RepoHive Project`,
          description: data.project.description || `${data.recommendations.length} curated open-source repos`,
          url: `https://repohive.app/p/${slug}`,
          siteName: 'RepoHive',
        }}
      />
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-4" style={{ borderColor: HAIRLINE }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-black font-bold">
            <Terminal className="w-5 h-5" />
            RepoHive
          </Link>
          <Link to="/sign-up" className="text-xs font-medium text-gray-500 hover:text-[#0000FF] transition-colors flex items-center gap-1">
            Build your own list <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Project header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#0000FF] mb-3">
            <Rocket className="w-4 h-4" /> Shared Project
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-black mb-3">{data.project.name}</h1>
          {data.project.description && (
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">{data.project.description}</p>
          )}
          <p className="text-xs text-gray-500 font-mono mt-4 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Created {new Date(data.project.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Recommendations */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black">Top recommendations ({data.recommendations.length})</h2>
        </div>

        {data.recommendations.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No recommendations saved yet.</p>
        ) : (
          <div className="space-y-3">
            {data.recommendations.map(rec => {
              const ai = aiOf(rec.ai_analysis);
              const cls = classifyRepo(ai);
              return (
                <a
                  key={rec.repo_id}
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-md p-5 border hover:border-[#0000FF] transition-all group"
                  style={{ borderColor: HAIRLINE }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-black group-hover:text-[#0000FF] transition-colors truncate">
                          {rec.repo_id}
                        </h3>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0000FF] flex-none" />
                      </div>
                      {rec.description && <p className="text-sm text-gray-600 line-clamp-2">{rec.description}</p>}
                    </div>
                    <div className="flex-none text-right">
                      <div className={`text-2xl font-bold font-mono ${scoreColor(rec.fit_score)}`}>{rec.fit_score}</div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">fit</div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 italic mb-3">{rec.rationale}</p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-gray-500 flex-wrap">
                    {rec.language && <span>{rec.language}</span>}
                    {rec.license && <span className="px-1.5 py-0.5 rounded border text-gray-600" style={{ borderColor: HAIRLINE }}>{rec.license}</span>}
                    <span className="flex items-center gap-0.5 text-gray-600"><Star className="w-3 h-3" />{rec.stars?.toLocaleString()}</span>
                    {cls.kind === 'app-killer' && <span className="flex items-center gap-1 text-[#0000FF]"><Flame className="w-3 h-3" />Replaces {cls.comparableApp}</span>}
                    {cls.kind === 'saas-ready' && <span className="flex items-center gap-1 text-[#0000FF]"><Server className="w-3 h-3" />SaaS Ready</span>}
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 rounded-md text-center bg-black text-white">
          <h3 className="text-xl font-bold mb-2">Build your own curated list</h3>
          <p className="text-sm text-gray-300 mb-4">RepoHive helps you find the right open-source repos for any project. Free tier includes 50 repos.</p>
          <Link to="/sign-up" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded bg-white text-black font-bold text-sm hover:bg-[#0000FF] hover:text-white transition-colors">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};
