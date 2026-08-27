'use client';

import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { roomTypesAPI } from '@/lib/api/room-types';
import { t } from '@/lib/i18n';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { useRates } from '@/hooks/use-rates';
import { CreateRateForm } from './rate-create-form';
import { RateList } from './rate-list';

export function RatesClient() {
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: roomTypes = [] } = useQuery({
    queryKey: ['room-types', propertyId],
    queryFn: () => roomTypesAPI.getAll(propertyId),
    enabled: Boolean(propertyId),
  });
  const { data: rates = [] } = useRates(propertyId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title={t('rates.title')} subtitle={t('rates.subtitle')} />

      {propertyId ? (
        <Panel title={t('rates.create')}>
          <CreateRateForm
            propertyId={propertyId}
            roomTypes={roomTypes}
            rates={rates}
          />
        </Panel>
      ) : null}

      <Panel title={t('rates.list')}>
        <RateList rates={rates} />
      </Panel>
    </div>
  );
}
