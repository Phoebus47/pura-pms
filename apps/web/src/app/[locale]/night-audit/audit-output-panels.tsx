'use client';

import { AlertCircle, FileText } from 'lucide-react';
import type { NightAuditStatus } from '@/lib/api/night-audit';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { Panel } from '@/components/shared/panel';
import { statusToneInk } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type AuditError = NonNullable<NightAuditStatus['errors']>[number];
type AuditReport = NonNullable<NightAuditStatus['reports']>[number];

export function AuditErrorsPanel({
  errors,
}: {
  readonly errors: AuditError[];
}) {
  return (
    <Panel
      title={t('nightAudit.errors')}
      padding="none"
      className="border-status-critical-line/30"
    >
      <ul className="divide-rule-mist divide-y">
        {errors.map((error) => (
          <li key={error.id} className="p-4">
            <p
              className={cn(
                'flex font-semibold gap-2 items-center text-sm',
                statusToneInk.critical,
              )}
            >
              <AlertCircle className="shrink-0 size-4" aria-hidden="true" />
              {error.errorType}
            </p>
            <p className="mt-1 text-ink-subtle text-xs">{error.description}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function AuditReportsPanel({
  reports,
}: {
  readonly reports: AuditReport[];
}) {
  return (
    <Panel title={t('nightAudit.reports')} padding="none">
      {reports.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-8" />}
          title={t('nightAudit.noReports')}
        />
      ) : (
        <ul className="divide-rule-mist divide-y">
          {reports.map((report) => (
            <li
              key={report.id}
              className="flex hover:bg-surface-sunken items-center justify-between p-4 transition-colors"
            >
              <div className="flex gap-3 items-center">
                <span className="bg-pura-blue/10 p-2 rounded-lg">
                  <FileText
                    className="size-4 text-pura-blue"
                    aria-hidden="true"
                  />
                </span>
                <p className="font-medium text-ink-default text-sm">
                  {report.reportName}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-pura-blue">
                {t('nightAudit.view')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
