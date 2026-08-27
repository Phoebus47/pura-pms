'use client';

import { ArrowRight } from 'lucide-react';
import { type Guest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/shared/panel';
import { t } from '@/lib/i18n';
import { StepNav } from './step-nav';

interface StepGuestSelectProps {
  readonly selectedGuest: Guest | null;
  readonly onClearGuest: () => void;
  readonly onOpenSearch: () => void;
  readonly onOpenCreate: () => void;
  readonly onBack: () => void;
  readonly onNext: () => void;
}

export function StepGuestSelect({
  selectedGuest,
  onClearGuest,
  onOpenSearch,
  onOpenCreate,
  onBack,
  onNext,
}: StepGuestSelectProps) {
  return (
    <Panel padding="lg" title={t('reservations.new.step3Title')}>
      <div className="space-y-6">
        {selectedGuest ? (
          <div className="bg-pura-blue/5 border-2 border-pura-blue p-4 rounded-xl">
            <div className="flex gap-4 items-center justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold text-ink-strong text-lg">
                  {selectedGuest.firstName} {selectedGuest.lastName}
                </h3>
                <p className="text-ink-subtle text-sm truncate">
                  {selectedGuest.email}
                </p>
                <p className="text-ink-subtle text-sm">{selectedGuest.phone}</p>
              </div>
              <Button onClick={onClearGuest} variant="outline" size="sm">
                {t('common.change')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button onClick={onOpenSearch} className="flex-1">
              {t('reservations.new.searchExistingGuest')}
            </Button>
            <Button onClick={onOpenCreate} variant="outline" className="flex-1">
              {t('reservations.new.createNewGuest')}
            </Button>
          </div>
        )}

        <StepNav
          nextLabel={t('common.next')}
          nextIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          onBack={onBack}
          onNext={onNext}
        />
      </div>
    </Panel>
  );
}
