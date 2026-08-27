'use client';

import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { roomTypesAPI } from '@/lib/api/room-types';
import { t } from '@/lib/i18n';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
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
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title={t('yield.title')} subtitle={t('yield.subtitle')} />

      <Panel title={t('yield.paceTitle')} padding="none">
        <PaceTable days={pace?.days ?? []} />
      </Panel>

      <Panel
        title={t('yield.recTitle')}
        actions={propertyId ? <GenerateButton propertyId={propertyId} /> : null}
      >
        <RecommendationList recommendations={recommendations} />
      </Panel>

      <Panel title={t('yield.competitorTitle')}>
        {propertyId ? (
          <CompetitorPanel
            propertyId={propertyId}
            roomTypes={roomTypes}
            competitors={competitors}
          />
        ) : null}
      </Panel>
    </div>
  );
}
