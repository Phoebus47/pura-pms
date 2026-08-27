'use client';

import { LineChart, Sparkles } from 'lucide-react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  useApplyYieldRecommendation,
  useDismissYieldRecommendation,
  useGenerateYieldRecommendations,
} from '@/hooks/use-yield';
import type {
  YieldPaceDay,
  YieldRecommendation,
  YieldRecommendReason,
} from '@/lib/api/yield';

const buttonClass = 'w-full sm:w-auto';

const REASON_KEYS: Record<YieldRecommendReason, string> = {
  HIGH_DEMAND: 'yield.reasonHighDemand',
  SLOW_PACE: 'yield.reasonSlowPace',
  COMP_UNDERCUT: 'yield.reasonCompUndercut',
};

export function PaceTable({ days }: { readonly days: YieldPaceDay[] }) {
  const columns: DataTableColumn<YieldPaceDay>[] = [
    {
      id: 'stayDate',
      header: t('yield.stayDate'),
      cell: (day) => day.stayDate,
    },
    {
      id: 'occupancy',
      header: t('yield.occupancy'),
      numeric: true,
      cell: (day) => `${day.occupied}/${day.capacity} (${day.occupancyPct}%)`,
    },
    {
      id: 'lastYear',
      header: t('yield.lastYear'),
      numeric: true,
      hideOnMobile: true,
      cell: (day) => `${day.lastYearOccupancyPct}%`,
    },
    {
      id: 'paceDelta',
      header: t('yield.paceDelta'),
      align: 'end',
      cell: (day) => (
        <span className="flex gap-2 items-center justify-end">
          <span className="tabular-nums">{day.paceDeltaPct}%</span>
          {day.alert ? (
            <StatusBadge
              tone="caution"
              label={t('yield.paceAlert')}
              size="sm"
            />
          ) : null}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      caption={t('yield.paceCaption')}
      columns={columns}
      rows={days}
      rowKey={(day) => day.stayDate}
      stickyHeader
      emptyState={
        <EmptyState
          icon={<LineChart className="h-10 w-10" />}
          title={t('yield.paceEmpty')}
        />
      }
    />
  );
}

export function RecommendationList({
  recommendations,
}: {
  readonly recommendations: YieldRecommendation[];
}) {
  const applyMutation = useApplyYieldRecommendation();
  const dismissMutation = useDismissYieldRecommendation();

  async function apply(id: string) {
    try {
      await applyMutation.mutateAsync(id);
      toast.success(t('yield.applySuccess'));
    } catch {
      toast.error(t('yield.applyFailed'));
    }
  }

  async function dismiss(id: string) {
    try {
      await dismissMutation.mutateAsync(id);
      toast.success(t('yield.dismissSuccess'));
    } catch {
      toast.error(t('yield.dismissFailed'));
    }
  }

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-10 w-10" />}
        title={t('yield.recEmpty')}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {recommendations.map((row) => (
        <li
          key={row.id}
          className="border border-rule-mist p-4 rounded-lg space-y-2"
        >
          <p className="font-semibold text-ink-strong">
            {row.rate?.code ?? row.rateId} · {row.stayDate}
          </p>
          <p className="tabular-nums text-ink-subtle text-sm">
            {t(REASON_KEYS[row.reason])} · {row.currentAmount} →{' '}
            {row.recommendedAmount} ({row.occupancyPct}%)
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className={buttonClass}
              onClick={() => apply(row.id)}
            >
              {t('yield.apply')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className={buttonClass}
              onClick={() => dismiss(row.id)}
            >
              {t('yield.dismiss')}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function GenerateButton({
  propertyId,
}: {
  readonly propertyId: string;
}) {
  const generateMutation = useGenerateYieldRecommendations();

  async function handleClick() {
    try {
      await generateMutation.mutateAsync(propertyId);
      toast.success(t('yield.generateSuccess'));
    } catch {
      toast.error(t('yield.generateFailed'));
    }
  }

  return (
    <Button type="button" className={buttonClass} onClick={handleClick}>
      {t('yield.generate')}
    </Button>
  );
}
