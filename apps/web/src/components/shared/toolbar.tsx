'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ToolbarProps {
  readonly search?: ReactNode;
  readonly filters?: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string;
}

export function Toolbar({ search, filters, actions, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center',
        className,
      )}
    >
      {search && <div className="flex-1 min-w-0 sm:max-w-md">{search}</div>}
      {filters && (
        <div className="flex flex-wrap gap-3 items-center">{filters}</div>
      )}
      {actions && (
        <div className="flex flex-wrap gap-3 items-center sm:ml-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
