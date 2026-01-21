'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { roomsAPI, type Room } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RoomStatusBadge } from '@/components/room-status-badge';

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
      setError(err instanceof Error ? err.message : 'Failed to load room');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      await roomsAPI.delete(roomId);
      router.push('/rooms');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete room');
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
        <h3 className="font-semibold text-red-800">Error loading room</h3>
        <p className="mt-2 text-red-600">{error || 'Room not found'}</p>
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
        <div className="flex gap-4 items-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 mr-2 w-4" />
            Back
          </Button>
          <div>
            <h1 className="font-bold text-[#1e4b8e] text-3xl">
              Room {room.number}
            </h1>
            <p className="mt-1 text-slate-600">Floor {room.floor}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/rooms/${roomId}/edit`)}
            className="rounded-xl"
          >
            <Edit className="h-4 mr-2 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="hover:bg-red-50 rounded-xl text-red-600"
          >
            <Trash2 className="h-4 mr-2 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Room Information */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Main Info Card */}
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 lg:col-span-2 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-xl">
            Room Information
          </h2>

          <div className="gap-6 grid grid-cols-2">
            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Room Number
              </label>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                {room.number}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Floor
              </label>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                {room.floor}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Status
              </label>
              <div className="mt-1">
                <RoomStatusBadge status={room.status} />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Room Type
              </label>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                {room.roomType?.name || '-'}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Base Rate
              </label>
              <p className="font-semibold mt-1 text-[#1e4b8e] text-lg">
                ฿{Number(room.roomType?.baseRate || 0).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Max Occupancy
              </label>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                {room.roomType?.maxOccupancy || '-'} guests
              </p>
            </div>
          </div>

          {room.notes && (
            <div className="border-slate-200 border-t mt-6 pt-6">
              <label className="font-semibold text-slate-600 text-sm">
                Notes
              </label>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                {room.notes}
              </p>
            </div>
          )}
        </div>

        {/* Room Type Details Card */}
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-xl">
            Room Type Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-slate-600 text-sm">
                Type Name
              </label>
              <p className="font-semibold mt-1 text-lg text-slate-800">
                {room.roomType?.name || '-'}
              </p>
            </div>

            {room.roomType?.description && (
              <div>
                <label className="font-semibold text-slate-600 text-sm">
                  Description
                </label>
                <p className="mt-1 text-slate-700">
                  {room.roomType.description}
                </p>
              </div>
            )}

            {room.roomType?.amenities && room.roomType.amenities.length > 0 && (
              <div>
                <label className="block font-semibold mb-2 text-slate-600 text-sm">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {room.roomType.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-[#1e4b8e]/10 font-semibold inline-flex items-center px-3 py-1 ring-[#1e4b8e]/20 ring-1 ring-inset rounded-full text-[#1e4b8e] text-xs"
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
      <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
        <h2 className="font-bold mb-4 text-[#1e4b8e] text-xl">Metadata</h2>
        <div className="gap-4 grid grid-cols-2 text-sm">
          <div>
            <span className="text-slate-600">Created:</span>{' '}
            <span className="font-medium text-slate-800">
              {new Date(room.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-600">Last Updated:</span>{' '}
            <span className="font-medium text-slate-800">
              {new Date(room.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
