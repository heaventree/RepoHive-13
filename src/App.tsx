import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Library } from './components/Library';
import { Ingest } from './components/Ingest';
import { RepoDetail } from './components/RepoDetail';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { SettingsHub } from './components/SettingsHub';
import { AdminDashboard } from './components/AdminDashboard';
import { Repo } from './types';
import { Bell, HelpCircle, Rocket, LayoutGrid, Settings, Flame, Crown } from 'lucide-react';
import { UserButton } from '@clerk/react';
import { AUTH_ENABLED } from './auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('library');
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  // Admin tab is shown only when the backend confirms this user is in
  // ADMIN_USER_IDS (the API enforces it regardless — this is just visibility).
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/admin/status')
      .then(r => r.json())
      .then(d => setIsAdmin(Boolean(d?.admin)))
      .catch(() => {});
  }, []);

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
      case 'settings':
        return <SettingsHub onExit={() => setActiveTab('library')} />;
      // Legacy direct routes — now nested under Settings.
      case 'monitoring':
        return <SettingsHub initialSection="monitoring" onExit={() => setActiveTab('library')} />;
      case 'policies':
        return <SettingsHub initialSection="policies" onExit={() => setActiveTab('library')} />;
      case 'api':
        return <SettingsHub initialSection="api" onExit={() => setActiveTab('library')} />;
      case 'config':
        return <SettingsHub initialSection="config" onExit={() => setActiveTab('library')} />;
      case 'appkillers':
        return <Library
          onViewRepo={setSelectedRepo}
          onBulkIngest={() => setActiveTab('ingest')}
          onGoToWorkspace={() => setActiveTab('projects')}
          appKillersMode
        />;
      case 'admin':
        return isAdmin ? <AdminDashboard /> : null;
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
      <header
        className="h-14 flex-none flex items-center justify-between px-5 z-30 relative"
        style={{
          background: 'rgba(15,23,42,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 1px 0 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.4)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 flex-none">
          <Link to="/" className="flex items-center">
            <img src="/repohive-logo-white-yellow.png" alt="RepoHive" className="h-7 w-auto" />
          </Link>
          <span
            className="text-[10px] font-mono text-slate-600 px-1.5 py-0.5 rounded border"
            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
          >
            v2.1.0
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 flex-1 justify-center mx-4">
          {[
            { id: 'library',  icon: LayoutGrid, label: 'Library' },
            { id: 'projects', icon: Rocket,     label: 'Projects' },
            { id: 'settings', icon: Settings,   label: 'Settings' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-150 ${
                activeTab === id
                  ? 'bg-accent-blue/15 text-accent-blue'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-4 bg-white/10 mx-1" />

          {/* App Killers */}
          <button
            onClick={() => handleTabChange('appkillers')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-150 border ${
              activeTab === 'appkillers'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.2)]'
                : 'text-amber-500/60 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            App Killers
          </button>

          {/* Admin — only rendered when the backend confirms admin access */}
          {isAdmin && (
            <button
              onClick={() => handleTabChange('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-150 border ${
                activeTab === 'admin'
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_16px_rgba(168,85,247,0.2)]'
                  : 'text-purple-500/60 border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/40'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-none">
          {/* API status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            API: Online
          </div>

          <div className="w-px h-4 bg-white/8 mx-1" />

          {/* Icon buttons */}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/8 mx-1" />

          {/* Avatar */}
          {AUTH_ENABLED ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-mono text-white cursor-pointer hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 0 10px rgba(99,102,241,0.35)' }}
            >
              AD
            </div>
          )}
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
