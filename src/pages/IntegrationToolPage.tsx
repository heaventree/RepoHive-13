import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { Loader, AlertCircle, ArrowLeft, Plug, ListChecks, Key } from 'lucide-react';
import { SEO } from '../lib/seo';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

const HAIRLINE = '#E5E5E5';

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
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Loader className="w-6 h-6 text-[#0000FF] animate-spin" />
    </div>
  );

  if (error || !tool) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-[#FAFAFA]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
      <h1 className="text-xl font-bold text-black tracking-tight mb-2">Integration not found</h1>
      <Link to="/integrations" className="px-4 py-2 rounded bg-black text-white font-mono text-sm mt-4 transition-colors hover:bg-[#0000FF]">← Back to Integrations</Link>
    </div>
  );

  let steps: string[] = [];
  try { steps = JSON.parse(tool.setupSteps || '[]'); } catch { steps = []; }
  const html = tool.bodyMd ? marked.parse(tool.bodyMd) as string : '';

  return (
    <div className="min-h-screen relative bg-[#FAFAFA] text-black selection:bg-[#0000FF] selection:text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <SEO
        title={tool.seoTitle || `Connect RepoHive to ${tool.name}`}
        description={tool.seoDescription || tool.tagline || `Step-by-step instructions for wiring RepoHive's curated repo library into ${tool.name}.`}
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
          <Link to="/integrations" className="inline-flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-[#0000FF] transition-colors mb-6">
            <ArrowLeft className="w-3 h-3" /> All integrations
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded border border-black flex items-center justify-center flex-none overflow-hidden">
              {tool.logoUrl ? <img src={tool.logoUrl} alt={tool.name} className="w-full h-full object-contain p-2" /> : <Plug className="w-6 h-6 text-black" />}
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#0000FF] mb-1">{tool.category}</div>
              <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight leading-tight">Connect RepoHive to {tool.name}</h1>
            </div>
          </div>

          {tool.tagline && <p className="text-lg text-gray-600 leading-relaxed mb-8">{tool.tagline}</p>}

          {tool.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-10 border-l-2 border-[#0000FF] pl-4">{tool.description}</p>
          )}

          {steps.length > 0 && (
            <div className="rounded-md p-6 mb-10 bg-white border" style={{ borderColor: HAIRLINE }}>
              <h2 className="font-mono font-bold text-black text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-[#0000FF]" /> Setup steps
              </h2>
              <ol className="space-y-4">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                    <span className="w-6 h-6 rounded-full border border-black text-black flex items-center justify-center font-bold font-mono text-xs flex-none">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {html && (
            <div className="prose-blog text-gray-700 leading-relaxed mb-10" dangerouslySetInnerHTML={{ __html: html }} />
          )}

          <div className="text-center mt-12">
            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 rounded font-mono text-sm font-bold tracking-widest uppercase bg-black text-white transition-colors hover:bg-[#0000FF] active:scale-[0.98]"
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
