import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  RefreshCw, 
  Bookmark, 
  ExternalLink,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  ShieldCheck,
  Zap,
  History,
  Star,
  GitFork,
  Database,
  Github
} from 'lucide-react';
import { Repo, Snapshot } from '../types';

interface RepoDetailProps {
  repo: Repo;
  onBack: () => void;
}

export const RepoDetail: React.FC<RepoDetailProps> = ({ repo, onBack }) => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  useEffect(() => {
    fetch(`/api/repos/${repo.owner}/${repo.name}`)
      .then(res => res.json())
      .then(data => setSnapshots(data.snapshots || []));
  }, [repo]);

  const getLicenseColor = (license: string) => {
    const l = license?.toUpperCase() || '';
    if (l.includes('MIT')) return 'text-[#00FF00] bg-[#00FF00]/10 border-[#00FF00]/30 shadow-[0_0_10px_rgba(0,255,0,0.1)]';
    if (l.includes('APACHE')) return 'text-accent-amber bg-accent-amber/10 border-accent-amber/20';
    if (l.includes('GPL')) return 'text-accent-red bg-accent-red/10 border-accent-red/20';
    if (l.includes('BSD')) return 'text-accent-green bg-accent-green/10 border-accent-green/20';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg-dark custom-scrollbar">
      <header className="bg-bg-panel border-b border-border-main sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-700"></div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Library</span>
              <span>/</span>
              <span className="font-mono text-white">{repo.id}</span>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors p-1">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center border border-border-main overflow-hidden shrink-0 shadow-sm text-xl font-bold">
                {repo.owner[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white leading-tight flex items-center gap-3">
                  {repo.id}
                  <span className="px-2.5 py-0.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20 uppercase tracking-wide">Active</span>
                  <a 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-white transition-colors ml-2"
                    title="View on GitHub"
                  >
                    <Github className="w-6 h-6" />
                  </a>
                </h1>
                <div className="flex items-center gap-4 mt-2 text-base">
                  <span className="text-slate-400 font-mono flex items-center gap-1">
                    <Zap className="w-4 h-4" /> v1.0.0
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <History className="w-4 h-4" /> Updated {new Date(repo.last_push).toLocaleDateString()}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${getLicenseColor(repo.license)}`}>
                    <ShieldCheck className="w-4 h-4" /> {repo.license} License
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-4xl font-bold text-accent-blue font-mono tracking-tight">{repo.score}<span className="text-xl text-slate-500 font-normal">/100</span></div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Health Score</div>
              </div>
              <div className="h-10 w-px bg-slate-700"></div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Rescan
                </button>
                <button className="px-4 py-2 bg-bg-dark border border-border-main hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors">
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  Watch
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-bg-panel rounded-xl border border-border-main p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Zap className="text-white w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">AI Smart Summary</h2>
              </div>
              <span className="text-xs bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20 font-medium">Model: Gemini 3 Flash</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-base mb-6">
              {repo.description || "No description available for this repository."}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-md border border-blue-500/20">FRONTEND</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-md border border-blue-500/20">JAVASCRIPT</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-md border border-blue-500/20">LIBRARY</span>
            </div>
          </section>

          {repo.readme && (
            <section className="bg-bg-panel rounded-xl border border-border-main p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-accent-blue" />
                <h3 className="text-lg font-bold text-white">README Insights</h3>
              </div>
              <div className="prose prose-invert max-w-none text-base text-slate-400 line-clamp-[10] overflow-hidden relative">
                <div className="whitespace-pre-wrap font-mono text-sm bg-bg-dark/50 p-4 rounded-lg border border-border-main/50">
                  {repo.readme.substring(0, 2000)}
                  {repo.readme.length > 2000 && "..."}
                </div>
                {repo.readme.length > 2000 && (
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-bg-panel to-transparent flex items-end justify-center pb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Truncated for preview</span>
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-panel rounded-xl border border-border-main p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Best For Use Cases
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-base text-slate-300">
                  <CheckCircle className="w-5 h-5 text-accent-green shrink-0 mt-0.5" />
                  <span>Single Page Applications (SPAs)</span>
                </li>
                <li className="flex items-start gap-3 text-base text-slate-300">
                  <CheckCircle className="w-5 h-5 text-accent-green shrink-0 mt-0.5" />
                  <span>Complex State Management</span>
                </li>
              </ul>
            </div>
            <div className="bg-bg-panel rounded-xl border border-border-main p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Integration Notes
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-bg-dark rounded-lg border border-border-main">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-white">Next.js</span>
                    <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 font-medium rounded-full">Perfect Match</span>
                  </div>
                  <p className="text-xs text-slate-500">Official recommendation for production apps.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="bg-bg-panel rounded-xl border border-border-main shadow-sm">
            <div className="p-4 border-b border-border-main flex justify-between items-center bg-slate-800/30">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent-blue" />
                Scoring Engine
              </h3>
            </div>
            <div className="p-5 space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white uppercase">Popularity</span>
                    <span className="text-xs text-slate-500">Stars, Forks, Watchers</span>
                  </div>
                  <span className="text-xl font-mono font-bold text-white">24<span className="text-base text-slate-500">/25</span></span>
                </div>
                <div className="w-full bg-slate-800 rounded-sm h-4 mb-3 relative overflow-hidden">
                  <div className="bg-indigo-500 h-4 rounded-sm" style={{ width: '96%' }}></div>
                </div>
                <div className="flex gap-4 text-sm text-slate-500 font-mono border-t border-dashed border-slate-700 pt-2">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {repo.stars}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {repo.forks}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white uppercase">Activity</span>
                    <span className="text-xs text-slate-500">Commits, PR Velocity</span>
                  </div>
                  <span className="text-xl font-mono font-bold text-white">22<span className="text-base text-slate-500">/25</span></span>
                </div>
                <div className="w-full bg-slate-800 rounded-sm h-4 mb-3 relative overflow-hidden">
                  <div className="bg-green-500 h-4 rounded-sm" style={{ width: '88%' }}></div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded p-3 flex gap-3 items-start">
                  <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-400 font-bold mb-0.5">High Velocity</p>
                    <p className="text-xs text-green-300/70 leading-snug">Last release 4d ago. This project moves fast.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white uppercase">Maintenance</span>
                    <span className="text-xs text-slate-500">Issue Closure, Stale Bots</span>
                  </div>
                  <span className="text-xl font-mono font-bold text-white">16<span className="text-base text-slate-500">/20</span></span>
                </div>
                <div className="w-full bg-slate-800 rounded-sm h-4 mb-3 relative overflow-hidden">
                  <div className="bg-amber-500 h-4 rounded-sm" style={{ width: '80%' }}></div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 flex gap-3 items-start">
                  <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-400 font-bold mb-0.5">Improvement Hint</p>
                    <p className="text-xs text-amber-300/70 leading-snug">Close ratio on issues dipped below 80%.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
