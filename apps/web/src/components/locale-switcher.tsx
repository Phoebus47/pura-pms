'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function LocaleSwitcher({ className }: { readonly className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('locale');

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
      <p className="font-medium text-slate-600 text-xs">{t('label')}</p>
      <div className="flex gap-2">
        {routing.locales.map((option) => (
          <Button
            key={option}
            type="button"
            variant={locale === option ? 'default' : 'outline'}
            size="sm"
            aria-pressed={locale === option}
            onClick={() => handleLocaleChange(option)}
            className="min-h-11"
          >
            {t(option)}
          </Button>
        ))}
      </div>
    </div>
  );
}
