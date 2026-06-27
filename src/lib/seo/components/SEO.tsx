import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import type { SEOProps, OpenGraphImage } from '../types';
import { useSEOContext } from '../context/SEOProvider';
import { renderTemplate, renderSeoTemplates } from '../utils/template-engine';

export const SEO: React.FC<SEOProps> = (props) => {
  const { config, isDevelopment, overrides } = useSEOContext();

  // Merge admin DB overrides (keyed by path) over per-page defaults.
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const ovr = overrides[currentPath];
  const title = ovr?.title || props.title;
  const description = ovr?.description || props.description;
  const canonical = props.canonical;
  const lang = props.lang;
  const openGraph = ovr?.ogImage
    ? { ...(props.openGraph || {}), image: ovr.ogImage }
    : props.openGraph;
  const twitter = props.twitter;
  const jsonLd = props.jsonLd;
  const noindex = ovr?.noindex ? true : (props.noindex ?? false);
  const nofollow = props.nofollow ?? false;
  const templateContext = props.templateContext;
  const keywords = ovr?.keywords;

  const baseContext = useMemo(() => ({
    sitetitle: config.appName,
    sep: '|',
    ...templateContext,
  }), [config.appName, templateContext]);

  const formattedTitle = useMemo(() => {
    const rawTitle = title || '';
    let finalTitle = rawTitle;
    if (rawTitle && !rawTitle.includes('%%')) {
      finalTitle = `${rawTitle} %%sep%% %%sitetitle%%`;
    } else if (!rawTitle) {
      finalTitle = `%%sitetitle%%`;
    }
    return renderTemplate(finalTitle, baseContext);
  }, [title, baseContext]);

  const finalDescription = useMemo(() => {
    return renderTemplate(description || config.defaultDescription || '', baseContext);
  }, [description, config.defaultDescription, baseContext]);

  const finalCanonical = useMemo(() => {
    if (canonical) return canonical;
    if (typeof window !== 'undefined') return window.location.href;
    return config.hostname;
  }, [canonical, config.hostname]);

  const parsedOpenGraph = useMemo(() => {
    return openGraph ? renderSeoTemplates(openGraph, baseContext) : openGraph;
  }, [openGraph, baseContext]);

  const ogImage = useMemo(() => {
    const image = parsedOpenGraph?.image || config.defaultOGImage;
    if (typeof image === 'string') return image;
    if (Array.isArray(image) && image.length > 0) return (image[0] as OpenGraphImage).url;
    return config.defaultOGImage;
  }, [parsedOpenGraph?.image, config.defaultOGImage]);

  useMemo(() => {
    if (isDevelopment) {
      const warnings: string[] = [];
      if (!title) warnings.push('Missing SEO title');
      if (!finalDescription) warnings.push('Missing SEO description');
      if (openGraph && !ogImage) warnings.push('OpenGraph specified but no image provided');
      if (warnings.length > 0) console.warn('[Reacteo] Page metadata warnings:', warnings);
    }
  }, [title, finalDescription, openGraph, ogImage, isDevelopment]);

  const jsonLdArray = useMemo(() => {
    if (!jsonLd) return undefined;
    return Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  }, [jsonLd]);

  const robotsMeta = useMemo(() => {
    const parts: string[] = [];
    if (noindex) parts.push('noindex');
    if (nofollow) parts.push('nofollow');
    return parts.length > 0 ? parts.join(',') : undefined;
  }, [noindex, nofollow]);

  return (
    <Helmet>
      <html lang={lang || config.lang || 'en'} />
      <title>{formattedTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {robotsMeta && <meta name="robots" content={robotsMeta} />}
      <link rel="canonical" href={finalCanonical} />

      <meta property="og:type" content={parsedOpenGraph?.type || 'website'} />
      <meta property="og:title" content={parsedOpenGraph?.title || formattedTitle} />
      <meta property="og:description" content={parsedOpenGraph?.description || finalDescription} />
      <meta property="og:url" content={parsedOpenGraph?.url || finalCanonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {typeof parsedOpenGraph?.image === 'object' && Array.isArray(parsedOpenGraph.image) &&
        parsedOpenGraph.image.map((img: OpenGraphImage, index: number) => (
          <React.Fragment key={`og-image-${index}`}>
            <meta property="og:image" content={img.url} />
            {img.width && <meta property="og:image:width" content={img.width.toString()} />}
            {img.height && <meta property="og:image:height" content={img.height.toString()} />}
            {img.alt && <meta property="og:image:alt" content={img.alt} />}
          </React.Fragment>
        ))}
      {parsedOpenGraph?.siteName && <meta property="og:site_name" content={parsedOpenGraph.siteName} />}
      {parsedOpenGraph?.locale && <meta property="og:locale" content={parsedOpenGraph.locale} />}

      {twitter && (
        <>
          <meta name="twitter:card" content={twitter.card || 'summary_large_image'} />
          {twitter.site && <meta name="twitter:site" content={renderTemplate(twitter.site, baseContext)} />}
          {twitter.creator && <meta name="twitter:creator" content={renderTemplate(twitter.creator, baseContext)} />}
          {twitter.title && <meta name="twitter:title" content={renderTemplate(twitter.title, baseContext)} />}
          {twitter.description && <meta name="twitter:description" content={renderTemplate(twitter.description, baseContext)} />}
          {twitter.image && <meta name="twitter:image" content={twitter.image} />}
        </>
      )}

      {jsonLdArray && jsonLdArray.map((schema, index) => (
        <script
          key={`json-ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  );
};
