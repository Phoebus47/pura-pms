'use client';

import { statusToneClass, type StatusTone } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';

export type StatusBadgeSize = 'sm' | 'md';

export interface StatusBadgeProps {
  readonly tone: StatusTone;
  readonly label: string;
  readonly size?: StatusBadgeSize;
  readonly icon?: React.ReactNode;
  readonly className?: string;
}

const BADGE_SIZE: Record<StatusBadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs',
  md: 'px-2.5 py-1 text-xs',
};

export function StatusBadge({
  tone,
  label,
  size = 'md',
  icon,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset whitespace-nowrap',
        BADGE_SIZE[size],
        statusToneClass[tone],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
