'use client';

import { useEffect, useState, useCallback } from 'react';
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

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationsAPI.getById(reservationId);
      setReservation(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load reservation',
      );
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  async function handleCheckIn() {
    if (!confirm('Confirm check-in for this reservation?')) return;

    try {
      await reservationsAPI.checkIn(reservationId);
      loadReservation();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to check in');
    }
  }

  async function handleCheckOut() {
    if (!confirm('Confirm check-out for this reservation?')) return;

    try {
      await reservationsAPI.checkOut(reservationId);
      loadReservation();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to check out');
    }
  }

  async function handleCancel() {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    try {
      await reservationsAPI.cancel(reservationId, reason);
      loadReservation();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Failed to cancel reservation',
      );
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this reservation?')) return;

    try {
      await reservationsAPI.delete(reservationId);
      router.push('/reservations');
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Failed to delete reservation',
      );
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
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
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading reservation...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
        <h3 className="font-semibold text-red-800">
          Error loading reservation
        </h3>
        <p className="mt-2 text-red-600">{error || 'Reservation not found'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
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
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 mr-2 w-4" />
            Back
          </Button>
          <div>
            <h1 className="font-bold text-[#1e4b8e] text-3xl">
              {reservation.confirmNumber}
            </h1>
            <div className="flex gap-2 items-center mt-1">
              <ReservationStatusBadge status={reservation.status} />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {canCheckIn && (
            <Button
              onClick={handleCheckIn}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              <CheckCircle className="h-4 mr-2 w-4" />
              Check In
            </Button>
          )}
          {canCheckOut && (
            <Button
              onClick={handleCheckOut}
              className="bg-[#1e4b8e] hover:bg-[#153a6e] rounded-xl"
            >
              <CheckCircle className="h-4 mr-2 w-4" />
              Check Out
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="hover:bg-orange-50 rounded-xl text-orange-600"
            >
              <XCircle className="h-4 mr-2 w-4" />
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/reservations/${reservationId}/edit`)}
            className="rounded-xl"
          >
            <Edit className="h-4 mr-2 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="hover:bg-red-50 rounded-xl text-red-600"
          >
            <Trash2 className="h-4 mr-2 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Reservation Information */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Main Info Card */}
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 lg:col-span-2 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-xl">
            Reservation Details
          </h2>

          <div className="gap-6 grid grid-cols-2">
            <div>
              <p className="font-semibold text-slate-600 text-sm">
                Confirmation Number
              </p>
              <p className="font-mono font-semibold mt-1 text-[#1e4b8e] text-lg">
                {reservation.confirmNumber}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-600 text-sm">Status</p>
              <div className="mt-1">
                <ReservationStatusBadge status={reservation.status} />
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-600 text-sm">Guest</p>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                {reservation.guest?.firstName} {reservation.guest?.lastName}
              </p>
              <p className="text-slate-500 text-sm">
                {reservation.guest?.email}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-600 text-sm">Room</p>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                Room {reservation.room?.number}
              </p>
              <p className="text-slate-500 text-sm">
                {reservation.room?.roomType.name}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-600 text-sm">
                Check-in Date
              </p>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                <Calendar className="h-4 inline mr-1 w-4" />
                {formatDate(reservation.checkIn)}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-600 text-sm">
                Check-out Date
              </p>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                <Calendar className="h-4 inline mr-1 w-4" />
                {formatDate(reservation.checkOut)}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-600 text-sm">
                Number of Nights
              </p>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                {reservation.nights}{' '}
                {reservation.nights === 1 ? 'night' : 'nights'}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-600 text-sm">
                Number of Guests
              </p>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                {reservation.numberOfGuests}{' '}
                {reservation.numberOfGuests === 1 ? 'guest' : 'guests'}
              </p>
            </div>
          </div>

          {reservation.specialRequests && (
            <div className="border-slate-200 border-t mt-6 pt-6">
              <p className="font-semibold text-slate-600 text-sm">
                Special Requests
              </p>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                {reservation.specialRequests}
              </p>
            </div>
          )}

          {reservation.cancellationReason && (
            <div className="-m-6 bg-red-50/50 border-red-200 border-t mt-6 p-6 pt-6 rounded-b-3xl">
              <p className="font-semibold text-red-600 text-sm">
                Cancellation Reason
              </p>
              <p className="mt-2 text-red-700 whitespace-pre-wrap">
                {reservation.cancellationReason}
              </p>
            </div>
          )}
        </div>

        {/* Pricing Card */}
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-xl">Pricing</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Room Rate</span>
              <span className="font-semibold text-slate-800">
                ฿
                {Number(
                  reservation.room?.roomType.baseRate || 0,
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Nights</span>
              <span className="font-semibold text-slate-800">
                × {reservation.nights}
              </span>
            </div>

            <div className="border-slate-200 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg text-slate-700">
                  Total Amount
                </span>
                <span className="font-bold text-[#1e4b8e] text-2xl">
                  ฿{Number(reservation.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>

            {reservation.actualCheckIn && (
              <div className="border-slate-200 border-t pt-4">
                <p className="font-semibold text-slate-600 text-sm">
                  Actual Check-in
                </p>
                <p className="mt-1 text-slate-700">
                  {new Date(reservation.actualCheckIn).toLocaleString()}
                </p>
              </div>
            )}

            {reservation.actualCheckOut && (
              <div className="border-slate-200 border-t pt-4">
                <p className="font-semibold text-slate-600 text-sm">
                  Actual Check-out
                </p>
                <p className="mt-1 text-slate-700">
                  {new Date(reservation.actualCheckOut).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
        <h2 className="font-bold mb-4 text-[#1e4b8e] text-xl">Metadata</h2>
        <div className="gap-4 grid grid-cols-2 text-sm">
          <div>
            <span className="text-slate-600">Created:</span>{' '}
            <span className="font-medium text-slate-800">
              {new Date(reservation.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-600">Last Updated:</span>{' '}
            <span className="font-medium text-slate-800">
              {new Date(reservation.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
