'use client';

import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { reportsAPI, type JournalEntry } from '@/lib/api/reports';

interface JournalsPanelProps {
  readonly propertyId?: string;
  readonly date: string;
  readonly journals: JournalEntry[];
  readonly loading: boolean;
  readonly onPosted: () => void;
}

interface JournalLineRow {
  readonly id: string;
  readonly source: string;
  readonly code: string;
  readonly debit: number;
  readonly credit: number;
}

function journalColumns(): DataTableColumn<JournalLineRow>[] {
  return [
    {
      id: 'source',
      header: t('reports.journalsSource'),
      cell: (line) => line.source,
    },
    {
      id: 'account',
      header: t('reports.tbAccount'),
      cell: (line) => line.code,
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

export function JournalsPanel({
  propertyId,
  date,
  journals,
  loading,
  onPosted,
}: JournalsPanelProps) {
  async function handlePost() {
    if (!propertyId || !date) return;
    try {
      await reportsAPI.postJournals(propertyId, date);
      toast.success(t('reports.journalsPosted'));
      onPosted();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('reports.postJournals'),
      );
    }
  }

  const lines: JournalLineRow[] = journals.flatMap((entry) =>
    entry.lines.map((line) => ({
      id: line.id,
      source: entry.source,
      code: line.account?.code ?? '',
      debit: Number(line.debit),
      credit: Number(line.credit),
    })),
  );

  function renderLines() {
    if (loading) {
      return <p className="text-ink-subtle text-sm">{t('reports.loading')}</p>;
    }
    if (lines.length === 0) {
      return <EmptyState title={t('reports.journalsEmpty')} />;
    }
    return (
      <DataTable
        caption={t('reports.journalsTitle')}
        columns={journalColumns()}
        rows={lines}
        rowKey={(line) => line.id}
        density="compact"
        stickyHeader
      />
    );
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        disabled={!propertyId || !date}
        onClick={() => void handlePost()}
      >
        {t('reports.postJournals')}
      </Button>
      {renderLines()}
    </div>
  );
}
