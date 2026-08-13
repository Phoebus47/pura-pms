import { cn } from '@/lib/utils';

interface DayUseBadgeProps {
  readonly className?: string;
  readonly size?: 'default' | 'xs';
}

export function DayUseBadge({ className, size = 'default' }: DayUseBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold ring-1 ring-inset bg-amber-100 text-amber-800 ring-amber-600/20',
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      Day use
    </span>
  );
}
