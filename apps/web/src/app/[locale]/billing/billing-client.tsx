'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ExternalLink, Receipt } from 'lucide-react';
import { FolioDetail } from '@/components/folio-detail';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

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
        err instanceof Error ? err.message : t('billing.loadReservationFailed'),
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
        <Panel padding="lg">
          <EmptyState
            icon={<Receipt className="h-14 w-14" />}
            title={t('billing.selectReservation')}
            description={`${t('billing.selectReservationBody')} ${t('billing.urlHint')} ${t('billing.urlHintSuffix')}`}
            action={
              <Button asChild>
                <Link href="/reservations">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {t('billing.goToReservations')}
                </Link>
              </Button>
            }
          />
        </Panel>
      );
    }
    if (loadingRes) {
      return <LoadingSpinner message={t('billing.loadingReservation')} />;
    }
    if (resError !== null || reservation === null) {
      const message = resError ?? t('billing.reservationNotFound');
      return (
        <Panel
          padding="lg"
          className={cn('text-center', statusToneSurface.critical)}
        >
          <p className={cn('font-semibold', statusToneInk.critical)}>
            {message}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/reservations">{t('billing.backToReservations')}</Link>
          </Button>
        </Panel>
      );
    }

    const roomLabel =
      reservation.room?.number !== undefined && reservation.room.number !== ''
        ? `${t('common.roomLabel')} ${reservation.room.number}`
        : '—';

    return (
      <>
        <Panel padding="lg">
          <div className="flex flex-wrap gap-6 items-start justify-between">
            <div>
              <p className="font-semibold text-2xs text-ink-subtle tracking-wide uppercase">
                {t('billing.guest')}
              </p>
              <p className="font-semibold mt-1 text-ink-strong text-lg">
                {reservation.guest?.firstName} {reservation.guest?.lastName}
              </p>
              <p className="text-ink-subtle text-sm">
                {reservation.confirmNumber}
              </p>
            </div>
            <div>
              <p className="font-semibold text-2xs text-ink-subtle tracking-wide uppercase">
                {t('billing.room')}
              </p>
              <p className="font-semibold mt-1 text-ink-strong text-lg">
                {roomLabel}
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href={`/reservations/${reservationId}`}>
                {t('billing.viewReservation')}
              </Link>
            </Button>
          </div>
        </Panel>
        <FolioDetail reservationId={reservationId} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('billing.title')} subtitle={t('billing.subtitle')} />
      {renderMain()}
    </div>
  );
}
