'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import type { JournalEntry, TrialBalanceReport } from '@/lib/api/reports';

interface TrialBalancePanelProps {
  readonly report?: TrialBalanceReport;
  readonly journals: JournalEntry[];
  readonly loading: boolean;
}

export function TrialBalancePanel({
  report,
  journals,
  loading,
}: TrialBalancePanelProps) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const drillLines = journals.flatMap((entry) =>
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
    return (
      <p className="text-muted-foreground text-sm">{t('reports.loading')}</p>
    );
  }
  if (!report || report.rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t('reports.tbEmpty')}</p>
    );
  }

  return (
    <div className="space-y-4">
      <table className="text-left text-sm w-full">
        <caption className="sr-only">{t('reports.tbTitle')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('reports.tbAccount')}</th>
            <th scope="col" className="text-right">
              {t('reports.tbDebit')}
            </th>
            <th scope="col" className="text-right">
              {t('reports.tbCredit')}
            </th>
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row) => (
            <tr key={row.accountCode}>
              <td>
                <button
                  type="button"
                  className="min-h-11 text-left underline"
                  onClick={() => setSelectedCode(row.accountCode)}
                >
                  {row.accountCode} {row.accountName}
                </button>
              </td>
              <td className="text-right">{row.debit.toFixed(2)}</td>
              <td className="text-right">{row.credit.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">{t('reports.total')}</th>
            <td className="text-right">{report.totalDebit.toFixed(2)}</td>
            <td className="text-right">{report.totalCredit.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      {selectedCode ? (
        <div>
          <h3 className="font-semibold text-sm">
            {t('reports.tbDrilldown')}: {selectedCode}
          </h3>
          {drillLines.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('reports.journalsEmpty')}
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {drillLines.map((line) => (
                <li key={line.id}>
                  {line.source} · {line.debit.toFixed(2)} /{' '}
                  {line.credit.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
