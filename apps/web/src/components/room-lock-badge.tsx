import { t } from '@/lib/i18n';
import type { StatusTone } from '@/lib/design/status-tone';
import { StatusChip } from './status-chip';

interface RoomLockBadgeProps {
  readonly isRoomLocked?: boolean | null;
  readonly className?: string;
}

export const roomLockTone: StatusTone = 'info';

export function RoomLockBadge({
  isRoomLocked,
  className = '',
}: RoomLockBadgeProps) {
  if (!isRoomLocked) {
    return null;
  }

  return (
    <StatusChip
      tone={roomLockTone}
      label={t('reservations.roomLock.badge')}
      className={className}
    />
  );
}
