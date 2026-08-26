'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { DayUseBadge } from '@/components/day-use-badge';
import { StayPurposeBadge } from '@/components/stay-purpose-badge';
import { BillingCycleBadge } from '@/components/billing-cycle-badge';
import { TaxExemptBadge } from '@/components/tax-exempt-badge';
import { RoomLockBadge } from '@/components/room-lock-badge';
import { SplitStayBadge } from '@/components/split-stay-badge';
import { isSplitStay } from '@/lib/split-stay';
import { formatMessage, getDateLocale, t } from '@/lib/i18n';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationsAPI.getAll();
      setReservations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('reservations.list.loadFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-b-2 border-pura-blue h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">
            {t('reservations.list.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
        <h3 className="font-semibold text-red-800">
          {t('reservations.list.errorTitle')}
        </h3>
        <p className="mt-2 text-red-600">{error}</p>
        <Button onClick={loadReservations} className="mt-4">
          {t('common.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="md:space-y-6 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold md:text-3xl text-2xl text-pura-blue">
            {t('reservations.list.title')}
          </h1>
          <p className="md:text-base mt-1 text-slate-600 text-sm">
            {t('reservations.list.subtitle')}
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={() => {
              router.push('/reservations/calendar');
            }}
            className="flex-1 md:flex-initial md:text-base text-sm"
          >
            <Calendar className="h-4 mr-2 w-4" />
            <span className="hidden sm:inline">
              {t('reservations.list.calendarView')}
            </span>
            <span className="sm:hidden">
              {t('reservations.list.calendarShort')}
            </span>
          </Button>
          <Button
            className="bg-pura-blue flex-1 hover:bg-pura-blue-dark md:flex-initial md:text-base text-sm"
            onClick={() => router.push('/reservations/new')}
          >
            <Plus className="h-4 mr-2 w-4" />
            <span className="hidden sm:inline">
              {t('reservations.list.newReservation')}
            </span>
            <span className="sm:hidden">{t('reservations.list.newShort')}</span>
          </Button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white border border-slate-200 py-12 rounded-xl text-center">
          <Calendar className="h-16 mx-auto text-slate-300 w-16" />
          <h3 className="font-semibold mt-4 text-lg text-slate-700">
            {t('reservations.list.emptyTitle')}
          </h3>
          <p className="mt-2 text-slate-500">
            {t('reservations.list.emptyBody')}
          </p>
          <Button
            className="bg-pura-blue hover:bg-pura-blue-dark mt-4"
            onClick={() => router.push('/reservations/new')}
          >
            <Plus className="h-4 mr-2 w-4" />
            {t('reservations.list.newReservation')}
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden md:block relative rounded-xl">
            <div className="bg-white border border-slate-200 overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-[56rem] w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        {t('reservations.list.table.confirmation')}
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        {t('reservations.list.table.guest')}
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        {t('reservations.list.table.room')}
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        {t('reservations.list.table.checkIn')}
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        {t('reservations.list.table.checkOut')}
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        {t('reservations.list.table.nights')}
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        {t('reservations.list.table.total')}
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        {t('reservations.list.table.status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-slate-200 divide-y">
                    {reservations.map((reservation) => (
                      <tr
                        key={reservation.id}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => {
                          router.push(`/reservations/${reservation.id}`);
                        }}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono font-semibold text-pura-blue text-sm">
                            {reservation.confirmNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800 whitespace-nowrap">
                            {reservation.guest?.firstName}{' '}
                            {reservation.guest?.lastName}
                          </div>
                          <div className="max-w-48 text-slate-500 text-xs truncate">
                            {reservation.guest?.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800 whitespace-nowrap">
                            {t('reservations.list.roomPrefix')}{' '}
                            {reservation.room?.number}
                          </div>
                          <div className="max-w-40 text-slate-500 text-xs truncate">
                            {reservation.room?.roomType.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 text-sm whitespace-nowrap">
                          {formatDate(reservation.checkIn)}
                        </td>
                        <td className="px-4 py-3 text-slate-700 text-sm whitespace-nowrap">
                          {formatDate(reservation.checkOut)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 text-sm">
                            {reservation.nights}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-pura-blue text-sm">
                            ฿{Number(reservation.totalAmount).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-nowrap gap-1 items-center">
                            <ReservationStatusBadge
                              status={reservation.status}
                            />
                            {reservation.isDayUse ? <DayUseBadge /> : null}
                            <StayPurposeBadge
                              stayPurpose={reservation.stayPurpose}
                            />
                            <BillingCycleBadge
                              billingCycle={reservation.billingCycle}
                            />
                            <TaxExemptBadge taxExempt={reservation.taxExempt} />
                            <RoomLockBadge
                              isRoomLocked={reservation.isRoomLocked}
                            />
                            {isSplitStay(reservation) ? (
                              <SplitStayBadge />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {reservations.map((reservation) => (
              <button
                key={reservation.id}
                className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm text-left transition-colors w-full"
                onClick={() => {
                  router.push(`/reservations/${reservation.id}`);
                }}
                type="button"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <div className="font-mono font-semibold text-pura-blue text-sm">
                        {reservation.confirmNumber}
                      </div>
                      <ReservationStatusBadge status={reservation.status} />
                      {reservation.isDayUse ? <DayUseBadge size="xs" /> : null}
                      <StayPurposeBadge
                        stayPurpose={reservation.stayPurpose}
                        size="xs"
                      />
                      <BillingCycleBadge
                        billingCycle={reservation.billingCycle}
                        className="text-[10px]"
                      />
                      <TaxExemptBadge
                        taxExempt={reservation.taxExempt}
                        className="text-[10px]"
                      />
                      <RoomLockBadge
                        isRoomLocked={reservation.isRoomLocked}
                        className="text-[10px]"
                      />
                      {isSplitStay(reservation) ? (
                        <SplitStayBadge size="xs" />
                      ) : null}
                    </div>
                    <div className="mt-2">
                      <div className="font-semibold text-slate-800 text-sm">
                        {reservation.guest?.firstName}{' '}
                        {reservation.guest?.lastName}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {reservation.guest?.email}
                      </div>
                    </div>
                    <div className="mt-2 text-slate-600 text-xs">
                      {t('reservations.list.roomPrefix')}{' '}
                      {reservation.room?.number} •{' '}
                      {reservation.room?.roomType.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-pura-blue text-sm">
                      ฿{Number(reservation.totalAmount).toLocaleString()}
                    </div>
                    <div className="mt-1 text-slate-500 text-xs">
                      {reservation.isDayUse
                        ? t('common.dayUse')
                        : formatMessage('reservations.list.nightsLabel', {
                            count: reservation.nights,
                          })}
                    </div>
                  </div>
                </div>
                <div className="border-slate-200 border-t flex gap-4 items-center mt-3 pt-3">
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 tracking-wide uppercase whitespace-nowrap">
                      {t('reservations.list.table.checkIn')}
                    </div>
                    <div className="font-medium mt-0.5 text-slate-700 text-xs">
                      {formatDate(reservation.checkIn)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 tracking-wide uppercase whitespace-nowrap">
                      {t('reservations.list.table.checkOut')}
                    </div>
                    <div className="font-medium mt-0.5 text-slate-700 text-xs">
                      {formatDate(reservation.checkOut)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(getDateLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
