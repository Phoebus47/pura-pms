'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
  const handleBack = onBack ?? (() => router.back());
  const hasTextSubtitle = typeof subtitle === 'string';

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        subtitle={hasTextSubtitle ? subtitle : undefined}
        actions={actions}
        onBack={handleBack}
      />
      {subtitle && !hasTextSubtitle && (
        <div className="text-ink-subtle text-sm">{subtitle}</div>
      )}
    </div>
  );
}
