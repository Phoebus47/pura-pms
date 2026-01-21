"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Star, Ban, CheckCircle } from "lucide-react";
import { guestsAPI, type Guest } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function GuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const guestId = params.id as string;

  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGuest();
  }, [guestId]);

  async function loadGuest() {
    try {
      setLoading(true);
      setError(null);
      const data = await guestsAPI.getById(guestId);
      setGuest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guest");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this guest?")) return;

    try {
      await guestsAPI.delete(guestId);
      router.push("/guests");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete guest");
    }
  }

  async function toggleBlacklist() {
    if (!guest) return;

    try {
      await guestsAPI.toggleBlacklist(guestId);
      loadGuest(); // Reload to get updated data
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update blacklist status",
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b8e] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading guest profile...</p>
        </div>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
        <h3 className="text-red-800 font-semibold">Error loading guest</h3>
        <p className="text-red-600 mt-2">{error || "Guest not found"}</p>
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
              {guest.firstName} {guest.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {guest.isBlacklist ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600">
                  <Ban className="h-4 w-4" />
                  Blacklisted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  Active Guest
                </span>
              )}
              {guest.vipLevel > 0 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: guest.vipLevel }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-[#f5a623] text-[#f5a623]"
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
            className={`rounded-xl ${guest.isBlacklist ? "text-emerald-600 hover:bg-emerald-50" : "text-red-600 hover:bg-red-50"}`}
          >
            {guest.isBlacklist ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Remove from Blacklist
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Add to Blacklist
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/guests/${guestId}/edit`)}
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

      {/* Guest Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info Card */}
        <div className="lg:col-span-2 rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-[#1e4b8e] mb-6">
            Personal Information
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-600">
                First Name
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {guest.firstName}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Last Name
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {guest.lastName}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Email
              </label>
              <p className="text-slate-700 mt-1">{guest.email || "-"}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Phone
              </label>
              <p className="text-slate-700 mt-1">{guest.phone || "-"}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Nationality
              </label>
              <p className="text-slate-700 mt-1">{guest.nationality || "-"}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                ID Number
              </label>
              <p className="text-slate-700 mt-1">{guest.idNumber || "-"}</p>
            </div>
          </div>

          {guest.address && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <label className="text-sm font-semibold text-slate-600">
                Address
              </label>
              <p className="text-slate-700 mt-2 whitespace-pre-wrap">
                {guest.address}
              </p>
            </div>
          )}

          {guest.notes && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <label className="text-sm font-semibold text-slate-600">
                Notes
              </label>
              <p className="text-slate-700 mt-2 whitespace-pre-wrap">
                {guest.notes}
              </p>
            </div>
          )}
        </div>

        {/* Statistics Card */}
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-[#1e4b8e] mb-6">
            Guest Statistics
          </h2>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-slate-600">
                VIP Level
              </label>
              <div className="flex items-center gap-1 mt-2">
                {guest.vipLevel === 0 ? (
                  <span className="text-slate-500">Standard Guest</span>
                ) : (
                  Array.from({ length: guest.vipLevel }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-6 w-6 fill-[#f5a623] text-[#f5a623]"
                    />
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Total Stays
              </label>
              <p className="text-3xl font-bold text-[#1e4b8e] mt-1">
                {guest.totalStays}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Total Revenue
              </label>
              <p className="text-3xl font-bold text-[#1e4b8e] mt-1">
                ฿{Number(guest.totalRevenue).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Status
              </label>
              <div className="mt-2">
                {guest.isBlacklist ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20">
                    <Ban className="h-4 w-4" />
                    Blacklisted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
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
      <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#1e4b8e] mb-4">Metadata</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Created:</span>{" "}
            <span className="text-slate-800 font-medium">
              {new Date(guest.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-600">Last Updated:</span>{" "}
            <span className="text-slate-800 font-medium">
              {new Date(guest.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
