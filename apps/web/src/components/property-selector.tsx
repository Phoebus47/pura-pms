'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { propertiesAPI, type Property } from '@/lib/api';
import { toast } from '@/lib/toast';

interface PropertySelectorProps {
  readonly id?: string;
  readonly value: string;
  readonly onChange: (propertyId: string) => void;
  readonly required?: boolean;
}

export function PropertySelector({
  id,
  value,
  onChange,
  required = false,
}: PropertySelectorProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      const data = await propertiesAPI.getAll();
      setProperties(data);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="relative">
        <Building2 className="-translate-y-1/2 absolute h-5 left-3 text-slate-400 top-1/2 w-5" />
        <div className="bg-slate-50 border border-slate-300 pl-10 pr-4 py-3 rounded-xl text-slate-400 w-full">
          Loading properties...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Building2 className="-translate-y-1/2 absolute h-5 left-3 pointer-events-none text-slate-400 top-1/2 w-5 z-10" />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="appearance-none bg-white border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none pl-10 pr-4 py-3 rounded-xl transition-all w-full"
      >
        <option value="">Select a property</option>
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.name}
          </option>
        ))}
      </select>
      <div className="-translate-y-1/2 absolute pointer-events-none right-3 top-1/2">
        <svg
          className="h-5 text-slate-400 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
