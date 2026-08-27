'use client';

import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface StepNavProps {
  readonly nextLabel: string;
  readonly nextIcon: ReactNode;
  readonly onNext: () => void;
  readonly onBack?: () => void;
  readonly disabled?: boolean;
}

export function StepNav({
  nextLabel,
  nextIcon,
  onNext,
  onBack,
  disabled = false,
}: StepNavProps) {
  return (
    <div
      className={cn('flex pt-4', onBack ? 'justify-between' : 'justify-end')}
    >
      {onBack && (
        <Button onClick={onBack} variant="outline" disabled={disabled}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('common.back')}
        </Button>
      )}
      <Button onClick={onNext} disabled={disabled}>
        {nextLabel}
        {nextIcon}
      </Button>
    </div>
  );
}
