'use client';

import { formatMessage, t } from '@/lib/i18n';

interface BookingTotalProps {
  readonly totalAmount: number;
  readonly baseRate: number;
  readonly isDayUse: boolean;
  readonly nights: number;
  /** Present only for a split stay, describing the second segment. */
  readonly secondSegment?: { readonly rate: number; readonly nights: number };
}

export function BookingTotal({
  totalAmount,
  baseRate,
  isDayUse,
  nights,
  secondSegment,
}: BookingTotalProps) {
  return (
    <div className="bg-pura-blue/5 border-2 border-pura-blue p-4 rounded-xl">
      <div className="flex gap-4 items-center justify-between">
        <span className="font-semibold text-ink-strong text-lg">
          {t('reservations.new.totalAmount')}
        </span>
        <span className="font-bold tabular-nums text-2xl text-pura-blue">
          ฿{totalAmount.toLocaleString()}
        </span>
      </div>
      <p className="mt-1 text-ink-subtle text-xs">
        ฿{baseRate.toLocaleString()} ×{' '}
        {isDayUse
          ? t('common.oneDayUse')
          : formatMessage('reservations.list.nightsLabel', { count: nights })}
        {secondSegment
          ? ` ${formatMessage('reservations.new.splitNightAddon', {
              rate: secondSegment.rate.toLocaleString(),
              count: secondSegment.nights,
            })}`
          : ''}
      </p>
    </div>
  );
}
