'use client';

import { cn } from '@/lib/utils';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';

interface ErrorDisplayProps {
  readonly error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div
      className={cn('border p-4 rounded-xl', statusToneSurface.critical)}
      role="alert"
    >
      <p className={cn('text-sm', statusToneInk.critical)}>{error}</p>
    </div>
  );
}
