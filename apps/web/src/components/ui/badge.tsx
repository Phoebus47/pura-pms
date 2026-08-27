import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { statusToneClass, type StatusTone } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-semibold ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      size: {
        sm: 'text-2xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

/** Legacy shadcn variants, kept so existing call sites keep compiling. */
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const legacyVariantTone: Record<BadgeVariant, StatusTone> = {
  default: 'brand',
  secondary: 'neutral',
  destructive: 'critical',
  outline: 'neutral',
};

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  tone?: StatusTone;
  variant?: BadgeVariant;
}

function Badge({
  className,
  tone,
  variant,
  size,
  ...props
}: Readonly<BadgeProps>) {
  const resolvedTone =
    tone ?? (variant ? legacyVariantTone[variant] : 'neutral');

  return (
    <div
      className={cn(
        badgeVariants({ size }),
        statusToneClass[resolvedTone],
        variant === 'outline' && 'border border-border',
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
