import React, { useState, useEffect } from 'react';
import {
  Key,
  Globe,
  Copy,
  RefreshCw,
  Terminal,
  Shield,
  Info,
  CheckCircle2,
  Lock,
  ExternalLink,
  Activity,
  Plug,
  ChevronDown,
  ListChecks
} from 'lucide-react';

interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

interface IntegrationListItem {
  slug: string;
  name: string;
  category: string;
  tagline: string | null;
  logoUrl: string | null;
  setupType: 'generic' | 'custom';
}

interface IntegrationDetail extends IntegrationListItem {
  setupSteps: string | null;
}

export const ApiConfig: React.FC = () => {
  // The full key is only ever returned once, at creation. After that we can
  // only show the masked prefix from the list.
  const [externalApiKey, setExternalApiKey] = useState('');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationListItem[]>([]);
  const [expanded, setExpanded] = useState<Record<string, IntegrationDetail | 'loading'>>({});

  const loadKeys = () => {
    fetch('/api/keys')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setKeys(data); })
      .catch(() => {});
  };

  useEffect(loadKeys, []);

  useEffect(() => {
    fetch('/api/integrations')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setIntegrations(data); })
      .catch(() => {});
  }, []);

  const keyForDisplay = externalApiKey || (keys.length > 0 ? `${keys[0].key_prefix}...` : 'YOUR_KEY');

  const toggleIntegration = async (slug: string) => {
    if (expanded[slug]) {
      setExpanded(prev => { const next = { ...prev }; delete next[slug]; return next; });
      return;
    }
    setExpanded(prev => ({ ...prev, [slug]: 'loading' }));
    try {
      const res = await fetch(`/api/integrations/${slug}`);
      const data = await res.json();
      if (res.ok) setExpanded(prev => ({ ...prev, [slug]: data }));
    } catch {
      setExpanded(prev => { const next = { ...prev }; delete next[slug]; return next; });
    }
  };

  const generateApiKey = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'IDE integration' })
      });
      const data = await res.json();
      if (data.key) setExternalApiKey(data.key);
      loadKeys();
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="glass-header p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 font-mono uppercase tracking-widest">
          <Globe className="w-4 h-4" /> Connectivity & Integration
        </div>
        <h2 className="text-3xl font-bold text-white font-mono tracking-tight">API Access Management</h2>
      </div>

      <div className="p-6 space-y-8 max-w-5xl mx-auto w-full">
        <div className="bg-accent-blue/5 border border-accent-blue/20 p-6 rounded-sm flex gap-4 items-start backdrop-blur-sm">
          <Info className="w-6 h-6 text-accent-blue mt-0.5" />
          <div>
            <h4 className="text-lg font-bold text-white mb-2">Give Your AI Build Tools a Repo Memory</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-mono">
              Connect tools like <span className="text-white font-bold">Lovable, Replit, Bolt, or Cursor</span> directly to the repos you&apos;ve imported.
              With your API key, these tools can search your saved repo library and use the best matches as build context — instead of starting from a blank prompt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Key Card */}
          <div className="glass-card rounded-lg p-8 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Key className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3 font-mono">
              <Key className="w-6 h-6 text-accent-blue" /> Authentication
            </h3>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold text-slate-500 font-mono tracking-widest">Your API Key</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-bg-dark border border-border-main p-3 rounded font-mono text-sm text-accent-blue break-all shadow-inner min-h-[44px] flex items-center">
                    {externalApiKey
                      ? externalApiKey
                      : keys.length > 0
                        ? <span className="text-slate-400">{keys[0].key_prefix}{'•'.repeat(24)}</span>
                        : <span className="text-slate-600 italic">No key generated yet</span>}
                  </div>
                  <button 
                    onClick={generateApiKey}
                    disabled={isGenerating}
                    className="p-3 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-50"
                    title="Generate New Key"
                  >
                    <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                  </button>
                  <button 
                    onClick={() => copyToClipboard(externalApiKey)}
                    disabled={!externalApiKey}
                    className="p-3 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-50 min-w-[48px] flex items-center justify-center"
                    title="Copy Key"
                  >
                    {copied ? <span className="text-[10px] font-bold text-accent-green">COPIED</span> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1 italic">
                  Copy your key now — for security it is only shown once. You can revoke it any time.
                </p>
              </div>
            </div>
          </div>

          {/* Endpoint Card */}
          <div className="glass-card rounded-lg p-8 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Terminal className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3 font-mono">
              <Terminal className="w-6 h-6 text-accent-blue" /> API Endpoints
            </h3>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-bold text-slate-500 font-mono tracking-widest">Library Export URL</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-bg-dark border border-border-main p-3 rounded font-mono text-xs text-slate-400 break-all shadow-inner min-h-[44px] flex items-center">
                    {window.location.origin}/api/external/repos?apiKey=...
                  </div>
                  <button 
                    onClick={() => copyToClipboard(`${window.location.origin}/api/external/repos?apiKey=${externalApiKey}`)}
                    disabled={!externalApiKey}
                    className="p-3 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-50"
                    title="Copy Full URL"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase font-mono mb-2">
                  <Activity className="w-3 h-3" /> Available Methods
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono p-2 bg-bg-dark/50 rounded border border-border-main/30">
                    <span className="text-accent-green font-bold">GET</span>
                    <span className="text-slate-400">/api/external/repos</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono p-2 bg-bg-dark/50 rounded border border-border-main/30">
                    <span className="text-accent-green font-bold">GET</span>
                    <span className="text-slate-400">/api/external/stats</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connector directory — click a tool for exact setup steps */}
        {integrations.length > 0 && (
          <div className="glass-card rounded-lg p-8 shadow-xl">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-3 font-mono">
              <Plug className="w-6 h-6 text-accent-blue" /> Connect Your Tools
            </h3>
            <p className="text-xs text-slate-500 font-mono mb-6">Click any tool below for step-by-step instructions, using the key above.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {integrations.map(tool => {
                const state = expanded[tool.slug];
                const isOpen = Boolean(state);
                return (
                  <div key={tool.slug} className="rounded-lg border border-border-main bg-bg-dark/50 overflow-hidden">
                    <button
                      onClick={() => toggleIntegration(tool.slug)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.03] transition-all"
                    >
                      <div className="w-8 h-8 rounded bg-white/5 border border-border-main/40 flex items-center justify-center flex-none overflow-hidden">
                        {tool.logoUrl ? <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-1" /> : <Plug className="w-3.5 h-3.5 text-slate-600" />}
                      </div>
                      <span className="flex-1 text-sm font-bold text-white truncate">{tool.name}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 flex-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 border-t border-border-main/30">
                        {state === 'loading' ? (
                          <p className="text-[11px] text-slate-600 italic font-mono pt-3">Loading…</p>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-mono pt-3 mb-2">
                              <ListChecks className="w-3 h-3" /> Setup steps
                            </div>
                            <ol className="space-y-2">
                              {(() => {
                                let steps: string[] = [];
                                try { steps = JSON.parse((state as IntegrationDetail).setupSteps || '[]'); } catch { steps = []; }
                                return steps.map((s, i) => (
                                  <li key={i} className="text-[11px] text-slate-400 font-mono leading-relaxed flex gap-2">
                                    <span className="text-accent-blue flex-none">{i + 1}.</span>
                                    <span>{s.replace('YOUR_KEY', keyForDisplay)}</span>
                                  </li>
                                ));
                              })()}
                            </ol>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Documentation Card */}
        <div className="glass-card rounded-lg p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3 font-mono">
            <FileText className="w-6 h-6 text-accent-blue" /> Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center font-bold font-mono">1</div>
              <h4 className="font-bold text-white">Create Key</h4>
              <p className="text-xs text-slate-500 font-mono leading-relaxed">Generate your unique access key above to allow AI agents to connect.</p>
            </div>
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center font-bold font-mono">2</div>
              <h4 className="font-bold text-white">Verify Access</h4>
              <p className="text-xs text-slate-500 font-mono leading-relaxed">Open the Endpoint URL in your browser to confirm your library is visible.</p>
            </div>
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center font-bold font-mono">3</div>
              <h4 className="font-bold text-white">Start Coding</h4>
              <p className="text-xs text-slate-500 font-mono leading-relaxed">Give the URL to Cursor, Lovable, or Replit so they can search your library as build context while they work.</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-bg-dark rounded border border-border-main font-mono text-xs">
            <div className="flex justify-between items-center mb-2 text-slate-500 uppercase tracking-widest font-bold">
              <span>Example Request</span>
              <button onClick={() => copyToClipboard(`curl "${window.location.origin}/api/external/repos?apiKey=${externalApiKey}"`)} className="hover:text-white transition-colors">
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <code className="text-accent-blue">
              curl "{window.location.origin}/api/external/repos?apiKey={externalApiKey || 'YOUR_KEY'}"
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

import { FileText } from 'lucide-react';
