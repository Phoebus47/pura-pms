import { cn } from '@/lib/utils';
import type { StatusTone } from '@/lib/design/status-tone';
import type { RoomStatus } from '@/lib/api/rooms';
import { StatusChip } from './status-chip';

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

const roomStatusLabel: Record<RoomStatus, string> = {
  VACANT_CLEAN: 'Vacant Clean',
  VACANT_DIRTY: 'Vacant Dirty',
  OCCUPIED_CLEAN: 'Occupied Clean',
  OCCUPIED_DIRTY: 'Occupied Dirty',
  OUT_OF_ORDER: 'Out of Order',
  OUT_OF_SERVICE: 'Out of Service',
};

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  return (
    <StatusChip
      tone={roomStatusTone[status]}
      label={roomStatusLabel[status]}
      className={cn('shrink-0', className)}
    />
  );
}
