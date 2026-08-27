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
import { formatMessage, t } from '@/lib/i18n';

function occupancyLabel(maxOccupancy: number | undefined): string {
  if (maxOccupancy === undefined) {
    return '-';
  }
  return formatMessage('rooms.guestsValue', { count: maxOccupancy });
}

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
      setError(err instanceof Error ? err.message : t('rooms.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  async function handleDelete() {
    if (!confirm(t('rooms.deleteConfirm'))) return;

    try {
      await roomsAPI.delete(roomId);
      router.push('/rooms');
    } catch (err) {
      alert(err instanceof Error ? err.message : t('rooms.deleteFailed'));
    }
  }

  if (loading) {
    return <LoadingSpinner message={t('rooms.detailLoading')} />;
  }

  if (error || !room) {
    return (
      <DetailPageError
        title={t('rooms.errorLoading')}
        message={error || t('rooms.notFound')}
      />
    );
  }

  const strongValue = (value: string | number) => (
    <p className="font-semibold text-ink-strong text-lg">{value}</p>
  );

  const floorSubtitle =
    room.floor === null || room.floor === undefined
      ? undefined
      : formatMessage('rooms.floorValue', { floor: room.floor });

  return (
    <div className="space-y-6">
      <DetailPageHeader
        title={formatMessage('rooms.roomNumber', { number: room.number })}
        subtitle={floorSubtitle}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push(`/rooms/${roomId}/edit`)}
            >
              <Edit className="h-4 w-4" />
              {t('common.edit')}
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="hover:bg-status-critical-tint text-status-critical-ink"
            >
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          </>
        }
      />

      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        <Panel
          title={t('rooms.information')}
          padding="lg"
          className="lg:col-span-2"
        >
          <div className="gap-6 grid grid-cols-2">
            <DetailField
              label={t('rooms.roomNumberLabel')}
              value={strongValue(room.number)}
            />

            <DetailField
              label={t('rooms.floorLabel')}
              value={strongValue(room.floor ?? '-')}
            />

            <DetailField
              label={t('common.status')}
              value={<RoomStatusBadge status={room.status} />}
            />

            <DetailField
              label={t('rooms.roomType')}
              value={strongValue(room.roomType?.name || '-')}
            />

            <DetailField
              label={t('rooms.baseRate')}
              value={
                <p className="font-semibold tabular-nums text-lg text-pura-blue">
                  ฿{Number(room.roomType?.baseRate || 0).toLocaleString()}
                </p>
              }
            />

            <DetailField
              label={t('rooms.maxOccupancy')}
              value={strongValue(occupancyLabel(room.roomType?.maxOccupancy))}
            />
          </div>

          {room.notes && (
            <div className="border-rule-mist border-t mt-6 pt-6">
              <p className="font-semibold text-ink-subtle text-sm">
                {t('common.notes')}
              </p>
              <p className="mt-2 text-ink-default whitespace-pre-wrap">
                {room.notes}
              </p>
            </div>
          )}
        </Panel>

        <Panel title={t('rooms.typeDetails')} padding="lg">
          <div className="space-y-4">
            <DetailField
              label={t('rooms.typeName')}
              value={strongValue(room.roomType?.name || '-')}
            />

            {room.roomType?.description && (
              <DetailField
                label={t('common.description')}
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
                  {t('rooms.amenities')}
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
