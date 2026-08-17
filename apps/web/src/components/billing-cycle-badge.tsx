import { t } from '@/lib/i18n';
import { isExtendedBillingCycle, type BillingCycle } from '@/lib/billing-cycle';

interface BillingCycleBadgeProps {
  readonly billingCycle?: BillingCycle | null;
  readonly className?: string;
}

export function BillingCycleBadge({
  billingCycle,
  className = '',
}: BillingCycleBadgeProps) {
  if (!isExtendedBillingCycle(billingCycle)) {
    return null;
  }

  const label =
    billingCycle === 'WEEKLY'
      ? t('reservations.billingCycle.badgeWeekly')
      : t('reservations.billingCycle.badgeMonthly');

  return (
    <span
      className={`inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-800 text-xs ${className}`}
    >
      {label}
    </span>
  );
}
