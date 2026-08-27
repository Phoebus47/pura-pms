'use client';

import { ReactNode } from 'react';

interface DetailFieldProps {
  readonly label: string;
  readonly value: ReactNode;
  readonly className?: string;
}

export function DetailField({
  label,
  value,
  className = '',
}: DetailFieldProps) {
  return (
    <div className={className}>
      <label className="font-semibold text-muted-foreground text-sm">
        {label}
      </label>
      <div className="mt-1">{value}</div>
    </div>
  );
}
