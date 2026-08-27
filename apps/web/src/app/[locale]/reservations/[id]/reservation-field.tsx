import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ReservationFieldProps {
  readonly label: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function ReservationField({
  label,
  children,
  className,
}: ReservationFieldProps) {
  return (
    <div className={className}>
      <p className="font-semibold text-ink-subtle text-sm">{label}</p>
      <div className="font-semibold mt-1 text-ink-strong text-lg">
        {children}
      </div>
    </div>
  );
}

export function ReservationNote({
  label,
  children,
  className,
}: ReservationFieldProps) {
  return (
    <div className={cn('border-rule-mist border-t mt-6 pt-6', className)}>
      <p className="font-semibold text-ink-subtle text-sm">{label}</p>
      <p className="mt-2 text-ink-default whitespace-pre-wrap">{children}</p>
    </div>
  );
}
