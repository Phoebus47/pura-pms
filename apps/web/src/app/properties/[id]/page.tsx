'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
} from 'lucide-react';
import { propertiesAPI, type Property } from '@/lib/api';
import { Button } from '@/components/ui/button';

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
      setError(err instanceof Error ? err.message : 'Failed to load property');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 mr-2 w-4" />
          Back
        </Button>
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
          <h3 className="font-semibold text-red-800">Error loading property</h3>
          <p className="mt-2 text-red-600">{error || 'Property not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex gap-4 items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 mr-2 w-4" />
          Back
        </Button>
      </div>

      {/* Property Info Card */}
      <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-8 rounded-3xl shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex gap-4 items-center">
            <div className="bg-[#1e4b8e]/10 p-4 rounded-2xl">
              <Building2 className="h-10 text-[#1e4b8e] w-10" />
            </div>
            <div>
              <h1 className="font-bold text-[#1e4b8e] text-3xl">
                {property.name}
              </h1>
              <p className="mt-1 text-slate-600">
                {property.currency} • {property.timezone}
              </p>
            </div>
          </div>
          <Button className="bg-[#1e4b8e] hover:bg-[#153a6e]">
            Edit Property
          </Button>
        </div>

        {/* Details Grid */}
        <div className="gap-6 grid md:grid-cols-2 mt-8">
          {property.address && (
            <div className="flex gap-3">
              <MapPin className="h-5 mt-0.5 text-slate-400 w-5" />
              <div>
                <div className="font-semibold text-slate-700 text-sm">
                  Address
                </div>
                <div className="mt-1 text-slate-600">{property.address}</div>
              </div>
            </div>
          )}

          {property.phone && (
            <div className="flex gap-3">
              <Phone className="h-5 mt-0.5 text-slate-400 w-5" />
              <div>
                <div className="font-semibold text-slate-700 text-sm">
                  Phone
                </div>
                <div className="mt-1 text-slate-600">{property.phone}</div>
              </div>
            </div>
          )}

          {property.email && (
            <div className="flex gap-3">
              <Mail className="h-5 mt-0.5 text-slate-400 w-5" />
              <div>
                <div className="font-semibold text-slate-700 text-sm">
                  Email
                </div>
                <div className="mt-1 text-slate-600">{property.email}</div>
              </div>
            </div>
          )}

          {property.taxId && (
            <div className="flex gap-3">
              <FileText className="h-5 mt-0.5 text-slate-400 w-5" />
              <div>
                <div className="font-semibold text-slate-700 text-sm">
                  Tax ID
                </div>
                <div className="mt-1 text-slate-600">{property.taxId}</div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {property._count && (
          <div className="border-slate-200 border-t flex gap-8 mt-8 pt-6">
            <div>
              <div className="font-bold text-[#1e4b8e] text-3xl">
                {property._count.rooms}
              </div>
              <div className="mt-1 text-slate-600 text-sm">Total Rooms</div>
            </div>
            <div>
              <div className="font-bold text-[#f5a623] text-3xl">
                {property._count.roomTypes}
              </div>
              <div className="mt-1 text-slate-600 text-sm">Room Types</div>
            </div>
          </div>
        )}
      </div>

      {/* Rooms & Room Types sections would go here */}
      <div className="gap-6 grid lg:grid-cols-2">
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold text-slate-800 text-xl">Rooms</h2>
          <p className="mt-2 text-slate-600">Room management coming soon...</p>
        </div>
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold text-slate-800 text-xl">Room Types</h2>
          <p className="mt-2 text-slate-600">
            Room type management coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
