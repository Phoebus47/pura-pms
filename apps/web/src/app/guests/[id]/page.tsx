'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Star, Ban, CheckCircle } from 'lucide-react';
import { guestsAPI, type Guest } from '@/lib/api';
import { Button } from '@/components/ui/button';

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
    if (!guest) return;

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
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading guest profile...</p>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
        <h3 className="font-semibold text-red-800">Error loading guest</h3>
        <p className="mt-2 text-red-600">{error || 'Guest not found'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

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
              {guest.firstName} {guest.lastName}
            </h1>
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
                      key={i}
                      className="fill-[#f5a623] h-4 text-[#f5a623] w-4"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
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
        </div>
      </div>

      {/* Guest Information */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Personal Info Card */}
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 lg:col-span-2 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-xl">
            Personal Information
          </h2>

          <div className="gap-6 grid grid-cols-2">
            <div>
              <label className="font-semibold text-slate-600 text-sm">
                First Name
              </label>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                {guest.firstName}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Last Name
              </label>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                {guest.lastName}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Email
              </label>
              <p className="mt-1 text-slate-700">{guest.email || '-'}</p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Phone
              </label>
              <p className="mt-1 text-slate-700">{guest.phone || '-'}</p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Nationality
              </label>
              <p className="mt-1 text-slate-700">{guest.nationality || '-'}</p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                ID Number
              </label>
              <p className="mt-1 text-slate-700">{guest.idNumber || '-'}</p>
            </div>
          </div>

          {guest.address && (
            <div className="border-slate-200 border-t mt-6 pt-6">
              <label className="font-semibold text-slate-600 text-sm">
                Address
              </label>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                {guest.address}
              </p>
            </div>
          )}

          {guest.notes && (
            <div className="border-slate-200 border-t mt-6 pt-6">
              <label className="font-semibold text-slate-600 text-sm">
                Notes
              </label>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                {guest.notes}
              </p>
            </div>
          )}
        </div>

        {/* Statistics Card */}
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-xl">
            Guest Statistics
          </h2>

          <div className="space-y-6">
            <div>
              <label className="font-semibold text-slate-600 text-sm">
                VIP Level
              </label>
              <div className="flex gap-1 items-center mt-2">
                {guest.vipLevel === 0 ? (
                  <span className="text-slate-500">Standard Guest</span>
                ) : (
                  Array.from({ length: guest.vipLevel }).map((_, i) => (
                    <Star
                      key={i}
                      className="fill-[#f5a623] h-6 text-[#f5a623] w-6"
                    />
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Total Stays
              </label>
              <p className="font-bold mt-1 text-[#1e4b8e] text-3xl">
                {guest.totalStays}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Total Revenue
              </label>
              <p className="font-bold mt-1 text-[#1e4b8e] text-3xl">
                ฿{Number(guest.totalRevenue).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Status
              </label>
              <div className="mt-2">
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
            </div>
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
              {new Date(guest.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-600">Last Updated:</span>{' '}
            <span className="font-medium text-slate-800">
              {new Date(guest.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
