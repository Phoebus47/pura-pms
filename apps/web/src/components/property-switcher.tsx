'use client';

import { useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { propertiesAPI, type Property } from '@/lib/api/properties';
import { useUIStore } from '@/lib/stores/use-ui-store';
import { cn } from '@/lib/utils';

interface PropertySwitcherProps {
  readonly className?: string;
  readonly showLabel?: boolean;
}

export function PropertySwitcher({
  className,
  showLabel = false,
}: PropertySwitcherProps) {
  const t = useTranslations('property');
  const activePropertyId = useUIStore((state) => state.activePropertyId);
  const setActivePropertyId = useUIStore((state) => state.setActivePropertyId);

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });

  useEffect(() => {
    if (!activePropertyId && properties.length > 0) {
      setActivePropertyId(properties[0].id);
    }
  }, [activePropertyId, properties, setActivePropertyId]);

  const currentProperty =
    properties.find((p) => p.id === activePropertyId) ?? properties[0];

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="group"
      aria-label={t('label')}
    >
      {showLabel ? (\n        <label
          htmlFor="property-select"
          className="flex font-medium gap-1.5 items-center text-slate-600 text-xs"
        >
          <Building2 className="h-3.5 text-muted-foreground w-3.5" />
          <span>{t('label')}</span>
        </label>
      ) : null}

      <div className="flex items-center relative">
        <Building2 className="absolute h-4 left-2.5 pointer-events-none text-pura-blue w-4" />
        <select
          id="property-select"
          name="propertyId"
          value={activePropertyId ?? currentProperty?.id ?? ''}
          onChange={(e) => setActivePropertyId(e.target.value)}
          disabled={isLoading || properties.length === 0}
          aria-label={t('select')}
          className="bg-white border border-slate-200 cursor-pointer disabled:opacity-50 focus:border-pura-blue focus:outline-none focus:ring-2 focus:ring-pura-blue/20 font-medium h-10 min-h-10 pl-8 pr-7 py-1.5 rounded-lg sm:text-sm text-slate-800 text-xs transition-all"
        >
          {properties.length === 0 ? (
            <option value="">{isLoading ? '...' : t('select')}</option>
          ) : (
            properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name} ({property.currency})
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
