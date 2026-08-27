'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { roomTypesAPI } from '@/lib/api/room-types';
import { t } from '@/lib/i18n';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { useBlocks } from '@/hooks/use-blocks';
import { BlockList } from './block-list';
import { CreateBlockForm } from './block-create-form';
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
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title={t('blocks.title')} subtitle={t('blocks.subtitle')} />

      {propertyId ? (
        <Panel title={t('blocks.create')}>
          <CreateBlockForm propertyId={propertyId} roomTypes={roomTypes} />
        </Panel>
      ) : null}

      <Panel title={t('blocks.list')}>
        <BlockList
          blocks={blocks}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </Panel>

      {selectedId ? (
        <Panel title={t('blocks.pickupTitle')}>
          <PickupPanel blockId={selectedId} />
        </Panel>
      ) : null}
    </div>
  );
}
