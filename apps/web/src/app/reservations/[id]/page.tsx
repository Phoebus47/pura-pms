"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { reservationsAPI, type Reservation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ReservationStatusBadge } from "@/components/reservation-status-badge";

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReservation();
  }, [reservationId]);

  async function loadReservation() {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationsAPI.getById(reservationId);
      setReservation(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load reservation",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!confirm("Confirm check-in for this reservation?")) return;

    try {
      await reservationsAPI.checkIn(reservationId);
      loadReservation(); // Reload to get updated data
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to check in");
    }
  }

  async function handleCheckOut() {
    if (!confirm("Confirm check-out for this reservation?")) return;

    try {
      await reservationsAPI.checkOut(reservationId);
      loadReservation(); // Reload to get updated data
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to check out");
    }
  }

  async function handleCancel() {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;

    try {
      await reservationsAPI.cancel(reservationId, reason);
      loadReservation(); // Reload to get updated data
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to cancel reservation",
      );
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this reservation?")) return;

    try {
      await reservationsAPI.delete(reservationId);
      router.push("/reservations");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete reservation",
      );
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
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
          <p className="mt-4 text-slate-600">Loading reservation...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
        <h3 className="text-red-800 font-semibold">
          Error loading reservation
        </h3>
        <p className="text-red-600 mt-2">{error || "Reservation not found"}</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const canCheckIn = reservation.status === "CONFIRMED";
  const canCheckOut = reservation.status === "CHECKED_IN";
  const canCancel = ["CONFIRMED", "CHECKED_IN"].includes(reservation.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1e4b8e]">
              {reservation.confirmNumber}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <ReservationStatusBadge status={reservation.status} />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {canCheckIn && (
            <Button
              onClick={handleCheckIn}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Check In
            </Button>
          )}
          {canCheckOut && (
            <Button
              onClick={handleCheckOut}
              className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="rounded-xl text-orange-600 hover:bg-orange-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/reservations/${reservationId}/edit`)}
            className="rounded-xl"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="rounded-xl text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Reservation Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-[#1e4b8e] mb-6">
            Reservation Details
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Confirmation Number
              </label>
              <p className="text-lg font-mono font-semibold text-[#1e4b8e] mt-1">
                {reservation.confirmNumber}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Status
              </label>
              <div className="mt-1">
                <ReservationStatusBadge status={reservation.status} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Guest
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {reservation.guest?.firstName} {reservation.guest?.lastName}
              </p>
              <p className="text-sm text-slate-500">
                {reservation.guest?.email}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Room
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                Room {reservation.room?.number}
              </p>
              <p className="text-sm text-slate-500">
                {reservation.room?.roomType.name}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Check-in Date
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                {formatDate(reservation.checkIn)}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Check-out Date
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                {formatDate(reservation.checkOut)}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Number of Nights
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {reservation.nights}{" "}
                {reservation.nights === 1 ? "night" : "nights"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Number of Guests
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {reservation.numberOfGuests}{" "}
                {reservation.numberOfGuests === 1 ? "guest" : "guests"}
              </p>
            </div>
          </div>

          {reservation.specialRequests && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <label className="text-sm font-semibold text-slate-600">
                Special Requests
              </label>
              <p className="text-slate-700 mt-2 whitespace-pre-wrap">
                {reservation.specialRequests}
              </p>
            </div>
          )}

          {reservation.cancellationReason && (
            <div className="mt-6 pt-6 border-t border-red-200 bg-red-50/50 -m-6 p-6 rounded-b-3xl">
              <label className="text-sm font-semibold text-red-600">
                Cancellation Reason
              </label>
              <p className="text-red-700 mt-2 whitespace-pre-wrap">
                {reservation.cancellationReason}
              </p>
            </div>
          )}
        </div>

        {/* Pricing Card */}
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-[#1e4b8e] mb-6">Pricing</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Room Rate</span>
              <span className="font-semibold text-slate-800">
                ฿
                {Number(
                  reservation.room?.roomType.baseRate || 0,
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Nights</span>
              <span className="font-semibold text-slate-800">
                × {reservation.nights}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-slate-700">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-[#1e4b8e]">
                  ฿{Number(reservation.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>

            {reservation.actualCheckIn && (
              <div className="pt-4 border-t border-slate-200">
                <label className="text-sm font-semibold text-slate-600">
                  Actual Check-in
                </label>
                <p className="text-slate-700 mt-1">
                  {new Date(reservation.actualCheckIn).toLocaleString()}
                </p>
              </div>
            )}

            {reservation.actualCheckOut && (
              <div className="pt-4 border-t border-slate-200">
                <label className="text-sm font-semibold text-slate-600">
                  Actual Check-out
                </label>
                <p className="text-slate-700 mt-1">
                  {new Date(reservation.actualCheckOut).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#1e4b8e] mb-4">Metadata</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Created:</span>{" "}
            <span className="text-slate-800 font-medium">
              {new Date(reservation.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-600">Last Updated:</span>{" "}
            <span className="text-slate-800 font-medium">
              {new Date(reservation.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
