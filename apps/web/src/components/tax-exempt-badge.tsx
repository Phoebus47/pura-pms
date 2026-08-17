import { t } from '@/lib/i18n';

interface TaxExemptBadgeProps {
  readonly taxExempt?: boolean | null;
  readonly className?: string;
}

export function TaxExemptBadge({
  taxExempt,
  className = '',
}: TaxExemptBadgeProps) {
  if (!taxExempt) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-900 text-xs ${className}`}
    >
      {t('reservations.taxExempt.badge')}
    </span>
  );
}
