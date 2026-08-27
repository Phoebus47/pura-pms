'use client';

import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { usePartnerHotels } from '@/hooks/use-partner-hotels';
import {
  CreatePartnerHotelForm,
  PartnerHotelList,
} from './partner-hotel-panels';

export function PartnerHotelsClient() {
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: hotels = [] } = usePartnerHotels(propertyId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={t('partnerHotels.title')}
        subtitle={t('partnerHotels.subtitle')}
      />

      {propertyId ? (
        <Panel title={t('partnerHotels.create')}>
          <CreatePartnerHotelForm propertyId={propertyId} />
        </Panel>
      ) : null}

      <Panel title={t('partnerHotels.list')}>
        <PartnerHotelList hotels={hotels} />
      </Panel>
    </div>
  );
}
