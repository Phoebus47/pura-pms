import { t } from '@/lib/i18n';
import type { StatusTone } from '@/lib/design/status-tone';
import { StatusBadge } from './shared/status-badge';

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
    <StatusBadge
      tone={taxExemptTone}
      label={t('reservations.taxExempt.badge')}
      className={className}
    />
  );
}
