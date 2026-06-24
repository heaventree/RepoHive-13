import React from 'react';

export interface OpenGraph {
  type?: string;
  title?: string;
  description?: string;
  url?: string;
  siteName?: string;
  image?: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  openGraph?: OpenGraph;
  jsonLd?: Record<string, unknown>;
}

export interface ArticleSchemaOptions {
  description?: string;
  author?: { name: string };
  image?: string;
}

export function buildArticleSchema(
  title: string,
  datePublished: string,
  options: ArticleSchemaOptions = {},
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    datePublished,
  };
  if (options.description) schema.description = options.description;
  if (options.image) schema.image = options.image;
  if (options.author) {
    schema.author = { '@type': 'Person', name: options.author.name };
  }
  return schema;
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let meta = document.head.querySelector(selector);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

const JSON_LD_ID = 'seo-json-ld';

export const SEO: React.FC<SEOProps> = ({ title, description, openGraph, jsonLd }) => {
  const fullTitle = title ? `${title} — RepoHive` : 'RepoHive';

  React.useEffect(() => {
    document.title = fullTitle;
    if (description) setMeta('meta[name="description"]', 'name', 'description', description);

    if (openGraph) {
      if (openGraph.type) setMeta('meta[property="og:type"]', 'property', 'og:type', openGraph.type);
      if (openGraph.title) setMeta('meta[property="og:title"]', 'property', 'og:title', openGraph.title);
      if (openGraph.description) setMeta('meta[property="og:description"]', 'property', 'og:description', openGraph.description);
      if (openGraph.url) setMeta('meta[property="og:url"]', 'property', 'og:url', openGraph.url);
      if (openGraph.siteName) setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', openGraph.siteName);
      if (openGraph.image) setMeta('meta[property="og:image"]', 'property', 'og:image', openGraph.image);
    }

    if (jsonLd) {
      let script = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = JSON_LD_ID;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      const script = document.getElementById(JSON_LD_ID);
      if (script) script.remove();
    };
  }, [fullTitle, description, openGraph, jsonLd]);

  return null;
};
