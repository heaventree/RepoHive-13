import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Loader, BookOpen, ArrowLeft } from 'lucide-react';
import { SEO } from '../lib/seo';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

interface BlogRow {
  slug: string;
  title: string;
  excerpt: string | null;
  ogImage: string | null;
  tags: string | null;
  author: string | null;
  publishedAt: string | null;
}

export const BlogIndexPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setPosts(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen relative bg-[#FAFAFA] text-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <SEO
        title="Blog — Open Source Insights & SEO for Developers"
        description="Practical articles on open-source tooling, self-hosting paid SaaS, and shipping faster with curated repos. From the RepoHive team."
        openGraph={{ type: 'website', url: 'https://repohive.app/blog', siteName: 'RepoHive' }}
      />
      <MarketingNav />

      <main className="relative z-10 pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-black mb-6">
            <ArrowLeft className="w-3 h-3" /> Home
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#0000FF] mb-3">
            <BookOpen className="w-4 h-4" /> Blog
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Notes on open source</h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-12 max-w-2xl">
            Field reports, comparisons, and self-hosting guides from the team that scores GitHub repos for a living.
          </p>

          {loading ? (
            <div className="flex justify-center py-12"><Loader className="w-6 h-6 text-[#0000FF] animate-spin" /></div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-gray-500 font-mono italic">No posts yet — check back soon.</p>
          ) : (
            <div className="space-y-4">
              {posts.map(p => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="block rounded-md p-6 bg-white border transition-colors group hover:border-[#0000FF]"
                  style={{ borderColor: '#E5E5E5' }}
                >
                  <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500 mb-2">
                    {p.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(p.publishedAt).toLocaleDateString()}</span>}
                    {p.author && <span>· {p.author}</span>}
                    {p.tags && <span>· {p.tags.split(',').slice(0, 3).map(t => t.trim()).join(' · ')}</span>}
                  </div>
                  <h2 className="text-xl font-bold text-black group-hover:text-[#0000FF] transition-colors mb-2">{p.title}</h2>
                  {p.excerpt && <p className="text-sm text-gray-600 leading-relaxed">{p.excerpt}</p>}
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-mono text-[#0000FF]">
                    Read post <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
};
