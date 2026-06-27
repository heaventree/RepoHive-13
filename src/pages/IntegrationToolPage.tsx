import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { Loader, AlertCircle, ArrowLeft, Plug, ListChecks, Key } from 'lucide-react';
import { SEO } from '../lib/seo';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

interface IntegrationDetail {
  slug: string;
  name: string;
  domain: string | null;
  category: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  setupType: 'generic' | 'custom';
  setupSteps: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  bodyMd: string | null;
}

marked.setOptions({ gfm: true, breaks: false });

export const IntegrationToolPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<IntegrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/integrations/${slug}`).then(async r => {
      const d = await r.json();
      if (!r.ok) setError(d.error || 'Integration not found');
      else setTool(d);
    }).catch(() => setError('Network error')).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1326' }}>
      <Loader className="w-6 h-6 text-accent-blue animate-spin" />
    </div>
  );

  if (error || !tool) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6" style={{ background: '#0b1326' }}>
      <AlertCircle className="w-10 h-10 text-slate-600 mb-3" />
      <h1 className="text-xl font-bold text-white font-mono mb-2">Integration not found</h1>
      <Link to="/integrations" className="px-4 py-2 rounded-lg bg-accent-blue text-white font-mono text-sm mt-4">← Back to Integrations</Link>
    </div>
  );

  let steps: string[] = [];
  try { steps = JSON.parse(tool.setupSteps || '[]'); } catch { steps = []; }
  const html = tool.bodyMd ? marked.parse(tool.bodyMd) as string : '';

  return (
    <div className="min-h-screen relative" style={{ background: '#0b1326', color: '#dae2fd' }}>
      <SEO
        title={tool.seoTitle || `Connect RepoHive to ${tool.name}`}
        description={tool.seoDescription || tool.tagline || `Step-by-step instructions for connecting your imported RepoHive repo library to ${tool.name}.`}
        openGraph={{
          type: 'article',
          title: `Connect RepoHive to ${tool.name}`,
          description: tool.tagline || undefined,
          url: `https://repohive.app/integrations/${tool.slug}`,
          image: tool.logoUrl || undefined,
          siteName: 'RepoHive',
        }}
      />
      <MarketingNav />

      <article className="relative z-10 pt-36 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/integrations" className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-white mb-6">
            <ArrowLeft className="w-3 h-3" /> All integrations
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-none overflow-hidden">
              {tool.logoUrl ? <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-2" /> : <Plug className="w-6 h-6 text-slate-500" />}
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-accent-blue mb-1">{tool.category}</div>
              <h1 className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight leading-tight">Connect RepoHive to {tool.name}</h1>
            </div>
          </div>

          {tool.tagline && <p className="text-lg text-slate-400 leading-relaxed mb-8">{tool.tagline}</p>}

          {tool.description && (
            <p className="text-sm text-slate-400 leading-relaxed mb-10 border-l-2 border-accent-blue/30 pl-4">{tool.description}</p>
          )}

          {steps.length > 0 && (
            <div
              className="rounded-lg p-6 mb-10"
              style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2 className="font-mono font-bold text-white text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-accent-blue" /> Setup steps
              </h2>
              <ol className="space-y-4">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-accent-blue/15 text-accent-blue flex items-center justify-center font-bold font-mono text-xs flex-none">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {html && (
            <div className="prose-blog text-slate-300 leading-relaxed mb-10" dangerouslySetInnerHTML={{ __html: html }} />
          )}

          <div className="text-center mt-12">
            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md font-mono text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#4d8eff', color: '#00285d', boxShadow: '0 0 24px rgba(77,142,255,0.4)' }}
            >
              <Key className="w-4 h-4" /> Get your API key
            </Link>
          </div>
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
};
