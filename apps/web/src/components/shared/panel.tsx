'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type PanelPadding = 'default' | 'lg' | 'none';

export interface PanelProps {
  readonly title?: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly padding?: PanelPadding;
  readonly className?: string;
  readonly children?: ReactNode;
}

const PANEL_PADDING: Record<PanelPadding, string> = {
  default: 'p-(--panel-pad)',
  lg: 'p-(--panel-pad-lg)',
  none: '',
};

export function Panel({
  title,
  description,
  actions,
  padding = 'default',
  className,
  children,
}: PanelProps) {
  const isFlush = padding === 'none';
  const hasHeader = Boolean(title || description || actions);

  return (
    <section
      className={cn(
        'rounded-xl border border-rule-mist bg-surface-desk shadow-panel',
        PANEL_PADDING[padding],
        className,
      )}
    >
      {hasHeader && (
        <div
          className={cn(
            'flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between',
            isFlush
              ? 'border-b border-rule-mist p-(--panel-pad)'
              : 'mb-4 sm:items-center',
          )}
        >
          <div className="min-w-0">
            {title && (
              <h2 className="font-semibold text-ink-strong text-lg">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-ink-subtle text-sm">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap gap-2 items-center">{actions}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
