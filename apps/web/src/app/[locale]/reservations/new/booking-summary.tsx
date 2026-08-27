'use client';

import type { ReactNode } from 'react';
import { type Guest, type Room } from '@/lib/api';
import { DayUseBadge } from '@/components/day-use-badge';
import { SplitStayBadge } from '@/components/split-stay-badge';
import { StayPurposeBadge } from '@/components/stay-purpose-badge';
import { TaxExemptBadge } from '@/components/tax-exempt-badge';
import { RoomLockBadge } from '@/components/room-lock-badge';
import { isNonRevenueStay, type StayPurpose } from '@/lib/stay-purpose';
import { getDateLocale, t } from '@/lib/i18n';

interface BookingSummaryProps {
  readonly checkIn: string;
  readonly checkOut: string;
  readonly nights: number;
  readonly isDayUse: boolean;
  readonly isSplitStay: boolean;
  readonly selectedRoom: Room | null;
  readonly selectedGuest: Guest | null;
  readonly stayPurpose: StayPurpose;
  readonly taxExempt: boolean;
  readonly isRoomLocked: boolean;
}

function SummaryRow({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex gap-4 items-center justify-between">
      <span className="text-ink-subtle">{label}</span>
      <span className="font-semibold text-ink-strong text-right">
        {children}
      </span>
    </div>
  );
}

export function BookingSummary({
  checkIn,
  checkOut,
  nights,
  isDayUse,
  isSplitStay,
  selectedRoom,
  selectedGuest,
  stayPurpose,
  taxExempt,
  isRoomLocked,
}: BookingSummaryProps) {
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(getDateLocale());

  return (
    <div className="bg-surface-inset p-4 rounded-xl">
      <h3 className="font-semibold mb-2 text-ink-strong">
        {t('reservations.new.bookingDetails')}
      </h3>
      <div className="space-y-2 text-sm">
        <SummaryRow label={t('reservations.new.checkInLabel')}>
          {formatDate(checkIn)}
        </SummaryRow>
        <SummaryRow label={t('reservations.new.checkOutLabel')}>
          {formatDate(checkOut)}
        </SummaryRow>
        <SummaryRow label={t('reservations.new.nightsLabel')}>
          {isDayUse ? <DayUseBadge /> : nights}
        </SummaryRow>
        <SummaryRow label={t('reservations.new.roomLabel')}>
          {t('common.roomLabel')} {selectedRoom?.number} -{' '}
          {selectedRoom?.roomType?.name}
          {isSplitStay ? <SplitStayBadge className="ml-2" /> : null}
        </SummaryRow>
        <SummaryRow label={t('reservations.new.guestLabel')}>
          {selectedGuest?.firstName} {selectedGuest?.lastName}
        </SummaryRow>
        <SummaryRow label={`${t('reservations.stayPurpose.label')}:`}>
          {isNonRevenueStay(stayPurpose) ? (
            <StayPurposeBadge stayPurpose={stayPurpose} />
          ) : (
            t('reservations.stayPurpose.standard')
          )}
        </SummaryRow>
        {taxExempt ? (
          <SummaryRow label={`${t('reservations.taxExempt.label')}:`}>
            <TaxExemptBadge taxExempt />
          </SummaryRow>
        ) : null}
        {isRoomLocked ? (
          <SummaryRow label={`${t('reservations.roomLock.label')}:`}>
            <RoomLockBadge isRoomLocked />
          </SummaryRow>
        ) : null}
      </div>
    </div>
  );
}
