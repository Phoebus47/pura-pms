'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { EntitySelect } from '@/components/shared/entity-select';
import { StatusBadge } from '@/components/shared/status-badge';
import type { StatusTone } from '@/lib/design/status-tone';
import { useOpenFolios } from '@/hooks/use-folios';
import { folioOptionLabel } from '@/lib/entity-labels';
import {
  useCaptureCardPreauth,
  useIncrementCardPreauth,
  useReleaseCardPreauth,
} from '@/hooks/use-card-preauths';
import type { CardPreauth } from '@/lib/api/card-preauths';

const STATUS_TONE: Record<string, StatusTone> = {
  HELD: 'info',
  INCREMENTAL: 'caution',
  CAPTURED: 'positive',
  RELEASED: 'neutral',
};

function reportError(err: unknown, fallbackKey: string) {
  toast.error(err instanceof Error ? err.message : t(fallbackKey));
}

interface ListProps {
  readonly holds: CardPreauth[];
  readonly userId: string;
  readonly propertyId?: string;
}

export function CardPreauthList({ holds, userId, propertyId }: ListProps) {
  const incrementMutation = useIncrementCardPreauth();
  const captureMutation = useCaptureCardPreauth();
  const releaseMutation = useReleaseCardPreauth();
  const { data: folios = [] } = useOpenFolios(propertyId);
  const [amountById, setAmountById] = useState<Record<string, string>>({});
  const [folioById, setFolioById] = useState<Record<string, string>>({});

  if (holds.length === 0) {
    return <EmptyState title={t('preauth.empty')} />;
  }

  function renderActions(hold: CardPreauth) {
    const isOpen = hold.status === 'HELD' || hold.status === 'INCREMENTAL';
    if (!isOpen) return null;

    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <Input
          id={`inc-${hold.id}`}
          name={`inc-${hold.id}`}
          type="number"
          min={0.01}
          className="sm:w-32"
          aria-label={t('preauth.incrementAmount')}
          value={amountById[hold.id] ?? ''}
          onChange={(event) =>
            setAmountById((current) => ({
              ...current,
              [hold.id]: event.target.value,
            }))
          }
        />
        <Button
          type="button"
          variant="outline"
          disabled={incrementMutation.isPending}
          onClick={() =>
            void incrementMutation
              .mutateAsync({ id: hold.id, amount: Number(amountById[hold.id]) })
              .then(() => toast.success(t('preauth.incrementSuccess')))
              .catch((err: unknown) => reportError(err, 'preauth.increment'))
          }
        >
          {t('preauth.increment')}
        </Button>
        <EntitySelect
          id={`folio-${hold.id}`}
          name={`folio-${hold.id}`}
          label={t('preauth.folioId')}
          value={folioById[hold.id] ?? ''}
          onChange={(value) =>
            setFolioById((current) => ({ ...current, [hold.id]: value }))
          }
          options={folios.map((folio) => ({
            value: folio.id,
            label: folioOptionLabel(folio),
          }))}
          required
        />
        <Button
          type="button"
          disabled={captureMutation.isPending}
          onClick={() =>
            void captureMutation
              .mutateAsync({
                id: hold.id,
                folioId: folioById[hold.id],
                userId,
              })
              .then(() => toast.success(t('preauth.captureSuccess')))
              .catch((err: unknown) => reportError(err, 'preauth.capture'))
          }
        >
          {t('preauth.capture')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={releaseMutation.isPending}
          onClick={() =>
            void releaseMutation
              .mutateAsync(hold.id)
              .then(() => toast.success(t('preauth.releaseSuccess')))
              .catch((err: unknown) => reportError(err, 'preauth.release'))
          }
        >
          {t('preauth.release')}
        </Button>
      </div>
    );
  }

  const columns: DataTableColumn<CardPreauth>[] = [
    {
      id: 'card',
      header: t('preauth.last4'),
      cell: (hold) => `****${hold.last4}`,
    },
    {
      id: 'amount',
      header: t('preauth.amount'),
      numeric: true,
      cell: (hold) => Number(hold.amount).toFixed(2),
    },
    {
      id: 'status',
      header: t('preauth.status'),
      cell: (hold) => (
        <StatusBadge
          tone={STATUS_TONE[hold.status] ?? 'neutral'}
          label={hold.status}
          size="sm"
        />
      ),
    },
    {
      id: 'manualRef',
      header: t('preauth.manualRef'),
      hideOnMobile: true,
      cell: (hold) => hold.manualRef,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: renderActions,
    },
  ];

  return (
    <DataTable
      caption={t('preauth.list')}
      columns={columns}
      rows={holds}
      rowKey={(hold) => hold.id}
      stickyHeader
    />
  );
}
