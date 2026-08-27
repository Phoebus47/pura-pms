'use client';

import { useEffect, useMemo, useState } from 'react';
import { Receipt, Search } from 'lucide-react';
import { transactionCodesAPI } from '@/lib/api/transaction-codes';
import type { TransactionCode } from '@/lib/api/transaction-codes';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { statusToneSurface } from '@/lib/design/status-tone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { Toolbar } from '@/components/shared/toolbar';
import { TransactionCodeDialog } from './transaction-code-dialog';
import { tc } from './transaction-code-copy';

function buildColumns(
  onEdit: (item: TransactionCode) => void,
): DataTableColumn<TransactionCode>[] {
  return [
    { id: 'code', header: t('common.code'), cell: (x) => x.code },
    {
      id: 'description',
      header: t('common.description'),
      cell: (x) => x.description,
    },
    { id: 'type', header: tc('type'), cell: (x) => x.type },
    {
      id: 'group',
      header: tc('group'),
      hideOnMobile: true,
      cell: (x) => x.group,
    },
    {
      id: 'tax',
      header: tc('tax'),
      cell: (x) => (x.hasTax ? tc('yes') : tc('no')),
    },
    {
      id: 'service',
      header: tc('service'),
      cell: (x) => (x.hasService ? `${x.serviceRate ?? 0}%` : tc('no')),
    },
    {
      id: 'gl',
      header: tc('gl'),
      hideOnMobile: true,
      cell: (x) => x.glAccountCode,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (x) => (
        <Button variant="outline" onClick={() => onEdit(x)}>
          {t('common.edit')}
        </Button>
      ),
    },
  ];
}

export default function TransactionCodesSettingsPage() {
  const [items, setItems] = useState<TransactionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionCode | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (x) =>
        x.code.toLowerCase().includes(q) ||
        x.description.toLowerCase().includes(q),
    );
  }, [items, query]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionCodesAPI.list();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : tc('loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function openCreate() {
    setEditing(null);
    setIsDialogOpen(true);
  }

  const columns = useMemo(
    () =>
      buildColumns((item) => {
        setEditing(item);
        setIsDialogOpen(true);
      }),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings.transactionCodes')}
        subtitle={tc('subtitle')}
        backHref="/settings"
        actions={<Button onClick={openCreate}>{tc('newCode')}</Button>}
      />

      <Panel padding="none">
        <div className="p-(--panel-pad) space-y-4">
          <Toolbar
            search={
              <div className="relative">
                <Label htmlFor="search" className="sr-only">
                  {t('common.search')}
                </Label>
                <Search
                  className="-translate-y-1/2 absolute h-4 left-3 pointer-events-none text-ink-subtle top-1/2 w-4"
                  aria-hidden="true"
                />
                <Input
                  id="search"
                  name="search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tc('searchPlaceholder')}
                  className="pl-9"
                />
              </div>
            }
            actions={
              <Button
                type="button"
                variant="outline"
                onClick={() => void refresh()}
                disabled={loading}
              >
                {tc('refresh')}
              </Button>
            }
          />

          {error && (
            <div
              role="alert"
              className={cn(
                'border p-4 rounded-xl',
                statusToneSurface.critical,
              )}
            >
              <p className="text-sm text-status-critical-ink">{error}</p>
            </div>
          )}
        </div>

        <DataTable
          caption={tc('caption')}
          columns={columns}
          rows={loading ? [] : filtered}
          rowKey={(x) => x.id}
          stickyHeader
          emptyState={
            loading ? (
              <LoadingSpinner message={t('common.loadingEllipsis')} />
            ) : (
              <EmptyState
                icon={<Receipt className="h-10 w-10" />}
                title={tc('empty')}
              />
            )
          }
        />
      </Panel>

      <TransactionCodeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSaved={async () => {
          setIsDialogOpen(false);
          await refresh();
        }}
        editing={editing}
      />
    </div>
  );
}
