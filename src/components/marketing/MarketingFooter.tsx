import React from 'react';
import { Link } from 'react-router-dom';

export function MarketingFooter() {
  return (
    <footer
      className="relative z-10 border-t mt-32"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(11,19,38,0.6)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 flex items-center justify-center font-black text-sm rounded-md font-mono text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
            >
              RS
            </div>
            <span className="font-bold text-sm text-white font-mono">RepoScout</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
            OSS intelligence for engineering teams that care about what they ship.
          </p>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-4">Product</div>
          {['Library', 'Projects', 'App Killers', 'Monitoring', 'API'].map(l => (
            <div key={l}>
              <Link to="/app" className="text-xs text-slate-500 hover:text-slate-200 transition-colors">{l}</Link>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-4">Company</div>
          {['Pricing', 'Changelog', 'Roadmap', 'Blog'].map(l => (
            <div key={l}>
              <Link to="/pricing" className="text-xs text-slate-500 hover:text-slate-200 transition-colors">{l}</Link>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-4">Legal</div>
          {['Privacy Policy', 'Terms of Service', 'System Status', 'API Docs'].map(l => (
            <div key={l}>
              <a href="#" className="text-xs text-slate-500 hover:text-slate-200 transition-colors">{l}</a>
            </div>
          ))}
        </div>
      </div>

      <div
        className="border-t px-6 py-4 flex items-center justify-between max-w-7xl mx-auto"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <span className="text-[10px] font-mono text-slate-700">© 2025 RepoScout. All rights reserved.</span>
        <span className="text-[10px] font-mono text-slate-700">Built for engineers, by engineers.</span>
      </div>
    </footer>
  );
}
