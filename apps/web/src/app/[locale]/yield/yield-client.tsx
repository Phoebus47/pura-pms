'use client';

import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { roomTypesAPI } from '@/lib/api/room-types';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useYieldCompetitors,
  useYieldPace,
  useYieldRecommendations,
} from '@/hooks/use-yield';
import { CompetitorPanel } from './yield-competitor-panel';
import { GenerateButton, PaceTable, RecommendationList } from './yield-panels';

export function YieldClient() {
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
  const { data: pace } = useYieldPace(propertyId);
  const { data: recommendations = [] } = useYieldRecommendations(propertyId);
  const { data: competitors = [] } = useYieldCompetitors(propertyId);

  return (
    <div className="max-w-3xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('yield.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">{t('yield.subtitle')}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('yield.paceTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <PaceTable days={pace?.days ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('yield.recTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {propertyId ? <GenerateButton propertyId={propertyId} /> : null}
          <RecommendationList recommendations={recommendations} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('yield.competitorTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {propertyId ? (
            <CompetitorPanel
              propertyId={propertyId}
              roomTypes={roomTypes}
              competitors={competitors}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
