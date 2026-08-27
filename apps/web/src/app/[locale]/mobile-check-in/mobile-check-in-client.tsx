'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  mobileCheckInAPI,
  type MobileCheckInAvailableRoomType,
  type MobileCheckInDigitalKey,
  type MobileCheckInReservation,
} from '@/lib/api/mobile-check-in';
import { formatMessage, t } from '@/lib/i18n';
import { toast } from '@/lib/toast';

type Step = 'lookup' | 'room-select' | 'success';

function formatStayDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function guestDisplayName(reservation: MobileCheckInReservation): string {
  return `${reservation.guestFirstName} ${reservation.guestLastName}`.trim();
}

function statusLabel(status: MobileCheckInReservation['status']): string {
  const labels: Record<MobileCheckInReservation['status'], string> = {
    TENTATIVE: t('mobileCheckIn.statusTentative'),
    CONFIRMED: t('mobileCheckIn.statusConfirmed'),
    CHECKED_IN: t('mobileCheckIn.statusCheckedIn'),
    CHECKED_OUT: t('mobileCheckIn.statusCheckedOut'),
    CANCELLED: t('mobileCheckIn.statusCancelled'),
    NO_SHOW: t('mobileCheckIn.statusNoShow'),
    WALKED: t('mobileCheckIn.statusWalked'),
  };
  return labels[status] ?? status;
}

export function MobileCheckInClient() {
  const [confirmNumber, setConfirmNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [reservation, setReservation] =
    useState<MobileCheckInReservation | null>(null);
  const [digitalKey, setDigitalKey] = useState<MobileCheckInDigitalKey | null>(
    null,
  );
  const [step, setStep] = useState<Step>('lookup');
  const [availableRooms, setAvailableRooms] = useState<
    MobileCheckInAvailableRoomType[]
  >([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  async function handleLookup() {
    const trimmed = confirmNumber.trim();
    if (!trimmed) return;
    setLookupLoading(true);
    setReservation(null);
    try {
      const found = await mobileCheckInAPI.lookup(
        trimmed,
        lastName.trim() || undefined,
      );
      setReservation(found);
      setStep('lookup');
    } catch {
      toast.error(t('mobileCheckIn.lookupFailed'));
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleShowRoomOptions() {
    if (!reservation) return;
    setRoomsLoading(true);
    try {
      const rooms = await mobileCheckInAPI.getAvailableRooms(
        reservation.confirmNumber,
        lastName.trim() || undefined,
      );
      setAvailableRooms(rooms);
      setStep('room-select');
    } catch {
      toast.error(t('mobileCheckIn.roomSelectFailed'));
    } finally {
      setRoomsLoading(false);
    }
  }

  async function handleSelectRoom(roomId: string) {
    if (!reservation) return;
    setActionLoading(true);
    try {
      const updated = await mobileCheckInAPI.selectRoom(
        reservation.confirmNumber,
        roomId,
        lastName.trim() || undefined,
      );
      setReservation(updated);
      setStep('lookup');
      toast.success(t('mobileCheckIn.roomSelected'));
    } catch {
      toast.error(t('mobileCheckIn.roomSelectFailed'));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!reservation || reservation.status !== 'CONFIRMED') return;
    setActionLoading(true);
    try {
      const result = await mobileCheckInAPI.checkIn(
        reservation.confirmNumber,
        lastName.trim() || undefined,
      );
      setReservation(result.reservation);
      setDigitalKey(result.digitalKey);
      setStep('success');
      toast.success(t('mobileCheckIn.checkInSuccess'));
    } catch {
      toast.error(t('mobileCheckIn.checkInFailed'));
    } finally {
      setActionLoading(false);
    }
  }

  function handleReset() {
    setConfirmNumber('');
    setLastName('');
    setReservation(null);
    setDigitalKey(null);
    setAvailableRooms([]);
    setStep('lookup');
  }

  const canCheckIn = reservation?.status === 'CONFIRMED';

  return (
    <div className="flex flex-col justify-center max-w-2xl md:p-8 min-h-[70vh] mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="font-bold md:text-5xl text-(--pura-blue) text-4xl">
          {t('mobileCheckIn.title')}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('mobileCheckIn.subtitle')}
        </p>
      </header>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 'room-select'
              ? t('mobileCheckIn.roomSelectTitle')
              : t('mobileCheckIn.lookupTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'lookup' ? (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="mobile-check-in-confirm-number"
                  className="text-lg"
                >
                  {t('mobileCheckIn.confirmNumber')}
                </Label>
                <Input
                  id="mobile-check-in-confirm-number"
                  name="confirmNumber"
                  value={confirmNumber}
                  onChange={(event) => setConfirmNumber(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handleLookup();
                  }}
                  placeholder={t('mobileCheckIn.confirmNumberPlaceholder')}
                  className="h-14 text-xl"
                  autoComplete="off"
                  inputMode="text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-check-in-last-name" className="text-lg">
                  {t('mobileCheckIn.lastNameOptional')}
                </Label>
                <Input
                  id="mobile-check-in-last-name"
                  name="lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handleLookup();
                  }}
                  placeholder={t('mobileCheckIn.lastNamePlaceholder')}
                  className="h-12"
                  autoComplete="family-name"
                />
                <p className="text-muted-foreground text-sm">
                  {t('mobileCheckIn.lastNameHint')}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  className="flex-1 h-14 min-h-[44px] text-lg"
                  onClick={() => void handleLookup()}
                  disabled={lookupLoading || !confirmNumber.trim()}
                >
                  {lookupLoading
                    ? t('common.loading')
                    : t('mobileCheckIn.lookup')}
                </Button>
                {reservation ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 min-h-[44px] text-lg"
                    onClick={handleReset}
                  >
                    {t('mobileCheckIn.startOver')}
                  </Button>
                ) : null}
              </div>

              {reservation ? (
                <section
                  aria-live="polite"
                  className="bg-surface-inset border p-6 rounded-lg space-y-4"
                >
                  <h2 className="font-semibold text-(--pura-blue) text-xl">
                    {t('mobileCheckIn.reservationDetails')}
                  </h2>
                  <dl className="gap-3 grid sm:grid-cols-2 text-lg">
                    <div>
                      <dt className="text-muted-foreground text-sm">
                        {t('mobileCheckIn.guest')}
                      </dt>
                      <dd className="font-medium">
                        {guestDisplayName(reservation)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-sm">
                        {t('mobileCheckIn.room')}
                      </dt>
                      <dd className="font-medium">
                        {reservation.room?.number ??
                          t('mobileCheckIn.unassignedRoom')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-sm">
                        {t('mobileCheckIn.checkInDate')}
                      </dt>
                      <dd className="font-medium">
                        {formatStayDate(reservation.checkIn)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-sm">
                        {t('mobileCheckIn.checkOutDate')}
                      </dt>
                      <dd className="font-medium">
                        {formatStayDate(reservation.checkOut)}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground text-sm">
                        {t('mobileCheckIn.status')}
                      </dt>
                      <dd className="font-medium">
                        {statusLabel(reservation.status)}
                      </dd>
                    </div>
                  </dl>

                  {canCheckIn ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-14 min-h-[44px] text-lg"
                        onClick={() => void handleShowRoomOptions()}
                        disabled={roomsLoading}
                      >
                        {roomsLoading
                          ? t('common.loading')
                          : t('mobileCheckIn.changeRoom')}
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 h-14 min-h-[44px] text-lg"
                        onClick={() => void handleCheckIn()}
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? t('common.loading')
                          : t('mobileCheckIn.confirmCheckIn')}
                      </Button>
                    </div>
                  ) : reservation.status === 'CHECKED_IN' ? (
                    <p className="font-medium text-center text-emerald-700 text-lg">
                      {t('mobileCheckIn.alreadyCheckedIn')}
                    </p>
                  ) : (
                    <p className="text-amber-700 text-center text-lg">
                      {t('mobileCheckIn.notEligible')}
                    </p>
                  )}
                </section>
              ) : null}
            </>
          ) : null}

          {step === 'room-select' && reservation ? (
            <section aria-live="polite" className="space-y-4">
              <p className="text-muted-foreground">
                {t('mobileCheckIn.roomSelectSubtitle')}
              </p>

              {availableRooms.length === 0 ? (
                <p className="text-amber-700">
                  {t('mobileCheckIn.noRoomsAvailable')}
                </p>
              ) : (
                <div className="gap-3 grid sm:grid-cols-2">
                  {availableRooms.flatMap((group) =>
                    group.rooms.map((room) => (
                      <Button
                        key={room.id}
                        type="button"
                        variant="outline"
                        className="h-14 justify-start min-h-[44px] text-lg"
                        onClick={() => void handleSelectRoom(room.id)}
                        disabled={actionLoading}
                      >
                        {formatMessage('mobileCheckIn.roomOptionLabel', {
                          number: room.number,
                          floor: room.floor ?? '-',
                        })}
                      </Button>
                    )),
                  )}
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                className="h-12 min-h-[44px] w-full"
                onClick={() => setStep('lookup')}
              >
                {t('mobileCheckIn.cancelRoomSelection')}
              </Button>
            </section>
          ) : null}

          {step === 'success' && reservation ? (
            <section aria-live="polite" className="space-y-6 text-center">
              <p className="font-semibold text-2xl text-emerald-700">
                {formatMessage('mobileCheckIn.welcomeBack', {
                  name: guestDisplayName(reservation),
                })}
              </p>
              <div className="bg-surface-inset border-2 border-dashed p-8 rounded-lg space-y-2">
                <h2 className="font-semibold text-lg">
                  {t('mobileCheckIn.digitalKeyTitle')}
                </h2>
                <p className="text-muted-foreground">
                  {digitalKey?.message ?? t('mobileCheckIn.digitalKeyPending')}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-12 min-h-[44px]"
                onClick={handleReset}
              >
                {t('mobileCheckIn.startOver')}
              </Button>
            </section>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
