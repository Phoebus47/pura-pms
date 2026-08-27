'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { roomTypesAPI } from '@/lib/api/room-types';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBlocks } from '@/hooks/use-blocks';
import { BlockList, CreateBlockForm } from './block-panels';
import { PickupPanel } from './block-pickup-panel';

export function BlocksClient() {
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
  const { data: blocks = [] } = useBlocks(propertyId);
  const [selectedId, setSelectedId] = useState<string>();

  return (
    <div className="max-w-3xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('blocks.title')}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {t('blocks.subtitle')}
        </p>
      </header>

      {propertyId ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('blocks.create')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateBlockForm propertyId={propertyId} roomTypes={roomTypes} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('blocks.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <BlockList
            blocks={blocks}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </CardContent>
      </Card>

      {selectedId ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('blocks.pickupTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <PickupPanel blockId={selectedId} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
