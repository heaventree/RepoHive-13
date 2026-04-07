import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  Bookmark, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  History, 
  Star, 
  GitFork, 
  Database, 
  Github,
  ChevronDown,
  Flame
} from 'lucide-react';
import { Repo, Snapshot } from '../types';

interface RepoDetailProps {
  repo: Repo;
  onBack: () => void;
}

export const RepoDetail: React.FC<RepoDetailProps> = ({ repo, onBack }) => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isReadmeExpanded, setIsReadmeExpanded] = useState(false);

  const aiData = useMemo(() => {
    try {
      return repo.ai_analysis ? JSON.parse(repo.ai_analysis) : null;
    } catch (e) {
      return null;
    }
  }, [repo.ai_analysis]);

  const formatRepoName = (id: string) => {
    const parts = id.split('/');
    const name = parts[parts.length - 1];
    return name.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <header className="glass-header sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="hover:text-slate-200 cursor-pointer" onClick={onBack}>Library</span>
              <span className="text-slate-600">/</span>
              <span className="font-mono text-accent-blue/80">{repo.id}</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold text-white leading-tight flex items-center gap-3">
                  {formatRepoName(repo.id)}
                  <span className="px-2.5 py-0.5 bg-green-500/10 text-green-400 text-[9px] font-bold rounded-full border border-green-500/20 uppercase tracking-widest">Active</span>
                </h1>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-slate-400 font-mono flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-accent-blue" /> v1.0.0
                  </span>
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Updated {new Date(repo.last_push).toLocaleDateString()}
                  </span>
                  <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${getLicenseColor(repo.license)}`}>
                    <ShieldCheck className="w-3.5 h-3.5" /> {repo.license}
                  </span>
                  {aiData?.tags?.slice(0, 2).map((tag: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold rounded-md border border-blue-500/20 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-4xl font-bold text-accent-blue/90 font-mono tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{repo.score}<span className="text-lg text-slate-500 font-normal ml-1">/100</span></div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">AI Viability Index</div>
                  <div className="text-[8px] text-slate-600 uppercase font-medium mt-0.5">Based on 12 key metrics</div>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div className="flex gap-2">
                <a 
                  href={repo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all text-xs font-bold rounded-xl flex items-center gap-2 active:scale-95"
                >
                  <Github className="w-4 h-4" />
                  <span>Github</span>
                </a>
                <button className="px-4 py-2 bg-accent-blue/5 border border-accent-blue/20 hover:bg-accent-blue/10 text-accent-blue text-xs font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95">
                  <RefreshCw className="w-4 h-4" />
                  Rescan
                </button>
                <button className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95">
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
          <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Zap className="text-white w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white">AI Smart Summary</h2>
              </div>
              <div className="flex gap-2">
                {aiData?.tags?.map((tag: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-md border border-blue-500/20 uppercase tracking-wider">
                    {tag}
                  </span>
                )) || (
                  <>
                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-md border border-blue-500/20 uppercase tracking-wider">FRONTEND</span>
                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-md border border-blue-500/20 uppercase tracking-wider">JAVASCRIPT</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">
              {aiData?.summary || repo.description || "No description available for this repository."}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5 shadow-xl">
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Best For Use Cases
              </h4>
              <ul className="space-y-3">
                {(aiData?.useCases || ["Single Page Applications (SPAs)", "Complex State Management"]).map((useCase: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-base text-slate-300">
                    <CheckCircle className="w-5 h-5 text-accent-green shrink-0 mt-0.5" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-5 shadow-xl">
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Integration Notes
              </h4>
              <div className="space-y-3">
                {aiData?.integrationNotes?.map((note: any, idx: number) => (
                  <div key={idx} className="p-3 bg-bg-dark rounded-lg border border-border-main">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold text-white">{note.platform}</span>
                      <span className={`text-xs px-2 py-0.5 font-medium rounded-full ${
                        note.match === 'Perfect Match' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {note.match}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{note.description}</p>
                  </div>
                )) || (
                  <div className="p-3 bg-bg-dark rounded-lg border border-border-main">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold text-white">Next.js</span>
                      <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 font-medium rounded-full">Perfect Match</span>
                    </div>
                    <p className="text-xs text-slate-500">Official recommendation for production apps.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {repo.readme && (
            <section className="glass-card rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-accent-blue" />
                  <h3 className="text-lg font-bold text-white">README Insights</h3>
                </div>
                <button 
                  onClick={() => setIsReadmeExpanded(!isReadmeExpanded)}
                  className="text-xs font-bold text-accent-blue hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  {isReadmeExpanded ? 'Show Less' : 'Expand Full Content'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isReadmeExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div className={`prose prose-invert max-w-none text-base text-slate-400 relative ${!isReadmeExpanded ? 'max-h-[400px] overflow-hidden' : ''}`}>
                <div className="whitespace-pre-wrap font-mono text-sm bg-bg-dark/50 p-4 rounded-lg border border-border-main/50">
                  {isReadmeExpanded ? repo.readme : repo.readme.substring(0, 2000)}
                  {!isReadmeExpanded && repo.readme.length > 2000 && "..."}
                </div>
                {!isReadmeExpanded && repo.readme.length > 2000 && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-panel to-transparent flex items-end justify-center pb-4">
                    <button 
                      onClick={() => setIsReadmeExpanded(true)}
                      className="px-4 py-2 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold rounded-lg hover:bg-accent-blue/20 transition-all"
                    >
                      Read More
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="glass-card rounded-2xl shadow-xl">
            <div className="p-4 border-b border-white/8 flex justify-between items-center">
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

              {aiData?.enterpriseTier && (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-amber-500/25"
                  style={{ background: 'rgba(245,158,11,0.06)' }}>
                  <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-0.5">App Killer</p>
                    <p className="text-xs text-slate-300 truncate">
                      Replaces <span className="text-amber-300 font-semibold">{aiData.comparableApp || 'commercial SaaS'}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
