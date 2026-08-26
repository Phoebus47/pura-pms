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
import { t } from '@/lib/i18n';

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

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title={`${guest.firstName} ${guest.lastName}`}
        subtitle={
          <div className="flex gap-2 items-center mt-1">
            {guest.isBlacklist ? (
              <span className="font-semibold gap-1 inline-flex items-center text-red-600 text-sm">
                <Ban className="h-4 w-4" />
                {t('common.blacklisted')}
              </span>
            ) : (
              <span className="font-semibold gap-1 inline-flex items-center text-emerald-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                {t('common.activeGuest')}
              </span>
            )}
            {guest.vipLevel > 0 && (
              <div className="flex gap-1 items-center">
                {Array.from({ length: guest.vipLevel }).map((_, i) => (
                  <Star
                    key={`${guest.id}-vip-star-${i}`}
                    className="fill-pura-orange h-4 text-pura-orange w-4"
                  />
                ))}
              </div>
            )}
          </div>
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={toggleBlacklist}
              className={
                guest.isBlacklist
                  ? 'text-emerald-600 hover:bg-emerald-50'
                  : 'text-red-600 hover:bg-red-50'
              }
            >
              {guest.isBlacklist ? (
                <>
                  <CheckCircle className="h-4 mr-2 w-4" />
                  {t('common.removeFromBlacklist')}
                </>
              ) : (
                <>
                  <Ban className="h-4 mr-2 w-4" />
                  {t('common.addToBlacklist')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/guests/${guestId}/edit`)}
            >
              <Edit className="h-4 mr-2 w-4" />
              {t('common.edit')}
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="hover:bg-red-50 text-red-600"
            >
              <Trash2 className="h-4 mr-2 w-4" />
              {t('common.delete')}
            </Button>
          </>
        }
      />

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <div className="bg-white border border-slate-200 lg:col-span-2 p-6 rounded-xl shadow-sm">
          <h2 className="font-bold mb-6 text-pura-blue text-xl">
            {t('common.personalInfo')}
          </h2>

          <div className="gap-6 grid grid-cols-2">
            <DetailField
              label={t('common.firstName')}
              value={
                <p className="font-semibold text-lg text-slate-800">
                  {guest.firstName}
                </p>
              }
            />

            <DetailField
              label={t('common.lastName')}
              value={
                <p className="font-semibold text-lg text-slate-800">
                  {guest.lastName}
                </p>
              }
            />

            <DetailField
              label={t('common.email')}
              value={<p className="text-slate-700">{guest.email || '-'}</p>}
            />

            <DetailField
              label={t('common.phone')}
              value={<p className="text-slate-700">{guest.phone || '-'}</p>}
            />

            <DetailField
              label={t('common.nationality')}
              value={
                <p className="text-slate-700">{guest.nationality || '-'}</p>
              }
            />

            <DetailField
              label={t('common.idNumber')}
              value={<p className="text-slate-700">{guest.idNumber || '-'}</p>}
            />
          </div>

          {guest.address && (
            <div className="border-slate-200 border-t mt-6 pt-6">
              <p className="font-semibold text-slate-600 text-sm">
                {t('common.address')}
              </p>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                {guest.address}
              </p>
            </div>
          )}

          {guest.notes && (
            <div className="border-slate-200 border-t mt-6 pt-6">
              <p className="font-semibold text-slate-600 text-sm">
                {t('common.notes')}
              </p>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                {guest.notes}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="font-bold mb-6 text-pura-blue text-xl">
            {t('common.guestStatistics')}
          </h2>

          <div className="space-y-6">
            <DetailField
              label={t('common.vipLevel')}
              value={
                <div className="flex gap-1 items-center">
                  {guest.vipLevel === 0 ? (
                    <span className="text-slate-500">
                      {t('common.standardGuest')}
                    </span>
                  ) : (
                    Array.from({ length: guest.vipLevel }).map((_, i) => (
                      <Star
                        key={`${guest.id}-stats-star-${i}`}
                        className="fill-pura-orange h-6 text-pura-orange w-6"
                      />
                    ))
                  )}
                </div>
              }
            />

            <DetailField
              label={t('common.totalStays')}
              value={
                <p className="font-bold text-3xl text-pura-blue">
                  {guest.totalStays}
                </p>
              }
            />

            <DetailField
              label={t('common.totalRevenue')}
              value={
                <p className="font-bold text-3xl text-pura-blue">
                  ฿{Number(guest.totalRevenue).toLocaleString()}
                </p>
              }
            />

            <DetailField
              label={t('common.status')}
              value={
                <div>
                  {guest.isBlacklist ? (
                    <span className="bg-red-100 font-semibold gap-1 inline-flex items-center px-3 py-1.5 ring-1 ring-inset ring-red-600/20 rounded-full text-red-700 text-sm">
                      <Ban className="h-4 w-4" />
                      {t('common.blacklisted')}
                    </span>
                  ) : (
                    <span className="bg-emerald-100 font-semibold gap-1 inline-flex items-center px-3 py-1.5 ring-1 ring-emerald-600/20 ring-inset rounded-full text-emerald-700 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      {t('common.active')}
                    </span>
                  )}
                </div>
              }
            />
          </div>
        </div>
      </div>

      <MetadataCard createdAt={guest.createdAt} updatedAt={guest.updatedAt} />
    </div>
  );
}
