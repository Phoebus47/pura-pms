"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { roomsAPI, type Room } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RoomStatusBadge } from "@/components/room-status-badge";

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoom = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsAPI.getById(roomId);
      setRoom(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      await roomsAPI.delete(roomId);
      router.push("/rooms");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete room");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b8e] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
        <h3 className="text-red-800 font-semibold">Error loading room</h3>
        <p className="text-red-600 mt-2">{error || "Room not found"}</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1e4b8e]">
              Room {room.number}
            </h1>
            <p className="text-slate-600 mt-1">Floor {room.floor}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/rooms/${roomId}/edit`)}
            className="rounded-xl"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="rounded-xl text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Room Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-[#1e4b8e] mb-6">
            Room Information
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Room Number
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {room.number}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Floor
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {room.floor}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Status
              </label>
              <div className="mt-1">
                <RoomStatusBadge status={room.status} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Room Type
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {room.roomType?.name || "-"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Base Rate
              </label>
              <p className="text-lg font-semibold text-[#1e4b8e] mt-1">
                ฿{Number(room.roomType?.baseRate || 0).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Max Occupancy
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {room.roomType?.maxOccupancy || "-"} guests
              </p>
            </div>
          </div>

          {room.notes && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <label className="text-sm font-semibold text-slate-600">
                Notes
              </label>
              <p className="text-slate-700 mt-2 whitespace-pre-wrap">
                {room.notes}
              </p>
            </div>
          )}
        </div>

        {/* Room Type Details Card */}
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-[#1e4b8e] mb-6">
            Room Type Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Type Name
              </label>
              <p className="text-lg font-semibold text-slate-800 mt-1">
                {room.roomType?.name || "-"}
              </p>
            </div>

            {room.roomType?.description && (
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Description
                </label>
                <p className="text-slate-700 mt-1">
                  {room.roomType.description}
                </p>
              </div>
            )}

            {room.roomType?.amenities && room.roomType.amenities.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {room.roomType.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#1e4b8e]/10 text-[#1e4b8e] ring-1 ring-inset ring-[#1e4b8e]/20"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#1e4b8e] mb-4">Metadata</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Created:</span>{" "}
            <span className="text-slate-800 font-medium">
              {new Date(room.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-600">Last Updated:</span>{" "}
            <span className="text-slate-800 font-medium">
              {new Date(room.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
