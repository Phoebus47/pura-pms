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
import { useAllocateArPayment } from '@/hooks/use-ar-accounts';
import type { ArInvoice } from '@/lib/api/ar-accounts';

interface InvoicePanelProps {
  readonly invoices: ArInvoice[];
  readonly paidBy: string;
  readonly businessDate: string;
}

export function ArInvoicePanel({
  invoices,
  paidBy,
  businessDate,
}: InvoicePanelProps) {
  const allocateMutation = useAllocateArPayment();
  const [amountById, setAmountById] = useState<Record<string, string>>({});

  async function handlePay(id: string) {
    try {
      await allocateMutation.mutateAsync({
        id,
        data: {
          amount: Number(amountById[id]),
          method: 'BANK_TRANSFER',
          paidBy,
          businessDate,
        },
      });
      toast.success(t('ar.allocateSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('ar.allocate'));
    }
  }

  if (invoices.length === 0) {
    return <EmptyState title={t('ar.selectAccount')} />;
  }

  const columns: DataTableColumn<ArInvoice>[] = [
    {
      id: 'invoiceNumber',
      header: t('ar.invoiceNumber'),
      cell: (invoice) => invoice.invoiceNumber,
    },
    {
      id: 'amount',
      header: t('ar.amount'),
      numeric: true,
      cell: (invoice) => Number(invoice.amount).toFixed(2),
    },
    {
      id: 'status',
      header: t('ar.status'),
      cell: (invoice) => invoice.status,
    },
    {
      id: 'allocate',
      header: t('ar.allocate'),
      cell: (invoice) => {
        if (invoice.status === 'PAID' || invoice.status === 'VOID') {
          return null;
        }
        const open = Number(invoice.amount) - Number(invoice.paidAmount);
        return (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id={`payAmount-${invoice.id}`}
              name={`payAmount-${invoice.id}`}
              type="number"
              min={0.01}
              step="0.01"
              className="sm:w-32"
              aria-label={t('ar.paymentAmount')}
              value={amountById[invoice.id] ?? String(open)}
              onChange={(event) =>
                setAmountById((current) => ({
                  ...current,
                  [invoice.id]: event.target.value,
                }))
              }
            />
            <Button
              type="button"
              disabled={allocateMutation.isPending}
              onClick={() => void handlePay(invoice.id)}
            >
              {t('ar.allocateSubmit')}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      caption={t('ar.invoices')}
      columns={columns}
      rows={invoices}
      rowKey={(invoice) => invoice.id}
      stickyHeader
    />
  );
}
