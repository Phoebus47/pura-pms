'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { RoomType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { StatTile } from '@/components/shared/stat-tile';
import { Toolbar } from '@/components/shared/toolbar';
import { useRoomTypes } from '@/hooks/use-room-types';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { formatMessage, t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { RoomTypeCard } from './room-type-card';

export default function RoomTypesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { roomTypes, loading, error, loadRoomTypes, deleteRoomType } =
    useRoomTypes();
  const { confirm, Dialog } = useConfirmDialog();

  useEffect(() => {
    loadRoomTypes();
  }, [loadRoomTypes]);

  function handleDelete(roomType: RoomType) {
    confirm(
      t('roomTypes.deleteTitle'),
      formatMessage('roomTypes.deleteConfirm', { name: roomType.name }),
      async () => {
        await deleteRoomType(roomType.id);
      },
    );
  }

  const filteredRoomTypes = roomTypes.filter(
    (rt) =>
      rt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rt.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return <LoadingSpinner message={t('roomTypes.loading')} />;
  }

  if (error) {
    return (
      <Panel className={cn('border', statusToneSurface.critical)}>
        <h2 className={cn('font-semibold text-lg', statusToneInk.critical)}>
          {t('roomTypes.errorTitle')}
        </h2>
        <p className={cn('mt-2 text-sm', statusToneInk.critical)}>{error}</p>
        <Button onClick={loadRoomTypes} className="mt-4">
          {t('common.tryAgain')}
        </Button>
      </Panel>
    );
  }

  const averageBaseRate =
    roomTypes.length > 0
      ? Math.round(
          roomTypes.reduce((sum, rt) => sum + Number(rt.baseRate), 0) /
            roomTypes.length,
        )
      : 0;
  const totalRooms = roomTypes.reduce(
    (sum, rt) => sum + (rt._count?.rooms || 0),
    0,
  );

  return (
    <>
      {Dialog}
      <div className="space-y-6">
        <PageHeader
          title={t('roomTypes.title')}
          subtitle={t('roomTypes.subtitle')}
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              {t('roomTypes.add')}
            </Button>
          }
        />

        <Toolbar
          search={
            <div className="relative">
              <Search
                className="-translate-y-1/2 absolute h-4 left-3.5 text-ink-disabled top-1/2 w-4"
                aria-hidden="true"
              />
              <Input
                id="room-type-search"
                name="roomTypeSearch"
                type="search"
                aria-label={t('roomTypes.searchAria')}
                placeholder={t('roomTypes.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          }
        />

        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
          <StatTile
            label={t('roomTypes.totalTypes')}
            value={roomTypes.length}
          />
          <StatTile
            label={t('roomTypes.avgBaseRate')}
            value={`฿${averageBaseRate.toLocaleString()}`}
          />
          <StatTile label={t('roomTypes.totalRooms')} value={totalRooms} />
        </div>

        {filteredRoomTypes.length === 0 ? (
          <Panel padding="none">
            <EmptyState
              title={
                searchTerm
                  ? t('roomTypes.emptySearch')
                  : t('roomTypes.emptyTitle')
              }
              description={searchTerm ? undefined : t('roomTypes.emptyBody')}
            />
          </Panel>
        ) : (
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2">
            {filteredRoomTypes.map((roomType) => (
              <RoomTypeCard
                key={roomType.id}
                roomType={roomType}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
