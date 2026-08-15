'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';

interface ReservationNoShowButtonProps {
  readonly reservation: Reservation;
  readonly onMarked: () => void;
}

export function canMarkNoShow(
  reservation: Pick<Reservation, 'status' | 'checkIn'>,
  asOf = new Date(),
): boolean {
  if (reservation.status !== 'CONFIRMED') {
    return false;
  }
  return reservation.checkIn.slice(0, 10) <= asOf.toISOString().slice(0, 10);
}

export function ReservationNoShowButton({
  reservation,
  onMarked,
}: ReservationNoShowButtonProps) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const [busy, setBusy] = useState(false);

  if (!canMarkNoShow(reservation)) {
    return null;
  }

  async function handleMark() {
    if (!window.confirm(t('reservations.noShow.confirm'))) {
      return;
    }

    try {
      setBusy(true);
      await reservationsAPI.markNoShow(reservation.id, { userId });
      toast.success(t('reservations.noShow.success'));
      onMarked();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('reservations.noShow.error'),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        void handleMark();
      }}
      disabled={busy}
      className="rounded-xl text-pura-orange"
    >
      {t('reservations.noShow.action')}
    </Button>
  );
}
