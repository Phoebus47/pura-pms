'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit, Trash2, Star, Ban, CheckCircle } from 'lucide-react';
import { guestsAPI, type Guest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { DetailPageError } from '@/components/shared/detail-page-error';
import { DetailPageHeader } from '@/components/shared/detail-page-header';
import { MetadataCard } from '@/components/shared/metadata-card';
import { DetailField } from '@/components/shared/detail-field';
import { Panel } from '@/components/shared/panel';
import { StatusBadge } from '@/components/shared/status-badge';
import { statusToneInk } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

function VipStars({
  guest,
  size,
}: {
  readonly guest: Guest;
  readonly size: string;
}) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: guest.vipLevel }).map((_, index) => (
        <Star
          key={`${guest.id}-star-${index}`}
          className={cn('fill-pura-orange text-pura-orange', size)}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function GuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const guestId = params.id as string;

  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGuest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await guestsAPI.getById(guestId);
      setGuest(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('common.failedToLoadGuest'),
      );
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  useEffect(() => {
    loadGuest();
  }, [loadGuest]);

  async function handleDelete() {
    if (!confirm(t('common.deleteGuestConfirm'))) return;

    try {
      await guestsAPI.delete(guestId);
      router.push('/guests');
    } catch (err) {
      alert(
        err instanceof Error ? err.message : t('common.failedToDeleteGuest'),
      );
    }
  }

  async function toggleBlacklist() {
    try {
      await guestsAPI.toggleBlacklist(guestId);
      loadGuest();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : t('common.failedToUpdateBlacklist'),
      );
    }
  }

  if (loading) {
    return <LoadingSpinner message={t('common.loadingGuestProfile')} />;
  }

  if (error || !guest) {
    return (
      <DetailPageError
        title={t('common.errorLoadingGuest')}
        message={error || t('common.guestNotFound')}
      />
    );
  }

  const isBlacklisted = guest.isBlacklist;

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title={`${guest.firstName} ${guest.lastName}`}
        subtitle={
          <div className="flex gap-2 items-center">
            <span
              className={cn(
                'font-semibold gap-1 inline-flex items-center text-sm',
                isBlacklisted ? statusToneInk.critical : statusToneInk.positive,
              )}
            >
              {isBlacklisted ? (
                <Ban className="h-4 w-4" aria-hidden="true" />
              ) : (
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
              )}
              {isBlacklisted
                ? t('common.blacklisted')
                : t('common.activeGuest')}
            </span>
            {guest.vipLevel > 0 && <VipStars guest={guest} size="h-4 w-4" />}
          </div>
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={toggleBlacklist}
              className={cn(
                isBlacklisted
                  ? 'hover:bg-status-positive-tint text-status-positive-ink'
                  : 'hover:bg-status-critical-tint text-status-critical-ink',
              )}
            >
              {isBlacklisted ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {t('common.removeFromBlacklist')}
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  {t('common.addToBlacklist')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/guests/${guestId}/edit`)}
            >
              <Edit className="h-4 w-4" />
              {t('common.edit')}
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="hover:bg-status-critical-tint text-status-critical-ink"
            >
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          </>
        }
      />

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <Panel
          title={t('common.personalInfo')}
          padding="lg"
          className="lg:col-span-2"
        >
          <div className="gap-6 grid grid-cols-2">
            <DetailField
              label={t('common.firstName')}
              value={
                <p className="font-semibold text-ink-strong text-lg">
                  {guest.firstName}
                </p>
              }
            />

            <DetailField
              label={t('common.lastName')}
              value={
                <p className="font-semibold text-ink-strong text-lg">
                  {guest.lastName}
                </p>
              }
            />

            <DetailField
              label={t('common.email')}
              value={<p className="text-ink-default">{guest.email || '-'}</p>}
            />

            <DetailField
              label={t('common.phone')}
              value={<p className="text-ink-default">{guest.phone || '-'}</p>}
            />

            <DetailField
              label={t('common.nationality')}
              value={
                <p className="text-ink-default">{guest.nationality || '-'}</p>
              }
            />

            <DetailField
              label={t('common.idNumber')}
              value={
                <p className="text-ink-default">{guest.idNumber || '-'}</p>
              }
            />
          </div>

          {guest.address && (
            <div className="border-rule-mist border-t mt-6 pt-6">
              <p className="font-semibold text-ink-subtle text-sm">
                {t('common.address')}
              </p>
              <p className="mt-2 text-ink-default whitespace-pre-wrap">
                {guest.address}
              </p>
            </div>
          )}

          {guest.notes && (
            <div className="border-rule-mist border-t mt-6 pt-6">
              <p className="font-semibold text-ink-subtle text-sm">
                {t('common.notes')}
              </p>
              <p className="mt-2 text-ink-default whitespace-pre-wrap">
                {guest.notes}
              </p>
            </div>
          )}
        </Panel>

        <Panel title={t('common.guestStatistics')} padding="lg">
          <div className="space-y-6">
            <DetailField
              label={t('common.vipLevel')}
              value={
                guest.vipLevel === 0 ? (
                  <span className="text-ink-subtle">
                    {t('common.standardGuest')}
                  </span>
                ) : (
                  <VipStars guest={guest} size="h-6 w-6" />
                )
              }
            />

            <DetailField
              label={t('common.totalStays')}
              value={
                <p className="font-bold tabular-nums text-2xl text-pura-blue">
                  {guest.totalStays}
                </p>
              }
            />

            <DetailField
              label={t('common.totalRevenue')}
              value={
                <p className="font-bold tabular-nums text-2xl text-pura-blue">
                  ฿{Number(guest.totalRevenue).toLocaleString()}
                </p>
              }
            />

            <DetailField
              label={t('common.status')}
              value={
                isBlacklisted ? (
                  <StatusBadge
                    tone="critical"
                    label={t('common.blacklisted')}
                    icon={<Ban className="h-4 w-4" aria-hidden="true" />}
                  />
                ) : (
                  <StatusBadge
                    tone="positive"
                    label={t('common.active')}
                    icon={
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    }
                  />
                )
              }
            />
          </div>
        </Panel>
      </div>

      <MetadataCard createdAt={guest.createdAt} updatedAt={guest.updatedAt} />
    </div>
  );
}
