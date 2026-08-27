'use client';

import { CheckCircle, Edit, Trash2, XCircle } from 'lucide-react';
import { type Reservation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ReservationNoShowButton } from '@/components/reservation-no-show-button';
import { t } from '@/lib/i18n';

interface ReservationDetailActionsProps {
  readonly reservation: Reservation;
  readonly onCheckIn: () => void;
  readonly onCheckOut: () => void;
  readonly onCancel: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly onReload: () => void;
}

export function ReservationDetailActions({
  reservation,
  onCheckIn,
  onCheckOut,
  onCancel,
  onEdit,
  onDelete,
  onReload,
}: ReservationDetailActionsProps) {
  const canCheckIn = reservation.status === 'CONFIRMED';
  const canCheckOut = reservation.status === 'CHECKED_IN';
  const canCancel = ['CONFIRMED', 'CHECKED_IN'].includes(reservation.status);

  return (
    <>
      {canCheckIn && (
        <Button
          onClick={onCheckIn}
          className="bg-status-positive-ink hover:bg-status-positive-ink/90 text-ink-onbrand"
        >
          <CheckCircle className="h-4 w-4" />
          {t('reservations.detail.checkIn')}
        </Button>
      )}
      <ReservationNoShowButton reservation={reservation} onMarked={onReload} />
      {canCheckOut && (
        <Button onClick={onCheckOut}>
          <CheckCircle className="h-4 w-4" />
          {t('reservations.detail.checkOut')}
        </Button>
      )}
      {canCancel && (
        <Button
          variant="outline"
          onClick={onCancel}
          className="hover:bg-status-caution-tint text-status-caution-ink"
        >
          <XCircle className="h-4 w-4" />
          {t('reservations.detail.cancel')}
        </Button>
      )}
      <Button variant="outline" onClick={onEdit}>
        <Edit className="h-4 w-4" />
        {t('reservations.detail.edit')}
      </Button>
      <Button
        variant="outline"
        onClick={onDelete}
        className="hover:bg-status-critical-tint text-status-critical-ink"
      >
        <Trash2 className="h-4 w-4" />
        {t('reservations.detail.delete')}
      </Button>
    </>
  );
}
