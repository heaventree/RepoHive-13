import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame } from 'lucide-react';

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4"
    >
      <div
        className="flex items-center justify-between px-5 py-2.5 rounded-full transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(11,19,38,0.92)' : 'rgba(11,19,38,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 flex items-center justify-center font-black text-sm rounded-md font-mono text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}
          >
            RS
          </div>
          <span className="font-bold text-sm tracking-tight text-white font-mono">RepoScout</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { to: '/', label: 'Home' },
            { to: '/pricing', label: 'Pricing' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono transition-all duration-150 ${
                location.pathname === to
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="w-px h-4 bg-white/10 mx-1" />
          <Link
            to="/app"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono text-amber-500/70 border border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/40 transition-all duration-150"
          >
            <Flame className="w-3.5 h-3.5" /> App Killers
          </Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Link
            to="/sign-in"
            className="px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="px-4 py-1.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 16px rgba(59,130,246,0.35)' }}
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
