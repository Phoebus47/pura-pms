import { t } from '@/lib/i18n';
import type { RevenueBucket } from '@/lib/api/reports';

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface DailyRevenueTableProps {
  readonly groups: ReadonlyArray<readonly [string, RevenueBucket]>;
  readonly totalRevenue: number;
}

export function DailyRevenueTable({
  groups,
  totalRevenue,
}: DailyRevenueTableProps) {
  if (groups.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t('reports.empty')}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-left text-sm w-full">
        <caption className="sr-only">{t('reports.drrTitle')}</caption>
        <thead>
          <tr className="border-b">
            <th scope="col" className="pr-4 py-2">
              {t('reports.group')}
            </th>
            <th scope="col" className="pr-4 py-2 text-right">
              {t('reports.net')}
            </th>
            <th scope="col" className="pr-4 py-2 text-right">
              {t('reports.service')}
            </th>
            <th scope="col" className="pr-4 py-2 text-right">
              {t('reports.tax')}
            </th>
            <th scope="col" className="py-2 text-right">
              {t('reports.total')}
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map(([group, bucket]) => (
            <tr key={group} className="border-b border-border">
              <th scope="row" className="font-medium pr-4 py-2">
                {group}
              </th>
              <td className="pr-4 py-2 text-right">
                {formatMoney(bucket.net)}
              </td>
              <td className="pr-4 py-2 text-right">
                {formatMoney(bucket.service)}
              </td>
              <td className="pr-4 py-2 text-right">
                {formatMoney(bucket.tax)}
              </td>
              <td className="py-2 text-right">{formatMoney(bucket.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="pr-4 pt-3">
              {t('reports.totalRevenue')}
            </th>
            <td colSpan={3} />
            <td className="font-bold pt-3 text-right">
              {formatMoney(totalRevenue)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
