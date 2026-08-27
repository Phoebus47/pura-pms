'use client';

import { ListChecks } from 'lucide-react';
import { t } from '@/lib/i18n';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import type { HardwareJob } from '@/lib/api/hardware-bridge';
import type { StatusTone } from '@/lib/design/status-tone';

function resultText(result: unknown) {
  if (result === undefined || result === null) return '';
  if (typeof result === 'string') return result;
  try {
    return JSON.stringify(result);
  } catch {
    return '';
  }
}

function jobTone(status: HardwareJob['status']): StatusTone {
  if (status === 'COMPLETED') return 'positive';
  if (status === 'FAILED') return 'critical';
  if (status === 'PENDING') return 'caution';
  if (status === 'CANCELLED') return 'neutral';
  return 'info';
}

export function HbJobsPanel({ jobs }: { readonly jobs: HardwareJob[] }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<ListChecks className="h-10 w-10" />}
        title={t('hardwareBridge.emptyJobs')}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {jobs.map((job) => {
        const scanText = resultText(job.result);
        return (
          <li
            key={job.id}
            className="border border-rule-mist p-4 rounded-lg space-y-1"
          >
            <p className="flex flex-wrap font-semibold gap-2 items-center text-ink-strong text-sm">
              {job.type}
              <StatusBadge
                tone={jobTone(job.status)}
                label={job.status}
                size="sm"
              />
            </p>
            <p className="text-ink-subtle text-sm">{job.requestedBy}</p>
            {job.errorMessage ? (
              <p className="text-sm text-status-critical-ink">
                {job.errorMessage}
              </p>
            ) : null}
            {scanText ? (
              <p className="text-ink-subtle text-sm">
                {t('hardwareBridge.scanResult')}: {scanText}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
