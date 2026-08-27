import { t } from '@/lib/i18n';
import type { StatusTone } from '@/lib/design/status-tone';
import { isExtendedBillingCycle, type BillingCycle } from '@/lib/billing-cycle';
import { StatusBadge } from './shared/status-badge';

interface BillingCycleBadgeProps {
  readonly billingCycle?: BillingCycle | null;
  readonly className?: string;
}

export const billingCycleTone: Record<BillingCycle, StatusTone> = {
  NIGHTLY: 'neutral',
  WEEKLY: 'info',
  MONTHLY: 'info',
};

export function BillingCycleBadge({
  billingCycle,
  className = '',
}: BillingCycleBadgeProps) {
  if (!isExtendedBillingCycle(billingCycle)) {
    return null;
  }

  const isWeekly = billingCycle === 'WEEKLY';

  return (
    <StatusBadge
      tone={billingCycleTone[isWeekly ? 'WEEKLY' : 'MONTHLY']}
      label={
        isWeekly
          ? t('reservations.billingCycle.badgeWeekly')
          : t('reservations.billingCycle.badgeMonthly')
      }
      className={className}
    />
  );
}
