'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ExternalLink, Receipt } from 'lucide-react';
import { FolioDetail } from '@/components/folio-detail';
import { Button } from '@/components/ui/button';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { t } from '@/lib/i18n';

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
        err instanceof Error
          ? err.message
          : t('billing.loadReservationFailed'),
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
        <div className="bg-white border border-slate-200 p-10 rounded-xl text-center">
          <Receipt className="h-14 mb-4 mx-auto text-slate-300 w-14" />
          <h2 className="font-semibold text-slate-800 text-xl">
            {t('billing.selectReservation')}
          </h2>
          <p className="max-w-md mt-2 mx-auto text-slate-600 text-sm">
            {t('billing.selectReservationBody')}{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">
              {t('billing.urlHint')}
            </code>{' '}
            {t('billing.urlHintSuffix')}
          </p>
          <Button asChild className="mt-6">
            <Link href="/reservations">
              <ExternalLink className="h-4 mr-2 w-4" />
              {t('billing.goToReservations')}
            </Link>
          </Button>
        </div>
      );
    }
    if (loadingRes) {
      return (
        <div className="bg-white border border-slate-200 flex flex-col h-48 items-center justify-center rounded-xl">
          <div className="animate-spin border-b-2 border-pura-blue h-10 rounded-full w-10" />
          <p className="mt-4 text-slate-600">{t('billing.loadingReservation')}</p>
        </div>
      );
    }
    if (resError !== null || reservation === null) {
      const message = resError ?? t('billing.reservationNotFound');
      return (
        <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-center">
          <p className="font-semibold text-red-800">{message}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/reservations">{t('billing.backToReservations')}</Link>
          </Button>
        </div>
      );
    }

    const roomLabel =
      reservation.room?.number !== undefined && reservation.room.number !== ''
        ? `${t('common.roomLabel')} ${reservation.room.number}`
        : '—';

    return (
      <>
        <div className="bg-white border border-slate-200 flex flex-wrap gap-6 items-start justify-between p-6 rounded-xl shadow-sm">
          <div>
            <p className="font-bold text-slate-500 text-xs tracking-wider uppercase">
              {t('billing.guest')}
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
              {t('billing.room')}
            </p>
            <p className="font-semibold mt-1 text-lg text-slate-900">
              {roomLabel}
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href={`/reservations/${reservationId}`}>
              {t('billing.viewReservation')}
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
        <h1 className="font-bold text-3xl text-pura-blue">{t('billing.title')}</h1>
        <p className="mt-1 text-slate-600">{t('billing.subtitle')}</p>
      </div>
      {renderMain()}
    </div>
  );
}
