import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { StatusTone } from '@/lib/design/status-tone';
import { StatusChip } from './status-chip';

interface DayUseBadgeProps {
  readonly className?: string;
  readonly size?: 'default' | 'xs';
}

export const dayUseTone: StatusTone = 'caution';

export function DayUseBadge({ className, size = 'default' }: DayUseBadgeProps) {
  return (
    <StatusChip
      tone={dayUseTone}
      label={t('common.dayUse')}
      size={size === 'xs' ? 'sm' : 'md'}
      className={cn('shrink-0', className)}
    />
  );
}
