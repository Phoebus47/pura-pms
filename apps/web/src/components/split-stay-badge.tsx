import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { StatusTone } from '@/lib/design/status-tone';
import { StatusBadge } from './shared/status-badge';

interface SplitStayBadgeProps {
  readonly className?: string;
  readonly size?: 'default' | 'xs';
}

export const splitStayTone: StatusTone = 'brand';

export function SplitStayBadge({
  className,
  size = 'default',
}: SplitStayBadgeProps) {
  return (
    <StatusBadge
      tone={splitStayTone}
      label={t('reservations.splitStay.badge')}
      size={size === 'xs' ? 'sm' : 'md'}
      className={cn('shrink-0', className)}
    />
  );
}
