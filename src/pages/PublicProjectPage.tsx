import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Rocket, ExternalLink, Star, Calendar, Loader, AlertCircle, ArrowRight } from 'lucide-react';
import { SEO } from '../lib/seo';

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
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1326' }}>
        <Loader className="w-6 h-6 text-accent-blue animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6" style={{ background: '#0b1326' }}>
        <AlertCircle className="w-10 h-10 text-slate-600 mb-3" />
        <h1 className="text-xl font-bold text-white font-mono mb-2">Project not found</h1>
        <p className="text-sm text-slate-500 font-mono mb-6">{error || 'The project may have been unpublished.'}</p>
        <Link to="/" className="px-4 py-2 rounded-lg bg-accent-blue text-white font-mono text-sm hover:bg-accent-blue/80">← Back to RepoHive</Link>
      </div>
    );
  }

  const aiOf = (json: string | null) => { try { return json ? JSON.parse(json) : {}; } catch { return {}; } };

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0b1326 60%)' }}>
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
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-bold font-mono">
            <div className="w-7 h-7 rounded-md flex items-center justify-center font-black text-xs" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}>RH</div>
            RepoHive
          </Link>
          <Link to="/sign-up" className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1">
            Build your own list <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Project header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent-blue mb-3">
            <Rocket className="w-4 h-4" /> Shared Project
          </div>
          <h1 className="text-4xl font-black text-white font-mono tracking-tight mb-3">{data.project.name}</h1>
          {data.project.description && (
            <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">{data.project.description}</p>
          )}
          <p className="text-xs text-slate-600 font-mono mt-4 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Created {new Date(data.project.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Recommendations */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-mono">Top recommendations ({data.recommendations.length})</h2>
        </div>

        {data.recommendations.length === 0 ? (
          <p className="text-sm text-slate-500 font-mono italic">No recommendations saved yet.</p>
        ) : (
          <div className="space-y-3">
            {data.recommendations.map(rec => {
              const ai = aiOf(rec.ai_analysis);
              return (
                <a
                  key={rec.repo_id}
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block glass-card rounded-2xl p-5 hover:border-accent-blue/40 transition-all group"
                  style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white font-mono group-hover:text-accent-blue transition-colors truncate">
                          {rec.repo_id}
                        </h3>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-accent-blue flex-none" />
                      </div>
                      {rec.description && <p className="text-sm text-slate-400 line-clamp-2">{rec.description}</p>}
                    </div>
                    <div className="flex-none text-right">
                      <div className={`text-2xl font-black font-mono ${scoreColor(rec.fit_score)}`}>{rec.fit_score}</div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-600 font-mono">fit</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic mb-3 font-mono">{rec.rationale}</p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 flex-wrap">
                    {rec.language && <span>{rec.language}</span>}
                    {rec.license && <span className="px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">{rec.license}</span>}
                    <span className="flex items-center gap-0.5 text-amber-500"><Star className="w-3 h-3" />{rec.stars?.toLocaleString()}</span>
                    {ai.comparableApp && <span className="text-purple-300">Replaces {ai.comparableApp}</span>}
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl text-center" style={{ background: 'rgba(77,142,255,0.08)', border: '1px solid rgba(77,142,255,0.2)' }}>
          <h3 className="text-xl font-bold text-white font-mono mb-2">Build your own curated list</h3>
          <p className="text-sm text-slate-400 mb-4">RepoHive helps you find the right open-source repos for any project. Free tier includes 50 repos.</p>
          <Link to="/sign-up" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-accent-blue text-white font-mono font-bold text-sm hover:bg-accent-blue/80">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};
