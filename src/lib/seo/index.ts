export { SEO } from './components/SEO';
export { SEOProvider, useSEOContext } from './context/SEOProvider';
export { useSEO } from './hooks/useSEO';
export {
  buildWebSiteSchema,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildProductSchema,
  buildLocalBusinessSchema,
} from './utils/schema';
export { renderTemplate, renderSeoTemplates } from './utils/template-engine';
export type {
  SEOProps,
  SEOConfig,
  OpenGraphProps,
  OpenGraphImage,
  TwitterCardProps,
  SchemaOrg,
  RouteMetadata,
  SitemapEntry,
  BreadcrumbItem,
  BreadcrumbProps,
  ImageProps,
} from './types';
