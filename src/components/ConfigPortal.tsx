import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  Sliders, 
  Save, 
  Play, 
  Terminal,
  Activity,
  Plus,
  X,
  Key,
  Globe,
  Copy,
  RefreshCw
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
  const [externalApiKey, setExternalApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.weights) setWeights(data.weights);
        if (data.projectTypes) setProjectTypes(data.projectTypes);
        if (data.external_api_key) setExternalApiKey(data.external_api_key);
      });
  }, []);

  const generateApiKey = () => {
    const newKey = 'rs_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setExternalApiKey(newKey);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      }),
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'external_api_key', value: externalApiKey })
      })
    ]);
    setIsSaving(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-dark bg-[radial-gradient(rgba(56,189,248,0.1)_1px,transparent_1px)] bg-[length:20px_20px]">
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 custom-scrollbar">
        <section className="p-4 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono text-sm uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Sliders className="w-5 h-5" /> Scoring Weights
            </h3>
            <span className="text-accent-blue text-sm font-mono bg-accent-blue/10 px-2 py-1 rounded border border-accent-blue/20">TOTAL: 100</span>
          </div>

          <div className="space-y-6 border border-slate-700 p-5 bg-bg-panel rounded-sm shadow-xl relative">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="group">
                <div className="flex justify-between mb-2">
                  <label className="text-base font-medium text-white capitalize">{key}</label>
                  <span className="font-mono text-sm text-accent-blue">{value}%</span>
                </div>
                <input 
                  type="range" 
                  value={value}
                  onChange={(e) => setWeights(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent-blue" 
                />
              </div>
            ))}
          </div>

          <section className="space-y-4">
            <h3 className="font-mono text-sm uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Plus className="w-5 h-5" /> Project Type Options
            </h3>
            <div className="border border-slate-700 p-5 bg-bg-panel rounded-sm space-y-4">
              <div className="flex flex-wrap gap-2">
                {projectTypes.map((type, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-bg-dark border border-slate-700 px-3 py-1.5 rounded-sm">
                    <span className="text-base text-white font-mono">{type}</span>
                    <button 
                      onClick={() => setProjectTypes(prev => prev.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Add new type..."
                  className="flex-1 bg-bg-dark border border-slate-700 p-2 rounded-sm text-base text-white focus:border-accent-blue outline-none"
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
              </div>
            </div>
          </section>

          <section className="py-2">
            <h3 className="font-mono text-sm uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Logic Visualizer
            </h3>
            <div className="border border-slate-700 bg-bg-panel h-40 w-full relative overflow-hidden rounded-sm flex items-center justify-center">
              <div className="text-center z-10">
                <div className="text-accent-blue font-mono text-sm mb-1 uppercase">Aggregate Score Simulation</div>
                <div className="text-4xl font-bold tracking-tighter text-white">87.4</div>
                <div className="text-xs text-slate-500 mt-1 font-mono">CALCULATED FROM WEIGHTS</div>
              </div>
              <div className="absolute top-4 right-4 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-mono text-sm uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Globe className="w-5 h-5" /> External Agent Access
            </h3>
            <div className="border border-slate-700 bg-bg-panel p-5 rounded-sm space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed">
                Allow external tools (like Replit Agents) to scan your library for useful repositories. 
                Access requires a valid API key passed as a query parameter.
              </p>
              
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-bold text-slate-500 flex items-center gap-1.5">
                    <Key className="w-4 h-4" /> API Key
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-bg-dark border border-slate-700 p-2 rounded-sm font-mono text-sm text-accent-blue truncate">
                      {externalApiKey || 'No key generated'}
                    </div>
                    <button 
                      onClick={generateApiKey}
                      className="p-2 bg-slate-800 border border-slate-700 rounded-sm text-slate-400 hover:text-white transition-colors"
                      title="Generate New Key"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => copyToClipboard(externalApiKey)}
                      disabled={!externalApiKey}
                      className="p-2 bg-slate-800 border border-slate-700 rounded-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                      title="Copy Key"
                    >
                      {copied ? <span className="text-xs font-bold text-green-500">COPIED</span> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase font-bold text-slate-500 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" /> Endpoint URL
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-bg-dark border border-slate-700 p-2 rounded-sm font-mono text-sm text-slate-400 truncate">
                      {window.location.origin}/api/external/repos?apiKey=...
                    </div>
                    <button 
                      onClick={() => copyToClipboard(`${window.location.origin}/api/external/repos?apiKey=${externalApiKey}`)}
                      disabled={!externalApiKey}
                      className="p-2 bg-slate-800 border border-slate-700 rounded-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                      title="Copy Endpoint"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-mono text-sm uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Activity className="w-5 h-5" /> Scan Schedule
            </h3>
            <div className="border border-slate-700 bg-bg-panel p-4 rounded-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex flex-col">
                  <span className="text-base font-medium text-white">Auto-Rescan Active</span>
                  <span className="text-sm text-slate-500">Background job daemon</span>
                </div>
                <div className="w-12 h-6 bg-accent-blue rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="pt-4 space-y-4">
                <div className="bg-bg-dark p-3 rounded border border-slate-700 flex items-center gap-3">
                  <Terminal className="text-accent-blue w-5 h-5" />
                  <code className="font-mono text-sm text-accent-blue">0 3 * * *</code>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-slate-500 uppercase">Valid</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      <footer className="bg-bg-dark/95 border-t border-slate-700 p-4 pb-6 backdrop-blur z-30">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <button className="flex-1 py-3 px-4 rounded-sm border border-slate-700 text-slate-400 font-mono text-sm uppercase tracking-wider hover:bg-slate-800 transition-colors">
            Reset Defaults
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] py-3 px-4 rounded-sm bg-accent-blue/10 border border-accent-blue text-accent-blue font-mono text-sm uppercase tracking-wider font-bold hover:bg-accent-blue/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Deploy Config
          </button>
        </div>
      </footer>
    </div>
  );
};
