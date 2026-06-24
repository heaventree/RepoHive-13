import React from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  openGraph?: {
    type?: string;
    url?: string;
    siteName?: string;
  };
}

export const SEO: React.FC<SEOProps> = ({ title, description, openGraph }) => {
  const fullTitle = title ? `${title} — RepoHive` : 'RepoHive';
  React.useEffect(() => {
    document.title = fullTitle;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [fullTitle, description]);
  return null;
};
