'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { useVoidTaxInvoice } from '@/hooks/use-tax-invoices';
import type { TaxInvoice } from '@/lib/api/tax-invoices';

interface InvoiceListProps {
  readonly invoices: TaxInvoice[];
  readonly voidedBy: string;
}

export function TaxInvoiceList({ invoices, voidedBy }: InvoiceListProps) {
  const voidMutation = useVoidTaxInvoice();
  const [reasonById, setReasonById] = useState<Record<string, string>>({});

  async function handleVoid(id: string) {
    const reason = reasonById[id]?.trim();
    if (!reason) {
      toast.error(t('taxInvoice.voidReasonRequired'));
      return;
    }
    try {
      await voidMutation.mutateAsync({
        id,
        data: { reason, voidedBy },
      });
      toast.success(t('taxInvoice.voidSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('taxInvoice.void'));
    }
  }

  if (invoices.length === 0) {
    return <EmptyState title={t('taxInvoice.empty')} />;
  }

  const columns: DataTableColumn<TaxInvoice>[] = [
    {
      id: 'invoiceNumber',
      header: t('taxInvoice.invoiceNumber'),
      cell: (invoice) => invoice.invoiceNumber,
    },
    {
      id: 'buyer',
      header: t('taxInvoice.buyer'),
      cell: (invoice) => invoice.buyerName,
    },
    {
      id: 'total',
      header: t('taxInvoice.total'),
      numeric: true,
      cell: (invoice) => Number(invoice.amountTotal).toFixed(2),
    },
    {
      id: 'status',
      header: t('taxInvoice.status'),
      cell: (invoice) => invoice.status,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (invoice) => (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/tax-invoices/${invoice.id}/print`}
            className={buttonVariants({ variant: 'outline' })}
          >
            {t('taxInvoice.print')}
          </Link>
          {invoice.status !== 'VOID' && (
            <>
              <Input
                id={`voidReason-${invoice.id}`}
                name={`voidReason-${invoice.id}`}
                className="sm:w-44"
                aria-label={t('taxInvoice.voidReason')}
                value={reasonById[invoice.id] ?? ''}
                onChange={(event) =>
                  setReasonById((current) => ({
                    ...current,
                    [invoice.id]: event.target.value,
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                disabled={voidMutation.isPending}
                onClick={() => void handleVoid(invoice.id)}
              >
                {t('taxInvoice.void')}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      caption={t('taxInvoice.list')}
      columns={columns}
      rows={invoices}
      rowKey={(invoice) => invoice.id}
      stickyHeader
    />
  );
}
