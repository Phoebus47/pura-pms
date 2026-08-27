import { cn } from '@/lib/utils';
import type { StatusTone } from '@/lib/design/status-tone';
import type { RoomStatus } from '@/lib/api/rooms';
import { t } from '@/lib/i18n';
import { StatusBadge } from './shared/status-badge';

interface RoomStatusBadgeProps {
  readonly status: RoomStatus;
  readonly className?: string;
}

export const roomStatusTone: Record<RoomStatus, StatusTone> = {
  VACANT_CLEAN: 'positive',
  VACANT_DIRTY: 'caution',
  OCCUPIED_CLEAN: 'info',
  OCCUPIED_DIRTY: 'caution',
  OUT_OF_ORDER: 'critical',
  OUT_OF_SERVICE: 'neutral',
};

export function roomStatusLabel(status: RoomStatus): string {
  return t(`rooms.status.${status}`);
}

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  return (
    <StatusBadge
      tone={roomStatusTone[status]}
      label={roomStatusLabel(status)}
      className={cn('shrink-0', className)}
    />
  );
}
