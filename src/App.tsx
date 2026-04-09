import React, { useState } from 'react';
import { Library } from './components/Library';
import { Ingest } from './components/Ingest';
import { RepoDetail } from './components/RepoDetail';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { ConfigPortal } from './components/ConfigPortal';
import { ApiConfig } from './components/ApiConfig';
import { Monitoring } from './components/Monitoring';
import { Policies } from './components/Policies';
import { Repo } from './types';
import { Bell, HelpCircle, Rocket, Database, Activity, ShieldCheck, Settings, Globe, Flame } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('library');
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  const handleTabChange = (tab: string) => {
    setSelectedRepo(null);
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (selectedRepo) {
      return <RepoDetail repo={selectedRepo} onBack={() => setSelectedRepo(null)} />;
    }

    switch (activeTab) {
      case 'library':
        return <Library 
          onViewRepo={setSelectedRepo} 
          onBulkIngest={() => setActiveTab('ingest')} 
          onGoToWorkspace={() => setActiveTab('projects')}
        />;
      case 'ingest':
        return <Ingest onComplete={() => setActiveTab('library')} />;
      case 'projects':
        return <ProjectWorkspace setActiveTab={setActiveTab} setSelectedRepo={setSelectedRepo} />;
      case 'monitoring':
        return <Monitoring />;
      case 'policies':
        return <Policies />;
      case 'config':
        return <ConfigPortal onBack={() => setActiveTab('library')} />;
      case 'api':
        return <ApiConfig />;
      case 'appkillers':
        return <Library
          onViewRepo={setSelectedRepo}
          onBulkIngest={() => setActiveTab('ingest')}
          onGoToWorkspace={() => setActiveTab('projects')}
          appKillersMode
        />;
      default:
        return <Library 
          onViewRepo={setSelectedRepo} 
          onBulkIngest={() => setActiveTab('ingest')} 
          onGoToWorkspace={() => setActiveTab('projects')}
        />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg-dark">
      {/* Header */}
      <header className="h-16 flex-none bg-bg-panel border-b border-border-main flex items-center justify-between px-4 z-30 shadow-sm">
        <div className="flex items-center gap-4 flex-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white text-bg-dark flex items-center justify-center font-bold text-base rounded-sm font-mono">RS</div>
            <h1 className="font-bold text-base tracking-tight text-white">RepoScout</h1>
          </div>
          <div className="h-5 w-px bg-border-main mx-1"></div>
          <div className="text-sm font-mono text-slate-500">v2.1.0</div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="flex items-center gap-8">
            <nav className="flex gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
              <button 
                onClick={() => handleTabChange('library')}
                className={`flex items-center gap-1.5 transition-colors ${activeTab === 'library' ? 'text-accent-blue border-b-2 border-accent-blue pb-0.5' : 'hover:text-white'}`}
              >
                <Database className="w-4 h-4" /> Library
              </button>
              <button 
                onClick={() => handleTabChange('projects')}
                className={`flex items-center gap-1.5 transition-colors ${activeTab === 'projects' ? 'text-accent-blue border-b-2 border-accent-blue pb-0.5' : 'hover:text-white'}`}
              >
                <Rocket className="w-4 h-4" /> Projects
              </button>
              <button 
                onClick={() => handleTabChange('monitoring')}
                className={`flex items-center gap-1.5 transition-colors ${activeTab === 'monitoring' ? 'text-accent-blue border-b-2 border-accent-blue pb-0.5' : 'hover:text-white'}`}
              >
                <Activity className="w-4 h-4" /> Monitoring
              </button>
              <button 
                onClick={() => handleTabChange('policies')}
                className={`flex items-center gap-1.5 transition-colors ${activeTab === 'policies' ? 'text-accent-blue border-b-2 border-accent-blue pb-0.5' : 'hover:text-white'}`}
              >
                <ShieldCheck className="w-4 h-4" /> Policies
              </button>
              <button 
                onClick={() => handleTabChange('api')}
                className={`flex items-center gap-1.5 transition-colors ${activeTab === 'api' ? 'text-accent-blue border-b-2 border-accent-blue pb-0.5' : 'hover:text-white'}`}
              >
                <Globe className="w-4 h-4" /> API
              </button>
              <button 
                onClick={() => handleTabChange('config')}
                className={`flex items-center gap-1.5 transition-colors ${activeTab === 'config' ? 'text-accent-blue border-b-2 border-accent-blue pb-0.5' : 'hover:text-white'}`}
              >
                <Settings className="w-4 h-4" /> System Config
              </button>
              <button
                onClick={() => handleTabChange('appkillers')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeTab === 'appkillers'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_14px_rgba(245,158,11,0.25)]'
                    : 'bg-transparent text-amber-500/70 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/50'
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> App Killers
              </button>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-none justify-end">
          <div className="flex items-center gap-2 px-3 py-1 bg-bg-dark/30 rounded-full border border-border-main/50 mr-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green"></span>
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">API: Online</span>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors"><Bell className="w-6 h-6" /></button>
          <button className="text-slate-500 hover:text-white transition-colors"><HelpCircle className="w-6 h-6" /></button>
          <div className="h-5 w-px bg-border-main mx-1"></div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-sm border border-border-main flex items-center justify-center text-sm font-mono font-bold shadow-md">
              AD
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 20% 50%, #1e1b4b 0%, #0f172a 40%, #0a0f1e 100%)' }}>
          {/* Global background orbs — make glass morphism work on every page */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-40" style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
            <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
            <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(100px)' }}></div>
            <div className="absolute top-1/4 left-1/2 w-[300px] h-[300px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
          </div>
          <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
