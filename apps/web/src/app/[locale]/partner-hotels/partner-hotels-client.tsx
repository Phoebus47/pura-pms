'use client';

import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="max-w-3xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('partnerHotels.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">
          {t('partnerHotels.subtitle')}
        </p>
      </header>

      {propertyId ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('partnerHotels.create')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreatePartnerHotelForm propertyId={propertyId} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('partnerHotels.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <PartnerHotelList hotels={hotels} />
        </CardContent>
      </Card>
    </div>
  );
}
