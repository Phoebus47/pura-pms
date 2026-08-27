'use client';

import type { ComponentProps } from 'react';
import { ArrowRight } from 'lucide-react';
import { DateRangePicker } from '@/components/date-range-picker';
import { PropertySelector } from '@/components/property-selector';
import { StayPurposeFields } from '@/components/stay-purpose-fields';
import { TaxExemptFields } from '@/components/tax-exempt-fields';
import { RoomLockFields } from '@/components/room-lock-fields';
import { SplitStayOptions } from '@/components/split-stay-options';
import { Panel } from '@/components/shared/panel';
import { type BillingCycle } from '@/lib/billing-cycle';
import { t } from '@/lib/i18n';
import { CHECKBOX_CLASS, FIELD_CLASS, FIELD_LABEL_CLASS } from './field-styles';
import { StepNav } from './step-nav';

interface StepDatesPropertyProps {
  readonly propertyId: string;
  readonly onPropertyIdChange: (value: string) => void;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly onCheckInChange: (value: string) => void;
  readonly onCheckOutChange: (value: string) => void;
  readonly isDayUse: boolean;
  readonly onDayUseChange: (checked: boolean) => void;
  readonly billingCycle: BillingCycle;
  readonly onBillingCycleChange: (value: BillingCycle) => void;
  readonly stayPurposeFields: ComponentProps<typeof StayPurposeFields>;
  readonly taxExemptFields: ComponentProps<typeof TaxExemptFields>;
  readonly roomLockFields: ComponentProps<typeof RoomLockFields>;
  readonly splitStayOptions: ComponentProps<typeof SplitStayOptions>;
  readonly loadingRooms: boolean;
  readonly onNext: () => void;
}

export function StepDatesProperty({
  propertyId,
  onPropertyIdChange,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  isDayUse,
  onDayUseChange,
  billingCycle,
  onBillingCycleChange,
  stayPurposeFields,
  taxExemptFields,
  roomLockFields,
  splitStayOptions,
  loadingRooms,
  onNext,
}: StepDatesPropertyProps) {
  return (
    <Panel padding="lg" title={t('reservations.new.step1Title')}>
      <div className="space-y-6">
        <div>
          <label htmlFor="property-select" className={FIELD_LABEL_CLASS}>
            {t('reservations.new.propertyRequired')}
          </label>
          <PropertySelector
            id="property-select"
            value={propertyId}
            onChange={onPropertyIdChange}
            required
          />
        </div>

        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onCheckInChange={onCheckInChange}
          onCheckOutChange={onCheckOutChange}
          sameDayStay={isDayUse}
        />

        <label className="cursor-pointer flex gap-3 items-start min-h-11">
          <input
            id="day-use"
            name="isDayUse"
            type="checkbox"
            checked={isDayUse}
            onChange={(event) => onDayUseChange(event.target.checked)}
            className={CHECKBOX_CLASS}
          />
          <span>
            <span className="block font-semibold text-ink-strong text-sm">
              {t('reservations.new.dayUseLabel')}
            </span>
            <span className="block mt-1 text-ink-subtle text-xs">
              {t('reservations.new.dayUseHint')}
            </span>
          </span>
        </label>

        <StayPurposeFields {...stayPurposeFields} />

        <div>
          <label htmlFor="billing-cycle" className={FIELD_LABEL_CLASS}>
            {t('reservations.billingCycle.label')}
          </label>
          <select
            id="billing-cycle"
            name="billingCycle"
            value={billingCycle}
            onChange={(event) =>
              onBillingCycleChange(event.target.value as BillingCycle)
            }
            disabled={isDayUse || splitStayOptions.enabled}
            className={FIELD_CLASS}
          >
            <option value="NIGHTLY">
              {t('reservations.billingCycle.nightly')}
            </option>
            <option value="WEEKLY">
              {t('reservations.billingCycle.weekly')}
            </option>
            <option value="MONTHLY">
              {t('reservations.billingCycle.monthly')}
            </option>
          </select>
          <p className="mt-1 text-ink-subtle text-xs">
            {t('reservations.billingCycle.hint')}
          </p>
        </div>

        <TaxExemptFields {...taxExemptFields} />

        <RoomLockFields {...roomLockFields} />

        <SplitStayOptions {...splitStayOptions} />

        <StepNav
          nextLabel={
            loadingRooms ? t('common.loadingEllipsis') : t('common.next')
          }
          nextIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          onNext={onNext}
        />
      </div>
    </Panel>
  );
}
