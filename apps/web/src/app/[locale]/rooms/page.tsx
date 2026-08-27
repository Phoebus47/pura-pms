'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Bed, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { roomsAPI, type Room, type RoomStatus } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RoomStatusBadge } from '@/components/room-status-badge';

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
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-b-2 border-pura-blue h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-muted-foreground">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
        <h3 className="font-semibold text-red-800">Error loading rooms</h3>
        <p className="mt-2 text-red-600">{error}</p>
        <Button onClick={loadRooms} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-bold text-3xl text-pura-blue">Rooms</h1>
          <p className="mt-1 text-muted-foreground">
            Manage rooms and their status
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="min-h-11">
            <Filter className="h-4 mr-2 w-4" />
            Filter
          </Button>
          <Button className="min-h-11">
            <Plus className="h-4 mr-2 w-4" />
            Add Room
          </Button>
        </div>
      </div>

      <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        {(
          [
            'VACANT_CLEAN',
            'VACANT_DIRTY',
            'OCCUPIED_CLEAN',
            'OCCUPIED_DIRTY',
            'OUT_OF_ORDER',
            'OUT_OF_SERVICE',
          ] as RoomStatus[]
        ).map((status) => {
          const count = rooms.filter((r) => r.status === status).length;
          return (
            <button
              key={status}
              type="button"
              onClick={() =>
                setStatusFilter(statusFilter === status ? undefined : status)
              }
              className={`flex flex-col gap-3 min-w-0 p-4 relative rounded-xl text-left transition-colors ${
                statusFilter === status
                  ? 'border border-pura-blue bg-pura-blue/5'
                  : 'border border-rule-mist bg-surface-desk hover:bg-surface-inset'
              }`}
            >
              <div className="font-bold text-2xl text-foreground">{count}</div>
              <RoomStatusBadge status={status} />
            </button>
          );
        })}
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="bg-surface-desk border border-rule-mist py-12 rounded-xl text-center">
          <Bed className="h-16 mx-auto text-muted-foreground/40 w-16" />
          <h3 className="font-semibold mt-4 text-foreground text-lg">
            No rooms found
          </h3>
          <p className="mt-2 text-muted-foreground">
            {statusFilter
              ? 'Try changing the filter'
              : 'Get started by adding your first room'}
          </p>
        </div>
      ) : (
        <div className="gap-4 grid lg:grid-cols-3 md:grid-cols-2 xl:grid-cols-4">
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              className="bg-surface-desk border border-rule-mist cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pura-blue group hover:border-slate-300 p-5 relative rounded-xl shadow-sm text-left transition-colors w-full"
              onClick={() => {
                router.push(`/rooms/${room.id}`);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-center">
                  <div className="bg-pura-blue/10 p-2.5 rounded-xl">
                    <Bed className="h-5 text-pura-blue w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">
                      Room {room.number}
                    </h3>
                    {room.floor !== null && room.floor !== undefined && (
                      <p className="text-muted-foreground text-xs">
                        Floor {room.floor}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <RoomStatusBadge status={room.status} />
              </div>

              {room.roomType && (
                <div className="border-rule-mist border-t mt-4 pt-4">
                  <div className="text-muted-foreground text-xs">Room Type</div>
                  <div className="font-semibold mt-1 text-foreground">
                    {room.roomType.name}
                  </div>
                  <div className="font-semibold mt-1 text-pura-blue text-sm">
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
