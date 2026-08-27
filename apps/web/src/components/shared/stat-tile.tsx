'use client';

import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { statusToneInk, type StatusTone } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';

export interface StatTileProps {
  readonly label: string;
  readonly value: string | number;
  readonly hint?: string;
  readonly tone?: StatusTone;
  readonly href?: string;
  readonly icon?: ReactNode;
  readonly className?: string;
}

const TILE_BASE = 'rounded-xl border border-rule-mist bg-surface-desk p-4';

export function StatTile({
  label,
  value,
  hint,
  tone,
  href,
  icon,
  className,
}: StatTileProps) {
  const valueInk =
    tone && tone !== 'brand' ? statusToneInk[tone] : 'text-pura-blue';

  const body = (
    <>
      <div className="flex gap-2 items-start justify-between">
        <p className="text-ink-subtle text-sm">{label}</p>
        {icon && (
          <span className="text-ink-subtle" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueInk)}>
        {value}
      </p>
      {hint && <p className="mt-1 text-ink-subtle text-xs">{hint}</p>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          TILE_BASE,
          'block transition-colors hover:border-pura-blue/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
      >
        {body}
      </Link>
    );
  }

  return <div className={cn(TILE_BASE, className)}>{body}</div>;
}
