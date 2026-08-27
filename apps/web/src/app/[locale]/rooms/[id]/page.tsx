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
import { Panel } from '@/components/shared/panel';

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

  const strongValue = (value: string | number) => (
    <p className="font-semibold text-ink-strong text-lg">{value}</p>
  );

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
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="hover:bg-status-critical-tint text-status-critical-ink"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        }
      />

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <Panel title="Room Information" padding="lg" className="lg:col-span-2">
          <div className="gap-6 grid grid-cols-2">
            <DetailField label="Room Number" value={strongValue(room.number)} />

            <DetailField label="Floor" value={strongValue(room.floor ?? '-')} />

            <DetailField
              label="Status"
              value={<RoomStatusBadge status={room.status} />}
            />

            <DetailField
              label="Room Type"
              value={strongValue(room.roomType?.name || '-')}
            />

            <DetailField
              label="Base Rate"
              value={
                <p className="font-semibold tabular-nums text-lg text-pura-blue">
                  ฿{Number(room.roomType?.baseRate || 0).toLocaleString()}
                </p>
              }
            />

            <DetailField
              label="Max Occupancy"
              value={strongValue(
                `${room.roomType?.maxOccupancy || '-'} guests`,
              )}
            />
          </div>

          {room.notes && (
            <div className="border-rule-mist border-t mt-6 pt-6">
              <p className="font-semibold text-ink-subtle text-sm">Notes</p>
              <p className="mt-2 text-ink-default whitespace-pre-wrap">
                {room.notes}
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Room Type Details" padding="lg">
          <div className="space-y-4">
            <DetailField
              label="Type Name"
              value={strongValue(room.roomType?.name || '-')}
            />

            {room.roomType?.description && (
              <DetailField
                label="Description"
                value={
                  <p className="text-ink-default">
                    {room.roomType.description}
                  </p>
                }
              />
            )}

            {room.roomType?.amenities && room.roomType.amenities.length > 0 && (
              <div>
                <p className="block font-semibold mb-2 text-ink-subtle text-sm">
                  Amenities
                </p>
                <div className="flex flex-wrap gap-2">
                  {room.roomType.amenities.map((amenity, index) => (
                    <span
                      key={`${amenity}-${index}`}
                      className="bg-pura-blue/10 font-semibold inline-flex items-center px-3 py-1 ring-1 ring-inset ring-pura-blue/20 rounded-full text-pura-blue text-xs"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      <MetadataCard createdAt={room.createdAt} updatedAt={room.updatedAt} />
    </div>
  );
}
