'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    // role="status" so a list that empties out after a filter change is announced.
    <div role="status" className={cn('py-12 text-center', className)}>
      {icon && (
        <div
          className="flex justify-center mb-4 text-ink-disabled"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h2 className="font-semibold text-ink-strong text-lg">{title}</h2>
      {description && (
        <p className="mt-2 text-ink-subtle text-sm">{description}</p>
      )}
      {action && <div className="flex justify-center mt-6">{action}</div>}
    </div>
  );
}
