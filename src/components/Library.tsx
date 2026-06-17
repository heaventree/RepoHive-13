import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter,
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
  X,
  Star,
  Github,
  HelpCircle,
  ChevronRight,
  Flame,
  GitCompare,
  ArrowDown,
  ArrowUp,
  Check,
  Play,
  Server
} from 'lucide-react';
import { Repo } from '../types';
import { classifyRepo } from '../lib/classification';
import { CompareModal } from './CompareModal';

interface LibraryProps {
  onViewRepo: (repo: Repo) => void;
  onBulkIngest: () => void;
  onGoToWorkspace: () => void;
  appKillersMode?: boolean;
  saasReadyMode?: boolean;
}

const StatusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className={className} fill="currentColor">
    <path d="M192 32C209.7 32 224 46.3 224 64L224 160L352 160L352 64C352 46.3 366.3 32 384 32C401.7 32 416 46.3 416 64L416 160L480 160C497.7 160 512 174.3 512 192C512 209.7 497.7 224 480 224L480 272.7C381.4 280.8 304 363.4 304 464C304 491.3 309.7 517.3 320 540.9L320 544C320 561.7 305.7 576 288 576C270.3 576 256 561.7 256 544L256 477.3C165.2 462.1 96 383.1 96 288L96 224C78.3 224 64 209.7 64 192C64 174.3 78.3 160 96 160L160 160L160 64C160 46.3 174.3 32 192 32zM352 464C352 384.5 416.5 320 496 320C575.5 320 640 384.5 640 464C640 543.5 575.5 608 496 608C416.5 608 352 543.5 352 464zM553.4 403.1C546.3 397.9 536.2 399.5 531 406.6L478 479.5L451.2 452.7C445 446.5 434.8 446.5 428.6 452.7C422.4 458.9 422.4 469.1 428.6 475.3L468.6 515.3C471.9 518.6 476.5 520.3 481.2 519.9C485.9 519.5 490.1 517.1 492.9 513.4L556.9 425.4C562.1 418.3 560.5 408.2 553.4 403.1z"/>
  </svg>
);

export const Library: React.FC<LibraryProps> = ({ onViewRepo, onBulkIngest, onGoToWorkspace, appKillersMode = false, saasReadyMode = false }) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRescanning, setIsRescanning] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [purposeRepo, setPurposeRepo] = useState<Repo | null>(null);
  const [enterpriseOnly, setEnterpriseOnly] = useState(appKillersMode);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  };

  const toggleInArray = (arr: string[], setter: (v: string[]) => void, value: string) => {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  useEffect(() => {
    setEnterpriseOnly(appKillersMode);
  }, [appKillersMode]);

  const fetchRepos = () => {
    setLoading(true);
    fetch('/api/repos')
      .then(res => res.json())
      .then(data => {
        setRepos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    return Array.from(cats).sort();
  }, [repos]);

  const licenses = useMemo(() => {
    const unique = new Set(repos.map(r => r.license).filter(Boolean));
    return Array.from(unique).sort();
  }, [repos]);

  const languages = useMemo(() => {
    const unique = new Set(repos.map(r => r.language).filter(Boolean));
    return Array.from(unique).sort();
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
        const matchesLicense = selectedLicenses.length === 0 || selectedLicenses.includes(repo.license);
        const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(repo.language);
        const matchesScore = repo.score >= minScore;

        let matchesCategory = selectedCategories.length === 0;
        if (!matchesCategory && repo.ai_analysis) {
          try {
            const data = JSON.parse(repo.ai_analysis);
            matchesCategory = selectedCategories.includes(data.category);
          } catch (e) {}
        }

        let matchesEnterprise = true;
        if (enterpriseOnly) {
          try {
            const data = repo.ai_analysis ? JSON.parse(repo.ai_analysis) : {};
            matchesEnterprise = classifyRepo(data).kind === 'app-killer';
          } catch { matchesEnterprise = false; }
          if (matchesEnterprise && appKillersMode) {
            const lic = (repo.license || '').toUpperCase();
            const openLicenses = ['MIT', 'APACHE', 'BSD', 'LGPL', 'MPL', 'ISC', 'AGPL', 'GPL'];
            matchesEnterprise = openLicenses.some(l => lic.includes(l));
          }
        }

        let matchesSaas = true;
        if (saasReadyMode) {
          try {
            const data = repo.ai_analysis ? JSON.parse(repo.ai_analysis) : {};
            matchesSaas = classifyRepo(data).kind === 'saas-ready';
          } catch { matchesSaas = false; }
        }

        return matchesSearch && matchesLicense && matchesCategory && matchesLanguage && matchesScore && matchesEnterprise && matchesSaas;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'latest' || sortBy === 'updated') {
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        } else if (sortBy === 'score') comparison = a.score - b.score;
        else if (sortBy === 'stars') comparison = a.stars - b.stars;
        else if (sortBy === 'name') comparison = a.id.localeCompare(b.id);
        else if (sortBy === 'language') comparison = (a.language || '').localeCompare(b.language || '');
        else if (sortBy === 'license') comparison = (a.license || '').localeCompare(b.license || '');

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [repos, searchQuery, selectedLicenses, selectedCategories, selectedLanguages, minScore, sortBy, sortOrder, enterpriseOnly, saasReadyMode]);

  const formatRepoName = (id: string) => {
    const parts = id.split('/');
    const name = parts[parts.length - 1];
    return name.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isStale = (lastPush: string) => {
    const lastDate = new Date(lastPush);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  };

  const handleRescanAll = async () => {
    if (isRescanning || repos.length === 0) return;
    setIsRescanning(true);
    onBulkIngest();
    setIsRescanning(false);
  };

  const activeFilterCount =
    selectedLicenses.length + selectedCategories.length + selectedLanguages.length + (minScore > 0 ? 1 : 0);

  const resetFilters = () => {
    setSelectedLicenses([]);
    setSelectedCategories([]);
    setSelectedLanguages([]);
    setMinScore(0);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
      {/* Compare action bar */}
      {compareIds.size > 0 && (
        <div className="flex-none px-6 py-2 flex items-center justify-between border-b border-border-main/30" style={{ background: 'rgba(77,142,255,0.08)' }}>
          <div className="flex items-center gap-2 text-xs font-mono text-accent-blue">
            <GitCompare className="w-3.5 h-3.5" />
            <span className="font-bold">{compareIds.size}</span> selected for compare
            <span className="text-slate-500 ml-1">(max 4)</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCompareIds(new Set())} className="text-[11px] text-slate-500 hover:text-slate-300 font-mono">Clear</button>
            <button
              onClick={() => setShowCompare(true)}
              disabled={compareIds.size < 2}
              className="px-3 py-1.5 rounded bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-xs font-mono font-bold hover:bg-accent-blue/30 transition-all disabled:opacity-40"
            >
              Compare {compareIds.size} repos →
            </button>
          </div>
        </div>
      )}

      {/* Single toolbar row */}
      <div className="glass-header flex-none px-6 py-3 flex items-center justify-between gap-3 border-b border-white/5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-bg-panel border border-border-main rounded-sm p-0.5 shadow-inner">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-accent-blue text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              title="List view"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-accent-blue text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xs text-slate-500 font-mono whitespace-nowrap">
            Showing <span className="text-slate-200 font-bold">{filteredRepos.length}</span> of <span className="text-slate-200">{repos.length}</span>
          </div>

          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-bg-panel border border-border-main rounded-sm text-xs font-bold text-slate-300 hover:text-white hover:border-accent-blue transition-all"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0 rounded-full bg-accent-blue text-white text-[10px] font-mono font-bold">{activeFilterCount}</span>
            )}
          </button>

          <div className="flex items-center bg-bg-panel border border-border-main rounded-sm">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold py-1.5 pl-2 pr-1 text-slate-200 focus:outline-none cursor-pointer uppercase font-mono [&>option]:bg-bg-dark [&>option]:text-slate-200 [&>option]:normal-case"
            >
              <option value="latest" style={{ backgroundColor: '#0d1424', color: '#e2e8f0' }}>Updated</option>
              <option value="score" style={{ backgroundColor: '#0d1424', color: '#e2e8f0' }}>Score</option>
              <option value="stars" style={{ backgroundColor: '#0d1424', color: '#e2e8f0' }}>Stars</option>
              <option value="name" style={{ backgroundColor: '#0d1424', color: '#e2e8f0' }}>Name</option>
              <option value="language" style={{ backgroundColor: '#0d1424', color: '#e2e8f0' }}>Language</option>
              <option value="license" style={{ backgroundColor: '#0d1424', color: '#e2e8f0' }}>License</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? 'Ascending — click to reverse' : 'Descending — click to reverse'}
              className="px-2 py-1.5 border-l border-border-main text-slate-300 hover:text-accent-blue transition-colors"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
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
        </div>

        <div className="flex items-center gap-2 flex-none">
          <button
            onClick={handleRescanAll}
            disabled={isRescanning || repos.length === 0}
            title="Refresh library"
            className="bg-bg-panel hover:bg-slate-800 disabled:opacity-50 text-slate-200 p-2 rounded-sm shadow-sm transition-colors border border-border-main"
          >
            <RefreshCw className={`w-4 h-4 ${isRescanning ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onBulkIngest}
            className="bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded-sm flex items-center gap-2 shadow-sm transition-colors border border-blue-500"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Import</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pt-6 pb-6 custom-scrollbar">

        {appKillersMode && (
          <div className="mb-5 rounded-xl border border-amber-500/20 px-5 py-4 flex items-start gap-4"
            style={{ background: 'rgba(245,158,11,0.04)' }}>
            <Flame className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-bold text-sm mb-1">White-label ready — built to replace paid software</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                These repos have been flagged by our AI as production-grade, self-hostable open-source projects that can
                directly replace a well-known commercial product out of the box. Each one ships with a permissive license
                (MIT, Apache, BSD or similar) meaning you can fork, rebrand and deploy commercially with no royalties or
                seat fees.
              </p>
            </div>
          </div>
        )}

        {saasReadyMode && (
          <div className="mb-5 rounded-xl border border-cyan-500/25 px-5 py-4 flex items-start gap-4"
            style={{ background: 'rgba(6,182,212,0.05)' }}>
            <Server className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-cyan-200 font-bold text-sm mb-1">SaaS Ready — self-hostable apps you can run as a service</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Production-grade, self-hostable applications with their own UI that you can deploy and run as a
                service. Unlike App Killers, these don't map cleanly to one named commercial product — they may
                span several categories or define a new one — but they're still complete, runnable apps rather than
                libraries or building blocks.
              </p>
            </div>
          </div>
        )}

        {purposeRepo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass-card rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
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

        {/* Unified Filter Modal — full-width, multi-select */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)}>
            <div className="glass-card rounded-lg shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between flex-none">
                <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                  <Filter className="w-5 h-5 text-accent-blue" /> Filters
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-accent-blue/20 border border-accent-blue/40 text-accent-blue text-xs font-mono">
                      {activeFilterCount} active
                    </span>
                  )}
                </h3>
                <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-auto custom-scrollbar">
                <FilterChipGroup
                  label="License"
                  options={licenses}
                  selected={selectedLicenses}
                  onToggle={(v) => toggleInArray(selectedLicenses, setSelectedLicenses, v)}
                  colorize={(l) => getLicenseColor(l)}
                />
                <FilterChipGroup
                  label="Programming Language"
                  options={languages}
                  selected={selectedLanguages}
                  onToggle={(v) => toggleInArray(selectedLanguages, setSelectedLanguages, v)}
                />
                <FilterChipGroup
                  label="Category"
                  options={categories}
                  selected={selectedCategories}
                  onToggle={(v) => toggleInArray(selectedCategories, setSelectedCategories, v)}
                />

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
                    <span>0</span><span>50</span><span>100</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-bg-dark border-t border-border-main flex justify-between items-center flex-none">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors font-mono"
                >
                  Reset All
                </button>
                <div className="text-xs text-slate-500 font-mono">
                  {filteredRepos.length} of {repos.length} match
                </div>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-6 py-2 bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold rounded-md transition-all font-mono shadow-lg shadow-blue-500/20"
                >
                  Apply
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
              <div className="col-span-4 pl-2">Repository Name</div>
              <div className="col-span-1 text-center">Purpose</div>
              <div className="col-span-1 text-center">Active</div>
              <div className="col-span-1 text-center">Stars</div>
              <div className="col-span-2 text-center">AI Score</div>
              <div className="col-span-2 text-center">License</div>
              <div className="col-span-1 flex justify-end pr-2">
                <Github className="w-4 h-4" />
              </div>
            </div>

            <div className="divide-y divide-border-main">
              {filteredRepos.map(repo => {
                let aiData = null;
                try { if (repo.ai_analysis) aiData = JSON.parse(repo.ai_analysis); } catch (e) {}
                const cls = classifyRepo(aiData);
                const stale = isStale(repo.last_push);

                return (
                  <div
                    key={repo.id}
                    onClick={() => onViewRepo(repo)}
                    className={`group hover:bg-white/5 cursor-pointer transition-colors border-l-2 ${compareIds.has(repo.id) ? 'border-l-accent-blue bg-accent-blue/[0.04]' : 'border-l-transparent hover:border-l-accent-blue'}`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center px-4 py-6">
                      <div className="col-span-4 flex flex-col gap-1 pl-2">
                        <div className="min-w-0">
                          <div className="font-bold text-lg text-slate-200 group-hover:text-accent-blue transition-colors truncate flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleCompare(repo.id); }}
                              title="Add to compare"
                              className={`w-4 h-4 flex-none rounded border ${compareIds.has(repo.id) ? 'bg-accent-blue border-accent-blue' : 'border-slate-600 hover:border-accent-blue'}`}
                            >
                              {compareIds.has(repo.id) && <Check className="w-3 h-3 text-white" />}
                            </button>
                            {formatRepoName(repo.id)}
                            {cls.kind === 'app-killer' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[9px] font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                                <Flame className="w-2.5 h-2.5" />
                                vs {cls.comparableApp}
                              </span>
                            )}
                            {cls.kind === 'saas-ready' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-bold text-cyan-300 uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                                <Server className="w-2.5 h-2.5" />
                                SaaS Ready
                              </span>
                            )}
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
                          onClick={(e) => { e.stopPropagation(); setPurposeRepo(repo); }}
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
                              className={`h-full transition-all duration-500 ${repo.score > 80 ? 'bg-[#00FF00]' : repo.score > 50 ? 'bg-accent-amber' : 'bg-accent-red'}`}
                              style={{ width: `${repo.score}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-bold font-mono w-8 text-right ${repo.score > 80 ? 'text-[#00FF00]' : repo.score > 50 ? 'text-accent-amber' : 'text-accent-red'}`}>{repo.score}</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border transition-colors ${getLicenseColor(repo.license)}`}>
                          <Verified className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold font-mono">{repo.license}</span>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end items-center pr-2 gap-1">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-all"
                          title="View on GitHub"
                        >
                          <Github className="w-5 h-5" />
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
              try { if (repo.ai_analysis) aiData = JSON.parse(repo.ai_analysis); } catch (e) {}
              const cls = classifyRepo(aiData);
              const selected = compareIds.has(repo.id);

              return (
                <div
                  key={repo.id}
                  onClick={() => onViewRepo(repo)}
                  className={`glass-card rounded-lg overflow-hidden group transition-all cursor-pointer flex flex-col relative ${selected ? 'ring-2 ring-accent-blue border-accent-blue/40' : 'hover:border-white/20'}`}
                >
                  <div className="border-b border-border-main bg-gradient-to-br from-bg-panel to-bg-dark relative">
                    {/* Classification badge — always reserves height so cards don't jump. */}
                    {cls.kind === 'saas-ready' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-cyan-500/30 bg-black/40">
                        <Server className="w-3 h-3 text-cyan-300 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider truncate">
                          SaaS Ready
                        </span>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 border-b border-amber-500/25 ${cls.kind === 'app-killer' ? 'bg-black/40 visible' : 'invisible'}`}>
                        <Flame className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider truncate">
                          Replaces {cls.comparableApp}
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col min-w-0">
                          <h4 className="text-lg font-bold text-white group-hover:text-accent-blue transition-colors font-mono truncate">
                            {formatRepoName(repo.id)}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Updated {new Date(repo.last_push).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col items-end flex-none ml-3">
                          <div className="flex items-center gap-1 text-yellow-500 font-mono text-sm mb-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-500" />
                            <span>{repo.stars > 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-bg-dark h-1 rounded-full overflow-hidden border border-border-main">
                              <div
                                className={`h-full transition-all duration-500 ${repo.score > 80 ? 'bg-[#00FF00]' : repo.score > 50 ? 'bg-accent-amber' : 'bg-accent-red'}`}
                                style={{ width: `${repo.score}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-bold font-mono ${repo.score > 80 ? 'text-[#00FF00]' : repo.score > 50 ? 'text-accent-amber' : 'text-accent-red'}`}>{repo.score}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2 items-stretch">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-[11px] font-bold font-mono uppercase"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Github</span>
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewRepo(repo); }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded border border-accent-blue/30 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 hover:border-accent-blue transition-all text-[11px] font-bold font-mono uppercase"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        {cls.demoUrl && (
                          <a
                            href={cls.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Open live demo"
                            className="flex-none w-10 inline-flex items-center justify-center rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
                          >
                            <Play className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCompare(repo.id); }}
                          title={selected ? 'Remove from compare' : 'Add to compare'}
                          className={`flex-none w-10 inline-flex items-center justify-center rounded border transition-all ${selected
                            ? 'border-accent-blue bg-accent-blue text-white'
                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-accent-blue hover:border-accent-blue'}`}
                        >
                          {selected ? <Check className="w-4 h-4" /> : <GitCompare className="w-4 h-4" />}
                        </button>
                      </div>
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

      {showCompare && compareIds.size >= 2 && (
        <CompareModal
          repos={repos.filter(r => compareIds.has(r.id))}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
};

interface FilterChipGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  colorize?: (v: string) => string;
}

const FilterChipGroup: React.FC<FilterChipGroupProps> = ({ label, options, selected, onToggle, colorize }) => {
  if (options.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">{label}</label>
        <span className="text-[10px] text-slate-600 font-mono">{selected.length} selected</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isActive = selected.includes(opt);
          const colorClasses = colorize ? colorize(opt) : '';
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all border whitespace-nowrap ${
                isActive
                  ? colorClasses || 'bg-accent-blue/20 border-accent-blue/50 text-accent-blue shadow-md'
                  : 'bg-slate-800/30 text-slate-400 border-slate-700/50 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {isActive && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
