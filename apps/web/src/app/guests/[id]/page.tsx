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
      setError(err instanceof Error ? err.message : 'Failed to load guest');
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  useEffect(() => {
    loadGuest();
  }, [loadGuest]);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this guest?')) return;

    try {
      await guestsAPI.delete(guestId);
      router.push('/guests');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete guest');
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
          : 'Failed to update blacklist status',
      );
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading guest profile..." />;
  }

  if (error || !guest) {
    return (
      <DetailPageError
        title="Error loading guest"
        message={error || 'Guest not found'}
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
                Blacklisted
              </span>
            ) : (
              <span className="font-semibold gap-1 inline-flex items-center text-emerald-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Active Guest
              </span>
            )}
            {guest.vipLevel > 0 && (
              <div className="flex gap-1 items-center">
                {Array.from({ length: guest.vipLevel }).map((_, i) => (
                  <Star
                    key={`${guest.id}-vip-star-${i}`}
                    className="fill-[#f5a623] h-4 text-[#f5a623] w-4"
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
              className={`rounded-xl ${guest.isBlacklist ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-600 hover:bg-red-50'}`}
            >
              {guest.isBlacklist ? (
                <>
                  <CheckCircle className="h-4 mr-2 w-4" />
                  Remove from Blacklist
                </>
              ) : (
                <>
                  <Ban className="h-4 mr-2 w-4" />
                  Add to Blacklist
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/guests/${guestId}/edit`)}
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
          </>
        }
      />

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 lg:col-span-2 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-xl">
            Personal Information
          </h2>

          <div className="gap-6 grid grid-cols-2">
            <DetailField
              label="First Name"
              value={
                <p className="font-semibold text-lg text-slate-800">
                  {guest.firstName}
                </p>
              }
            />

            <DetailField
              label="Last Name"
              value={
                <p className="font-semibold text-lg text-slate-800">
                  {guest.lastName}
                </p>
              }
            />

            <DetailField
              label="Email"
              value={<p className="text-slate-700">{guest.email || '-'}</p>}
            />

            <DetailField
              label="Phone"
              value={<p className="text-slate-700">{guest.phone || '-'}</p>}
            />

            <DetailField
              label="Nationality"
              value={
                <p className="text-slate-700">{guest.nationality || '-'}</p>
              }
            />

            <DetailField
              label="ID Number"
              value={<p className="text-slate-700">{guest.idNumber || '-'}</p>}
            />
          </div>

          {guest.address && (
            <div className="border-slate-200 border-t mt-6 pt-6">
              <p className="font-semibold text-slate-600 text-sm">Address</p>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                {guest.address}
              </p>
            </div>
          )}

          {guest.notes && (
            <div className="border-slate-200 border-t mt-6 pt-6">
              <p className="font-semibold text-slate-600 text-sm">Notes</p>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                {guest.notes}
              </p>
            </div>
          )}
        </div>

        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-xl">
            Guest Statistics
          </h2>

          <div className="space-y-6">
            <DetailField
              label="VIP Level"
              value={
                <div className="flex gap-1 items-center">
                  {guest.vipLevel === 0 ? (
                    <span className="text-slate-500">Standard Guest</span>
                  ) : (
                    Array.from({ length: guest.vipLevel }).map((_, i) => (
                      <Star
                        key={`${guest.id}-stats-star-${i}`}
                        className="fill-[#f5a623] h-6 text-[#f5a623] w-6"
                      />
                    ))
                  )}
                </div>
              }
            />

            <DetailField
              label="Total Stays"
              value={
                <p className="font-bold text-[#1e4b8e] text-3xl">
                  {guest.totalStays}
                </p>
              }
            />

            <DetailField
              label="Total Revenue"
              value={
                <p className="font-bold text-[#1e4b8e] text-3xl">
                  ฿{Number(guest.totalRevenue).toLocaleString()}
                </p>
              }
            />

            <DetailField
              label="Status"
              value={
                <div>
                  {guest.isBlacklist ? (
                    <span className="bg-red-100 font-semibold gap-1 inline-flex items-center px-3 py-1.5 ring-1 ring-inset ring-red-600/20 rounded-full text-red-700 text-sm">
                      <Ban className="h-4 w-4" />
                      Blacklisted
                    </span>
                  ) : (
                    <span className="bg-emerald-100 font-semibold gap-1 inline-flex items-center px-3 py-1.5 ring-1 ring-emerald-600/20 ring-inset rounded-full text-emerald-700 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Active
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
