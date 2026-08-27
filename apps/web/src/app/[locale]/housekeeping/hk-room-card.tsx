'use client';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { statusToneSurface } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';
import type { GuestRoomRequest, HkBoardRoom } from '@/lib/api/housekeeping';
import { hkRequestTone, hkRoomTone } from './hk-tone';

interface HkRoomCardProps {
  readonly room: HkBoardRoom;
  readonly isSelected: boolean;
  readonly onSelect: (id: string) => void;
  readonly onSetRequest: (id: string, request: GuestRoomRequest) => void;
  readonly onMarkClean?: (id: string) => void;
}

function requestBadge(request: GuestRoomRequest | undefined) {
  if (request !== 'DND' && request !== 'MUR') return null;
  const label =
    request === 'DND' ? t('housekeeping.dnd') : t('housekeeping.mur');
  return <StatusBadge tone={hkRequestTone(request)} label={label} size="sm" />;
}

export function HkRoomCard({
  room,
  isSelected,
  onSelect,
  onSetRequest,
  onMarkClean,
}: HkRoomCardProps) {
  return (
    <li>
      <div
        className={`${statusToneSurface[hkRoomTone(room)]} border p-4 rounded-xl space-y-3`}
      >
        <button
          type="button"
          className={`min-h-11 w-full rounded-lg px-2 py-2 text-left text-sm text-ink-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isSelected
              ? 'border border-pura-blue bg-surface-desk'
              : 'border border-transparent'
          }`}
          onClick={() => onSelect(room.id)}
        >
          <span className="flex flex-wrap gap-2 items-center">
            <span>
              {room.number} · {room.roomType?.name ?? room.status}
            </span>
            {requestBadge(room.guestRequest)}
          </span>
        </button>
        <div className="flex flex-wrap gap-2">
          {room.guestRequest !== 'DND' ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSetRequest(room.id, 'DND')}
            >
              {t('housekeeping.setDnd')}
            </Button>
          ) : null}
          {room.guestRequest !== 'MUR' ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSetRequest(room.id, 'MUR')}
            >
              {t('housekeeping.setMur')}
            </Button>
          ) : null}
          {room.guestRequest && room.guestRequest !== 'NONE' ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSetRequest(room.id, 'NONE')}
            >
              {t('housekeeping.clearRequest')}
            </Button>
          ) : null}
        </div>
        {onMarkClean ? (
          <Button
            type="button"
            className="w-full"
            disabled={room.guestRequest === 'DND'}
            onClick={() => onMarkClean(room.id)}
          >
            {t('housekeeping.markClean')}
          </Button>
        ) : null}
      </div>
    </li>
  );
}
