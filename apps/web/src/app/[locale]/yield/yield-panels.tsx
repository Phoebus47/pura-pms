'use client';

import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
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

const buttonClass = 'min-h-11 w-full sm:w-auto';

const REASON_KEYS: Record<YieldRecommendReason, string> = {
  HIGH_DEMAND: 'yield.reasonHighDemand',
  SLOW_PACE: 'yield.reasonSlowPace',
  COMP_UNDERCUT: 'yield.reasonCompUndercut',
};

export function PaceTable({ days }: { readonly days: YieldPaceDay[] }) {
  if (days.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t('yield.paceEmpty')}</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="text-left text-sm w-full">
        <thead>
          <tr className="border-b border-rule-mist text-foreground">
            <th scope="col" className="font-medium pr-3 py-2">
              {t('yield.stayDate')}
            </th>
            <th scope="col" className="font-medium pr-3 py-2">
              {t('yield.occupancy')}
            </th>
            <th scope="col" className="font-medium pr-3 py-2">
              {t('yield.lastYear')}
            </th>
            <th scope="col" className="font-medium py-2">
              {t('yield.paceDelta')}
            </th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.stayDate} className="border-b border-slate-100">
              <td className="pr-3 py-2">{day.stayDate}</td>
              <td className="pr-3 py-2">
                {day.occupied}/{day.capacity} ({day.occupancyPct}%)
              </td>
              <td className="pr-3 py-2">{day.lastYearOccupancyPct}%</td>
              <td className="py-2">
                {day.paceDeltaPct}%
                {day.alert ? ` · ${t('yield.paceAlert')}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RecommendationList({
  recommendations,
}: {
  readonly recommendations: YieldRecommendation[];
}) {
  const applyMutation = useApplyYieldRecommendation();
  const dismissMutation = useDismissYieldRecommendation();

  if (recommendations.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t('yield.recEmpty')}</p>
    );
  }

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

  return (
    <ul className="space-y-3">
      {recommendations.map((row) => (
        <li
          key={row.id}
          className="border border-rule-mist p-3 rounded-md space-y-2"
        >
          <p className="font-medium text-foreground">
            {row.rate?.code ?? row.rateId} · {row.stayDate}
          </p>
          <p className="text-muted-foreground text-sm">
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
