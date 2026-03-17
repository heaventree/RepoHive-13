import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Layers, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  BrainCircuit,
  Pin,
  Star,
  History,
  Rocket,
  Edit,
  Trash2,
  Check,
  X as CloseIcon,
  Settings,
  LayoutGrid,
  List as ListIcon,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Repo, Project } from '../types';

interface ProjectWorkspaceProps {
  setActiveTab: (tab: string) => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ setActiveTab }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [projectTypeOptions, setProjectTypeOptions] = useState<string[]>(['SAAS', 'SKILL', 'INTERNAL TOOL']);
  const [isManagingTypes, setIsManagingTypes] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState('');
  const [editingTypeIndex, setEditingTypeIndex] = useState<number | null>(null);
  const [editingTypeValue, setEditingTypeValue] = useState('');
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    types: [] as string[],
    constraints: '' 
  });
  const [brief, setBrief] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [recViewMode, setRecViewMode] = useState<'grid' | 'list'>('grid');

  const getLicenseColor = (license: string) => {
    const l = license?.toUpperCase() || '';
    if (l.includes('MIT')) return 'text-[#00FF00] bg-[#00FF00]/10 border-[#00FF00]/30 shadow-[0_0_10px_rgba(0,255,0,0.1)]';
    if (l.includes('APACHE')) return 'text-accent-amber bg-accent-amber/10 border-accent-amber/20';
    if (l.includes('GPL')) return 'text-accent-red bg-accent-red/10 border-accent-red/20';
    if (l.includes('BSD')) return 'text-accent-green bg-accent-green/10 border-accent-green/20';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  const fetchProjects = () => {
    fetch('/api/projects').then(res => res.json()).then(data => {
      setProjects(data);
      if (data.length > 0 && !activeProject) setActiveProject(data[0]);
    });
  };

  const handleSaveProject = async () => {
    if (!activeProject) return;
    setIsSaving(true);
    try {
      const constraints = JSON.parse(activeProject.constraints);
      await fetch(`/api/projects/${activeProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeProject.name,
          description: brief,
          constraints: constraints
        })
      });
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const fetchConfig = () => {
    fetch('/api/config').then(res => res.json()).then(data => {
      if (data.projectTypes) setProjectTypeOptions(data.projectTypes);
    });
  };

  useEffect(() => {
    fetch('/api/repos').then(res => res.json()).then(setRepos);
    fetchProjects();
    fetchConfig();

    const handleTriggerCreate = () => setIsCreating(true);
    window.addEventListener('trigger-create-project', handleTriggerCreate);
    return () => window.removeEventListener('trigger-create-project', handleTriggerCreate);
  }, []);

  useEffect(() => {
    if (activeProject) {
      setBrief(activeProject.description);
    }
  }, [activeProject]);

  const handleSaveConfig = async (newTypes: string[]) => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'projectTypes', value: newTypes })
      });
      fetchConfig();
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  };

  const handleAddType = () => {
    if (!newTypeInput.trim()) return;
    const updated = [...projectTypeOptions, newTypeInput.trim().toUpperCase()];
    handleSaveConfig(updated);
    setNewTypeInput('');
  };

  const handleRemoveType = (typeToRemove: string) => {
    const updated = projectTypeOptions.filter(t => t !== typeToRemove);
    handleSaveConfig(updated);
  };

  const handleStartEditType = (index: number, value: string) => {
    setEditingTypeIndex(index);
    setEditingTypeValue(value);
  };

  const handleSaveEditType = () => {
    if (editingTypeIndex === null || !editingTypeValue.trim()) return;
    const updated = [...projectTypeOptions];
    updated[editingTypeIndex] = editingTypeValue.trim().toUpperCase();
    handleSaveConfig(updated);
    setEditingTypeIndex(null);
  };

  const handleCreateProject = async () => {
    if (!newProject.name) return;
    
    let parsedConstraints = {};
    try {
      parsedConstraints = newProject.constraints ? JSON.parse(newProject.constraints) : {};
    } catch (e) {
      // If not valid JSON, treat as string or key-value pairs
      parsedConstraints = { raw: newProject.constraints };
    }

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: newProject.name, 
        description: newProject.description,
        constraints: {
          types: newProject.types,
          data: parsedConstraints
        } 
      })
    });
    const data = await res.json();
    fetchProjects();
    setIsCreating(false);
    setNewProject({ name: '', description: '', types: [], constraints: '' });
  };

  const handleUpdateRecommendations = async () => {
    if (!brief || repos.length === 0) return;
    setIsAnalyzing(true);
    try {
      let constraints = null;
      if (activeProject?.constraints) {
        try {
          constraints = JSON.parse(activeProject.constraints);
        } catch (e) {}
      }
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, repos, constraints })
      });
      if (!res.ok) throw new Error(await res.text());
      const recs = await res.json();
      setRecommendations(recs);
    } catch (e) {
      console.error(e);
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 lg:w-96 glass-card border-r flex flex-col shrink-0 h-full overflow-y-auto z-10 custom-scrollbar" style={{ borderRadius: 0 }}>
          {isCreating ? (
            <div className="p-6 border-b border-border-main">
              <h2 className="text-base font-bold mb-4 text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent-blue" /> Initialize Project
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-mono">Project Name</label>
                  <input 
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full bg-bg-dark border border-border-main p-2 rounded-sm text-sm text-white focus:border-accent-blue outline-none font-mono"
                    placeholder="e.g. Analytics Dashboard"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-mono">Description</label>
                  <textarea 
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full bg-bg-dark border border-border-main p-2 rounded-sm text-sm text-white h-20 font-mono outline-none focus:border-accent-blue"
                    placeholder="Define project scope..."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase font-mono">Classification</label>
                    <button 
                      onClick={() => setIsManagingTypes(!isManagingTypes)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm transition-all uppercase font-mono border flex items-center gap-1 ${
                        isManagingTypes 
                          ? 'bg-accent-blue/10 text-accent-blue border-accent-blue' 
                          : 'bg-bg-dark text-slate-500 border-border-main hover:text-white hover:border-slate-500'
                      }`}
                    >
                      <Settings className={`w-3.5 h-3.5 ${isManagingTypes ? 'animate-spin-slow' : ''}`} />
                      {isManagingTypes ? 'Exit Config' : 'Manage Types'}
                    </button>
                  </div>

                  {isManagingTypes ? (
                    <div className="space-y-2 bg-bg-dark/50 p-3 rounded-sm border border-border-main">
                      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                        {projectTypeOptions.map((type, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2">
                            {editingTypeIndex === idx ? (
                              <div className="flex-1 flex items-center gap-1">
                                <input 
                                  type="text"
                                  value={editingTypeValue}
                                  onChange={(e) => setEditingTypeValue(e.target.value)}
                                  className="flex-1 bg-bg-panel border border-accent-blue p-1 rounded-sm text-[10px] text-white font-mono outline-none"
                                  autoFocus
                                />
                                <button onClick={handleSaveEditType} className="text-accent-green hover:bg-accent-green/10 p-1 rounded">
                                  <Check className="w-3 h-3" />
                                </button>
                                <button onClick={() => setEditingTypeIndex(null)} className="text-slate-500 hover:bg-slate-500/10 p-1 rounded">
                                  <CloseIcon className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="text-[10px] font-mono text-slate-300 uppercase">{type}</span>
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => handleStartEditType(idx, type)}
                                    className="text-slate-500 hover:text-white p-1"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleRemoveType(type)}
                                    className="text-slate-500 hover:text-accent-red p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border-main">
                        <input 
                          type="text"
                          value={newTypeInput}
                          onChange={(e) => setNewTypeInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                          placeholder="NEW TYPE..."
                          className="flex-1 bg-bg-panel border border-border-main p-1.5 rounded-sm text-[10px] text-white font-mono outline-none focus:border-accent-blue"
                        />
                        <button 
                          onClick={handleAddType}
                          className="bg-accent-blue text-white p-1.5 rounded-sm hover:bg-blue-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {projectTypeOptions.map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={newProject.types.includes(type)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setNewProject(prev => ({
                                ...prev,
                                types: checked 
                                  ? [...prev.types, type]
                                  : prev.types.filter(t => t !== type)
                              }));
                            }}
                            className="w-3.5 h-3.5 rounded border-border-main bg-bg-dark text-accent-blue focus:ring-accent-blue"
                          />
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-white uppercase">{type}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 font-mono">Technical Constraints (JSON)</label>
                  <textarea 
                    value={newProject.constraints}
                    onChange={(e) => setNewProject({ ...newProject, constraints: e.target.value })}
                    className="w-full bg-bg-dark border border-border-main p-2 rounded-sm text-xs text-accent-blue h-20 font-mono outline-none focus:border-accent-blue"
                    placeholder='{ "minStars": 100 }'
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={handleCreateProject}
                    className="flex-1 bg-accent-blue text-white text-xs font-bold py-2 rounded-sm hover:bg-blue-600 uppercase tracking-widest"
                  >
                    Deploy
                  </button>
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="flex-1 bg-bg-dark text-slate-400 text-xs font-bold py-2 rounded-sm border border-border-main hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border-main bg-bg-dark/50">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 font-mono tracking-widest">Active Project Selector</label>
                <div className="relative">
                  <select 
                    className="w-full bg-bg-panel border border-border-main p-2 rounded-sm text-sm text-white font-mono outline-none appearance-none cursor-pointer focus:border-accent-blue"
                    value={activeProject?.id || ''}
                    onChange={(e) => {
                      const p = projects.find(proj => proj.id === parseInt(e.target.value));
                      if (p) setActiveProject(p);
                    }}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-b border-border-main">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-accent-blue uppercase tracking-widest">
                    {activeProject ? `Project ID: ${activeProject.id}` : 'Status: Idle'}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold leading-tight mb-4 text-white font-mono tracking-tight">
                  {activeProject?.name || 'Workspace Root'}
                </h2>
                
                {activeProject?.constraints && (
                  <div className="mb-6 flex flex-wrap gap-1.5">
                    {(() => {
                      try {
                        const c = JSON.parse(activeProject.constraints);
                        return c.types?.map((t: string) => (
                          <span key={t} className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 text-xs font-bold uppercase rounded-sm font-mono">
                            {t}
                          </span>
                        ));
                      } catch (e) { return null; }
                    })()}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Project Brief</label>
                      {activeProject && brief !== activeProject.description && (
                        <button 
                          onClick={handleSaveProject}
                          disabled={isSaving}
                          className="text-[10px] font-bold text-accent-blue hover:underline flex items-center gap-1 font-mono uppercase"
                        >
                          {isSaving ? 'Syncing...' : 'Commit Changes'}
                        </button>
                      )}
                    </div>
                    <textarea 
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      className="w-full bg-bg-dark border border-border-main p-3 rounded-sm text-sm text-slate-300 font-mono resize-y focus:border-accent-blue outline-none h-32 custom-scrollbar" 
                      placeholder="Input project parameters..."
                    />
                  </div>
                  
                  <button 
                    onClick={handleUpdateRecommendations}
                    disabled={isAnalyzing || !activeProject}
                    className="w-full bg-accent-blue text-white font-mono text-xs font-bold py-3 px-4 rounded-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                  >
                    {isAnalyzing ? <Layers className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                    Execute Analysis
                  </button>

                  {activeProject?.constraints && (() => {
                    try {
                      const c = JSON.parse(activeProject.constraints);
                      if (c.data && Object.keys(c.data).length > 0) {
                        return (
                          <div className="mt-6 pt-6 border-t border-border-main">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 font-mono tracking-widest">Technical Constraints</label>
                            <pre className="text-xs font-mono bg-bg-dark p-3 rounded border border-border-main text-accent-blue overflow-x-auto custom-scrollbar">
                              {JSON.stringify(c.data, null, 2)}
                            </pre>
                          </div>
                        );
                      }
                    } catch (e) {}
                    return null;
                  })()}
                </div>
              </div>
            </>
          )}
          <div className="p-6 bg-bg-dark/30 flex-1">
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-slate-500 mb-4">Telemetry Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-3">
                <div className="text-2xl font-bold text-white font-mono">{repos.length}</div>
                <div className="text-[10px] text-slate-500 uppercase font-mono mt-1">Nodes Scanned</div>
              </div>
              <div className="glass-card rounded-xl p-3">
                <div className="text-2xl font-bold text-accent-green font-mono">92%</div>
                <div className="text-[10px] text-slate-500 uppercase font-mono mt-1">Match Prob</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8 border-b border-border-main pb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-mono uppercase tracking-tight">
                  <BrainCircuit className="text-accent-blue w-8 h-8" />
                  AI Curated Recommendations
                </h2>
                <p className="text-sm text-slate-500 mt-2 font-mono">Neural analysis of repository nodes based on project heuristics.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-bg-panel border border-border-main rounded-sm p-0.5">
                  <button 
                    onClick={() => setRecViewMode('list')}
                    className={`p-1.5 rounded-sm transition-all ${recViewMode === 'list' ? 'bg-accent-blue text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setRecViewMode('grid')}
                    className={`p-1.5 rounded-sm transition-all ${recViewMode === 'grid' ? 'bg-accent-blue text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-4 w-px bg-border-main"></div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-accent-blue animate-pulse"></div>
                  <span className="text-xs font-mono text-accent-blue uppercase tracking-widest">Live Engine</span>
                </div>
              </div>
            </div>

            {recommendations.length === 0 && !isAnalyzing ? (
              <div className="py-32 flex flex-col items-center justify-center text-slate-600 border border-dashed border-border-main rounded-sm bg-bg-panel/20">
                <BrainCircuit className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-sm font-mono uppercase tracking-widest opacity-50">Awaiting Input Parameters</p>
                <p className="text-xs font-mono mt-2 text-slate-500">Update brief and execute analysis to populate nodes.</p>
              </div>
            ) : recViewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
                {recommendations.map((rec, idx) => {
                  const repo = repos.find(r => r.id === rec.repoId);
                  if (!repo) return null;
                  return (
                    <article key={idx} className="glass-card rounded-2xl shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
                      <div className="absolute top-0 right-0 p-4 z-10 flex flex-col items-end gap-2">
                        <div className="h-12 w-12 rounded-full border border-accent-green/30 bg-bg-dark flex flex-col items-center justify-center shadow-lg">
                          <span className="text-[8px] font-mono text-accent-green uppercase leading-none mb-0.5">FIT</span>
                          <span className="font-bold text-accent-green text-lg leading-none">{rec.fitScore}</span>
                        </div>
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-bg-dark border border-border-main rounded-full text-slate-400 hover:text-white hover:border-accent-blue transition-all shadow-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Search className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="p-6 border-b border-border-main relative bg-gradient-to-br from-bg-panel to-bg-dark">
                        <div className="flex gap-2 items-center mb-3">
                          <span className="text-xs font-mono text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded border border-accent-blue/20 uppercase">{repo.id}</span>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-accent-blue transition-colors font-mono tracking-tight">{repo.name}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 font-sans">{repo.description}</p>
                      </div>
                      <div className="p-5 border-b border-border-main bg-bg-dark/30">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="text-accent-green w-5 h-5 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-500 uppercase mb-1 font-mono tracking-widest">AI Rationale</div>
                            <p className="text-sm text-slate-300 leading-relaxed">{rec.rationale}</p>
                          </div>
                        </div>
                      </div>
                      {rec.warnings?.length > 0 && (
                        <div className="bg-accent-red/5 p-4 border-b border-accent-red/20 flex items-start gap-3">
                          <AlertTriangle className="text-accent-red w-5 h-5 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-accent-red uppercase mb-1 font-mono tracking-widest">System Warning</div>
                            <p className="text-xs text-slate-400">{rec.warnings[0]}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between px-6 py-3 bg-bg-dark/50 text-xs font-mono text-slate-500">
                        <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-accent-amber" /> {repo.stars}</span>
                        <span className="flex items-center gap-1.5"><History className="w-4 h-4" /> {new Date(repo.last_push).toLocaleDateString()}</span>
                        <span className={`px-1.5 py-0.5 rounded border uppercase ${getLicenseColor(repo.license)}`}>{repo.license}</span>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-border-main border-t border-border-main">
                        <button className="py-3 text-xs font-bold uppercase tracking-widest hover:bg-bg-dark flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-all font-mono">
                          <Search className="w-4 h-4" /> Inspect
                        </button>
                        <button className="py-3 text-xs font-bold uppercase tracking-widest text-accent-blue hover:bg-accent-blue/10 flex items-center justify-center gap-2 transition-all font-mono">
                          <Pin className="w-4 h-4" /> Pin Node
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4 pb-24">
                {recommendations.map((rec, idx) => {
                  const repo = repos.find(r => r.id === rec.repoId);
                  if (!repo) return null;
                  return (
                    <div key={idx} className="glass-card rounded-2xl hover:border-white/20 transition-all group flex items-center overflow-hidden">
                      <div className="w-20 h-20 bg-bg-dark flex flex-col items-center justify-center border-r border-border-main shrink-0">
                        <span className="text-[8px] font-mono text-accent-green uppercase mb-0.5">FIT</span>
                        <span className="font-bold text-accent-green text-xl">{rec.fitScore}</span>
                      </div>
                      <div className="flex-1 p-4 flex items-center justify-between gap-6 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-base font-bold text-white font-mono truncate">{repo.id}</h4>
                            <span className="text-xs font-mono text-slate-500 uppercase">{repo.language}</span>
                          </div>
                          <p className="text-sm text-slate-400 line-clamp-1 font-sans">{rec.rationale}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex flex-col items-end text-xs font-mono text-slate-500">
                            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-accent-amber" /> {repo.stars}</span>
                            <span className={`px-1 py-0.5 rounded border uppercase mt-1 ${getLicenseColor(repo.license)}`}>{repo.license}</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 bg-bg-dark border border-border-main rounded-sm text-slate-400 hover:text-white hover:border-slate-500 transition-all">
                              <Pin className="w-4 h-4" />
                            </button>
                            <a 
                              href={repo.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 bg-bg-dark border border-border-main rounded-sm text-slate-400 hover:text-white hover:border-accent-blue transition-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
