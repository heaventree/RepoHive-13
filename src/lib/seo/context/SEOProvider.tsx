import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import type { SEOConfig, SEOProps } from '../types';

interface RemoteOverride {
  path: string;
  title?: string | null;
  description?: string | null;
  ogImage?: string | null;
  keywords?: string | null;
  noindex?: number;
}

interface SEOContextType {
  config: SEOConfig;
  isDevelopment: boolean;
  overrides: Record<string, RemoteOverride>;
  settings: Record<string, string>;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

interface SEOProviderProps {
  config: SEOConfig;
  children: ReactNode;
}

export const SEOProvider: React.FC<SEOProviderProps> = ({ config, children }) => {
  const isDevelopment = config.environment === 'development';
  const [overrides, setOverrides] = useState<Record<string, RemoteOverride>>({});
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Fetch admin-managed overrides + GA/GTM/SC ids once at mount. Best-effort —
  // the static SEO defaults from each page still render if this fails.
  useEffect(() => {
    fetch('/api/seo/settings').then(r => r.ok ? r.json() : null).then(d => {
      if (!d) return;
      const map: Record<string, RemoteOverride> = {};
      for (const o of (d.overrides || [])) map[o.path] = o;
      setOverrides(map);
      setSettings(d.settings || {});
    }).catch(() => {});
  }, []);

  const contextValue = useMemo<SEOContextType>(
    () => ({ config, isDevelopment, overrides, settings }),
    [config, isDevelopment, overrides, settings],
  );

  return (
    <HelmetProvider>
      <SEOContext.Provider value={contextValue}>
        <SiteWideTags settings={settings} />
        {children}
      </SEOContext.Provider>
    </HelmetProvider>
  );
};

// GA4, GTM, and Search Console verification — rendered once at app root.
// Only emits the tags when an ID is configured in the admin panel.
function SiteWideTags({ settings }: { settings: Record<string, string> }) {
  const ga4 = settings.GA4_ID;
  const gtm = settings.GTM_ID;
  const sc = settings.SEARCH_CONSOLE_VERIFICATION;

  return (
    <Helmet>
      {sc && <meta name="google-site-verification" content={sc} />}
      {ga4 && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} />
      )}
      {ga4 && (
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4}');
        `}</script>
      )}
      {gtm && (
        <script>{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');
        `}</script>
      )}
    </Helmet>
  );
}

export const useSEOContext = (): SEOContextType => {
  const context = useContext(SEOContext);
  if (!context) throw new Error('useSEOContext must be used within SEOProvider');
  return context;
};

export type { RemoteOverride };
export type { SEOProps };
