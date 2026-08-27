'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { useHkBoard } from '@/hooks/use-housekeeping';
import { HkBoard } from './hk-board';
import { HkInspectPanel } from './hk-inspect-panel';
import type { HkBoardRoom } from '@/lib/api/housekeeping';

const EMPTY_ROOMS: HkBoardRoom[] = [];

export function HousekeepingClient() {
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: rooms = EMPTY_ROOMS } = useHkBoard(propertyId);
  const [selectedId, setSelectedId] = useState<string>();
  const selected = rooms.find((room) => room.id === selectedId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={t('housekeeping.title')}
        subtitle={t('housekeeping.subtitle')}
      />

      <Panel title={t('housekeeping.board')} padding="lg">
        <HkBoard
          rooms={rooms}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </Panel>

      {selected ? (
        <Panel title={`${t('housekeeping.inspectTitle')} · ${selected.number}`}>
          <HkInspectPanel key={selected.id} room={selected} />
        </Panel>
      ) : null}
    </div>
  );
}
