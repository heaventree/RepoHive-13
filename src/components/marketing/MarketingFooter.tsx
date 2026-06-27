import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

const HAIRLINE = '#E5E5E5';

export function MarketingFooter() {
  return (
    <footer
      className="bg-white border-t"
      style={{ borderColor: HAIRLINE, fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1 space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <span className="font-bold text-lg tracking-tight">RepoHive</span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
            OSS intelligence for engineering teams that care about what they ship.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-gray-500 border" style={{ borderColor: HAIRLINE }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C00] animate-pulse" />
            All systems operational
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-4">Product</div>
          {[
            { l: 'Library', to: '/app' },
            { l: 'Projects', to: '/projects' },
            { l: 'App Killers', to: '/app-killers' },
            { l: 'Integrations', to: '/integrations' },
          ].map(({ l, to }) => (
            <div key={l}>
              <Link to={to} className="text-sm text-gray-500 hover:text-black transition-colors">{l}</Link>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-4">Company</div>
          {[
            { l: 'Pricing', to: '/pricing' },
            { l: 'How it works', to: '/how-it-works' },
            { l: 'Blog', to: '/blog' },
          ].map(({ l, to }) => (
            <div key={l}>
              <Link to={to} className="text-sm text-gray-500 hover:text-black transition-colors">{l}</Link>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-4">Legal</div>
          {[
            { l: 'Privacy Policy', to: '/privacy' },
            { l: 'Terms of Service', to: '/terms' },
            { l: 'Acceptable Use', to: '/acceptable-use' },
            { l: 'Imprint', to: '/imprint' },
          ].map(({ l, to }) => (
            <div key={l}>
              <Link to={to} className="text-sm text-gray-500 hover:text-black transition-colors">{l}</Link>
            </div>
          ))}
        </div>
      </div>

      <div
        className="border-t px-6 py-4 flex items-center justify-between max-w-7xl mx-auto"
        style={{ borderColor: HAIRLINE }}
      >
        <span className="text-[10px] font-mono text-gray-400">© {new Date().getFullYear()} RepoHive. All rights reserved.</span>
        <span className="text-[10px] font-mono text-gray-400">Built for engineers, by engineers.</span>
      </div>
    </footer>
  );
}
