import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { isNonRevenueStay, type StayPurpose } from '@/lib/stay-purpose';

interface StayPurposeBadgeProps {
  readonly stayPurpose?: StayPurpose | null;
  readonly className?: string;
  readonly size?: 'default' | 'xs';
}

export function StayPurposeBadge({
  stayPurpose,
  className,
  size = 'default',
}: StayPurposeBadgeProps) {
  if (!isNonRevenueStay(stayPurpose)) {
    return null;
  }

  const label =
    stayPurpose === 'HOUSE_USE'
      ? t('reservations.stayPurpose.badgeHouse')
      : t('reservations.stayPurpose.badgeComp');

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold ring-1 ring-inset shrink-0 whitespace-nowrap',
        stayPurpose === 'HOUSE_USE'
          ? 'bg-slate-100 text-foreground ring-slate-600/20'
          : 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      {label}
    </span>
  );
}
