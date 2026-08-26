'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LocaleSwitcherProps {
  readonly className?: string;
  /** Use on dark surfaces (e.g. sidebar) so hover/active keep readable contrast. */
  readonly appearance?: 'default' | 'onDark';
}

export function LocaleSwitcher({
  className,
  appearance = 'default',
}: LocaleSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('locale');
  const isOnDark = appearance === 'onDark';

  function handleLocaleChange(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      role="group"
      aria-label={t('label')}
    >
      <p
        className={cn(
          'font-medium text-xs',
          isOnDark ? 'text-white/70' : 'text-slate-600',
        )}
      >
        {t('label')}
      </p>
      <div className="flex gap-2">
        {routing.locales.map((option) => {
          const isActive = locale === option;

          if (isOnDark) {
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleLocaleChange(option)}
                className={cn(
                  'inline-flex min-h-11 items-center justify-center rounded-md px-4 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-pura-blue',
                  isActive
                    ? 'bg-white text-pura-blue hover:bg-white/90'
                    : 'border border-white/40 bg-transparent text-white hover:border-white/70 hover:bg-white/15 hover:text-white',
                )}
              >
                {t(option)}
              </button>
            );
          }

          return (
            <Button
              key={option}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              aria-pressed={isActive}
              onClick={() => handleLocaleChange(option)}
              className="min-h-11"
            >
              {t(option)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
