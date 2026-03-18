'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ExternalLink, Receipt } from 'lucide-react';
import { FolioDetail } from '@/components/folio-detail';
import { Button } from '@/components/ui/button';
import { reservationsAPI, type Reservation } from '@/lib/api';

export function BillingClient() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('reservationId')?.trim() ?? '';

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [resError, setResError] = useState<string | null>(null);
  const [loadingRes, setLoadingRes] = useState(false);

  const loadReservation = useCallback(async () => {
    if (!reservationId) {
      setReservation(null);
      setResError(null);
      return;
    }
    try {
      setLoadingRes(true);
      setResError(null);
      const data = await reservationsAPI.getById(reservationId);
      setReservation(data);
    } catch (err) {
      setReservation(null);
      setResError(
        err instanceof Error ? err.message : 'Failed to load reservation',
      );
    } finally {
      setLoadingRes(false);
    }
  }, [reservationId]);

  useEffect(() => {
    void loadReservation();
  }, [loadReservation]);

  function renderMain() {
    if (reservationId === '') {
      return (
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-10 rounded-3xl shadow-xl text-center">
          <Receipt className="h-14 mb-4 mx-auto text-slate-300 w-14" />
          <h2 className="font-semibold text-slate-800 text-xl">
            Select a reservation
          </h2>
          <p className="max-w-md mt-2 mx-auto text-slate-600 text-sm">
            Open billing from a reservation (Billing & Folio tab) or pick one
            from the list. You can also append{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">
              ?reservationId=
            </code>{' '}
            to this URL.
          </p>
          <Button
            asChild
            className="bg-[#1e4b8e] hover:bg-[#153a6e] mt-6 rounded-xl"
          >
            <Link href="/reservations">
              <ExternalLink className="h-4 mr-2 w-4" />
              Go to reservations
            </Link>
          </Button>
        </div>
      );
    }
    if (loadingRes) {
      return (
        <div className="bg-white/30 border border-white/50 flex flex-col h-48 items-center justify-center rounded-3xl">
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-10 rounded-full w-10" />
          <p className="mt-4 text-slate-600">Loading reservation…</p>
        </div>
      );
    }
    if (resError !== null || reservation === null) {
      const message = resError ?? 'Reservation not found';
      return (
        <div className="bg-red-50/80 border border-red-200 p-8 rounded-3xl text-center">
          <p className="font-semibold text-red-800">{message}</p>
          <Button asChild variant="outline" className="mt-4 rounded-xl">
            <Link href="/reservations">Back to reservations</Link>
          </Button>
        </div>
      );
    }

    const roomLabel =
      reservation.room?.number !== undefined && reservation.room.number !== ''
        ? `Room ${reservation.room.number}`
        : '—';

    return (
      <>
        <div className="backdrop-blur-xl bg-white/60 border border-white/70 flex flex-wrap gap-6 items-start justify-between p-6 rounded-3xl shadow-black/5 shadow-xl">
          <div>
            <p className="font-bold text-slate-500 text-xs tracking-wider uppercase">
              Guest
            </p>
            <p className="font-semibold mt-1 text-lg text-slate-900">
              {reservation.guest?.firstName} {reservation.guest?.lastName}
            </p>
            <p className="text-slate-500 text-sm">
              {reservation.confirmNumber}
            </p>
          </div>
          <div>
            <p className="font-bold text-slate-500 text-xs tracking-wider uppercase">
              Room
            </p>
            <p className="font-semibold mt-1 text-lg text-slate-900">
              {roomLabel}
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl shrink-0">
            <Link href={`/reservations/${reservationId}`}>
              View reservation
            </Link>
          </Button>
        </div>
        <FolioDetail reservationId={reservationId} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-[#1e4b8e] text-3xl">Billing</h1>
        <p className="mt-1 text-slate-600">
          Folio windows, balances, and charge / payment posting
        </p>
      </div>
      {renderMain()}
    </div>
  );
}
