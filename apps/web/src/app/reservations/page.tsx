'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';

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
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
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
          <h1 className="font-bold md:text-3xl text-[#1e4b8e] text-2xl">
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
            className="bg-[#1e4b8e] flex-1 hover:bg-[#153a6e] md:flex-initial md:text-base text-sm"
            onClick={() => router.push('/reservations/new')}
          >
            <Plus className="h-4 mr-2 w-4" />
            <span className="hidden sm:inline">New Reservation</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 py-12 rounded-3xl text-center">
          <Calendar className="h-16 mx-auto text-slate-300 w-16" />
          <h3 className="font-semibold mt-4 text-lg text-slate-700">
            No reservations yet
          </h3>
          <p className="mt-2 text-slate-500">
            Get started by creating your first reservation
          </p>
          <Button
            className="bg-[#1e4b8e] hover:bg-[#153a6e] mt-4"
            onClick={() => router.push('/reservations/new')}
          >
            <Plus className="h-4 mr-2 w-4" />
            New Reservation
          </Button>
        </div>
      ) : (
        <>
          <div className="backdrop-blur-2xl bg-white/40 border border-white/50 hidden md:block overflow-hidden rounded-3xl shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Confirmation
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Guest
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Room
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Check-in
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Check-out
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Nights
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Total
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-slate-200 divide-y">
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="cursor-pointer hover:bg-white/50 transition-colors"
                      onClick={() => {
                        router.push(`/reservations/${reservation.id}`);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono font-semibold text-[#1e4b8e] text-sm">
                          {reservation.confirmNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {reservation.guest?.firstName}{' '}
                          {reservation.guest?.lastName}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {reservation.guest?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          Room {reservation.room?.number}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {reservation.room?.roomType.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 text-sm">
                          {formatDate(reservation.checkIn)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 text-sm">
                          {formatDate(reservation.checkOut)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 text-sm">
                          {reservation.nights}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#1e4b8e] text-sm">
                          ฿{Number(reservation.totalAmount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ReservationStatusBadge status={reservation.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {reservations.map((reservation) => (
              <button
                key={reservation.id}
                className="active:scale-[0.98] backdrop-blur-2xl bg-white/40 border border-white/50 p-4 rounded-2xl shadow-lg text-left transition-all w-full"
                onClick={() => {
                  router.push(`/reservations/${reservation.id}`);
                }}
                type="button"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex gap-2 items-center">
                      <div className="font-mono font-semibold text-[#1e4b8e] text-sm">
                        {reservation.confirmNumber}
                      </div>
                      <ReservationStatusBadge status={reservation.status} />
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
                    <div className="font-semibold text-[#1e4b8e] text-sm">
                      ฿{Number(reservation.totalAmount).toLocaleString()}
                    </div>
                    <div className="mt-1 text-slate-500 text-xs">
                      {reservation.nights} nights
                    </div>
                  </div>
                </div>
                <div className="border-slate-200 border-t flex gap-4 items-center mt-3 pt-3">
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 tracking-wide uppercase">
                      Check-in
                    </div>
                    <div className="font-medium mt-0.5 text-slate-700 text-xs">
                      {formatDate(reservation.checkIn)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 tracking-wide uppercase">
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
