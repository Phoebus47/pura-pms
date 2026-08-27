import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ReservationStatus } from '@/lib/api/reservations';

interface ReservationStatusBadgeProps {
  readonly status: ReservationStatus;
  readonly className?: string;
  readonly size?: 'default' | 'xs';
}

const statusConfig: Record<
  ReservationStatus,
  { className: string; labelKey: string }
> = {
  TENTATIVE: {
    labelKey: 'reservations.status.TENTATIVE',
    className: 'bg-slate-100 text-foreground ring-slate-600/20',
  },
  CONFIRMED: {
    labelKey: 'reservations.status.CONFIRMED',
    className: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  },
  CHECKED_IN: {
    labelKey: 'reservations.status.CHECKED_IN',
    className: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  },
  CHECKED_OUT: {
    labelKey: 'reservations.status.CHECKED_OUT',
    className: 'bg-purple-100 text-purple-700 ring-purple-600/20',
  },
  CANCELLED: {
    labelKey: 'reservations.status.CANCELLED',
    className: 'bg-red-100 text-red-700 ring-red-600/20',
  },
  NO_SHOW: {
    labelKey: 'reservations.status.NO_SHOW',
    className: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  },
  WALKED: {
    labelKey: 'reservations.status.WALKED',
    className: 'bg-orange-100 text-orange-700 ring-orange-600/20',
  },
};

export function ReservationStatusBadge({
  status,
  className,
  size = 'default',
}: ReservationStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold ring-1 ring-inset shrink-0 whitespace-nowrap',
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        config.className,
        className,
      )}
    >
      {t(config.labelKey)}
    </span>
  );
}
