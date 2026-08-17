import { t } from '@/lib/i18n';

interface RoomLockBadgeProps {
  readonly isRoomLocked?: boolean | null;
  readonly className?: string;
}

export function RoomLockBadge({
  isRoomLocked,
  className = '',
}: RoomLockBadgeProps) {
  if (!isRoomLocked) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 font-semibold text-violet-900 text-xs ${className}`}
    >
      {t('reservations.roomLock.badge')}
    </span>
  );
}
