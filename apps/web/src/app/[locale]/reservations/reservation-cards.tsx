'use client';

import { type Reservation } from '@/lib/api';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { DayUseBadge } from '@/components/day-use-badge';
import { StayPurposeBadge } from '@/components/stay-purpose-badge';
import { BillingCycleBadge } from '@/components/billing-cycle-badge';
import { TaxExemptBadge } from '@/components/tax-exempt-badge';
import { RoomLockBadge } from '@/components/room-lock-badge';
import { SplitStayBadge } from '@/components/split-stay-badge';
import { isSplitStay } from '@/lib/split-stay';
import { formatMessage, t } from '@/lib/i18n';
import { formatStayDate } from './format-stay-date';

interface ReservationCardsProps {
  readonly reservations: Reservation[];
  readonly onSelect: (reservation: Reservation) => void;
}

const MICRO_LABEL =
  'text-2xs text-ink-subtle tracking-wide uppercase whitespace-nowrap';

function StayDate({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex-1">
      <div className={MICRO_LABEL}>{label}</div>
      <div className="font-medium mt-0.5 text-ink-default text-xs">{value}</div>
    </div>
  );
}

export function ReservationCards({
  reservations,
  onSelect,
}: ReservationCardsProps) {
  return (
    <div className="md:hidden space-y-3">
      {reservations.map((reservation) => (
        <button
          key={reservation.id}
          type="button"
          onClick={() => onSelect(reservation)}
          className="bg-surface-desk border border-rule-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring hover:bg-surface-sunken p-4 rounded-xl shadow-panel text-left transition-colors w-full"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="font-mono font-semibold text-pura-blue text-sm">
                  {reservation.confirmNumber}
                </span>
                <ReservationStatusBadge status={reservation.status} size="xs" />
                {reservation.isDayUse ? <DayUseBadge size="xs" /> : null}
                <StayPurposeBadge
                  stayPurpose={reservation.stayPurpose}
                  size="xs"
                />
                <BillingCycleBadge
                  billingCycle={reservation.billingCycle}
                  size="xs"
                />
                <TaxExemptBadge taxExempt={reservation.taxExempt} size="xs" />
                <RoomLockBadge
                  isRoomLocked={reservation.isRoomLocked}
                  size="xs"
                />
                {isSplitStay(reservation) ? <SplitStayBadge size="xs" /> : null}
              </div>
              <div className="mt-2">
                <div className="font-semibold text-ink-strong text-sm">
                  {reservation.guest?.firstName} {reservation.guest?.lastName}
                </div>
                <div className="text-ink-subtle text-xs truncate">
                  {reservation.guest?.email}
                </div>
              </div>
              <div className="mt-2 text-ink-subtle text-xs">
                {t('reservations.list.roomPrefix')} {reservation.room?.number} •{' '}
                {reservation.room?.roomType.name}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-semibold tabular-nums text-pura-blue text-sm">
                ฿{Number(reservation.totalAmount).toLocaleString()}
              </div>
              <div className="mt-1 text-ink-subtle text-xs">
                {reservation.isDayUse
                  ? t('common.dayUse')
                  : formatMessage('reservations.list.nightsLabel', {
                      count: reservation.nights,
                    })}
              </div>
            </div>
          </div>
          <div className="border-rule-mist border-t flex gap-4 items-center mt-3 pt-3">
            <StayDate
              label={t('reservations.list.table.checkIn')}
              value={formatStayDate(reservation.checkIn)}
            />
            <StayDate
              label={t('reservations.list.table.checkOut')}
              value={formatStayDate(reservation.checkOut)}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
