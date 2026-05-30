import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/react';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { SignInPage } from './pages/SignInPage';
import { AUTH_ENABLED, RequireAuth } from './auth';
import App from './App';

function ClerkAuthScreen({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0b1326' }}>
      {mode === 'sign-in'
        ? <SignIn routing="hash" signUpUrl="/sign-up" />
        : <SignUp routing="hash" signInUrl="/sign-in" />}
    </div>
  );
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
