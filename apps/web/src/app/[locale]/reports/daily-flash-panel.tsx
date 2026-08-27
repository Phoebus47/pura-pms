import { StatTile } from '@/components/shared/stat-tile';
import { t } from '@/lib/i18n';
import type { DailyFlashReport } from '@/lib/api/reports';

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface DailyFlashPanelProps {
  readonly flash: DailyFlashReport | undefined;
  readonly loading: boolean;
}

export function DailyFlashPanel({ flash, loading }: DailyFlashPanelProps) {
  if (loading) {
    return <p className="text-ink-subtle text-sm">{t('reports.loading')}</p>;
  }

  const items = [
    {
      label: t('reports.occupancy'),
      value: `${flash?.occupancy.occupancyRate ?? 0}%`,
    },
    {
      label: t('reports.occupiedRooms'),
      value: `${flash?.occupancy.occupiedRooms ?? 0} / ${flash?.occupancy.totalRooms ?? 0}`,
    },
    { label: t('reports.arrivals'), value: String(flash?.arrivals ?? 0) },
    { label: t('reports.departures'), value: String(flash?.departures ?? 0) },
    { label: t('reports.stayOvers'), value: String(flash?.stayOvers ?? 0) },
    {
      label: t('reports.roomRevenue'),
      value: formatMoney(flash?.roomRevenue ?? 0),
    },
    {
      label: t('reports.totalRevenue'),
      value: formatMoney(flash?.totalRevenue ?? 0),
    },
  ];

  return (
    <div className="gap-4 grid lg:grid-cols-4 sm:grid-cols-2">
      {items.map((item) => (
        <StatTile key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}
