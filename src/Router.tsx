import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SEOProvider } from './lib/seo';
import { SignIn, SignUp } from '@clerk/react';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { SignInPage } from './pages/SignInPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AppKillersPage } from './pages/AppKillersPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PublicProjectPage } from './pages/PublicProjectPage';
import { BlogIndexPage } from './pages/BlogIndexPage';
import { BlogPostPage } from './pages/BlogPostPage';
import TermsPage from './pages/legal/Terms';
import PrivacyPage from './pages/legal/Privacy';
import AcceptableUsePage from './pages/legal/AcceptableUse';
import ImprintPage from './pages/legal/Imprint';
import { AUTH_ENABLED, RequireAuth } from './auth';
import App from './App';

function ClerkAuthScreen({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  // After auth, drop the user into the app — not the marketing home page.
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0b1326' }}>
      {mode === 'sign-in'
        ? <SignIn routing="hash" signUpUrl="/sign-up" fallbackRedirectUrl="/app" forceRedirectUrl="/app" />
        : <SignUp routing="hash" signInUrl="/sign-in" fallbackRedirectUrl="/app" forceRedirectUrl="/app" />}
    </div>
  );
}

const SEO_CONFIG = {
  hostname: 'https://repohive.app',
  appName: 'RepoHive',
  lang: 'en',
  defaultDescription: 'Discover the best open-source tools for any project. AI-powered repo discovery, scoring, and comparison.',
  defaultOGImage: 'https://repohive.app/og-image.png',
  environment: (import.meta.env.DEV ? 'development' : 'production') as 'development' | 'production',
};

export function Router() {
  return (
    <SEOProvider config={SEO_CONFIG}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/app-killers" element={<AppKillersPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route
          path="/sign-in"
          element={AUTH_ENABLED ? <ClerkAuthScreen mode="sign-in" /> : <SignInPage mode="signin" />}
        />
        <Route
          path="/sign-up"
          element={AUTH_ENABLED ? <ClerkAuthScreen mode="sign-up" /> : <SignInPage mode="signup" />}
        />
        <Route path="/app" element={<RequireAuth><App /></RequireAuth>} />
        <Route path="/app/*" element={<RequireAuth><App /></RequireAuth>} />
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/legal/acceptable-use" element={<AcceptableUsePage />} />
        <Route path="/legal/imprint" element={<ImprintPage />} />
        <Route path="/p/:slug" element={<PublicProjectPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        {/* Legacy: anything else → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </SEOProvider>
  );
}
