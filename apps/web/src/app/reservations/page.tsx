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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-[#1e4b8e] text-3xl">Reservations</h1>
          <p className="mt-1 text-slate-600">
            Manage bookings and reservations
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              router.push('/reservations/calendar');
            }}
          >
            <Calendar className="h-4 mr-2 w-4" />
            Calendar View
          </Button>
          <Button
            className="bg-[#1e4b8e] hover:bg-[#153a6e]"
            onClick={() => router.push('/reservations/new')}
          >
            <Plus className="h-4 mr-2 w-4" />
            New Reservation
          </Button>
        </div>
      </div>

      {/* Reservations List */}
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
            className="bg-[#1e4b8e] hover:bg-[#153a6e]"
            onClick={() => router.push('/reservations/new')}
          >
            <Plus className="h-4 mr-2 w-4" />
            New Reservation
          </Button>
        </div>
      ) : (
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 overflow-hidden rounded-3xl shadow-xl">
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
                      window.location.href = `/reservations/${reservation.id}`;
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
      )}
    </div>
  );
}
