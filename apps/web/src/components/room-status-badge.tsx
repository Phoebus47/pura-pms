import { cn } from '@/lib/utils';
import type { RoomStatus } from '@/lib/api/rooms';

interface RoomStatusBadgeProps {
  readonly status: RoomStatus;
  readonly className?: string;
}

const statusConfig: Record<RoomStatus, { label: string; className: string }> = {
  VACANT_CLEAN: {
    label: 'Vacant Clean',
    className: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  },
  VACANT_DIRTY: {
    label: 'Vacant Dirty',
    className: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  },
  OCCUPIED_CLEAN: {
    label: 'Occupied Clean',
    className: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  },
  OCCUPIED_DIRTY: {
    label: 'Occupied Dirty',
    className: 'bg-purple-100 text-purple-700 ring-purple-600/20',
  },
  OUT_OF_ORDER: {
    label: 'Out of Order',
    className: 'bg-red-100 text-red-700 ring-red-600/20',
  },
  OUT_OF_SERVICE: {
    label: 'Out of Service',
    className: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  },
};

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
