"use client";

import { useEffect, useState } from "react";
import { Plus, Bed, Filter } from "lucide-react";
import { roomsAPI, type Room, type RoomStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RoomStatusBadge } from "@/components/room-status-badge";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RoomStatus | undefined>();

  useEffect(() => {
    loadRooms();
  }, [statusFilter]);

  async function loadRooms() {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsAPI.getAll(
        statusFilter ? { status: statusFilter } : undefined,
      );
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b8e] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
        <h3 className="text-red-800 font-semibold">Error loading rooms</h3>
        <p className="text-red-600 mt-2">{error}</p>
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
          <h1 className="text-3xl font-bold text-[#1e4b8e]">Rooms</h1>
          <p className="text-slate-600 mt-1">Manage rooms and their status</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-[#1e4b8e] hover:bg-[#153a6e]">
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Room Status Summary */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {(
          [
            "VACANT_CLEAN",
            "VACANT_DIRTY",
            "OCCUPIED_CLEAN",
            "OCCUPIED_DIRTY",
            "OUT_OF_ORDER",
            "OUT_OF_SERVICE",
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
                  ? "border-[#1e4b8e] bg-[#1e4b8e]/5"
                  : "border-white/50 bg-white/40 hover:bg-white/50"
              }`}
            >
              <div className="text-2xl font-bold text-slate-800">{count}</div>
              <RoomStatusBadge status={status} className="mt-2" />
            </button>
          );
        })}
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="text-center py-12 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50">
          <Bed className="h-16 w-16 text-slate-300 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            No rooms found
          </h3>
          <p className="text-slate-500 mt-2">
            {statusFilter
              ? "Try changing the filter"
              : "Get started by adding your first room"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group relative overflow-hidden rounded-2xl border border-white/50 bg-white/40 backdrop-blur-2xl p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-white/70 hover:bg-white/50 cursor-pointer"
              onClick={() => {
                window.location.href = `/rooms/${room.id}`;
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#1e4b8e]/10 p-2.5">
                    <Bed className="h-5 w-5 text-[#1e4b8e]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Room {room.number}
                    </h3>
                    {room.floor !== null && room.floor !== undefined && (
                      <p className="text-xs text-slate-500">
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
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500">Room Type</div>
                  <div className="font-semibold text-slate-700 mt-1">
                    {room.roomType.name}
                  </div>
                  <div className="text-sm text-[#1e4b8e] font-semibold mt-1">
                    ฿{Number(room.roomType.baseRate).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
