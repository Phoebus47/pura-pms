'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { PageHeader } from './page-header';

export interface DetailPageHeaderProps {
  readonly title: string;
  readonly subtitle?: string | ReactNode;
  readonly actions?: ReactNode;
  readonly onBack?: () => void;
}

export function DetailPageHeader({
  title,
  subtitle,
  actions,
  onBack,
}: DetailPageHeaderProps) {
  const router = useRouter();
  const t = useTranslations('common');

  const handleBack = onBack ?? (() => router.back());
  const hasTextSubtitle = typeof subtitle === 'string';

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('back')}
      </Button>
      <PageHeader
        title={title}
        subtitle={hasTextSubtitle ? subtitle : undefined}
        actions={actions}
      />
      {subtitle && !hasTextSubtitle && (
        <div className="text-ink-subtle text-sm">{subtitle}</div>
      )}
    </div>
  );
}
