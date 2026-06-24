import React, { ReactNode } from 'react';
import { MarketingNav } from './MarketingNav';
import { MarketingFooter } from './MarketingFooter';
import { SEO } from '../../lib/seo';
import type { SEOProps } from '../../lib/seo';

const HAIRLINE = '#E5E5E5';

interface MarketingPageProps {
  kicker: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  seo?: SEOProps;
}

// Shared shell for all marketing/feature pages: light Raw Minimal background,
// MarketingNav at top, MarketingFooter at bottom, hero block, then content.
export function MarketingPage({ kicker, title, subtitle, children, seo }: MarketingPageProps) {
  return (
    <div
      className="min-h-screen bg-[#FAFAFA] text-black selection:bg-[#0000FF] selection:text-white flex flex-col"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {seo && <SEO {...seo} />}
      <MarketingNav />

      <div className="flex-1 pt-20 pb-24 px-6 bg-white border-b" style={{ borderColor: HAIRLINE }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span
                className="font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-gray-100 border"
                style={{ borderColor: HAIRLINE }}
              >
                {kicker}
              </span>
            </div>
            <h1
              className="font-bold tracking-tighter leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}
            >
              {title}
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
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

// Standard card section used across feature pages — Raw Minimal style.
export function FeatureCard({ title, body, icon: Icon }: { title: string; body: ReactNode; icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; }) {
  return (
    <div
      className="rounded-md p-8 h-full bg-white border"
      style={{ borderColor: HAIRLINE }}
    >
      {Icon && (
        <div className="w-10 h-10 rounded flex items-center justify-center mb-4 border border-black">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="font-bold text-black text-lg mb-3">{title}</h3>
      <div className="text-sm text-gray-600 leading-relaxed space-y-3">{body}</div>
    </div>
  );
}
