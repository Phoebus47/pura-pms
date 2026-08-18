'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="max-w-5xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('housekeeping.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">
          {t('housekeeping.subtitle')}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('housekeeping.board')}</CardTitle>
        </CardHeader>
        <CardContent>
          <HkBoard
            rooms={rooms}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </CardContent>
      </Card>

      {selected ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('housekeeping.inspectTitle')} · {selected.number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HkInspectPanel key={selected.id} room={selected} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
