import React, { useState, useEffect, useMemo } from 'react';
import { 
  Filter, 
  SortDesc, 
  PlusCircle, 
  Verified, 
  ExternalLink,
  Search,
  RefreshCw,
  Rocket,
  LayoutGrid,
  List as ListIcon,
  Tag,
  Cpu,
  Globe,
  ShieldCheck,
  ChevronDown,
  X,
  Star,
  Github
} from 'lucide-react';
import { Repo } from '../types';

interface LibraryProps {
  onViewRepo: (repo: Repo) => void;
  onBulkIngest: () => void;
  onGoToWorkspace: () => void;
}

export const Library: React.FC<LibraryProps> = ({ onViewRepo, onBulkIngest, onGoToWorkspace }) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLicense, setSelectedLicense] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score' | 'stars' | 'name'>('score');
  const [isRescanning, setIsRescanning] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const fetchRepos = () => {
    setLoading(true);
    fetch('/api/repos')
      .then(res => res.json())
      .then(data => {
        setRepos(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    repos.forEach(r => {
      try {
        if (r.ai_analysis) {
          const data = JSON.parse(r.ai_analysis);
          if (data.category) cats.add(data.category);
        }
      } catch (e) {}
    });
    return ['All', ...Array.from(cats)];
  }, [repos]);

  const licenses = useMemo(() => {
    const unique = new Set(repos.map(r => r.license).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [repos]);

  const languages = useMemo(() => {
    const unique = new Set(repos.map(r => r.language).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [repos]);

  const suitabilities = useMemo(() => {
    const unique = new Set<string>();
    repos.forEach(r => {
      try {
        if (r.ai_analysis) {
          const data = JSON.parse(r.ai_analysis);
          if (data.useCases) {
            data.useCases.forEach((u: string) => unique.add(u));
          }
        }
      } catch (e) {}
    });
    return ['All', ...Array.from(unique)];
  }, [repos]);

  const getLicenseColor = (license: string) => {
    const l = license?.toUpperCase() || '';
    if (l.includes('MIT')) return 'text-[#00FF00] bg-[#00FF00]/10 border-[#00FF00]/30 shadow-[0_0_10px_rgba(0,255,0,0.1)]';
    if (l.includes('APACHE')) return 'text-accent-amber bg-accent-amber/10 border-accent-amber/20';
    if (l.includes('GPL')) return 'text-accent-red bg-accent-red/10 border-accent-red/20';
    if (l.includes('BSD')) return 'text-accent-green bg-accent-green/10 border-accent-green/20';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  const filteredRepos = useMemo(() => {
    return repos
      .filter(repo => {
        const matchesSearch = repo.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLicense = selectedLicense === 'All' || repo.license === selectedLicense;
        const matchesLanguage = selectedLanguage === 'All' || repo.language === selectedLanguage;
        const matchesScore = repo.score >= minScore;
        
        let matchesCategory = selectedCategory === 'All';

        if (!matchesCategory && repo.ai_analysis) {
          try {
            const data = JSON.parse(repo.ai_analysis);
            matchesCategory = data.category === selectedCategory;
          } catch (e) {}
        }
        
        return matchesSearch && matchesLicense && matchesCategory && matchesLanguage && matchesScore;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.score - a.score;
        if (sortBy === 'stars') return b.stars - a.stars;
        return a.id.localeCompare(b.id);
      });
  }, [repos, searchQuery, selectedLicense, selectedCategory, selectedLanguage, minScore, sortBy]);

  const handleRescanAll = async () => {
    if (isRescanning || repos.length === 0) return;
    setIsRescanning(true);
    // In a real app, we'd probably do this on the server or via a queue
    // For this demo, we'll just trigger the ingest logic for each
    onBulkIngest(); 
    setIsRescanning(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-bg-dark relative overflow-hidden">
      <div className="flex-none p-6 pb-4 flex items-end justify-between border-b border-border-main/50">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 font-mono">
            <span className="hover:text-white cursor-pointer">Workspace</span>
            <span>/</span>
            <span className="text-white">Library</span>
          </div>
          <h2 className="text-3xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <span className="text-accent-blue">~/</span>Repositories
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-mono">
            Managing {repos.length} repositories across internal and external sources.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRescanAll}
            disabled={isRescanning || repos.length === 0}
            className="bg-bg-panel hover:bg-slate-800 disabled:opacity-50 text-slate-200 text-xs font-bold py-2 px-4 rounded-sm flex items-center gap-2 shadow-sm transition-colors border border-border-main"
          >
            <RefreshCw className={`w-4 h-4 ${isRescanning ? 'animate-spin' : ''}`} />
            <span>{isRescanning ? 'Rescanning...' : 'Rescan All'}</span>
          </button>
          <button 
            onClick={onBulkIngest}
            className="bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-sm flex items-center gap-2 shadow-sm transition-colors border border-blue-500"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Bulk Ingest</span>
          </button>
        </div>
      </div>

      <div className="flex-none px-6 py-3 flex flex-col gap-3 bg-bg-dark border-b border-border-main/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex bg-bg-panel border border-border-main rounded-sm p-0.5 mr-2 shadow-inner">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-accent-blue text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-accent-blue text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-accent-blue transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search library..."
                className="bg-bg-panel border border-border-main rounded-sm text-sm py-1.5 pl-9 pr-3 text-white placeholder-slate-600 focus:border-accent-blue outline-none transition-all w-72"
              />
            </div>

            <div className="h-4 w-px bg-border-main mx-2"></div>

            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-bg-panel border border-border-main rounded-sm text-sm font-bold text-slate-300 hover:text-white hover:border-accent-blue transition-all"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
              {(selectedCategory !== 'All' || selectedLanguage !== 'All' || minScore > 0) && (
                <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse"></span>
              )}
            </button>

            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-xs font-bold text-slate-500 uppercase font-mono">Sort:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-bg-panel border border-border-main rounded-sm text-xs font-bold py-1.5 px-2 text-slate-200 focus:border-accent-blue outline-none cursor-pointer uppercase font-mono"
              >
                <option value="score">Score</option>
                <option value="stars">Stars</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-slate-500 font-mono">
            Showing <span className="text-slate-200 font-bold">{filteredRepos.length}</span> of <span className="text-slate-200">{repos.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-500 uppercase font-mono whitespace-nowrap mr-1">License Filter:</span>
          {licenses.map(license => {
            const isActive = selectedLicense === license;
            const colorClasses = getLicenseColor(license);
            return (
              <button
                key={license}
                onClick={() => setSelectedLicense(license)}
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all border whitespace-nowrap ${
                  isActive 
                    ? `${colorClasses} scale-105 shadow-md` 
                    : 'bg-slate-800/30 text-slate-500 border-slate-700/50 hover:border-slate-500 hover:text-slate-300'
                }`}
              >
                {license}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-6 custom-scrollbar">
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-bg-panel border border-border-main rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-bg-dark">
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Filter className="w-5 h-5 text-accent-blue" /> Advanced Filters
                </h3>
                <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Primary Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-bg-dark border border-border-main rounded-md py-2 px-3 text-sm text-white focus:border-accent-blue outline-none cursor-pointer font-mono"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Programming Language</label>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-bg-dark border border-border-main rounded-md py-2 px-3 text-sm text-white focus:border-accent-blue outline-none cursor-pointer font-mono"
                  >
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Minimum Intelligence Score</label>
                    <span className="text-sm font-bold text-accent-blue font-mono">{minScore}</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full h-1.5 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-accent-blue border border-border-main"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-bg-dark border-t border-border-main flex justify-between gap-3">
                <button 
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedLanguage('All');
                    setMinScore(0);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors font-mono"
                >
                  Reset All
                </button>
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-6 py-2 bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold rounded-md transition-all font-mono shadow-lg shadow-blue-500/20"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-mono text-sm">Loading library...</div>
        ) : filteredRepos.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-sm">No repositories match your filters.</div>
        ) : viewMode === 'list' ? (
          <div className="bg-bg-panel border border-border-main rounded-sm shadow-xl min-w-[900px]">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border-main bg-[#162032] text-sm font-bold text-slate-400 uppercase tracking-wider font-mono sticky top-0 z-10">
              <div className="col-span-3 pl-2">Repository Name</div>
              <div className="col-span-2">Suitability</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Stars</div>
              <div className="col-span-2">AI Score</div>
              <div className="col-span-1">Language</div>
              <div className="col-span-2 text-right pr-2">Actions</div>
            </div>
            
            <div className="divide-y divide-border-main">
              {filteredRepos.map(repo => {
                let aiData = null;
                try {
                  if (repo.ai_analysis) aiData = JSON.parse(repo.ai_analysis);
                } catch (e) {}

                return (
                  <div 
                    key={repo.id}
                    onClick={() => onViewRepo(repo)}
                    className="group hover:bg-[#253248] cursor-pointer transition-colors grid grid-cols-12 gap-4 items-center px-4 py-3 border-l-2 border-l-transparent hover:border-l-accent-blue"
                  >
                    <div className="col-span-3 flex items-center gap-3 pl-2">
                      <div className="w-8 h-8 rounded-md border border-border-main bg-slate-800 flex items-center justify-center text-xs font-bold">
                        {repo.owner[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-base text-slate-200 group-hover:text-accent-blue transition-colors truncate">{repo.id}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5 flex gap-2">
                          <span>Updated {new Date(repo.last_push).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-wrap gap-1">
                      {aiData?.useCases?.slice(0, 2).map((useCase: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-accent-green/10 text-accent-green border border-accent-green/20 text-xs font-bold uppercase rounded-sm font-mono truncate max-w-full">
                          {useCase}
                        </span>
                      ))}
                    </div>
                    <div className="col-span-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border mono ${
                        repo.status === 'ACTIVE' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-slate-700/50 text-slate-400 border-slate-600/50'
                      }`}>
                        {repo.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>}
                        {repo.status}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center gap-1 text-slate-300 font-mono text-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span>{repo.stars > 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-bg-dark h-2 rounded-full overflow-hidden border border-border-main">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              repo.score > 80 ? 'bg-accent-green' : repo.score > 50 ? 'bg-accent-amber' : 'bg-accent-red'
                            }`}
                            style={{ width: `${repo.score}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold font-mono w-8 text-right ${
                          repo.score > 80 ? 'text-accent-green' : repo.score > 50 ? 'text-accent-amber' : 'text-accent-red'
                        }`}>{repo.score}</span>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      <span className="text-sm text-slate-200 font-mono truncate">{repo.language}</span>
                    </div>
                    <div className="col-span-2 flex justify-end items-center gap-3 pr-2">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-colors ${getLicenseColor(repo.license)}`}>
                        <Verified className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold font-mono">{repo.license}</span>
                      </div>
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-all"
                        title="View on GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRepos.map(repo => {
              let aiData = null;
              try {
                if (repo.ai_analysis) aiData = JSON.parse(repo.ai_analysis);
              } catch (e) {}

              return (
                <div 
                  key={repo.id}
                  onClick={() => onViewRepo(repo)}
                  className="bg-bg-panel border border-border-main rounded-sm overflow-hidden group hover:border-accent-blue transition-all cursor-pointer flex flex-col"
                >
                  <div className="p-5 border-b border-border-main bg-gradient-to-br from-bg-panel to-bg-dark relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded border border-border-main bg-slate-800 flex items-center justify-center text-lg font-bold text-accent-blue">
                        {repo.owner[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-yellow-500 font-mono text-sm mb-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-500" />
                          <span>{repo.stars > 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}</span>
                        </div>
                        <div className={`text-xl font-bold font-mono ${
                          repo.score > 80 ? 'text-accent-green' : repo.score > 50 ? 'text-accent-amber' : 'text-accent-red'
                        }`}>{repo.score}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Intelligence Score</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-lg font-bold text-white group-hover:text-accent-blue transition-colors font-mono truncate">{repo.id}</h4>
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-1">Updated {new Date(repo.last_push).toLocaleDateString()}</p>
                  </div>

                  <div className="p-5 flex-1 space-y-4">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1.5 font-mono tracking-widest flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-accent-blue" /> AI Analysis
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                        {aiData?.summary || repo.description || 'No detailed analysis available for this node.'}
                      </p>
                    </div>

                    {aiData?.useCases && (
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2 font-mono tracking-widest flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-accent-green" /> Best Suitability
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {aiData.useCases.slice(0, 3).map((useCase: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-accent-green/10 text-accent-green border border-accent-green/20 text-xs font-bold uppercase rounded-sm font-mono">
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-bg-dark/50 border-t border-border-main flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                      <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {repo.language}</span>
                      <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${getLicenseColor(repo.license)}`}><ShieldCheck className="w-3.5 h-3.5" /> {repo.license}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
