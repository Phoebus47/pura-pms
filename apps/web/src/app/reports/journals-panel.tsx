'use client';

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

  const lines = journals.flatMap((entry) =>
    entry.lines.map((line) => ({
      id: line.id,
      source: entry.source,
      code: line.account?.code ?? '',
      debit: Number(line.debit),
      credit: Number(line.credit),
    })),
  );

  return (
    <div className="space-y-4">
      <Button
        type="button"
        className="min-h-11"
        disabled={!propertyId || !date}
        onClick={() => void handlePost()}
      >
        {t('reports.postJournals')}
      </Button>
      {loading ? (
        <p className="text-slate-600 text-sm">{t('reports.loading')}</p>
      ) : lines.length === 0 ? (
        <p className="text-slate-600 text-sm">{t('reports.journalsEmpty')}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {lines.map((line) => (
            <li key={line.id}>
              {line.source} · {line.code} · {line.debit.toFixed(2)} /{' '}
              {line.credit.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
