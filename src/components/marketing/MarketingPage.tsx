import React, { ReactNode } from 'react';
import { MarketingNav } from './MarketingNav';
import { MarketingFooter } from './MarketingFooter';
import { SEO } from '../../lib/seo';
import type { SEOProps } from '../../lib/seo';

const PRIMARY = '#adc6ff';

function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full"
        style={{ background: 'rgba(79,70,229,0.12)', filter: 'blur(120px)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
        style={{ background: 'rgba(124,58,237,0.10)', filter: 'blur(150px)' }} />
    </div>
  );
}

interface MarketingPageProps {
  kicker: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  seo?: SEOProps;
}

// Shared shell for all marketing/feature pages: dark background, orbs,
// MarketingNav at top, MarketingFooter at bottom, hero block, then content.
export function MarketingPage({ kicker, title, subtitle, children, seo }: MarketingPageProps) {
  return (
    <div className="min-h-screen relative" style={{ background: '#0b1326', color: '#dae2fd' }}>
      {seo && <SEO {...seo} />}
      <Orbs />
      <MarketingNav />

      <div className="relative z-10 pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span
                className="font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full"
                style={{ color: PRIMARY, border: '1px solid rgba(173,198,255,0.20)', background: 'rgba(173,198,255,0.05)' }}
              >
                {kicker}
              </span>
            </div>
            <h1
              className="font-mono font-black tracking-tight leading-tight mb-6 text-white"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
            >
              {title}
            </h1>
            <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}

// Standard glass-card section used across feature pages.
export function FeatureCard({ title, body, icon: Icon }: { title: string; body: ReactNode; icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; }) {
  return (
    <div
      className="rounded-xl p-8 h-full"
      style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
          style={{ background: 'rgba(77,142,255,0.10)', border: '1px solid rgba(77,142,255,0.25)' }}>
          <Icon className="w-5 h-5" style={{ color: '#4d8eff' }} />
        </div>
      )}
      <h3 className="font-mono font-bold text-white text-lg mb-3">{title}</h3>
      <div className="text-sm text-slate-400 leading-relaxed space-y-3">{body}</div>
    </div>
  );
}
