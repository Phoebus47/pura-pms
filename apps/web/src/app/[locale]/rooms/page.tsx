'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Bed, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { roomsAPI, type Room, type RoomStatus } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  RoomStatusBadge,
  roomStatusLabel,
  roomStatusTone,
} from '@/components/room-status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { StatTile } from '@/components/shared/stat-tile';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { formatMessage, t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const STATUS_FILTERS: RoomStatus[] = [
  'VACANT_CLEAN',
  'VACANT_DIRTY',
  'OCCUPIED_CLEAN',
  'OCCUPIED_DIRTY',
  'OUT_OF_ORDER',
  'OUT_OF_SERVICE',
];

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
      setError(err instanceof Error ? err.message : t('rooms.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  if (loading) {
    return <LoadingSpinner message={t('rooms.loading')} />;
  }

  if (error) {
    return (
      <Panel className={cn('border', statusToneSurface.critical)}>
        <h2 className={cn('font-semibold text-lg', statusToneInk.critical)}>
          {t('rooms.errorTitle')}
        </h2>
        <p className={cn('mt-2 text-sm', statusToneInk.critical)}>{error}</p>
        <Button onClick={loadRooms} className="mt-4">
          {t('common.tryAgain')}
        </Button>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('rooms.title')}
        subtitle={t('rooms.subtitle')}
        actions={
          <>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              {t('rooms.filter')}
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              {t('rooms.add')}
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
              label={roomStatusLabel(status)}
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
            title={t('rooms.emptyTitle')}
            description={
              statusFilter ? t('rooms.emptyFilter') : t('rooms.emptyBody')
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
                    {formatMessage('rooms.roomNumber', { number: room.number })}
                  </span>
                  {room.floor !== null && room.floor !== undefined && (
                    <span className="block text-ink-subtle text-xs">
                      {formatMessage('rooms.floorValue', { floor: room.floor })}
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
                    {t('rooms.roomType')}
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
