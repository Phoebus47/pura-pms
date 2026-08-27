'use client';

import { Tag } from 'lucide-react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/empty-state';
import { useUpdateRate } from '@/hooks/use-rates';
import type { Rate } from '@/lib/api/rates';

function formulaLabel(rate: Rate, rates: Rate[]): string | null {
  if (!rate.parentRateId || !rate.deriveMode || rate.deriveValue == null) {
    return null;
  }
  const parent =
    rate.parentRate ?? rates.find((item) => item.id === rate.parentRateId);
  if (!parent) {
    return null;
  }
  const value = Number(rate.deriveValue);
  const signed = value >= 0 ? `+${value}` : `${value}`;
  if (rate.deriveMode === 'PERCENT_OFFSET') {
    return `${parent.code} ${signed}%`;
  }
  return `${parent.code} ${signed}`;
}

interface ListProps {
  readonly rates: Rate[];
}

export function RateList({ rates }: ListProps) {
  const updateMutation = useUpdateRate();

  async function saveAmount(rate: Rate, raw: string) {
    try {
      await updateMutation.mutateAsync({
        id: rate.id,
        data: { amount: Number(raw) },
      });
      toast.success(t('rates.updateSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('rates.updateFailed'));
    }
  }

  if (rates.length === 0) {
    return (
      <EmptyState
        icon={<Tag className="h-10 w-10" />}
        title={t('rates.empty')}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {rates.map((rate) => {
        const formula = formulaLabel(rate, rates);
        return (
          <li
            key={rate.id}
            className="border border-rule-mist flex flex-col gap-3 p-4 rounded-lg sm:flex-row sm:items-center sm:justify-between text-sm"
          >
            <div>
              <p className="font-semibold text-ink-strong">
                {rate.code} — {rate.name}
              </p>
              <p className="tabular-nums text-ink-subtle">
                {formula ?? t('rates.standalone')} · ฿
                {Number(rate.amount).toLocaleString()}
              </p>
            </div>
            {formula ? null : (
              <form
                className="flex gap-2 items-center"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const input = form.elements.namedItem(
                    `amount-${rate.id}`,
                  ) as HTMLInputElement;
                  void saveAmount(rate, input.value);
                }}
              >
                <Label htmlFor={`amount-${rate.id}`} className="sr-only">
                  {t('rates.amount')}
                </Label>
                <Input
                  id={`amount-${rate.id}`}
                  name={`amount-${rate.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={Number(rate.amount)}
                  className="tabular-nums w-28"
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={updateMutation.isPending}
                >
                  {t('rates.updateAmount')}
                </Button>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}
