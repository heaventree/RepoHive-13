import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Flame } from 'lucide-react';

const ACCENT = '#0000FF';
const HAIRLINE = '#E5E5E5';

const LINKS = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/projects', label: 'Projects' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/integrations', label: 'Integrations' },
];

export function MarketingNav() {
  const location = useLocation();

  return (
    <nav
      className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-50 border-b"
      style={{ borderColor: HAIRLINE, fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <Link to="/" className="flex items-center gap-2">
        <Terminal className="w-5 h-5" />
        <span className="font-bold text-lg tracking-tight">RepoHive</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
        {LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`transition-colors hover:text-black ${
              location.pathname === to ? 'text-black' : ''
            }`}
          >
            {label}
          </Link>
        ))}
        <Link
          to="/app-killers"
          className={`flex items-center gap-1.5 transition-colors hover:text-[#0000FF] ${
            location.pathname === '/app-killers' ? 'text-[#0000FF]' : ''
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> App Killers
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/sign-in"
          className="text-sm font-medium hover:text-[#0000FF] transition-colors hidden md:block"
        >
          Log in
        </Link>
        <Link
          to="/sign-up"
          className="text-sm font-bold bg-black text-white px-4 py-2 rounded hover:bg-[#0000FF] transition-colors"
          style={{ ['--accent' as string]: ACCENT }}
        >
          Start Free
        </Link>
      </div>
    </nav>
  );
}
