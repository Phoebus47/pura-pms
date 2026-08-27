'use client';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Tm30Report } from '@/lib/api/tm30-reports';
import type { StatusTone } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';

export function isTm30Overdue(row: Tm30Report): boolean {
  return row.status === 'PENDING' && new Date(row.dueAt).getTime() < Date.now();
}

export function tm30StatusLabel(status: Tm30Report['status']): string {
  if (status === 'PENDING') return t('tm30.statusPending');
  if (status === 'SUBMITTED') return t('tm30.statusSubmitted');
  if (status === 'CONFIRMED') return t('tm30.statusConfirmed');
  return t('tm30.statusFailed');
}

function tm30StatusTone(status: Tm30Report['status']): StatusTone {
  if (status === 'PENDING') return 'caution';
  if (status === 'SUBMITTED') return 'info';
  if (status === 'CONFIRMED') return 'positive';
  return 'critical';
}

interface Tm30ReportCardProps {
  readonly report: Tm30Report;
  readonly onSubmit: (id: string) => void;
  readonly onConfirm: (id: string) => void;
  readonly onFail: (id: string) => void;
}

export function Tm30ReportCard({
  report,
  onSubmit,
  onConfirm,
  onFail,
}: Tm30ReportCardProps) {
  return (
    <li className="border border-rule-mist p-4 rounded-lg space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <p className="font-semibold text-ink-strong">
          {report.fullName} · {t('tm30.room')} {report.roomNumber}
        </p>
        <StatusBadge
          tone={tm30StatusTone(report.status)}
          label={tm30StatusLabel(report.status)}
          size="sm"
        />
        {isTm30Overdue(report) ? (
          <StatusBadge tone="critical" label={t('tm30.overdue')} size="sm" />
        ) : null}
      </div>
      <p className="text-ink-subtle text-sm">
        {report.nationality} · {report.passportNumber}
      </p>
      {report.status === 'PENDING' ? (
        <Button type="button" onClick={() => onSubmit(report.id)}>
          {t('tm30.submit')}
        </Button>
      ) : null}
      {report.status === 'SUBMITTED' ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => onConfirm(report.id)}>
            {t('tm30.confirm')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onFail(report.id)}
          >
            {t('tm30.fail')}
          </Button>
        </div>
      ) : null}
    </li>
  );
}
