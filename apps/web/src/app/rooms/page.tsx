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
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-[#1e4b8e] text-3xl">Rooms</h1>
          <p className="mt-1 text-slate-600">Manage rooms and their status</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 mr-2 w-4" />
            Filter
          </Button>
          <Button className="bg-[#1e4b8e] hover:bg-[#153a6e]">
            <Plus className="h-4 mr-2 w-4" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Room Status Summary */}
      <div className="gap-4 grid lg:grid-cols-6 md:grid-cols-3">
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
              onClick={() =>
                setStatusFilter(statusFilter === status ? undefined : status)
              }
              className={`rounded-2xl border p-4 text-left transition-all ${
                statusFilter === status
                  ? 'border-[#1e4b8e] bg-[#1e4b8e]/5'
                  : 'border-white/50 bg-white/40 hover:bg-white/50'
              }`}
            >
              <div className="font-bold text-2xl text-slate-800">{count}</div>
              <RoomStatusBadge status={status} className="mt-2" />
            </button>
          );
        })}
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 py-12 rounded-3xl text-center">
          <Bed className="h-16 mx-auto text-slate-300 w-16" />
          <h3 className="font-semibold mt-4 text-lg text-slate-700">
            No rooms found
          </h3>
          <p className="mt-2 text-slate-500">
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
              className="active:scale-[0.98] backdrop-blur-2xl bg-white/40 border border-white/50 cursor-pointer duration-300 focus:outline-none focus:ring-[#1e4b8e] focus:ring-2 focus:ring-offset-2 group hover:-translate-y-1 hover:bg-white/50 hover:border-white/70 hover:shadow-xl overflow-hidden p-5 relative rounded-2xl shadow-lg text-left transition-all w-full"
              onClick={() => {
                router.push(`/rooms/${room.id}`);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-center">
                  <div className="bg-[#1e4b8e]/10 p-2.5 rounded-xl">
                    <Bed className="h-5 text-[#1e4b8e] w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Room {room.number}
                    </h3>
                    {room.floor !== null && room.floor !== undefined && (
                      <p className="text-slate-500 text-xs">
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
                <div className="border-slate-200 border-t mt-4 pt-4">
                  <div className="text-slate-500 text-xs">Room Type</div>
                  <div className="font-semibold mt-1 text-slate-700">
                    {room.roomType.name}
                  </div>
                  <div className="font-semibold mt-1 text-[#1e4b8e] text-sm">
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
