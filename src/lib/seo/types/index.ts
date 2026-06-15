export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface OpenGraphProps {
  type?: 'website' | 'article' | 'product' | 'video.movie' | 'music.song' | 'profile';
  title?: string;
  description?: string;
  url?: string;
  image?: string | OpenGraphImage | OpenGraphImage[];
  siteName?: string;
  locale?: string;
}

export interface TwitterCardProps {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface SchemaOrg {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  lang?: string;
  openGraph?: OpenGraphProps;
  twitter?: TwitterCardProps;
  jsonLd?: SchemaOrg | SchemaOrg[];
  noindex?: boolean;
  nofollow?: boolean;
  templateContext?: Record<string, string | undefined>;
}

export interface RouteMetadata {
  path: string;
  priority?: number;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  label?: string;
  prerender?: boolean;
}

export interface SEOConfig {
  hostname: string;
  appName: string;
  lang?: string;
  defaultDescription?: string;
  defaultOGImage?: string;
  routes?: RouteMetadata[];
  environment?: 'development' | 'production';
}

export interface SitemapEntry {
  url: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
  hreflang?: Array<{ lang: string; url: string }>;
}

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export interface ImageProps extends Omit<import('react').ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  format?: 'webp' | 'avif' | 'auto';
  sizes?: string;
}

export type PreloadedState = Record<string, unknown>;
