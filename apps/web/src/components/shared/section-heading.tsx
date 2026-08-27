'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  readonly title: string;
  readonly actions?: ReactNode;
  readonly className?: string;
}

export function SectionHeading({
  title,
  actions,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <h2 className="font-semibold text-2xs text-ink-subtle tracking-wide uppercase">
        {title}
      </h2>
      {actions && (
        <div className="flex flex-wrap gap-2 items-center">{actions}</div>
      )}
    </div>
  );
}
