'use client';

import { t } from '@/lib/i18n';
import type { HardwareJob } from '@/lib/api/hardware-bridge';

function resultText(result: unknown) {
  if (result === undefined || result === null) return '';
  if (typeof result === 'string') return result;
  try {
    return JSON.stringify(result);
  } catch {
    return '';
  }
}

export function HbJobsPanel({ jobs }: { readonly jobs: HardwareJob[] }) {
  if (jobs.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {t('hardwareBridge.emptyJobs')}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {jobs.map((job) => {
        const scanText = resultText(job.result);
        return (
          <li
            key={job.id}
            className="border border-rule-mist p-3 rounded-md space-y-1"
          >
            <p className="font-medium text-foreground text-sm">
              {job.type} · {job.status}
            </p>
            <p className="text-muted-foreground text-sm">{job.requestedBy}</p>
            {job.errorMessage ? (
              <p className="text-muted-foreground text-sm">
                {job.errorMessage}
              </p>
            ) : null}
            {scanText ? (
              <p className="text-muted-foreground text-sm">
                {t('hardwareBridge.scanResult')}: {scanText}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
