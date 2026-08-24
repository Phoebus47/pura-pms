'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { DayUseBadge } from '@/components/day-use-badge';
import { StayPurposeBadge } from '@/components/stay-purpose-badge';
import { BillingCycleBadge } from '@/components/billing-cycle-badge';
import { TaxExemptBadge } from '@/components/tax-exempt-badge';
import { RoomLockBadge } from '@/components/room-lock-badge';
import { SplitStayBadge } from '@/components/split-stay-badge';
import { SplitStayTable } from '@/components/split-stay-table';
import { isSplitStay } from '@/lib/split-stay';
import { isNonRevenueStay } from '@/lib/stay-purpose';
import { formatMessage, getDateLocale, t } from '@/lib/i18n';
import { FolioDetail } from '@/components/folio-detail';
import { RoomMovePanel } from '@/components/room-move-panel';
import { WalkPanel } from '@/components/walk-panel';
import { RegistrationCardPanel } from '@/components/registration-card-panel';
import { WakeUpCallPanel } from '@/components/wake-up-call-panel';
import { ReservationNoShowButton } from '@/components/reservation-no-show-button';
import { cn } from '@/lib/utils';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'billing'>('details');

  const loadReservation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationsAPI.getById(reservationId);
      setReservation(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('reservations.detail.loadFailed'),
      );
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  async function handleCheckIn() {
    if (!confirm(t('reservations.detail.confirmCheckIn'))) return;

    try {
      await reservationsAPI.checkIn(reservationId);
      loadReservation();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : t('reservations.detail.checkInFailed'),
      );
    }
  }

  async function handleCheckOut() {
    if (!confirm(t('reservations.detail.confirmCheckOut'))) return;

    try {
      await reservationsAPI.checkOut(reservationId);
      loadReservation();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : t('reservations.detail.checkOutFailed'),
      );
    }
  }

  async function handleCancel() {
    const reason = prompt(t('reservations.detail.cancelReasonPrompt'));
    if (!reason) return;

    try {
      await reservationsAPI.cancel(reservationId, reason);
      loadReservation();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : t('reservations.detail.cancelFailed'),
      );
    }
  }

  async function handleDelete() {
    if (!confirm(t('reservations.detail.deleteConfirm'))) return;

    try {
      await reservationsAPI.delete(reservationId);
      router.push('/reservations');
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : t('reservations.detail.deleteFailed'),
      );
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(getDateLocale(), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-b-2 border-pura-blue h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">
            {t('reservations.detail.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
        <h3 className="font-semibold text-red-800">
          {t('reservations.detail.errorTitle')}
        </h3>
        <p className="mt-2 text-red-600">
          {error || t('reservations.detail.notFound')}
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          {t('common.goBack')}
        </Button>
      </div>
    );
  }

  const canCheckIn = reservation.status === 'CONFIRMED';
  const canCheckOut = reservation.status === 'CHECKED_IN';
  const canCancel = ['CONFIRMED', 'CHECKED_IN'].includes(reservation.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 mr-2 w-4" />
            {t('common.back')}
          </Button>
          <div>
            <h1 className="font-bold text-3xl text-pura-blue">
              {reservation.confirmNumber}
            </h1>
            <div className="flex gap-2 items-center mt-1">
              <ReservationStatusBadge status={reservation.status} />
              {reservation.isDayUse ? <DayUseBadge /> : null}
              <StayPurposeBadge stayPurpose={reservation.stayPurpose} />
              <BillingCycleBadge billingCycle={reservation.billingCycle} />
              <TaxExemptBadge taxExempt={reservation.taxExempt} />
              <RoomLockBadge isRoomLocked={reservation.isRoomLocked} />
              {isSplitStay(reservation) ? <SplitStayBadge /> : null}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {canCheckIn && (
            <Button
              onClick={handleCheckIn}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="h-4 mr-2 w-4" />
              {t('reservations.detail.checkIn')}
            </Button>
          )}
          <ReservationNoShowButton
            reservation={reservation}
            onMarked={loadReservation}
          />
          {canCheckOut && (
            <Button
              onClick={handleCheckOut}
              className="bg-pura-blue hover:bg-pura-blue-dark"
            >
              <CheckCircle className="h-4 mr-2 w-4" />
              {t('reservations.detail.checkOut')}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="hover:bg-orange-50 text-orange-600"
            >
              <XCircle className="h-4 mr-2 w-4" />
              {t('reservations.detail.cancel')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/reservations/${reservationId}/edit`)}
          >
            <Edit className="h-4 mr-2 w-4" />
            {t('reservations.detail.edit')}
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="hover:bg-red-50 text-red-600"
          >
            <Trash2 className="h-4 mr-2 w-4" />
            {t('reservations.detail.delete')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          onClick={() => setActiveTab('details')}
          className={cn(
            'px-4 py-3 text-sm font-bold transition-all border-b-2',
            activeTab === 'details'
              ? 'border-pura-blue text-pura-blue'
              : 'border-transparent text-slate-400 hover:text-slate-600',
          )}
        >
          {t('reservations.detail.tabDetails')}
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={cn(
            'px-4 py-3 text-sm font-bold transition-all border-b-2',
            activeTab === 'billing'
              ? 'border-pura-blue text-pura-blue'
              : 'border-transparent text-slate-400 hover:text-slate-600',
          )}
        >
          {t('reservations.detail.tabBilling')}
        </button>
      </div>

      {activeTab === 'details' ? (
        <div className="space-y-6">
          {/* Reservation Information */}
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
            {/* Main Info Card */}
            <div className="bg-white border border-slate-200 lg:col-span-2 p-6 rounded-xl shadow-sm">
              <h2 className="font-bold mb-6 text-pura-blue text-xl">
                {t('reservations.detail.reservationDetails')}
              </h2>

              <div className="gap-6 grid grid-cols-2">
                <div>
                  <p className="font-semibold text-slate-600 text-sm">
                    {t('reservations.detail.confirmationNumber')}
                  </p>
                  <p className="font-mono font-semibold mt-1 text-lg text-pura-blue">
                    {reservation.confirmNumber}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 text-sm">
                    {t('common.status')}
                  </p>
                  <div className="mt-1">
                    <ReservationStatusBadge status={reservation.status} />
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 text-sm">
                    {t('reservations.detail.guest')}
                  </p>
                  <p className="font-semibold mt-1 text-lg text-slate-800">
                    {reservation.guest?.firstName} {reservation.guest?.lastName}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {reservation.guest?.email}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 text-sm">
                    {t('reservations.detail.room')}
                  </p>
                  <p className="font-semibold mt-1 text-lg text-slate-800">
                    {t('common.roomLabel')} {reservation.room?.number}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {reservation.room?.roomType.name}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 text-sm">
                    {t('reservations.detail.checkInDate')}
                  </p>
                  <p className="font-semibold mt-1 text-lg text-slate-800">
                    <Calendar className="h-4 inline mr-1 w-4" />
                    {formatDate(reservation.checkIn)}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 text-sm">
                    {t('reservations.detail.checkOutDate')}
                  </p>
                  <p className="font-semibold mt-1 text-lg text-slate-800">
                    <Calendar className="h-4 inline mr-1 w-4" />
                    {formatDate(reservation.checkOut)}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 text-sm">
                    {t('reservations.detail.numberOfNights')}
                  </p>
                  <p className="font-semibold mt-1 text-lg text-slate-800">
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
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 text-sm">
                    {t('reservations.detail.numberOfGuests')}
                  </p>
                  <p className="font-semibold mt-1 text-lg text-slate-800">
                    {reservation.numberOfGuests}{' '}
                    {reservation.numberOfGuests === 1
                      ? t('common.guestSingular')
                      : t('common.guestsCount')}
                  </p>
                </div>
              </div>

              {isNonRevenueStay(reservation.stayPurpose) ? (
                <div className="border-slate-200 border-t mt-6 pt-6">
                  <div className="gap-6 grid md:grid-cols-2">
                    <div>
                      <p className="font-semibold text-slate-600 text-sm">
                        {t('reservations.stayPurpose.approvedBy')}
                      </p>
                      <p className="font-semibold mt-1 text-lg text-slate-800">
                        {reservation.approvedBy}
                      </p>
                    </div>
                    {reservation.stayPurposeNote ? (
                      <div>
                        <p className="font-semibold text-slate-600 text-sm">
                          {t('reservations.stayPurpose.purpose')}
                        </p>
                        <p className="font-semibold mt-1 text-lg text-slate-800">
                          {reservation.stayPurposeNote}
                        </p>
                      </div>
                    ) : null}
                    {reservation.stayPurpose === 'HOUSE_USE' ? (
                      <div>
                        <p className="font-semibold text-slate-600 text-sm">
                          {t('reservations.stayPurpose.department')}
                        </p>
                        <p className="font-semibold mt-1 text-lg text-slate-800">
                          {reservation.department}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {reservation.taxExempt ? (
                <div className="border-slate-200 border-t mt-6 pt-6">
                  <div className="gap-6 grid md:grid-cols-2">
                    <div>
                      <p className="font-semibold text-slate-600 text-sm">
                        {t('reservations.taxExempt.reason')}
                      </p>
                      <p className="font-semibold mt-1 text-lg text-slate-800">
                        {reservation.taxExemptReason}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600 text-sm">
                        {t('reservations.taxExempt.documentRef')}
                      </p>
                      <p className="font-semibold mt-1 text-lg text-slate-800">
                        {reservation.taxExemptDocumentRef}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600 text-sm">
                        {t('reservations.taxExempt.approvedBy')}
                      </p>
                      <p className="font-semibold mt-1 text-lg text-slate-800">
                        {reservation.taxExemptApprovedBy}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {reservation.isRoomLocked ? (
                <div className="border-slate-200 border-t mt-6 pt-6">
                  <p className="font-semibold text-slate-600 text-sm">
                    {t('reservations.roomLock.note')}
                  </p>
                  <p className="font-semibold mt-1 text-lg text-slate-800">
                    {reservation.roomLockNote}
                  </p>
                </div>
              ) : null}

              {reservation.stays ? (
                <div className="border-slate-200 border-t mt-6 pt-6">
                  <SplitStayTable stays={reservation.stays} />
                </div>
              ) : null}

              {reservation.specialRequests && (
                <div className="border-slate-200 border-t mt-6 pt-6">
                  <p className="font-semibold text-slate-600 text-sm">
                    {t('reservations.detail.specialRequests')}
                  </p>
                  <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                    {reservation.specialRequests}
                  </p>
                </div>
              )}

              {reservation.cancellationReason && (
                <div className="-m-6 bg-red-50 border-red-200 border-t mt-6 p-6 pt-6 rounded-b-xl">
                  <p className="font-semibold text-red-600 text-sm">
                    {t('reservations.detail.cancellationReason')}
                  </p>
                  <p className="mt-2 text-red-700 whitespace-pre-wrap">
                    {reservation.cancellationReason}
                  </p>
                </div>
              )}
            </div>

            {/* Pricing Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <h2 className="font-bold mb-6 text-pura-blue text-xl">
                {t('reservations.detail.pricing')}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {t('reservations.detail.roomRate')}
                  </span>
                  <span className="font-semibold text-slate-800">
                    ฿
                    {Number(
                      reservation.room?.roomType.baseRate || 0,
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {reservation.isDayUse
                      ? t('reservations.detail.stayType')
                      : t('common.nights')}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {reservation.isDayUse ? (
                      <DayUseBadge />
                    ) : (
                      `× ${reservation.nights}`
                    )}
                  </span>
                </div>

                <div className="border-slate-200 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg text-slate-700">
                      {t('reservations.detail.totalAmount')}
                    </span>
                    <span className="font-bold text-2xl text-pura-blue">
                      ฿{Number(reservation.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {reservation.actualCheckIn && (
                  <div className="border-slate-200 border-t pt-4">
                    <p className="font-semibold text-slate-600 text-sm">
                      {t('reservations.detail.actualCheckIn')}
                    </p>
                    <p className="mt-1 text-slate-700">
                      {new Date(reservation.actualCheckIn).toLocaleString(
                        getDateLocale(),
                      )}
                    </p>
                  </div>
                )}

                {reservation.actualCheckOut && (
                  <div className="border-slate-200 border-t pt-4">
                    <p className="font-semibold text-slate-600 text-sm">
                      {t('reservations.detail.actualCheckOut')}
                    </p>
                    <p className="mt-1 text-slate-700">
                      {new Date(reservation.actualCheckOut).toLocaleString(
                        getDateLocale(),
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {reservation.status === 'CHECKED_IN' ? (
            <RoomMovePanel
              reservation={reservation}
              onMoved={loadReservation}
            />
          ) : null}

          {reservation.status === 'CONFIRMED' ? (
            <WalkPanel reservation={reservation} onWalked={loadReservation} />
          ) : null}

          {['CONFIRMED', 'CHECKED_IN'].includes(reservation.status) ? (
            <RegistrationCardPanel reservation={reservation} />
          ) : null}

          {['CONFIRMED', 'CHECKED_IN'].includes(reservation.status) ? (
            <WakeUpCallPanel reservation={reservation} />
          ) : null}

          {/* Metadata */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h2 className="font-bold mb-4 text-pura-blue text-xl">
              {t('reservations.detail.metadata')}
            </h2>
            <div className="gap-4 grid grid-cols-2 text-sm">
              <div>
                <span className="text-slate-600">
                  {t('reservations.detail.created')}
                </span>{' '}
                <span className="font-medium text-slate-800">
                  {new Date(reservation.createdAt).toLocaleString(
                    getDateLocale(),
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-600">
                  {t('reservations.detail.lastUpdated')}
                </span>{' '}
                <span className="font-medium text-slate-800">
                  {new Date(reservation.updatedAt).toLocaleString(
                    getDateLocale(),
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              asChild
              variant="outline"
              className="border-pura-blue text-pura-blue"
            >
              <Link href={`/billing?reservationId=${reservationId}`}>
                {t('reservations.detail.openBillingDashboard')}
              </Link>
            </Button>
          </div>
          <FolioDetail reservationId={reservationId} />
        </div>
      )}
    </div>
  );
}
