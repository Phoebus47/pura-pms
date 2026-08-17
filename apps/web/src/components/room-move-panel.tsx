'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntitySelect } from '@/components/shared/entity-select';
import { reservationsAPI, roomsAPI, type Reservation } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';

interface RoomMovePanelProps {
  readonly reservation: Reservation;
  readonly onMoved: () => void;
}

const VACANT_STATUSES = new Set(['VACANT_CLEAN', 'VACANT_DIRTY']);

export function RoomMovePanel({ reservation, onMoved }: RoomMovePanelProps) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const queryClient = useQueryClient();
  const propertyId = reservation.room?.property?.id;
  const roomLocked = reservation.isRoomLocked === true;
  const [toRoomId, setToRoomId] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms', propertyId],
    queryFn: () => roomsAPI.getAll({ propertyId }),
    enabled: Boolean(propertyId),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['room-moves', reservation.id],
    queryFn: () => reservationsAPI.listRoomMoves(reservation.id),
  });

  const options = useMemo(
    () =>
      rooms
        .filter(
          (room) =>
            room.id !== reservation.roomId && VACANT_STATUSES.has(room.status),
        )
        .map((room) => ({
          value: room.id,
          label: room.roomType?.name
            ? `${room.number} · ${room.roomType.name}`
            : room.number,
        })),
    [rooms, reservation.roomId],
  );

  async function handleMove() {
    try {
      setBusy(true);
      await reservationsAPI.moveRoom(reservation.id, {
        toRoomId,
        reason: reason.trim() || undefined,
        movedBy: userId,
      });
      await queryClient.invalidateQueries({
        queryKey: ['room-moves', reservation.id],
      });
      await queryClient.invalidateQueries({ queryKey: ['rooms', propertyId] });
      toast.success(t('reservations.roomMove.success'));
      setToRoomId('');
      setReason('');
      onMoved();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('reservations.roomMove.submit'),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reservations.roomMove.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600 text-sm">
          {t('reservations.roomMove.currentRoom')}:{' '}
          {reservation.room?.number ?? reservation.roomId}
        </p>
        {roomLocked ? (
          <p className="text-amber-800 text-sm">
            {t('reservations.roomLock.moveBlocked')}
          </p>
        ) : null}
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleMove();
          }}
        >
          <EntitySelect
            id="room-move-target"
            name="toRoomId"
            label={t('reservations.roomMove.targetRoom')}
            value={toRoomId}
            onChange={setToRoomId}
            options={options}
            required
            placeholder={t('reservations.roomMove.placeholder')}
            disabled={busy || options.length === 0 || roomLocked}
          />
          {options.length === 0 ? (
            <p className="text-slate-600 text-sm">
              {t('reservations.roomMove.noRooms')}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="room-move-reason">
              {t('reservations.roomMove.reason')}
            </Label>
            <Input
              id="room-move-reason"
              name="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={busy}
            />
          </div>
          <Button type="submit" disabled={busy || !toRoomId || roomLocked}>
            {t('reservations.roomMove.submit')}
          </Button>
        </form>
        <div className="border-slate-200 border-t pt-4">
          <h4 className="font-semibold mb-2 text-sm">
            {t('reservations.roomMove.history')}
          </h4>
          {history.length === 0 ? (
            <p className="text-slate-600 text-sm">
              {t('reservations.roomMove.emptyHistory')}
            </p>
          ) : (
            <ul className="space-y-2 text-slate-800 text-sm">
              {history.map((move) => (
                <li key={move.id}>
                  {t('reservations.roomMove.from')}{' '}
                  {move.fromRoom?.number ?? move.fromRoomId}{' '}
                  {t('reservations.roomMove.to')}{' '}
                  {move.toRoom?.number ?? move.toRoomId}
                  {move.reason ? ` — ${move.reason}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
