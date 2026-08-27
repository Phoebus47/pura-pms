'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/stores/use-ui-store';

/**
 * Keeps the `.dark` class on <html> in sync with the persisted theme.
 * The initial class is set by the boot script in the locale layout so the
 * first paint already matches; this only handles later changes and rehydration.
 */
export function ThemeProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}
