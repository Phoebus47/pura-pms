import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { t } from '@/lib/i18n';
import type { RevenueBucket } from '@/lib/api/reports';

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type RevenueRow = readonly [string, RevenueBucket];

function revenueColumns(): DataTableColumn<RevenueRow>[] {
  return [
    { id: 'group', header: t('reports.group'), cell: ([group]) => group },
    {
      id: 'net',
      header: t('reports.net'),
      numeric: true,
      cell: ([, bucket]) => formatMoney(bucket.net),
    },
    {
      id: 'service',
      header: t('reports.service'),
      numeric: true,
      cell: ([, bucket]) => formatMoney(bucket.service),
    },
    {
      id: 'tax',
      header: t('reports.tax'),
      numeric: true,
      cell: ([, bucket]) => formatMoney(bucket.tax),
    },
    {
      id: 'total',
      header: t('reports.total'),
      numeric: true,
      cell: ([, bucket]) => formatMoney(bucket.total),
    },
  ];
}

interface DailyRevenueTableProps {
  readonly groups: ReadonlyArray<RevenueRow>;
  readonly totalRevenue: number;
}

export function DailyRevenueTable({
  groups,
  totalRevenue,
}: DailyRevenueTableProps) {
  if (groups.length === 0) {
    return <EmptyState title={t('reports.empty')} />;
  }

  return (
    <div className="space-y-4">
      <DataTable
        caption={t('reports.drrTitle')}
        columns={revenueColumns()}
        rows={[...groups]}
        rowKey={([group]) => group}
        density="compact"
        stickyHeader
      />
      {/* DataTable has no footer slot, so the report total sits below the table. */}
      <div className="border-rule-strong border-t flex gap-4 items-baseline justify-between pt-3">
        <span className="font-semibold text-ink-strong text-sm">
          {t('reports.totalRevenue')}
        </span>
        <span className="font-bold tabular-nums text-ink-strong text-sm">
          {formatMoney(totalRevenue)}
        </span>
      </div>
    </div>
  );
}
