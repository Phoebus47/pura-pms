'use client';

import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/lib/stores/use-ui-store';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface ThemeToggleProps {
  readonly className?: string;
  /** Use on the dark sidebar so the control keeps contrast against pura-blue. */
  readonly appearance?: 'default' | 'onDark';
}

export function ThemeToggle({
  className,
  appearance = 'default',
}: ThemeToggleProps) {
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';
  const isOnDark = appearance === 'onDark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={t(isDark ? 'theme.switchToLight' : 'theme.switchToDark')}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isOnDark
          ? 'border border-white/40 text-white hover:border-white/70 hover:bg-white/15 focus-visible:ring-white/70 focus-visible:ring-offset-pura-blue'
          : 'border border-border bg-surface-desk text-ink-default hover:bg-muted focus-visible:ring-ring focus-visible:ring-offset-background',
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
      <span>{t(isDark ? 'theme.light' : 'theme.dark')}</span>
    </button>
  );
}
