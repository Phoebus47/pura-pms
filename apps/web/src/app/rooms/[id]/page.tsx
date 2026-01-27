'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import { roomsAPI, type Room } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RoomStatusBadge } from '@/components/room-status-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { DetailPageError } from '@/components/shared/detail-page-error';
import { DetailPageHeader } from '@/components/shared/detail-page-header';
import { MetadataCard } from '@/components/shared/metadata-card';
import { DetailField } from '@/components/shared/detail-field';

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
    return <LoadingSpinner message="Loading room details..." />;
  }

  if (error || !room) {
    return (
      <DetailPageError
        title="Error loading room"
        message={error || 'Room not found'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title={`Room ${room.number}`}
        subtitle={`Floor ${room.floor}`}
        actions={
          <>
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
          </>
        }
      />

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 lg:col-span-2 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-xl">
            Room Information
          </h2>

          <div className="gap-6 grid grid-cols-2">
            <DetailField
              label="Room Number"
              value={
                <p className="font-semibold text-lg text-slate-800">
                  {room.number}
                </p>
              }
            />

            <DetailField
              label="Floor"
              value={
                <p className="font-semibold text-lg text-slate-800">
                  {room.floor}
                </p>
              }
            />

            <DetailField
              label="Status"
              value={<RoomStatusBadge status={room.status} />}
            />

            <DetailField
              label="Room Type"
              value={
                <p className="font-semibold text-lg text-slate-800">
                  {room.roomType?.name || '-'}
                </p>
              }
            />

            <DetailField
              label="Base Rate"
              value={
                <p className="font-semibold text-[#1e4b8e] text-lg">
                  ฿{Number(room.roomType?.baseRate || 0).toLocaleString()}
                </p>
              }
            />

            <DetailField
              label="Max Occupancy"
              value={
                <p className="font-semibold text-lg text-slate-800">
                  {room.roomType?.maxOccupancy || '-'} guests
                </p>
              }
            />
          </div>

          {room.notes && (
            <div className="border-slate-200 border-t mt-6 pt-6">
              <p className="font-semibold text-slate-600 text-sm">Notes</p>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                {room.notes}
              </p>
            </div>
          )}
        </div>

        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
          <h2 className="font-bold mb-6 text-[#1e4b8e] text-xl">
            Room Type Details
          </h2>

          <div className="space-y-4">
            <DetailField
              label="Type Name"
              value={
                <p className="font-semibold text-lg text-slate-800">
                  {room.roomType?.name || '-'}
                </p>
              }
            />

            {room.roomType?.description && (
              <DetailField
                label="Description"
                value={
                  <p className="text-slate-700">{room.roomType.description}</p>
                }
              />
            )}

            {room.roomType?.amenities && room.roomType.amenities.length > 0 && (
              <div>
                <p className="block font-semibold mb-2 text-slate-600 text-sm">
                  Amenities
                </p>
                <div className="flex flex-wrap gap-2">
                  {room.roomType.amenities.map((amenity, index) => (
                    <span
                      key={`${amenity}-${index}`}
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

      <MetadataCard createdAt={room.createdAt} updatedAt={room.updatedAt} />
    </div>
  );
}
