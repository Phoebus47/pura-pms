'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { DayUseBadge } from '@/components/day-use-badge';
import { StayPurposeBadge } from '@/components/stay-purpose-badge';
import { BillingCycleBadge } from '@/components/billing-cycle-badge';
import { TaxExemptBadge } from '@/components/tax-exempt-badge';
import { RoomLockBadge } from '@/components/room-lock-badge';
import { SplitStayBadge } from '@/components/split-stay-badge';
import { isSplitStay } from '@/lib/split-stay';
import { getDateLocale, t } from '@/lib/i18n';
import { FolioDetail } from '@/components/folio-detail';
import { RoomMovePanel } from '@/components/room-move-panel';
import { WalkPanel } from '@/components/walk-panel';
import { RegistrationCardPanel } from '@/components/registration-card-panel';
import { WakeUpCallPanel } from '@/components/wake-up-call-panel';
import { DigitalKeyPanel } from '@/components/digital-key-panel';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';
import { ReservationDetailActions } from './reservation-detail-actions';
import { ReservationDetailInfo } from './reservation-detail-info';
import { ReservationDetailPricing } from './reservation-detail-pricing';

const TAB_BASE =
  'border-b-2 font-semibold min-h-11 px-4 text-sm transition-colors';
const TAB_ACTIVE = 'border-pura-blue text-pura-blue';
const TAB_IDLE = 'border-transparent hover:text-ink-strong text-ink-subtle';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'billing'>('details');

  const loadReservation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationsAPI.getById(reservationId);
      setReservation(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('reservations.detail.loadFailed'),
      );
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  async function handleCheckIn() {
    if (!confirm(t('reservations.detail.confirmCheckIn'))) return;

    try {
      await reservationsAPI.checkIn(reservationId);
      loadReservation();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : t('reservations.detail.checkInFailed'),
      );
    }
  }

  async function handleCheckOut() {
    if (!confirm(t('reservations.detail.confirmCheckOut'))) return;

    try {
      await reservationsAPI.checkOut(reservationId);
      loadReservation();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : t('reservations.detail.checkOutFailed'),
      );
    }
  }

  async function handleCancel() {
    const reason = prompt(t('reservations.detail.cancelReasonPrompt'));
    if (!reason) return;

    try {
      await reservationsAPI.cancel(reservationId, reason);
      loadReservation();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : t('reservations.detail.cancelFailed'),
      );
    }
  }

  async function handleDelete() {
    if (!confirm(t('reservations.detail.deleteConfirm'))) return;

    try {
      await reservationsAPI.delete(reservationId);
      router.push('/reservations');
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : t('reservations.detail.deleteFailed'),
      );
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(getDateLocale(), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (loading) {
    return <LoadingSpinner message={t('reservations.detail.loading')} />;
  }

  if (error || !reservation) {
    return (
      <Panel className={cn('border', statusToneSurface.critical)}>
        <h2 className={cn('font-semibold text-lg', statusToneInk.critical)}>
          {t('reservations.detail.errorTitle')}
        </h2>
        <p className={cn('mt-2 text-sm', statusToneInk.critical)}>
          {error || t('reservations.detail.notFound')}
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          {t('common.goBack')}
        </Button>
      </Panel>
    );
  }

  const isCheckedIn = reservation.status === 'CHECKED_IN';
  const isBookable = ['CONFIRMED', 'CHECKED_IN'].includes(reservation.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={reservation.confirmNumber}
        onBack={() => router.back()}
        actions={
          <ReservationDetailActions
            reservation={reservation}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onCancel={handleCancel}
            onEdit={() => router.push(`/reservations/${reservationId}/edit`)}
            onDelete={handleDelete}
            onReload={loadReservation}
          />
        }
      />

      <div className="flex flex-wrap gap-2 items-center">
        <ReservationStatusBadge status={reservation.status} />
        {reservation.isDayUse ? <DayUseBadge /> : null}
        <StayPurposeBadge stayPurpose={reservation.stayPurpose} />
        <BillingCycleBadge billingCycle={reservation.billingCycle} />
        <TaxExemptBadge taxExempt={reservation.taxExempt} />
        <RoomLockBadge isRoomLocked={reservation.isRoomLocked} />
        {isSplitStay(reservation) ? <SplitStayBadge /> : null}
      </div>

      <div className="border-b border-rule-mist flex gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={cn(
            TAB_BASE,
            activeTab === 'details' ? TAB_ACTIVE : TAB_IDLE,
          )}
        >
          {t('reservations.detail.tabDetails')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={cn(
            TAB_BASE,
            activeTab === 'billing' ? TAB_ACTIVE : TAB_IDLE,
          )}
        >
          {t('reservations.detail.tabBilling')}
        </button>
      </div>

      {activeTab === 'details' ? (
        <div className="space-y-6">
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
            <ReservationDetailInfo
              reservation={reservation}
              formatDate={formatDate}
            />
            <ReservationDetailPricing reservation={reservation} />
          </div>

          {isCheckedIn ? (
            <RoomMovePanel
              reservation={reservation}
              onMoved={loadReservation}
            />
          ) : null}

          {reservation.status === 'CONFIRMED' ? (
            <WalkPanel reservation={reservation} onWalked={loadReservation} />
          ) : null}

          {isBookable ? (
            <>
              <RegistrationCardPanel reservation={reservation} />
              <WakeUpCallPanel reservation={reservation} />
              <DigitalKeyPanel reservation={reservation} />
            </>
          ) : null}

          <Panel title={t('reservations.detail.metadata')} padding="lg">
            <div className="gap-4 grid grid-cols-2 text-sm">
              <div>
                <span className="text-ink-subtle">
                  {t('reservations.detail.created')}
                </span>{' '}
                <span className="font-medium text-ink-strong">
                  {new Date(reservation.createdAt).toLocaleString(
                    getDateLocale(),
                  )}
                </span>
              </div>
              <div>
                <span className="text-ink-subtle">
                  {t('reservations.detail.lastUpdated')}
                </span>{' '}
                <span className="font-medium text-ink-strong">
                  {new Date(reservation.updatedAt).toLocaleString(
                    getDateLocale(),
                  )}
                </span>
              </div>
            </div>
          </Panel>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button asChild variant="outline">
              <Link href={`/billing?reservationId=${reservationId}`}>
                {t('reservations.detail.openBillingDashboard')}
              </Link>
            </Button>
          </div>
          <FolioDetail reservationId={reservationId} />
        </div>
      )}
    </div>
  );
}
