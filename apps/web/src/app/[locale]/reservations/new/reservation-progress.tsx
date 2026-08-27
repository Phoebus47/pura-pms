'use client';

import type { LucideIcon } from 'lucide-react';
import { Panel } from '@/components/shared/panel';
import { cn } from '@/lib/utils';

export interface ReservationStep {
  readonly number: number;
  readonly title: string;
  readonly icon: LucideIcon;
}

interface ReservationProgressProps {
  readonly steps: ReservationStep[];
  readonly currentStep: number;
}

export function ReservationProgress({
  steps,
  currentStep,
}: ReservationProgressProps) {
  return (
    <Panel padding="lg">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isReached = currentStep >= step.number;
          const Icon = step.icon;
          return (
            <li key={step.number} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <span
                  className={cn(
                    'flex h-12 items-center justify-center rounded-full transition-colors w-12',
                    isReached
                      ? 'bg-pura-blue text-ink-onbrand'
                      : 'bg-surface-inset text-ink-subtle',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p
                  className={cn(
                    'font-semibold mt-2 text-center text-sm',
                    isReached ? 'text-pura-blue' : 'text-ink-subtle',
                  )}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex-1 h-1 mx-4 rounded-full transition-colors',
                    currentStep > step.number
                      ? 'bg-pura-blue'
                      : 'bg-surface-inset',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
