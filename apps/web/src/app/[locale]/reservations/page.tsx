'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ReservationTable } from './reservation-table';
import { ReservationCards } from './reservation-cards';

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

  function openReservation(reservation: Reservation) {
    router.push(`/reservations/${reservation.id}`);
  }

  function openNewReservation() {
    router.push('/reservations/new');
  }

  if (loading) {
    return <LoadingSpinner message={t('reservations.list.loading')} />;
  }

  if (error) {
    return (
      <Panel className={cn('border', statusToneSurface.critical)}>
        <h2 className={cn('font-semibold text-lg', statusToneInk.critical)}>
          {t('reservations.list.errorTitle')}
        </h2>
        <p className={cn('mt-2 text-sm', statusToneInk.critical)}>{error}</p>
        <Button onClick={loadReservations} className="mt-4">
          {t('common.tryAgain')}
        </Button>
      </Panel>
    );
  }

  const newReservationButton = (
    <Button onClick={openNewReservation}>
      <Plus className="h-4 w-4" />
      <span className="hidden sm:inline">
        {t('reservations.list.newReservation')}
      </span>
      <span className="sm:hidden">{t('reservations.list.newShort')}</span>
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reservations.list.title')}
        subtitle={t('reservations.list.subtitle')}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push('/reservations/calendar')}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t('reservations.list.calendarView')}
              </span>
              <span className="sm:hidden">
                {t('reservations.list.calendarShort')}
              </span>
            </Button>
            {newReservationButton}
          </>
        }
      />

      {reservations.length === 0 ? (
        <Panel padding="none">
          <EmptyState
            icon={<Calendar className="h-12 w-12" />}
            title={t('reservations.list.emptyTitle')}
            description={t('reservations.list.emptyBody')}
            action={
              <Button onClick={openNewReservation}>
                <Plus className="h-4 w-4" />
                {t('reservations.list.newReservation')}
              </Button>
            }
          />
        </Panel>
      ) : (
        <>
          <Panel padding="none" className="hidden md:block overflow-hidden">
            <ReservationTable
              reservations={reservations}
              onSelect={openReservation}
            />
          </Panel>
          <ReservationCards
            reservations={reservations}
            onSelect={openReservation}
          />
        </>
      )}
    </div>
  );
}
