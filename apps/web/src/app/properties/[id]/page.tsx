"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { propertiesAPI, type Property } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadProperty(params.id as string);
    }
  }, [params.id]);

  async function loadProperty(id: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesAPI.getById(id);
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load property");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b8e] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
          <h3 className="text-red-800 font-semibold">Error loading property</h3>
          <p className="text-red-600 mt-2">{error || "Property not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Property Info Card */}
      <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#1e4b8e]/10 p-4">
              <Building2 className="h-10 w-10 text-[#1e4b8e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1e4b8e]">
                {property.name}
              </h1>
              <p className="text-slate-600 mt-1">
                {property.currency} • {property.timezone}
              </p>
            </div>
          </div>
          <Button className="bg-[#1e4b8e] hover:bg-[#153a6e]">
            Edit Property
          </Button>
        </div>

        {/* Details Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {property.address && (
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-700">
                  Address
                </div>
                <div className="text-slate-600 mt-1">{property.address}</div>
              </div>
            </div>
          )}

          {property.phone && (
            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-700">
                  Phone
                </div>
                <div className="text-slate-600 mt-1">{property.phone}</div>
              </div>
            </div>
          )}

          {property.email && (
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-700">
                  Email
                </div>
                <div className="text-slate-600 mt-1">{property.email}</div>
              </div>
            </div>
          )}

          {property.taxId && (
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-700">
                  Tax ID
                </div>
                <div className="text-slate-600 mt-1">{property.taxId}</div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {property._count && (
          <div className="mt-8 pt-6 border-t border-slate-200 flex gap-8">
            <div>
              <div className="text-3xl font-bold text-[#1e4b8e]">
                {property._count.rooms}
              </div>
              <div className="text-sm text-slate-600 mt-1">Total Rooms</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#f5a623]">
                {property._count.roomTypes}
              </div>
              <div className="text-sm text-slate-600 mt-1">Room Types</div>
            </div>
          </div>
        )}
      </div>

      {/* Rooms & Room Types sections would go here */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-slate-800">Rooms</h2>
          <p className="text-slate-600 mt-2">Room management coming soon...</p>
        </div>
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-slate-800">Room Types</h2>
          <p className="text-slate-600 mt-2">
            Room type management coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
