import React from 'react';
import { Show, RedirectToSignIn } from '@clerk/react';

// Clerk auto-reads VITE_CLERK_PUBLISHABLE_KEY; we only use this flag to decide
// whether auth is configured. When it's absent (e.g. a build with no env set),
// the app still renders so it never white-screens — auth is simply disabled.
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
export const AUTH_ENABLED = Boolean(CLERK_PUBLISHABLE_KEY);

// Gates a route: signed-in users see it, signed-out users are redirected to
// sign-in. When auth is disabled the children render unguarded.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!AUTH_ENABLED) return <>{children}</>;
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
    </>
  );
}
