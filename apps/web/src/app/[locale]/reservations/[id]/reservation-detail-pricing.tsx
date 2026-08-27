'use client';

import { type Reservation } from '@/lib/api';
import { DayUseBadge } from '@/components/day-use-badge';
import { Panel } from '@/components/shared/panel';
import { getDateLocale, t } from '@/lib/i18n';

interface ReservationDetailPricingProps {
  readonly reservation: Reservation;
}

export function ReservationDetailPricing({
  reservation,
}: ReservationDetailPricingProps) {
  const formatTimestamp = (value: string) =>
    new Date(value).toLocaleString(getDateLocale());

  return (
    <Panel title={t('reservations.detail.pricing')} padding="lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-ink-subtle text-sm">
            {t('reservations.detail.roomRate')}
          </span>
          <span className="font-semibold tabular-nums text-ink-strong">
            ฿{Number(reservation.room?.roomType.baseRate || 0).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-ink-subtle text-sm">
            {reservation.isDayUse
              ? t('reservations.detail.stayType')
              : t('common.nights')}
          </span>
          <span className="font-semibold tabular-nums text-ink-strong">
            {reservation.isDayUse ? <DayUseBadge /> : `× ${reservation.nights}`}
          </span>
        </div>

        <div className="border-rule-mist border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink-strong text-lg">
              {t('reservations.detail.totalAmount')}
            </span>
            <span className="font-bold tabular-nums text-2xl text-pura-blue">
              ฿{Number(reservation.totalAmount).toLocaleString()}
            </span>
          </div>
        </div>

        {reservation.actualCheckIn && (
          <div className="border-rule-mist border-t pt-4">
            <p className="font-semibold text-ink-subtle text-sm">
              {t('reservations.detail.actualCheckIn')}
            </p>
            <p className="mt-1 text-ink-default">
              {formatTimestamp(reservation.actualCheckIn)}
            </p>
          </div>
        )}

        {reservation.actualCheckOut && (
          <div className="border-rule-mist border-t pt-4">
            <p className="font-semibold text-ink-subtle text-sm">
              {t('reservations.detail.actualCheckOut')}
            </p>
            <p className="mt-1 text-ink-default">
              {formatTimestamp(reservation.actualCheckOut)}
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}
