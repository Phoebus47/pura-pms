'use client';

import { useState } from 'react';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionHeading } from '@/components/shared/section-heading';
import { statusToneInk } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { JournalEntry, TrialBalanceReport } from '@/lib/api/reports';

interface TrialBalancePanelProps {
  readonly report?: TrialBalanceReport;
  readonly journals: JournalEntry[];
  readonly loading: boolean;
}

interface DrillLine {
  readonly id: string;
  readonly source: string;
  readonly debit: number;
  readonly credit: number;
}

type TrialBalanceRow = TrialBalanceReport['rows'][number];

function drillColumns(): DataTableColumn<DrillLine>[] {
  return [
    {
      id: 'source',
      header: t('reports.journalsSource'),
      cell: (line) => line.source,
    },
    {
      id: 'debit',
      header: t('reports.tbDebit'),
      numeric: true,
      cell: (line) => line.debit.toFixed(2),
    },
    {
      id: 'credit',
      header: t('reports.tbCredit'),
      numeric: true,
      cell: (line) => line.credit.toFixed(2),
    },
  ];
}

export function TrialBalancePanel({
  report,
  journals,
  loading,
}: TrialBalancePanelProps) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const drillLines: DrillLine[] = journals.flatMap((entry) =>
    entry.lines
      .filter((line) => line.account?.code === selectedCode)
      .map((line) => ({
        id: line.id,
        source: entry.source,
        debit: Number(line.debit),
        credit: Number(line.credit),
      })),
  );

  if (loading) {
    return <p className="text-ink-subtle text-sm">{t('reports.loading')}</p>;
  }
  if (!report || report.rows.length === 0) {
    return <EmptyState title={t('reports.tbEmpty')} />;
  }

  const columns: DataTableColumn<TrialBalanceRow>[] = [
    {
      id: 'account',
      header: t('reports.tbAccount'),
      cell: (row) => (
        <button
          type="button"
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring min-h-11 rounded-md text-left underline"
          onClick={() => setSelectedCode(row.accountCode)}
        >
          {row.accountCode} {row.accountName}
        </button>
      ),
    },
    {
      id: 'debit',
      header: t('reports.tbDebit'),
      numeric: true,
      cell: (row) => row.debit.toFixed(2),
    },
    {
      id: 'credit',
      header: t('reports.tbCredit'),
      numeric: true,
      cell: (row) => row.credit.toFixed(2),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        caption={t('reports.tbTitle')}
        columns={columns}
        rows={report.rows}
        rowKey={(row) => row.accountCode}
        density="compact"
        stickyHeader
      />
      {/* DataTable has no footer slot, so the balance totals sit below the table. */}
      <div className="border-rule-strong border-t flex flex-wrap gap-6 items-baseline pt-3 text-sm">
        <p className="font-semibold text-ink-strong">{t('reports.total')}</p>
        <dl className="flex flex-wrap gap-6 items-baseline ml-auto">
          <div className="flex gap-2 items-baseline">
            <dt className="font-semibold text-ink-strong">
              {t('reports.tbDebit')}
            </dt>
            <dd className={cn('font-bold tabular-nums', statusToneInk.info)}>
              {report.totalDebit.toFixed(2)}
            </dd>
          </div>
          <div className="flex gap-2 items-baseline">
            <dt className="font-semibold text-ink-strong">
              {t('reports.tbCredit')}
            </dt>
            <dd
              className={cn('font-bold tabular-nums', statusToneInk.positive)}
            >
              {report.totalCredit.toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>
      {selectedCode ? (
        <div className="space-y-2">
          <SectionHeading
            title={`${t('reports.tbDrilldown')}: ${selectedCode}`}
          />
          {drillLines.length === 0 ? (
            <p className="text-ink-subtle text-sm">
              {t('reports.journalsEmpty')}
            </p>
          ) : (
            <DataTable
              caption={t('reports.tbDrilldown')}
              columns={drillColumns()}
              rows={drillLines}
              rowKey={(line) => line.id}
              density="compact"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
