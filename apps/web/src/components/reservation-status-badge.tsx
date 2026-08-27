import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { StatusTone } from '@/lib/design/status-tone';
import type { ReservationStatus } from '@/lib/api/reservations';
import { StatusChip } from './status-chip';

interface ReservationStatusBadgeProps {
  readonly status: ReservationStatus;
  readonly className?: string;
  readonly size?: 'default' | 'xs';
}

export const reservationStatusTone: Record<ReservationStatus, StatusTone> = {
  TENTATIVE: 'caution',
  CONFIRMED: 'info',
  CHECKED_IN: 'positive',
  CHECKED_OUT: 'neutral',
  CANCELLED: 'critical',
  // No-show still needs desk action (post the fee, release the room), so it
  // reads as an exception rather than a settled cancellation.
  NO_SHOW: 'caution',
  WALKED: 'caution',
};

const reservationStatusLabelKey: Record<ReservationStatus, string> = {
  TENTATIVE: 'reservations.status.TENTATIVE',
  CONFIRMED: 'reservations.status.CONFIRMED',
  CHECKED_IN: 'reservations.status.CHECKED_IN',
  CHECKED_OUT: 'reservations.status.CHECKED_OUT',
  CANCELLED: 'reservations.status.CANCELLED',
  NO_SHOW: 'reservations.status.NO_SHOW',
  WALKED: 'reservations.status.WALKED',
};

export function ReservationStatusBadge({
  status,
  className,
  size = 'default',
}: ReservationStatusBadgeProps) {
  return (
    <StatusChip
      tone={reservationStatusTone[status]}
      label={t(reservationStatusLabelKey[status])}
      size={size === 'xs' ? 'sm' : 'md'}
      className={cn('shrink-0', className)}
    />
  );
}
