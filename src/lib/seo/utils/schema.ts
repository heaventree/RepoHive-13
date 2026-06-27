import type { SchemaOrg } from '../types';

export interface WebSiteSchema extends SchemaOrg {
  name: string;
  url: string;
  description?: string;
  image?: string;
  sameAs?: string[];
}

export interface ArticleSchema extends SchemaOrg {
  headline: string;
  datePublished: string;
  dateModified?: string;
  author?: string | { name: string; url?: string };
  description?: string;
  image?: string | string[];
}

export interface BreadcrumbSchema extends SchemaOrg {
  itemListElement: Array<{ '@type': 'ListItem'; position: number; name: string; item?: string }>;
}

export interface ProductSchema extends SchemaOrg {
  name: string;
  description?: string;
  brand?: string;
  image?: string;
}

export interface LocalBusinessSchema extends SchemaOrg {
  name: string;
  telephone?: string;
  email?: string;
  url?: string;
  address?: { streetAddress?: string; addressLocality?: string; addressCountry?: string };
}

export function buildWebSiteSchema(
  name: string,
  url: string,
  options?: Partial<WebSiteSchema>
): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    ...options,
  };
}

export function buildArticleSchema(
  headline: string,
  datePublished: string,
  options?: Partial<ArticleSchema>
): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    datePublished,
    ...options,
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export function buildProductSchema(
  name: string,
  options?: Partial<ProductSchema>
): ProductSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    ...options,
  };
}

export function buildLocalBusinessSchema(
  name: string,
  options?: Partial<LocalBusinessSchema>
): LocalBusinessSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    ...options,
  };
}
