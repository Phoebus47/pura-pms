'use client';

import { SerwistProvider } from '@serwist/turbopack/react';

export function PwaProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== 'production') {
    return children;
  }

  return <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>;
}
