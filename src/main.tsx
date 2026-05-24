import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { Router } from './Router';
import { AUTH_ENABLED, CLERK_PUBLISHABLE_KEY } from './auth';
import './index.css';

if (!AUTH_ENABLED) {
  console.warn('[auth] VITE_CLERK_PUBLISHABLE_KEY not set — running with authentication disabled.');
}

const app = <Router />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {AUTH_ENABLED ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} afterSignOutUrl="/" signInUrl="/sign-in" signUpUrl="/sign-up">
        {app}
      </ClerkProvider>
    ) : (
      app
    )}
  </StrictMode>,
);
