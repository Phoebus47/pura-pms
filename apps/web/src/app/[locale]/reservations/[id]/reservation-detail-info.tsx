'use client';

import { Calendar } from 'lucide-react';
import { type Reservation } from '@/lib/api';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { DayUseBadge } from '@/components/day-use-badge';
import { SplitStayTable } from '@/components/split-stay-table';
import { Panel } from '@/components/shared/panel';
import { isNonRevenueStay } from '@/lib/stay-purpose';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ReservationField, ReservationNote } from './reservation-field';

interface ReservationDetailInfoProps {
  readonly reservation: Reservation;
  readonly formatDate: (value: string) => string;
}

function NonRevenueSection({
  reservation,
}: {
  readonly reservation: Reservation;
}) {
  return (
    <div className="border-rule-mist border-t mt-6 pt-6">
      <div className="gap-6 grid md:grid-cols-2">
        <ReservationField label={t('reservations.stayPurpose.approvedBy')}>
          {reservation.approvedBy}
        </ReservationField>
        {reservation.stayPurposeNote ? (
          <ReservationField label={t('reservations.stayPurpose.purpose')}>
            {reservation.stayPurposeNote}
          </ReservationField>
        ) : null}
        {reservation.stayPurpose === 'HOUSE_USE' ? (
          <ReservationField label={t('reservations.stayPurpose.department')}>
            {reservation.department}
          </ReservationField>
        ) : null}
      </div>
    </div>
  );
}

function TaxExemptSection({
  reservation,
}: {
  readonly reservation: Reservation;
}) {
  return (
    <div className="border-rule-mist border-t mt-6 pt-6">
      <div className="gap-6 grid md:grid-cols-2">
        <ReservationField label={t('reservations.taxExempt.reason')}>
          {reservation.taxExemptReason}
        </ReservationField>
        <ReservationField label={t('reservations.taxExempt.documentRef')}>
          {reservation.taxExemptDocumentRef}
        </ReservationField>
        <ReservationField label={t('reservations.taxExempt.approvedBy')}>
          {reservation.taxExemptApprovedBy}
        </ReservationField>
      </div>
    </div>
  );
}

export function ReservationDetailInfo({
  reservation,
  formatDate,
}: ReservationDetailInfoProps) {
  return (
    <Panel
      title={t('reservations.detail.reservationDetails')}
      padding="lg"
      className="lg:col-span-2"
    >
      <div className="gap-6 grid grid-cols-2">
        <ReservationField label={t('reservations.detail.confirmationNumber')}>
          <span className="font-mono text-pura-blue">
            {reservation.confirmNumber}
          </span>
        </ReservationField>

        <ReservationField label={t('common.status')}>
          <ReservationStatusBadge status={reservation.status} />
        </ReservationField>

        <ReservationField label={t('reservations.detail.guest')}>
          {reservation.guest?.firstName} {reservation.guest?.lastName}
          <span className="block font-normal text-ink-subtle text-sm">
            {reservation.guest?.email}
          </span>
        </ReservationField>

        <ReservationField label={t('reservations.detail.room')}>
          {t('common.roomLabel')} {reservation.room?.number}
          <span className="block font-normal text-ink-subtle text-sm">
            {reservation.room?.roomType.name}
          </span>
        </ReservationField>

        <ReservationField label={t('reservations.detail.checkInDate')}>
          <Calendar className="h-4 inline mr-1 w-4" aria-hidden="true" />
          {formatDate(reservation.checkIn)}
        </ReservationField>

        <ReservationField label={t('reservations.detail.checkOutDate')}>
          <Calendar className="h-4 inline mr-1 w-4" aria-hidden="true" />
          {formatDate(reservation.checkOut)}
        </ReservationField>

        <ReservationField label={t('reservations.detail.numberOfNights')}>
          {reservation.isDayUse ? (
            <DayUseBadge />
          ) : (
            <>
              {reservation.nights}{' '}
              {reservation.nights === 1
                ? t('common.night')
                : t('common.nightsCount')}
            </>
          )}
        </ReservationField>

        <ReservationField label={t('reservations.detail.numberOfGuests')}>
          {reservation.numberOfGuests}{' '}
          {reservation.numberOfGuests === 1
            ? t('common.guestSingular')
            : t('common.guestsCount')}
        </ReservationField>
      </div>

      {isNonRevenueStay(reservation.stayPurpose) ? (
        <NonRevenueSection reservation={reservation} />
      ) : null}

      {reservation.taxExempt ? (
        <TaxExemptSection reservation={reservation} />
      ) : null}

      {reservation.isRoomLocked ? (
        <ReservationNote label={t('reservations.roomLock.note')}>
          {reservation.roomLockNote}
        </ReservationNote>
      ) : null}

      {reservation.stays ? (
        <div className="border-rule-mist border-t mt-6 pt-6">
          <SplitStayTable stays={reservation.stays} />
        </div>
      ) : null}

      {reservation.specialRequests && (
        <ReservationNote label={t('reservations.detail.specialRequests')}>
          {reservation.specialRequests}
        </ReservationNote>
      )}

      {reservation.cancellationReason && (
        <div
          className={cn(
            'border mt-6 p-4 rounded-lg',
            statusToneSurface.critical,
          )}
        >
          <p className={cn('font-semibold text-sm', statusToneInk.critical)}>
            {t('reservations.detail.cancellationReason')}
          </p>
          <p className={cn('mt-2 whitespace-pre-wrap', statusToneInk.critical)}>
            {reservation.cancellationReason}
          </p>
        </div>
      )}
    </Panel>
  );
}
