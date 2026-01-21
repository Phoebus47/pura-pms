"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { reservationsAPI, type Reservation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ReservationStatusBadge } from "@/components/reservation-status-badge";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        err instanceof Error ? err.message : "Failed to load reservations",
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b8e] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
        <h3 className="text-red-800 font-semibold">
          Error loading reservations
        </h3>
        <p className="text-red-600 mt-2">{error}</p>
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
          <h1 className="text-3xl font-bold text-[#1e4b8e]">Reservations</h1>
          <p className="text-slate-600 mt-1">
            Manage bookings and reservations
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/reservations/calendar";
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button className="bg-[#1e4b8e] hover:bg-[#153a6e]">
            <Plus className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        </div>
      </div>

      {/* Reservations List */}
      {reservations.length === 0 ? (
        <div className="text-center py-12 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50">
          <Calendar className="h-16 w-16 text-slate-300 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            No reservations yet
          </h3>
          <p className="text-slate-500 mt-2">
            Get started by creating your first reservation
          </p>
          <Button className="mt-6 bg-[#1e4b8e] hover:bg-[#153a6e]">
            <Plus className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Confirmation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nights
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="hover:bg-white/50 transition-colors cursor-pointer"
                    onClick={() => {
                      window.location.href = `/reservations/${reservation.id}`;
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-semibold text-[#1e4b8e]">
                        {reservation.confirmNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {reservation.guest?.firstName}{" "}
                        {reservation.guest?.lastName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {reservation.guest?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        Room {reservation.room?.number}
                      </div>
                      <div className="text-xs text-slate-500">
                        {reservation.room?.roomType.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">
                        {formatDate(reservation.checkIn)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">
                        {formatDate(reservation.checkOut)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-800">
                        {reservation.nights}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#1e4b8e]">
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
