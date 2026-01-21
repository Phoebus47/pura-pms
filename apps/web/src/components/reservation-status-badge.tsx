import { cn } from '@/lib/utils';
import type { ReservationStatus } from '@/lib/api/reservations';

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  className?: string;
  size?: 'default' | 'xs';
}

const statusConfig: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  TENTATIVE: {
    label: 'Tentative',
    className: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  },
  CHECKED_IN: {
    label: 'Checked In',
    className: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  },
  CHECKED_OUT: {
    label: 'Checked Out',
    className: 'bg-purple-100 text-purple-700 ring-purple-600/20',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 ring-red-600/20',
  },
  NO_SHOW: {
    label: 'No Show',
    className: 'bg-amber-100 text-amber-700 ring-amber-600/20',
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
        'inline-flex items-center rounded-full font-semibold ring-1 ring-inset',
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
