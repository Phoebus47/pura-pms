import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface SplitStayBadgeProps {
  readonly className?: string;
  readonly size?: 'default' | 'xs';
}

export function SplitStayBadge({
  className,
  size = 'default',
}: SplitStayBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold ring-1 ring-inset bg-pura-sky/30 text-pura-blue ring-pura-blue/20 shrink-0 whitespace-nowrap',
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      {t('reservations.splitStay.badge')}
    </span>
  );
}
