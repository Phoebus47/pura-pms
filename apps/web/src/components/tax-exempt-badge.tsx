import { t } from '@/lib/i18n';
import type { StatusTone } from '@/lib/design/status-tone';
import { StatusChip } from './status-chip';

interface TaxExemptBadgeProps {
  readonly taxExempt?: boolean | null;
  readonly className?: string;
}

export const taxExemptTone: StatusTone = 'caution';

export function TaxExemptBadge({
  taxExempt,
  className = '',
}: TaxExemptBadgeProps) {
  if (!taxExempt) {
    return null;
  }

  return (
    <StatusChip
      tone={taxExemptTone}
      label={t('reservations.taxExempt.badge')}
      className={className}
    />
  );
}
