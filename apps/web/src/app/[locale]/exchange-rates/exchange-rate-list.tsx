'use client';

import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { useUpdateExchangeRate } from '@/hooks/use-exchange-rates';
import type { ExchangeRate } from '@/lib/api/exchange-rates';

function formatRate(rate: number): string {
  return Number(rate).toFixed(4);
}

interface ExchangeRateListProps {
  readonly rates: ExchangeRate[];
}

export function ExchangeRateList({ rates }: ExchangeRateListProps) {
  const updateMutation = useUpdateExchangeRate();

  async function handleToggle(rate: ExchangeRate) {
    try {
      await updateMutation.mutateAsync({
        id: rate.id,
        data: { isActive: !rate.isActive },
      });
      toast.success(t('fx.updateSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('fx.updateSuccess'));
    }
  }

  if (rates.length === 0) {
    return <EmptyState title={t('fx.empty')} />;
  }

  const columns: DataTableColumn<ExchangeRate>[] = [
    {
      id: 'pair',
      header: t('fx.pair'),
      cell: (rate) => `${rate.baseCurrency}/${rate.targetCurrency}`,
    },
    {
      id: 'rate',
      header: t('fx.rate'),
      numeric: true,
      cell: (rate) => formatRate(rate.rate),
    },
    {
      id: 'effectiveDate',
      header: t('fx.effectiveDate'),
      cell: (rate) => rate.effectiveDate.slice(0, 10),
    },
    {
      id: 'state',
      header: t('common.status'),
      cell: (rate) => (
        <StatusBadge
          tone={rate.isActive ? 'positive' : 'neutral'}
          label={rate.isActive ? t('common.active') : t('fx.inactive')}
          size="sm"
        />
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (rate) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={updateMutation.isPending}
          onClick={() => void handleToggle(rate)}
        >
          {rate.isActive ? t('fx.deactivate') : t('fx.activate')}
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      caption={t('fx.list')}
      columns={columns}
      rows={rates}
      rowKey={(rate) => rate.id}
      density="compact"
      stickyHeader
    />
  );
}
