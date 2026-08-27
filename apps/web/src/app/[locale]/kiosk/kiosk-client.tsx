'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { kioskAPI } from '@/lib/api/kiosk';
import { propertiesAPI } from '@/lib/api/properties';
import type { Reservation } from '@/lib/api/reservations';
import { reservationsAPI } from '@/lib/api/reservations';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';

function formatStayDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function guestDisplayName(reservation: Reservation): string {
  if (!reservation.guest) return t('kiosk.noGuest');
  return `${reservation.guest.firstName} ${reservation.guest.lastName}`.trim();
}

function statusLabel(status: Reservation['status']): string {
  const labels: Record<Reservation['status'], string> = {
    TENTATIVE: t('kiosk.statusTentative'),
    CONFIRMED: t('kiosk.statusConfirmed'),
    CHECKED_IN: t('kiosk.statusCheckedIn'),
    CHECKED_OUT: t('kiosk.statusCheckedOut'),
    CANCELLED: t('kiosk.statusCancelled'),
    NO_SHOW: t('kiosk.statusNoShow'),
    WALKED: t('kiosk.statusWalked'),
  };
  return labels[status] ?? status;
}

export function KioskClient() {
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const [confirmNumber, setConfirmNumber] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  async function handleLookup() {
    const trimmed = confirmNumber.trim();
    if (!trimmed) return;
    setLookupLoading(true);
    setReservation(null);
    try {
      const found = await reservationsAPI.getByConfirmNumber(trimmed);
      setReservation(found);
    } catch {
      toast.error(t('kiosk.lookupFailed'));
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!reservation || reservation.status !== 'CONFIRMED') return;
    setCheckInLoading(true);
    try {
      const updated = await kioskAPI.checkIn({
        confirmNumber: reservation.confirmNumber,
        propertyId,
      });
      setReservation(updated);
      toast.success(t('kiosk.checkInSuccess'));
    } catch {
      toast.error(t('kiosk.checkInFailed'));
    } finally {
      setCheckInLoading(false);
    }
  }

  function handleReset() {
    setConfirmNumber('');
    setReservation(null);
  }

  const canCheckIn = reservation?.status === 'CONFIRMED';

  return (
    <div className="flex flex-col justify-center max-w-2xl md:p-8 min-h-[70vh] mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="font-bold md:text-5xl text-(--pura-blue) text-4xl">
          {t('kiosk.title')}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('kiosk.subtitle')}
        </p>
      </header>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{t('kiosk.lookupTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="kiosk-confirm-number" className="text-lg">
              {t('kiosk.confirmNumber')}
            </Label>
            <Input
              id="kiosk-confirm-number"
              name="confirmNumber"
              value={confirmNumber}
              onChange={(event) => setConfirmNumber(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleLookup();
              }}
              placeholder={t('kiosk.confirmNumberPlaceholder')}
              className="h-14 text-xl"
              autoComplete="off"
              inputMode="text"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="flex-1 h-14 min-h-[44px] text-lg"
              onClick={() => void handleLookup()}
              disabled={lookupLoading || !confirmNumber.trim()}
            >
              {lookupLoading ? t('common.loading') : t('kiosk.lookup')}
            </Button>
            {reservation ? (
              <Button
                type="button"
                variant="outline"
                className="h-14 min-h-[44px] text-lg"
                onClick={handleReset}
              >
                {t('kiosk.startOver')}
              </Button>
            ) : null}
          </div>

          {reservation ? (
            <section
              aria-live="polite"
              className="bg-surface-inset border p-6 rounded-lg space-y-4"
            >
              <h2 className="font-semibold text-(--pura-blue) text-xl">
                {t('kiosk.reservationDetails')}
              </h2>
              <dl className="gap-3 grid sm:grid-cols-2 text-lg">
                <div>
                  <dt className="text-muted-foreground text-sm">
                    {t('kiosk.guest')}
                  </dt>
                  <dd className="font-medium">
                    {guestDisplayName(reservation)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">
                    {t('kiosk.room')}
                  </dt>
                  <dd className="font-medium">
                    {reservation.room?.number ?? t('kiosk.unassignedRoom')}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">
                    {t('kiosk.checkInDate')}
                  </dt>
                  <dd className="font-medium">
                    {formatStayDate(reservation.checkIn)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-sm">
                    {t('kiosk.checkOutDate')}
                  </dt>
                  <dd className="font-medium">
                    {formatStayDate(reservation.checkOut)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground text-sm">
                    {t('kiosk.status')}
                  </dt>
                  <dd className="font-medium">
                    {statusLabel(reservation.status)}
                  </dd>
                </div>
              </dl>

              {canCheckIn ? (
                <Button
                  type="button"
                  className="h-16 min-h-[44px] text-xl w-full"
                  onClick={() => void handleCheckIn()}
                  disabled={checkInLoading}
                >
                  {checkInLoading
                    ? t('common.loading')
                    : t('kiosk.confirmCheckIn')}
                </Button>
              ) : reservation.status === 'CHECKED_IN' ? (
                <p className="font-medium text-center text-emerald-700 text-lg">
                  {t('kiosk.alreadyCheckedIn')}
                </p>
              ) : (
                <p className="text-amber-700 text-center text-lg">
                  {t('kiosk.notEligible')}
                </p>
              )}
            </section>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
