import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { StatusTone } from '@/lib/design/status-tone';
import { isNonRevenueStay, type StayPurpose } from '@/lib/stay-purpose';
import { StatusBadge } from './shared/status-badge';

interface StayPurposeBadgeProps {
  readonly stayPurpose?: StayPurpose | null;
  readonly className?: string;
  readonly size?: 'default' | 'xs';
}

export const stayPurposeTone: Record<StayPurpose, StatusTone> = {
  STANDARD: 'neutral',
  HOUSE_USE: 'neutral',
  COMPLIMENTARY: 'positive',
};

export function StayPurposeBadge({
  stayPurpose,
  className,
  size = 'default',
}: StayPurposeBadgeProps) {
  if (!isNonRevenueStay(stayPurpose)) {
    return null;
  }

  const isHouseUse = stayPurpose === 'HOUSE_USE';

  return (
    <StatusBadge
      tone={stayPurposeTone[isHouseUse ? 'HOUSE_USE' : 'COMPLIMENTARY']}
      label={
        isHouseUse
          ? t('reservations.stayPurpose.badgeHouse')
          : t('reservations.stayPurpose.badgeComp')
      }
      size={size === 'xs' ? 'sm' : 'md'}
      className={cn('shrink-0', className)}
    />
  );
}
