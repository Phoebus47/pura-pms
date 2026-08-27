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
      'Delete Room Type',
      `Are you sure you want to delete room type "${roomType.name}"? This action cannot be undone.`,
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
    return <LoadingSpinner message="Loading room types..." />;
  }

  if (error) {
    return (
      <Panel className={cn('border', statusToneSurface.critical)}>
        <h2 className={cn('font-semibold text-lg', statusToneInk.critical)}>
          Error loading room types
        </h2>
        <p className={cn('mt-2 text-sm', statusToneInk.critical)}>{error}</p>
        <Button onClick={loadRoomTypes} className="mt-4">
          Retry
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
          title="Room Types"
          subtitle="Manage room type configurations and pricing"
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add Room Type
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
                aria-label="Search room types by name or code"
                placeholder="Search room types by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          }
        />

        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
          <StatTile label="Total Types" value={roomTypes.length} />
          <StatTile
            label="Avg Base Rate"
            value={`฿${averageBaseRate.toLocaleString()}`}
          />
          <StatTile label="Total Rooms" value={totalRooms} />
        </div>

        {filteredRoomTypes.length === 0 ? (
          <Panel padding="none">
            <EmptyState
              title={
                searchTerm
                  ? 'No room types found matching your search'
                  : 'No room types yet'
              }
              description={
                searchTerm
                  ? undefined
                  : 'Create your first room type to get started.'
              }
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
