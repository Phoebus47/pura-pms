'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { DayUseBadge } from '@/components/day-use-badge';
import { SplitStayBadge } from '@/components/split-stay-badge';
import { isSplitStay } from '@/lib/split-stay';

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
        err instanceof Error ? err.message : 'Failed to load reservations',
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
          <p className="mt-4 text-slate-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
        <h3 className="font-semibold text-red-800">
          Error loading reservations
        </h3>
        <p className="mt-2 text-red-600">{error}</p>
        <Button onClick={loadReservations} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="md:space-y-6 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold md:text-3xl text-2xl text-pura-blue">
            Reservations
          </h1>
          <p className="md:text-base mt-1 text-slate-600 text-sm">
            Manage bookings and reservations
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
            <span className="hidden sm:inline">Calendar View</span>
            <span className="sm:hidden">Calendar</span>
          </Button>
          <Button
            className="bg-pura-blue flex-1 hover:bg-pura-blue-dark md:flex-initial md:text-base text-sm"
            onClick={() => router.push('/reservations/new')}
          >
            <Plus className="h-4 mr-2 w-4" />
            <span className="hidden sm:inline">New Reservation</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white border border-slate-200 py-12 rounded-xl text-center">
          <Calendar className="h-16 mx-auto text-slate-300 w-16" />
          <h3 className="font-semibold mt-4 text-lg text-slate-700">
            No reservations yet
          </h3>
          <p className="mt-2 text-slate-500">
            Get started by creating your first reservation
          </p>
          <Button
            className="bg-pura-blue hover:bg-pura-blue-dark mt-4"
            onClick={() => router.push('/reservations/new')}
          >
            <Plus className="h-4 mr-2 w-4" />
            New Reservation
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
                        Confirmation
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        Guest
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        Room
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        Check-in
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        Check-out
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        Nights
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        Total
                      </th>
                      <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                        Status
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
                            Room {reservation.room?.number}
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
                      Room {reservation.room?.number} •{' '}
                      {reservation.room?.roomType.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-pura-blue text-sm">
                      ฿{Number(reservation.totalAmount).toLocaleString()}
                    </div>
                    <div className="mt-1 text-slate-500 text-xs">
                      {reservation.isDayUse
                        ? 'Day use'
                        : `${reservation.nights} nights`}
                    </div>
                  </div>
                </div>
                <div className="border-slate-200 border-t flex gap-4 items-center mt-3 pt-3">
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 tracking-wide uppercase whitespace-nowrap">
                      Check-in
                    </div>
                    <div className="font-medium mt-0.5 text-slate-700 text-xs">
                      {formatDate(reservation.checkIn)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 tracking-wide uppercase whitespace-nowrap">
                      Check-out
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
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
