'use client';

import { Building2, Pencil, Trash2 } from 'lucide-react';
import { type Property } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/shared/panel';
import { formatMessage, t } from '@/lib/i18n';

interface PropertyCardProps {
  readonly property: Property;
  readonly onView: (property: Property) => void;
  readonly onEdit: (property: Property) => void;
  readonly onDelete: (property: Property) => void;
}

function CountFigure({
  value,
  label,
  ink,
}: {
  readonly value: number;
  readonly label: string;
  readonly ink: string;
}) {
  return (
    <div className="text-center">
      <div className={`font-bold tabular-nums text-2xl ${ink}`}>{value}</div>
      <div className="text-ink-subtle text-xs">{label}</div>
    </div>
  );
}

export function PropertyCard({
  property,
  onView,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  return (
    <Panel padding="lg" className="hover:border-rule-strong transition-colors">
      <div className="flex gap-3 items-center">
        <span className="bg-pura-blue/10 p-3 rounded-lg">
          <Building2 className="h-6 text-pura-blue w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold text-ink-strong text-lg truncate">
            {property.name}
          </h2>
          <p className="text-ink-subtle text-xs">
            {property.currency} • {property.timezone}
          </p>
        </div>
      </div>

      {property.address && (
        <p className="line-clamp-2 mt-4 text-ink-subtle text-sm">
          {property.address}
        </p>
      )}

      {property._count && (
        <div className="flex gap-4 mt-4">
          <CountFigure
            value={property._count.rooms}
            label={t('properties.rooms')}
            ink="text-pura-blue"
          />
          <CountFigure
            value={property._count.roomTypes}
            label={t('properties.types')}
            ink="text-signal-ink"
          />
        </div>
      )}

      <div className="flex gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView(property)}
        >
          {t('properties.viewDetails')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(property)}
          aria-label={formatMessage('properties.editAria', {
            name: property.name,
          })}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-status-critical-tint text-status-critical-ink"
          onClick={() => onDelete(property)}
          aria-label={formatMessage('properties.deleteAria', {
            name: property.name,
          })}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Panel>
  );
}
