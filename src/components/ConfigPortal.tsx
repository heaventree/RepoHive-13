import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  Activity,
  Plus,
  X,
  Terminal,
  Settings,
  Info,
  CheckCircle2,
  Lock,
  RefreshCw,
  Clock,
  Zap,
  LayoutGrid
} from 'lucide-react';

interface ConfigPortalProps {
  onBack: () => void;
}

export const ConfigPortal: React.FC<ConfigPortalProps> = ({ onBack }) => {
  const [weights, setWeights] = useState({
    popularity: 25,
    activity: 35,
    maintenance: 20,
    documentation: 15,
    quality: 10,
    license: 5
  });
  const [projectTypes, setProjectTypes] = useState<string[]>(['SAAS', 'SKILL', 'INTERNAL TOOL']);
  const [isSaving, setIsSaving] = useState(false);
  const [autoRescan, setAutoRescan] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.weights) setWeights(data.weights);
        if (data.projectTypes) setProjectTypes(data.projectTypes);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await Promise.all([
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'weights', value: weights })
      }),
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'projectTypes', value: projectTypes })
      })
    ]);
    setIsSaving(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
      <div className="glass-header p-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 font-mono uppercase tracking-widest">
            <Settings className="w-4 h-4" /> System Configuration
          </div>
          <h2 className="text-3xl font-bold text-white font-mono tracking-tight">Global Settings</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-accent-blue hover:bg-blue-600 text-white font-bold rounded-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest font-mono disabled:opacity-50"
          >
            {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Deploy Config
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
        <div className="bg-accent-blue/5 border border-accent-blue/20 p-4 rounded-sm flex gap-4 items-start backdrop-blur-sm">
          <Info className="w-5 h-5 text-accent-blue mt-0.5" />
          <div>
            <h4 className="text-base font-bold text-white mb-1">Configuration Engine Active</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-mono">
              System-wide settings affect how repositories are scored, categorized, and monitored. Changes are applied immediately to all background workers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scoring Weights Card */}
          <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sliders className="w-24 h-24" />
            </div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3 font-mono">
                <Sliders className="w-6 h-6 text-accent-blue" /> Scoring Weights
              </h3>
              <span className="text-accent-blue text-xs font-bold font-mono bg-accent-blue/10 px-2 py-1 rounded border border-accent-blue/20">TOTAL: 100</span>
            </div>
            
            <div className="space-y-6">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="group/item">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-slate-300 capitalize font-mono tracking-tight">{key}</label>
                    <span className="font-mono text-sm text-accent-blue font-bold">{value}%</span>
                  </div>
                  <input 
                    type="range" 
                    value={value}
                    onChange={(e) => setWeights(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-accent-blue border border-border-main" 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Project Types Card */}
            <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <LayoutGrid className="w-24 h-24" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3 font-mono">
                <LayoutGrid className="w-6 h-6 text-accent-blue" /> Project Categories
              </h3>
              
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {projectTypes.map((type, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-bg-dark border border-border-main px-3 py-1.5 rounded group/tag hover:border-accent-blue/50 transition-colors">
                      <span className="text-xs text-slate-300 font-mono font-bold">{type}</span>
                      <button 
                        onClick={() => setProjectTypes(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-600 hover:text-accent-red transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Add new category..."
                    className="w-full bg-bg-dark border border-border-main p-3 rounded text-sm text-white focus:border-accent-blue outline-none font-mono shadow-inner"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
                        if (val && !projectTypes.includes(val)) {
                          setProjectTypes([...projectTypes, val]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 font-mono uppercase">Press Enter</div>
                </div>
              </div>
            </div>

            {/* Logic Visualizer Card */}
            <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-24 h-24" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3 font-mono">
                <Zap className="w-6 h-6 text-accent-blue" /> Logic Simulator
              </h3>
              
              <div className="bg-bg-dark border border-border-main rounded p-6 flex items-center justify-center relative overflow-hidden shadow-inner">
                <div className="text-center z-10">
                  <div className="text-accent-blue font-mono text-xs mb-1 uppercase tracking-widest font-bold">Aggregate Score Simulation</div>
                  <div className="text-5xl font-bold tracking-tighter text-white font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">87.4</div>
                  <div className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">Calculated from dynamic weights</div>
                </div>
                <div className="absolute top-4 right-4 h-2 w-2 bg-accent-red rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Schedule Card */}
        <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-24 h-24" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-3 font-mono">
            <Clock className="w-6 h-6 text-accent-blue" /> Background Automation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between p-6 bg-bg-dark/50 rounded-lg border border-border-main/50 group/item hover:border-accent-blue/30 transition-colors">
              <div>
                <span className="text-base font-bold text-slate-200 block">Auto-Rescan Active</span>
                <span className="text-xs text-slate-500 font-mono">Background job daemon for library health.</span>
              </div>
              <button 
                onClick={() => setAutoRescan(!autoRescan)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${autoRescan ? 'bg-accent-green' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRescan ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="p-6 bg-bg-dark/50 rounded-lg border border-border-main/50 group/item hover:border-accent-blue/30 transition-colors flex items-center gap-6">
              <div className="flex-1">
                <span className="text-base font-bold text-slate-200 block">Cron Schedule</span>
                <span className="text-xs text-slate-500 font-mono">Standard cron syntax for rescan frequency.</span>
              </div>
              <div className="bg-bg-dark px-4 py-2 rounded border border-border-main flex items-center gap-3 shadow-inner">
                <Terminal className="text-accent-blue w-4 h-4" />
                <code className="font-mono text-sm text-accent-blue font-bold">0 3 * * *</code>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 bg-accent-green rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Valid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
