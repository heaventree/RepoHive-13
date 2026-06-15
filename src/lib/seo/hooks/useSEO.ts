import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import type { SEOProps } from '../types';
import { useSEOContext } from '../context/SEOProvider';

export const useSEO = (props: SEOProps): SEOProps => {
  const { config } = useSEOContext();

  return useMemo<SEOProps>(() => ({
    ...props,
    title: props.title,
    description: props.description || config.defaultDescription,
    canonical: props.canonical,
    openGraph: props.openGraph
      ? { ...props.openGraph, image: props.openGraph.image || config.defaultOGImage }
      : undefined,
    twitter: props.twitter,
    jsonLd: props.jsonLd,
    noindex: props.noindex ?? false,
    nofollow: props.nofollow ?? false,
  }), [props, config.defaultDescription, config.defaultOGImage]);
};

export { Helmet };
