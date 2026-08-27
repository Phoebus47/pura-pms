'use client';

import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
  readonly backHref?: string;
  readonly eyebrow?: string;
  readonly className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  backHref,
  eyebrow,
  className,
}: PageHeaderProps) {
  const t = useTranslations('common');

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring font-semibold gap-1 hover:underline inline-flex items-center mb-2 min-h-11 rounded-md text-pura-blue text-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('back')}
          </Link>
        )}
        {eyebrow && (
          <p className="font-semibold text-2xs text-ink-subtle tracking-wide uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-bold sm:text-3xl text-2xl text-pura-blue">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-ink-subtle text-sm">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap gap-3 items-center sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
