import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { Calendar, Loader, AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';
import { SEO, buildArticleSchema } from '../lib/seo';
import { MarketingNav } from '../components/marketing/MarketingNav';
import { MarketingFooter } from '../components/marketing/MarketingFooter';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string | null;
  bodyMd: string | null;
  bodyHtml: string | null;
  format: string | null;
  ogImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  tags: string | null;
  author: string | null;
  publishedAt: string | null;
}

marked.setOptions({ gfm: true, breaks: false });

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog/${slug}`).then(async r => {
      const d = await r.json();
      if (!r.ok) setError(d.error || 'Post not found');
      else setPost(d);
    }).catch(() => setError('Network error')).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <Loader className="w-6 h-6 text-[#0000FF] animate-spin" />
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-[#FAFAFA]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
      <h1 className="text-xl font-bold text-black mb-2">Post not found</h1>
      <Link to="/blog" className="px-4 py-2 rounded bg-black text-white font-mono text-sm mt-4 hover:bg-[#0000FF] transition-colors">← Back to Blog</Link>
    </div>
  );

  const html = post.format === 'html'
    ? (post.bodyHtml || '')
    : (post.bodyMd ? marked.parse(post.bodyMd) as string : '');
  const schema = post.publishedAt
    ? buildArticleSchema(post.title, post.publishedAt, {
        description: post.excerpt ?? undefined,
        author: post.author ? { name: post.author } : undefined,
        image: post.ogImage ?? undefined,
      })
    : undefined;

  return (
    <div className="min-h-screen relative bg-[#FAFAFA] text-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <SEO
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt || undefined}
        openGraph={{
          type: 'article',
          title: post.title,
          description: post.excerpt || undefined,
          url: `https://repohive.app/blog/${post.slug}`,
          image: post.ogImage || undefined,
          siteName: 'RepoHive',
        }}
        jsonLd={schema}
      />
      <MarketingNav />

      <article className="relative z-10 pt-36 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-black mb-6">
            <ArrowLeft className="w-3 h-3" /> All posts
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#0000FF] mb-3">
            <BookOpen className="w-4 h-4" /> Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 text-xs font-mono text-gray-500 mb-10">
            {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.publishedAt).toLocaleDateString()}</span>}
            {post.author && <span>· {post.author}</span>}
          </div>

          <div
            className="prose-blog text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {post.tags && (
            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                <span key={t} className="px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider bg-white text-[#0000FF] border" style={{ borderColor: '#E5E5E5' }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
};
