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
  Github,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Repo } from '../types';

interface LibraryProps {
  onViewRepo: (repo: Repo) => void;
  onBulkIngest: () => void;
  onGoToWorkspace: () => void;
}

const LinkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className={className} fill="currentColor">
    <path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z"/>
  </svg>
);

const StatusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className={className} fill="currentColor">
    <path d="M192 32C209.7 32 224 46.3 224 64L224 160L352 160L352 64C352 46.3 366.3 32 384 32C401.7 32 416 46.3 416 64L416 160L480 160C497.7 160 512 174.3 512 192C512 209.7 497.7 224 480 224L480 272.7C381.4 280.8 304 363.4 304 464C304 491.3 309.7 517.3 320 540.9L320 544C320 561.7 305.7 576 288 576C270.3 576 256 561.7 256 544L256 477.3C165.2 462.1 96 383.1 96 288L96 224C78.3 224 64 209.7 64 192C64 174.3 78.3 160 96 160L160 160L160 64C160 46.3 174.3 32 192 32zM352 464C352 384.5 416.5 320 496 320C575.5 320 640 384.5 640 464C640 543.5 575.5 608 496 608C416.5 608 352 543.5 352 464zM553.4 403.1C546.3 397.9 536.2 399.5 531 406.6L478 479.5L451.2 452.7C445 446.5 434.8 446.5 428.6 452.7C422.4 458.9 422.4 469.1 428.6 475.3L468.6 515.3C471.9 518.6 476.5 520.3 481.2 519.9C485.9 519.5 490.1 517.1 492.9 513.4L556.9 425.4C562.1 418.3 560.5 408.2 553.4 403.1z"/>
  </svg>
);

export const Library: React.FC<LibraryProps> = ({ onViewRepo, onBulkIngest, onGoToWorkspace }) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLicense, setSelectedLicense] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRescanning, setIsRescanning] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [singleRepoUrl, setSingleRepoUrl] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickAddStatus, setQuickAddStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [purposeRepo, setPurposeRepo] = useState<Repo | null>(null);

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
        if (sortBy === 'latest') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        if (sortBy === 'oldest') return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        
        let comparison = 0;
        if (sortBy === 'score') comparison = a.score - b.score;
        else if (sortBy === 'stars') comparison = a.stars - b.stars;
        else if (sortBy === 'name') comparison = a.id.localeCompare(b.id);
        else if (sortBy === 'language') comparison = (a.language || '').localeCompare(b.language || '');
        else if (sortBy === 'license') comparison = (a.license || '').localeCompare(b.license || '');
        else if (sortBy === 'status') comparison = (a.status || '').localeCompare(b.status || '');
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [repos, searchQuery, selectedLicense, selectedCategory, selectedLanguage, minScore, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleQuickAdd = async () => {
    const url = singleRepoUrl.trim();
    if (!url || isQuickAdding) return;
    setIsQuickAdding(true);
    setQuickAddStatus(null);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) throw new Error('Already in library');
        throw new Error(data.error || res.statusText);
      }
      setQuickAddStatus({ ok: true, msg: `Added ${data.id} · score ${data.score} · ${data.category}` });
      setSingleRepoUrl('');
      fetchRepos();
    } catch (err: any) {
      setQuickAddStatus({ ok: false, msg: err.message });
    } finally {
      setIsQuickAdding(false);
      setTimeout(() => setQuickAddStatus(null), 4000);
    }
  };

  const formatRepoName = (id: string) => {
    const parts = id.split('/');
    const name = parts[parts.length - 1];
    return name.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isStale = (lastPush: string) => {
    const lastDate = new Date(lastPush);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  };

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
          <h2 className="text-3xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <span className="text-accent-blue">~/</span>Repositories
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-2 bg-bg-panel border rounded-sm px-3 py-1.5 transition-colors ${isQuickAdding ? 'border-accent-blue' : 'border-border-main focus-within:border-accent-blue'}`}>
              {isQuickAdding
                ? <RefreshCw className="w-4 h-4 text-accent-blue animate-spin" />
                : <PlusCircle className="w-4 h-4 text-slate-500" />}
              <input 
                type="text" 
                placeholder="Quick add repo URL..." 
                className="bg-transparent border-0 text-xs text-white outline-none w-48 placeholder-slate-600"
                value={singleRepoUrl}
                onChange={(e) => setSingleRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                disabled={isQuickAdding}
              />
            </div>
            {quickAddStatus && (
              <span className={`text-[10px] font-mono px-1 ${quickAddStatus.ok ? 'text-accent-green' : 'text-accent-red'}`}>
                {quickAddStatus.msg}
              </span>
            )}
          </div>
          <button 
            onClick={handleRescanAll}
            disabled={isRescanning || repos.length === 0}
            className="bg-bg-panel hover:bg-slate-800 disabled:opacity-50 text-slate-200 text-xs font-bold py-2 px-4 rounded-sm flex items-center gap-2 shadow-sm transition-colors border border-border-main"
          >
            <RefreshCw className={`w-4 h-4 ${isRescanning ? 'animate-spin' : ''}`} />
            <span>{isRescanning ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button 
            onClick={onBulkIngest}
            className="bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-sm flex items-center gap-2 shadow-sm transition-colors border border-blue-500"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Bulk</span>
          </button>
        </div>
      </div>

      <div className="flex-none px-6 py-3 mb-6 flex flex-col gap-3 bg-bg-dark border-b border-border-main/30">
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
                className="bg-bg-panel border border-border-main rounded-sm text-sm py-1.5 pl-9 pr-8 text-white placeholder-slate-600 focus:border-accent-blue outline-none transition-all w-72"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
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
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
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
          <span className="text-xs font-bold text-slate-500 uppercase font-mono whitespace-nowrap mr-1">License:</span>
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
        {purposeRepo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-bg-panel border border-border-main rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-bg-dark">
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-accent-blue" /> Purpose & Suitability Analysis
                </h3>
                <button onClick={() => setPurposeRepo(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-widest mb-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-accent-blue" /> AI Analysis Summary
                    </h4>
                    <p className="text-base text-slate-200 leading-relaxed font-mono">
                      {(() => {
                        try {
                          const data = JSON.parse(purposeRepo.ai_analysis || '{}');
                          return data.summary || purposeRepo.description || 'No detailed analysis available.';
                        } catch (e) {
                          return purposeRepo.description || 'No detailed analysis available.';
                        }
                      })()}
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-widest mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-yellow-500" /> Primary Language
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                        <span className="text-lg text-white font-mono">{purposeRepo.language}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-widest mb-3 flex items-center gap-2">
                        <Verified className="w-4 h-4 text-accent-blue" /> License
                      </h4>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border ${getLicenseColor(purposeRepo.license)}`}>
                        <Verified className="w-4 h-4" />
                        <span className="text-sm font-bold font-mono">{purposeRepo.license}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-widest mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-accent-green" /> Best Suitability & Use Cases
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      try {
                        const data = JSON.parse(purposeRepo.ai_analysis || '{}');
                        return data.useCases?.map((useCase: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-accent-green/10 text-accent-green border border-accent-green/20 text-xs font-bold uppercase rounded-sm font-mono">
                            {useCase}
                          </span>
                        )) || <span className="text-slate-500 italic">No use cases identified.</span>;
                      } catch (e) {
                        return <span className="text-slate-500 italic">No use cases identified.</span>;
                      }
                    })()}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-bg-dark border-t border-border-main flex justify-end">
                <button 
                  onClick={() => setPurposeRepo(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-md transition-all font-mono"
                >
                  Close Analysis
                </button>
              </div>
            </div>
          </div>
        )}

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
          <div className="bg-bg-panel border border-border-main rounded-sm shadow-xl min-w-[1000px]">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border-main bg-[#162032] text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono sticky top-0 z-10">
              <div 
                onClick={() => handleSort('name')}
                className="col-span-4 pl-2 cursor-pointer hover:text-white flex items-center gap-1"
              >
                Repository Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div className="col-span-1 text-center">Purpose</div>
              <div 
                onClick={() => handleSort('status')}
                className="col-span-1 cursor-pointer hover:text-white flex items-center justify-center gap-1"
              >
                Active {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div 
                onClick={() => handleSort('stars')}
                className="col-span-1 cursor-pointer hover:text-white flex items-center justify-center gap-1"
              >
                Stars {sortBy === 'stars' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div 
                onClick={() => handleSort('score')}
                className="col-span-2 cursor-pointer hover:text-white flex items-center justify-center gap-1"
              >
                AI Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div 
                onClick={() => handleSort('license')}
                className="col-span-2 cursor-pointer hover:text-white flex items-center justify-center gap-1"
              >
                License {sortBy === 'license' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div className="col-span-1 flex justify-end pr-2">
                <Github className="w-4 h-4" />
              </div>
            </div>
            
            <div className="divide-y divide-border-main">
              {filteredRepos.map(repo => {
                let aiData = null;
                try {
                  if (repo.ai_analysis) aiData = JSON.parse(repo.ai_analysis);
                } catch (e) {}

                const stale = isStale(repo.last_push);

                return (
                  <div 
                    key={repo.id}
                    onClick={() => onViewRepo(repo)}
                    className="group hover:bg-[#253248] cursor-pointer transition-colors border-l-2 border-l-transparent hover:border-l-accent-blue"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center px-4 py-6">
                      <div className="col-span-4 flex flex-col gap-1 pl-2">
                        <div className="min-w-0">
                          <div className="font-bold text-lg text-slate-200 group-hover:text-accent-blue transition-colors truncate">
                            {formatRepoName(repo.id)}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-3">
                            <span>Updated {new Date(repo.last_push).toLocaleDateString()}</span>
                            <span className="text-accent-blue/60 group-hover:text-accent-blue flex items-center gap-0.5 transition-colors">
                              <ChevronRight className="w-3 h-3" />
                              View Details
                            </span>
                            {aiData?.tags?.slice(0, 2).map((tag: string, idx: number) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold rounded border border-blue-500/20 uppercase tracking-wider">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPurposeRepo(repo);
                          }}
                          className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded transition-colors"
                          title="View Purpose & Suitability"
                        >
                          <HelpCircle className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <div className={`p-1.5 rounded border ${stale ? 'text-accent-amber bg-accent-amber/10 border-accent-amber/20' : 'text-[#00FF00] bg-[#00FF00]/10 border-[#00FF00]/30 shadow-[0_0_10px_rgba(0,255,0,0.1)]'}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="col-span-1 flex items-center justify-center gap-1 text-slate-300 font-mono text-sm">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span>{repo.stars > 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-bg-dark h-1.5 rounded-full overflow-hidden border border-border-main">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                repo.score > 80 ? 'bg-[#00FF00]' : repo.score > 50 ? 'bg-accent-amber' : 'bg-accent-red'
                              }`}
                              style={{ width: `${repo.score}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-bold font-mono w-8 text-right ${
                            repo.score > 80 ? 'text-[#00FF00]' : repo.score > 50 ? 'text-accent-amber' : 'text-accent-red'
                          }`}>{repo.score}</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border transition-colors ${getLicenseColor(repo.license)}`}>
                          <Verified className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold font-mono">{repo.license}</span>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end items-center pr-2 gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewRepo(repo);
                          }}
                          className="p-1.5 text-accent-blue hover:text-white hover:bg-accent-blue/20 rounded transition-all"
                          title="View Details"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-all"
                          title="View on GitHub"
                        >
                          <LinkIcon className="w-5 h-5" />
                        </a>
                      </div>
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
                      <div className="flex flex-col">
                        <h4 className="text-lg font-bold text-white group-hover:text-accent-blue transition-colors font-mono truncate max-w-[180px]">
                          {formatRepoName(repo.id)}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Updated {new Date(repo.last_push).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-yellow-500 font-mono text-sm mb-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-500" />
                          <span>{repo.stars > 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-bg-dark h-1 rounded-full overflow-hidden border border-border-main">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                repo.score > 80 ? 'bg-[#00FF00]' : repo.score > 50 ? 'bg-accent-amber' : 'bg-accent-red'
                              }`}
                              style={{ width: `${repo.score}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-bold font-mono ${
                            repo.score > 80 ? 'text-[#00FF00]' : repo.score > 50 ? 'text-accent-amber' : 'text-accent-red'
                          }`}>{repo.score}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3 items-center">
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-[10px] font-bold font-mono uppercase"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>View on Github</span>
                      </a>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRepo(repo);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded border border-accent-blue/30 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 hover:border-accent-blue transition-all text-[10px] font-bold font-mono uppercase"
                      >
                        <span>Full Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
