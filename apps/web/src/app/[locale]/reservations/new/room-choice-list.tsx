'use client';

import { type Room } from '@/lib/api';
import { formatMessage, t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface RoomChoiceListProps {
  readonly rooms: Room[];
  readonly selectedRoomId?: string;
  readonly onSelect: (room: Room) => void;
  /** Prefixes the room number in each option's accessible name. */
  readonly labelPrefix: string;
  readonly showRate?: boolean;
}

export function RoomChoiceList({
  rooms,
  selectedRoomId,
  onSelect,
  labelPrefix,
  showRate = false,
}: RoomChoiceListProps) {
  return (
    <div className="gap-4 grid">
      {rooms.map((room) => (
        <button
          key={room.id}
          type="button"
          aria-label={`${labelPrefix} ${room.number}`}
          aria-pressed={selectedRoomId === room.id}
          onClick={() => onSelect(room)}
          className={cn(
            'border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring p-4 rounded-xl text-left transition-colors',
            selectedRoomId === room.id
              ? 'bg-pura-blue/5 border-pura-blue'
              : 'border-rule-mist hover:border-rule-strong',
          )}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-ink-strong text-lg">
                {t('common.roomLabel')} {room.number}
              </h3>
              <p className="text-ink-subtle text-sm">{room.roomType?.name}</p>
              {showRate && (
                <p className="mt-1 text-ink-subtle text-xs">
                  {formatMessage('reservations.new.maxOccupancy', {
                    count: room.roomType?.maxOccupancy ?? 0,
                  })}
                </p>
              )}
            </div>
            {showRate && (
              <div className="shrink-0 text-right">
                <p className="font-bold tabular-nums text-2xl text-pura-blue">
                  ฿{Number(room.roomType?.baseRate || 0).toLocaleString()}
                </p>
                <p className="text-ink-subtle text-xs">
                  {t('common.perNight')}
                </p>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
