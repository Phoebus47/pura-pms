import { t } from '@/lib/i18n';
import type { StatusTone } from '@/lib/design/status-tone';
import { StatusBadge } from './shared/status-badge';

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
    <StatusBadge
      tone={roomLockTone}
      label={t('reservations.roomLock.badge')}
      className={className}
    />
  );
}
