import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { statusToneClass, type StatusTone } from '@/lib/design/status-tone';

export type StatusChipSize = 'sm' | 'md';

interface StatusChipProps {
  readonly tone: StatusTone;
  readonly label: string;
  readonly size?: StatusChipSize;
  readonly icon?: ReactNode;
  readonly className?: string;
}

const sizeClass: Record<StatusChipSize, string> = {
  sm: 'text-2xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export function StatusChip({
  tone,
  label,
  size = 'md',
  icon,
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full ring-1 ring-inset font-semibold whitespace-nowrap',
        sizeClass[size],
        statusToneClass[tone],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
