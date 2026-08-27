'use client';

import { type Reservation } from '@/lib/api';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { SplitStayBadge } from '@/components/split-stay-badge';
import type { CalendarOccupancyItem } from '@/lib/split-stay';
import { formatMessage, t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface CalendarDayCellProps {
  readonly day: number;
  readonly isToday: boolean;
  readonly occupants: CalendarOccupancyItem[];
}

const VISIBLE_OCCUPANTS = 3;

export function CalendarDayCell({
  day,
  isToday,
  occupants,
}: CalendarDayCellProps) {
  return (
    <div
      className={cn(
        'aspect-square rounded-lg border-2 p-2 transition-colors',
        isToday
          ? 'border-pura-blue bg-pura-blue/5'
          : 'border-rule-mist hover:border-rule-strong',
      )}
    >
      <div className="flex flex-col h-full">
        <div
          className={cn(
            'font-bold mb-1 tabular-nums text-sm',
            isToday ? 'text-pura-blue' : 'text-ink-strong',
          )}
        >
          {day}
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {occupants.slice(0, VISIBLE_OCCUPANTS).map((occupant) => (
            <div
              key={occupant.key}
              className="bg-surface-desk border border-rule-mist p-1 rounded-md text-ink-default text-xs truncate"
              title={formatMessage('reservations.calendar.occupantTooltip', {
                guestName: occupant.guestName,
                roomLabel: t('common.roomLabel'),
                roomNumber: occupant.roomNumber ?? '',
              })}
            >
              <ReservationStatusBadge
                status={occupant.status as Reservation['status']}
                size="xs"
              />
              {occupant.isSplitStay ? (
                <SplitStayBadge size="xs" className="ml-1" />
              ) : null}
              <div className="mt-0.5 truncate">{occupant.guestName}</div>
            </div>
          ))}
          {occupants.length > VISIBLE_OCCUPANTS && (
            <div className="font-semibold text-ink-subtle text-xs">
              {formatMessage('reservations.calendar.more', {
                count: occupants.length - VISIBLE_OCCUPANTS,
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
