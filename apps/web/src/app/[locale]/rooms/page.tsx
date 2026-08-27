'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Bed, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { roomsAPI, type Room, type RoomStatus } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  RoomStatusBadge,
  roomStatusTone,
} from '@/components/room-status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { StatTile } from '@/components/shared/stat-tile';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';

const STATUS_FILTERS: RoomStatus[] = [
  'VACANT_CLEAN',
  'VACANT_DIRTY',
  'OCCUPIED_CLEAN',
  'OCCUPIED_DIRTY',
  'OUT_OF_ORDER',
  'OUT_OF_SERVICE',
];

// RoomStatusBadge keeps its label map private, so the summary tiles carry their
// own copy of the same wording.
const STATUS_LABEL: Record<RoomStatus, string> = {
  VACANT_CLEAN: 'Vacant Clean',
  VACANT_DIRTY: 'Vacant Dirty',
  OCCUPIED_CLEAN: 'Occupied Clean',
  OCCUPIED_DIRTY: 'Occupied Dirty',
  OUT_OF_ORDER: 'Out of Order',
  OUT_OF_SERVICE: 'Out of Service',
};

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RoomStatus | undefined>();

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsAPI.getAll(
        statusFilter ? { status: statusFilter } : undefined,
      );
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  if (loading) {
    return <LoadingSpinner message="Loading rooms..." />;
  }

  if (error) {
    return (
      <Panel className={cn('border', statusToneSurface.critical)}>
        <h2 className={cn('font-semibold text-lg', statusToneInk.critical)}>
          Error loading rooms
        </h2>
        <p className={cn('mt-2 text-sm', statusToneInk.critical)}>{error}</p>
        <Button onClick={loadRooms} className="mt-4">
          Try Again
        </Button>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms"
        subtitle="Manage rooms and their status"
        actions={
          <>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              Add Room
            </Button>
          </>
        }
      />

      <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        {STATUS_FILTERS.map((status) => {
          const isActive = statusFilter === status;
          return (
            <StatTile
              key={status}
              label={STATUS_LABEL[status]}
              value={rooms.filter((room) => room.status === status).length}
              tone={roomStatusTone[status]}
              pressed={isActive}
              onClick={() => setStatusFilter(isActive ? undefined : status)}
              className={cn(
                'h-full min-w-0',
                isActive ? 'bg-pura-blue/5' : 'hover:bg-surface-sunken',
              )}
            />
          );
        })}
      </div>

      {rooms.length === 0 ? (
        <Panel padding="none">
          <EmptyState
            icon={<Bed className="h-12 w-12" />}
            title="No rooms found"
            description={
              statusFilter
                ? 'Try changing the filter'
                : 'Get started by adding your first room'
            }
          />
        </Panel>
      ) : (
        <div className="gap-4 grid lg:grid-cols-3 md:grid-cols-2 xl:grid-cols-4">
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              className="bg-surface-desk border border-rule-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring hover:border-rule-strong p-(--panel-pad) rounded-xl shadow-panel text-left transition-colors w-full"
              onClick={() => router.push(`/rooms/${room.id}`)}
            >
              <div className="flex gap-3 items-center">
                <span className="bg-pura-blue/10 p-2.5 rounded-lg">
                  <Bed className="h-5 text-pura-blue w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-ink-strong text-lg">
                    Room {room.number}
                  </span>
                  {room.floor !== null && room.floor !== undefined && (
                    <span className="block text-ink-subtle text-xs">
                      Floor {room.floor}
                    </span>
                  )}
                </span>
              </div>

              <div className="mt-4">
                <RoomStatusBadge status={room.status} />
              </div>

              {room.roomType && (
                <div className="border-rule-mist border-t mt-4 pt-4">
                  <div className="font-semibold text-2xs text-ink-subtle tracking-wide uppercase">
                    Room Type
                  </div>
                  <div className="font-semibold mt-1 text-ink-strong">
                    {room.roomType.name}
                  </div>
                  <div className="font-semibold mt-1 tabular-nums text-pura-blue text-sm">
                    ฿{Number(room.roomType.baseRate).toLocaleString()}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
