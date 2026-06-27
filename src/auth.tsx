import React from 'react';
import { Show, RedirectToSignIn } from '@clerk/react';

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
export const AUTH_ENABLED = /^pk_(test|live)_/.test(CLERK_PUBLISHABLE_KEY || '');

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
