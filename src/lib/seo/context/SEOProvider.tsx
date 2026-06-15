import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import type { SEOConfig } from '../types';

interface SEOContextType {
  config: SEOConfig;
  isDevelopment: boolean;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

interface SEOProviderProps {
  config: SEOConfig;
  children: ReactNode;
}

export const SEOProvider: React.FC<SEOProviderProps> = ({ config, children }) => {
  const isDevelopment = config.environment === 'development';

  useMemo(() => {
    if (isDevelopment) {
      const warnings: string[] = [];
      if (!config.hostname) warnings.push('SEOConfig: hostname is required');
      if (!config.appName) warnings.push('SEOConfig: appName is required');
      if (warnings.length > 0) console.warn('[Reacteo] Configuration warnings:', warnings);
    }
  }, [config, isDevelopment]);

  const contextValue = useMemo<SEOContextType>(
    () => ({ config, isDevelopment }),
    [config, isDevelopment]
  );

  return (
    <HelmetProvider>
      <SEOContext.Provider value={contextValue}>
        {children}
      </SEOContext.Provider>
    </HelmetProvider>
  );
};

export const useSEOContext = (): SEOContextType => {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEOContext must be used within SEOProvider');
  }
  return context;
};
