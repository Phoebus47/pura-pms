'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, FileText } from 'lucide-react';
import type { ReactNode } from 'react';
import { propertiesAPI, type Property } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { StatTile } from '@/components/shared/stat-tile';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';

function ContactRow({
  icon,
  label,
  value,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-ink-subtle" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-semibold text-ink-strong text-sm">{label}</div>
        <div className="mt-1 text-ink-default text-sm">{value}</div>
      </div>
    </div>
  );
}

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
    return <LoadingSpinner message="Loading property..." />;
  }

  if (error || !property) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Panel className={cn('border', statusToneSurface.critical)}>
          <h2 className={cn('font-semibold text-lg', statusToneInk.critical)}>
            Error loading property
          </h2>
          <p className={cn('mt-2 text-sm', statusToneInk.critical)}>
            {error || 'Property not found'}
          </p>
        </Panel>
      </div>
    );
  }

  const iconClass = 'h-5 w-5';

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.name}
        subtitle={`${property.currency} • ${property.timezone}`}
        onBack={() => router.back()}
        actions={<Button>Edit Property</Button>}
      />

      <Panel padding="lg">
        <div className="gap-6 grid md:grid-cols-2">
          {property.address && (
            <ContactRow
              icon={<MapPin className={iconClass} />}
              label="Address"
              value={property.address}
            />
          )}
          {property.phone && (
            <ContactRow
              icon={<Phone className={iconClass} />}
              label="Phone"
              value={property.phone}
            />
          )}
          {property.email && (
            <ContactRow
              icon={<Mail className={iconClass} />}
              label="Email"
              value={property.email}
            />
          )}
          {property.taxId && (
            <ContactRow
              icon={<FileText className={iconClass} />}
              label="Tax ID"
              value={property.taxId}
            />
          )}
        </div>
      </Panel>

      {property._count && (
        <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
          <StatTile label="Total Rooms" value={property._count.rooms} />
          <StatTile
            label="Room Types"
            value={property._count.roomTypes}
            tone="caution"
          />
        </div>
      )}

      <div className="gap-6 grid lg:grid-cols-2">
        <Panel title="Rooms" padding="lg">
          <p className="text-ink-subtle text-sm">
            Room management coming soon...
          </p>
        </Panel>
        <Panel title="Room Types" padding="lg">
          <p className="text-ink-subtle text-sm">
            Room type management coming soon...
          </p>
        </Panel>
      </div>
    </div>
  );
}
