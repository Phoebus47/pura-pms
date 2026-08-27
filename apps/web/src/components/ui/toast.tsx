'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'var(--surface-desk)',
          border: '1px solid var(--rule-mist)',
          color: 'var(--ink-default)',
        },
      }}
    />
  );
}
