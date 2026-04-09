import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  CheckCircle, 
  AlertTriangle,
  BrainCircuit,
  Star,
  History,
  Rocket,
  Edit,
  Trash2,
  Check,
  LayoutGrid,
  List as ListIcon,
  ExternalLink,
  FolderOpen,
  Sparkles,
  ChevronRight,
  GitFork,
  Zap,
  Database,
  Cpu
} from 'lucide-react';
import { Repo, Project } from '../types';

interface ProjectWorkspaceProps {
  setActiveTab: (tab: string) => void;
  setSelectedRepo: (repo: any) => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ setActiveTab, setSelectedRepo }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [projectTypeOptions, setProjectTypeOptions] = useState<string[]>(['SAAS', 'SKILL', 'INTERNAL TOOL']);
  const [newProject, setNewProject] = useState({ name: '', description: '', types: [] as string[] });
  const [brief, setBrief] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recViewMode, setRecViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [embedStatus, setEmbedStatus] = useState<{ embedded: number; total: number; running: boolean } | null>(null);
  const [isEmbedding, setIsEmbedding] = useState(false);

  const fetchProjects = () => {
    fetch('/api/projects').then(res => res.json()).then(data => {
      setProjects(data);
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0]);
        loadSavedRecommendations(data[0].id);
      }
    });
  };

  const fetchConfig = () => {
    fetch('/api/config').then(res => res.json()).then(data => {
      if (data.projectTypes) setProjectTypeOptions(data.projectTypes);
    });
  };

  const fetchEmbedStatus = () => {
    fetch('/api/embed/status').then(r => r.json()).then(setEmbedStatus).catch(() => {});
  };

  const handleBuildIndex = async () => {
    setIsEmbedding(true);
    await fetch('/api/embed/sweep', { method: 'POST' });
    // Poll until done
    const poll = setInterval(() => {
      fetch('/api/embed/status').then(r => r.json()).then(s => {
        setEmbedStatus(s);
        if (!s.running) { clearInterval(poll); setIsEmbedding(false); }
      });
    }, 2000);
  };

  useEffect(() => {
    fetch('/api/repos').then(res => res.json()).then(setRepos);
    fetchProjects();
    fetchConfig();
    fetchEmbedStatus();
  }, []);

  useEffect(() => {
    if (activeProject) setBrief(activeProject.description || '');
  }, [activeProject]);

  const handleSaveProject = async () => {
    if (!activeProject) return;
    setIsSaving(true);
    try {
      let constraints = {};
      try { constraints = JSON.parse(activeProject.constraints); } catch {}
      await fetch(`/api/projects/${activeProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: activeProject.name, description: brief, constraints })
      });
      fetchProjects();
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newProject.name,
        description: newProject.description,
        constraints: { types: newProject.types, data: {} }
      })
    });
    fetchProjects();
    setIsCreating(false);
    setNewProject({ name: '', description: '', types: [] });
  };

  const loadSavedRecommendations = (projectId: number) => {
    fetch(`/api/projects/${projectId}/recommendations`)
      .then(r => r.json())
      .then(recs => setRecommendations(recs))
      .catch(() => {});
  };

  const handleAnalyze = async () => {
    if (!brief || !activeProject) return;
    setIsAnalyzing(true);
    setError(null);
    setRecommendations([]);
    try {
      let constraints = null;
      try { constraints = JSON.parse(activeProject.constraints); } catch {}
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, constraints, projectId: activeProject.id })
      });
      if (!res.ok) throw new Error(await res.text());
      const recs = await res.json();
      setRecommendations(recs);
    } catch (e: any) {
      setError(e.message || 'Analysis failed');
    }
    setIsAnalyzing(false);
  };

  const handleRemoveRecommendation = async (repoId: string) => {
    if (!activeProject) return;
    await fetch(`/api/projects/${activeProject.id}/recommendations/${encodeURIComponent(repoId)}`, { method: 'DELETE' });
    setRecommendations(prev => prev.filter(r => r.repoId !== repoId));
  };

  const getLicenseColor = (license: string) => {
    const l = license?.toUpperCase() || '';
    if (l.includes('MIT')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (l.includes('APACHE')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (l.includes('GPL')) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (l.includes('BSD')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  const getProjectTypes = (project: Project) => {
    try { return JSON.parse(project.constraints)?.types || []; } catch { return []; }
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full">

      {/* ── Sidebar ── */}
      <aside className="w-72 flex flex-col shrink-0 h-full border-r border-white/8 overflow-hidden" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(16px)' }}>

        {isCreating ? (
          /* ── Create Project Form ── */
          <div className="flex flex-col h-full">
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent-blue" /> New Project
              </h2>
              <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white p-1 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-accent-blue focus:outline-none transition-colors"
                  placeholder="e.g. Book Publishing Suite"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Project Brief</label>
                <textarea
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-accent-blue focus:outline-none transition-colors resize-none h-24 custom-scrollbar"
                  placeholder="Describe what this project needs..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Classification</label>
                <div className="flex flex-wrap gap-2">
                  {projectTypeOptions.map(type => (
                    <button
                      key={type}
                      onClick={() => setNewProject(prev => ({
                        ...prev,
                        types: prev.types.includes(type) ? prev.types.filter(t => t !== type) : [...prev.types, type]
                      }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        newProject.types.includes(type)
                          ? 'bg-accent-blue/20 border-accent-blue/50 text-accent-blue'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-white/8 flex gap-3">
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name.trim()}
                className="flex-1 bg-accent-blue hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Create Project
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>

        ) : (
          /* ── Project List + Details ── */
          <>
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between flex-shrink-0">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-accent-blue" /> Projects
              </h2>
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1.5 bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 text-accent-blue text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            {/* Project list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-1.5">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <FolderOpen className="w-10 h-10 text-slate-700 mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No projects yet</p>
                  <p className="text-slate-600 text-xs mt-1">Create one to get AI-matched repos</p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="mt-4 bg-accent-blue text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    + New Project
                  </button>
                </div>
              ) : (
                projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveProject(p); loadSavedRecommendations(p.id); }}
                    className={`w-full text-left rounded-xl p-3 transition-all border ${
                      activeProject?.id === p.id
                        ? 'bg-accent-blue/10 border-accent-blue/30'
                        : 'bg-white/3 border-transparent hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                      {activeProject?.id === p.id && <ChevronRight className="w-3.5 h-3.5 text-accent-blue flex-shrink-0" />}
                    </div>
                    {getProjectTypes(p).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {getProjectTypes(p).slice(0, 2).map((t: string) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue/80 border border-accent-blue/20 font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Active project brief + analyze */}
            {activeProject && (
              <div className="border-t border-white/8 p-5 space-y-4 flex-shrink-0">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-400">Project Brief</label>
                    {brief !== activeProject.description && (
                      <button onClick={handleSaveProject} disabled={isSaving} className="text-[10px] text-accent-blue hover:underline font-semibold">
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>
                  <textarea
                    value={brief}
                    onChange={e => setBrief(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:border-accent-blue focus:outline-none transition-colors resize-none custom-scrollbar"
                    placeholder="Describe what you're building..."
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !brief.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-accent-blue hover:bg-blue-600 disabled:opacity-40 text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/10"
                >
                  {isAnalyzing
                    ? <><Sparkles className="w-4 h-4 animate-spin" /> Analyzing...</>
                    : <><BrainCircuit className="w-4 h-4" /> Run Analysis</>
                  }
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="border-t border-white/8 p-4 flex-shrink-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
                  <div className="text-xl font-bold text-white">{repos.length}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Repos Indexed</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
                  <div className="text-xl font-bold text-emerald-400">{recommendations.length > 0 ? recommendations.length : '—'}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Saved Matches</div>
                </div>
              </div>

              {/* Vector index status */}
              <div className="rounded-xl border p-3 space-y-2" style={{ background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.15)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-accent-blue" />
                    <span className="text-[10px] font-bold text-accent-blue uppercase tracking-wider">Vector Index</span>
                  </div>
                  {embedStatus && (
                    <span className="text-[10px] text-slate-400 font-mono">{embedStatus.embedded}/{embedStatus.total}</span>
                  )}
                </div>
                {embedStatus && embedStatus.total > 0 && (
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-accent-blue transition-all duration-500"
                      style={{ width: `${Math.round((embedStatus.embedded / embedStatus.total) * 100)}%` }}
                    />
                  </div>
                )}
                <button
                  onClick={handleBuildIndex}
                  disabled={isEmbedding || embedStatus?.embedded === embedStatus?.total}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    embedStatus?.embedded === embedStatus?.total
                      ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 cursor-default'
                      : 'border-accent-blue/30 text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20'
                  }`}
                >
                  {isEmbedding
                    ? <><Cpu className="w-3 h-3 animate-pulse" /> Building…</>
                    : embedStatus?.embedded === embedStatus?.total
                    ? <><CheckCircle className="w-3 h-3" /> Index Ready</>
                    : <><Database className="w-3 h-3" /> Build Vector Index</>
                  }
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <BrainCircuit className="w-6 h-6 text-accent-blue" />
              {activeProject ? `${activeProject.name} — AI Matches` : 'AI Recommendations'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {activeProject
                ? 'Repos ranked by relevance to your project brief'
                : 'Select or create a project to get started'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => setRecViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${recViewMode === 'grid' ? 'bg-accent-blue text-white' : 'text-slate-500 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRecViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${recViewMode === 'list' ? 'bg-accent-blue text-white' : 'text-slate-500 hover:text-white'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
            {recommendations.length > 0 && recommendations[0]._mode === 'vector' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
                <Cpu className="w-3.5 h-3.5 text-accent-blue" />
                <span className="text-xs font-semibold text-accent-blue">Vector Search</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-400">Keyword Search</span>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">Analysis Failed</p>
              <p className="text-xs text-red-300/70 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading shimmer */}
        {isAnalyzing && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded-lg w-2/3" />
                  <div className="h-3 bg-white/5 rounded-lg w-full" />
                  <div className="h-3 bg-white/5 rounded-lg w-4/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isAnalyzing && recommendations.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center mb-6 border border-white/10">
              <Rocket className="w-9 h-9 text-slate-600" />
            </div>
            {activeProject ? (
              <>
                <p className="text-white font-semibold text-lg mb-2">No saved matches yet</p>
                <p className="text-slate-500 text-sm max-w-xs">
                  Run an analysis to find AI-matched repos. Results are saved automatically and will appear here next time.
                </p>
              </>
            ) : (
              <>
                <p className="text-white font-semibold text-lg mb-2">No project selected</p>
                <p className="text-slate-500 text-sm max-w-xs">Select a project on the left or create a new one to get started.</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-6 bg-accent-blue hover:bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/10"
                >
                  + New Project
                </button>
              </>
            )}
          </div>
        )}

        {/* Results — Grid */}
        {!isAnalyzing && recommendations.length > 0 && recViewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-10">
            {recommendations.map((rec, idx) => {
              const repo = repos.find(r => r.id === rec.repoId);
              if (!repo) return null;
              return (
                <article key={idx} className="glass-card rounded-2xl overflow-hidden group hover:border-white/20 transition-all relative">
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveRecommendation(rec.repoId)}
                    title="Remove from saved results"
                    className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {/* Fit score badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="w-11 h-11 rounded-full border border-emerald-500/30 bg-bg-dark flex flex-col items-center justify-center shadow-lg">
                      <span className="text-[7px] text-emerald-400 font-bold uppercase leading-none mb-0.5">FIT</span>
                      <span className="text-base font-bold text-emerald-400 leading-none">{rec.fitScore}</span>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="p-5 border-b border-white/8 min-h-[108px]">
                    <p className="text-[11px] text-slate-500 font-mono mb-1">{repo.id}</p>
                    <h4 className="text-base font-bold text-white group-hover:text-accent-blue transition-colors pr-12">{repo.name}</h4>
                    <p className="text-sm text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{repo.description}</p>
                  </div>

                  {/* Rationale */}
                  <div className="px-5 py-4 border-b border-white/8 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">{rec.rationale}</p>
                  </div>

                  {/* Warning */}
                  {rec.warnings?.length > 0 && (
                    <div className="px-5 py-3 border-b border-red-500/10 bg-red-500/5 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300/80">{rec.warnings[0]}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-5 py-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars?.toLocaleString()}</span>
                    <span className="flex items-center gap-1.5"><GitFork className="w-3.5 h-3.5" /> {repo.forks?.toLocaleString()}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getLicenseColor(repo.license)}`}>{repo.license || 'Unknown'}</span>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-white/8 grid grid-cols-2 divide-x divide-white/8">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center gap-2 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> GitHub
                    </a>
                    <button
                      onClick={() => { setSelectedRepo(repo); setActiveTab('library'); }}
                      className="py-3 text-xs font-semibold text-accent-blue hover:bg-accent-blue/10 flex items-center justify-center gap-2 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" /> View Details
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Results — List */}
        {!isAnalyzing && recommendations.length > 0 && recViewMode === 'list' && (
          <div className="space-y-3 pb-10">
            {recommendations.map((rec, idx) => {
              const repo = repos.find(r => r.id === rec.repoId);
              if (!repo) return null;
              return (
                <div key={idx} className="glass-card rounded-2xl flex items-center overflow-hidden hover:border-white/20 transition-all group">
                  {/* Fit score */}
                  <div className="w-16 h-16 bg-emerald-500/10 border-r border-white/8 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[8px] text-emerald-400 font-bold uppercase leading-none mb-0.5">FIT</span>
                    <span className="text-lg font-bold text-emerald-400">{rec.fitScore}</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 px-5 py-3 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white group-hover:text-accent-blue transition-colors truncate">{repo.name}</span>
                      <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">{repo.language}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{rec.rationale}</p>
                  </div>
                  {/* Meta */}
                  <div className="flex items-center gap-4 px-5 flex-shrink-0">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars?.toLocaleString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getLicenseColor(repo.license)}`}>{repo.license || 'Unknown'}</span>
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleRemoveRecommendation(rec.repoId)}
                      title="Remove from saved results"
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
