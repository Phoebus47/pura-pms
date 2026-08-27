'use client';

import type { ComponentProps } from 'react';
import { Check } from 'lucide-react';
import { StayPurposeFields } from '@/components/stay-purpose-fields';
import { TaxExemptFields } from '@/components/tax-exempt-fields';
import { RoomLockFields } from '@/components/room-lock-fields';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Panel } from '@/components/shared/panel';
import { t } from '@/lib/i18n';
import { BookingSummary } from './booking-summary';
import { BookingTotal } from './booking-total';
import { FIELD_LABEL_CLASS } from './field-styles';
import { StepNav } from './step-nav';

interface StepConfirmProps {
  readonly summary: ComponentProps<typeof BookingSummary>;
  readonly total: ComponentProps<typeof BookingTotal>;
  readonly stayPurposeFields: ComponentProps<typeof StayPurposeFields>;
  readonly taxExemptFields: ComponentProps<typeof TaxExemptFields>;
  readonly roomLockFields: ComponentProps<typeof RoomLockFields>;
  readonly numberOfGuests: number;
  readonly onNumberOfGuestsChange: (value: number) => void;
  readonly maxOccupancy: number;
  readonly specialRequests: string;
  readonly onSpecialRequestsChange: (value: string) => void;
  readonly submitting: boolean;
  readonly onBack: () => void;
  readonly onSubmit: () => void;
}

export function StepConfirm({
  summary,
  total,
  stayPurposeFields,
  taxExemptFields,
  roomLockFields,
  numberOfGuests,
  onNumberOfGuestsChange,
  maxOccupancy,
  specialRequests,
  onSpecialRequestsChange,
  submitting,
  onBack,
  onSubmit,
}: StepConfirmProps) {
  return (
    <Panel padding="lg" title={t('reservations.new.step4Title')}>
      <div className="space-y-6">
        <div className="space-y-4">
          <BookingSummary {...summary} />

          <StayPurposeFields {...stayPurposeFields} showAuthority />
          <TaxExemptFields {...taxExemptFields} showDetails />
          <RoomLockFields {...roomLockFields} showNote />

          <div>
            <label htmlFor="number-of-guests" className={FIELD_LABEL_CLASS}>
              {t('reservations.new.numberOfGuests')}
            </label>
            <Input
              id="number-of-guests"
              name="numberOfGuests"
              type="number"
              value={numberOfGuests}
              onChange={(event) =>
                onNumberOfGuestsChange(
                  Number.parseInt(event.target.value, 10) || 1,
                )
              }
              min="1"
              max={maxOccupancy}
            />
          </div>

          <div>
            <label htmlFor="special-requests" className={FIELD_LABEL_CLASS}>
              {t('reservations.new.specialRequests')}
            </label>
            <Textarea
              id="special-requests"
              name="specialRequests"
              value={specialRequests}
              onChange={(event) => onSpecialRequestsChange(event.target.value)}
              rows={3}
              placeholder={t('reservations.new.specialRequestsPlaceholder')}
              className="resize-none"
            />
          </div>

          <BookingTotal {...total} />
        </div>

        <StepNav
          nextLabel={
            submitting
              ? t('common.creating')
              : t('reservations.new.confirmReservation')
          }
          nextIcon={<Check className="h-4 w-4" aria-hidden="true" />}
          onBack={onBack}
          onNext={onSubmit}
          disabled={submitting}
        />
      </div>
    </Panel>
  );
}
