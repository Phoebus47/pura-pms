'use client';

import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { roomTypesAPI } from '@/lib/api/room-types';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRates } from '@/hooks/use-rates';
import { CreateRateForm, RateList } from './rate-panels';

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
    <div className="max-w-3xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('rates.title')}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {t('rates.subtitle')}
        </p>
      </header>

      {propertyId ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('rates.create')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateRateForm
              propertyId={propertyId}
              roomTypes={roomTypes}
              rates={rates}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('rates.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RateList rates={rates} />
        </CardContent>
      </Card>
    </div>
  );
}
