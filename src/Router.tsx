import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { SignInPage } from './pages/SignInPage';
import App from './App';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/sign-in" element={<SignInPage mode="signin" />} />
        <Route path="/sign-up" element={<SignInPage mode="signup" />} />
        <Route path="/app" element={<App />} />
        <Route path="/app/*" element={<App />} />
        {/* Legacy: anything else → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
