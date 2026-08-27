'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAllocateArPayment } from '@/hooks/use-ar-accounts';
import type { ArInvoice } from '@/lib/api/ar-accounts';

const fieldClass = 'min-h-11';

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
    return (
      <p className="text-muted-foreground text-sm">{t('ar.selectAccount')}</p>
    );
  }

  return (
    <ul className="space-y-4">
      {invoices.map((invoice) => {
        const open = Number(invoice.amount) - Number(invoice.paidAmount);
        return (
          <li
            key={invoice.id}
            className="border-b last:border-0 pb-4 space-y-2"
          >
            <p className="text-sm">
              {invoice.invoiceNumber} · {Number(invoice.amount).toFixed(2)} ·{' '}
              {invoice.status}
            </p>
            {invoice.status !== 'PAID' && invoice.status !== 'VOID' && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id={`payAmount-${invoice.id}`}
                  name={`payAmount-${invoice.id}`}
                  type="number"
                  min={0.01}
                  step="0.01"
                  className={fieldClass}
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
                  className="min-h-11"
                  disabled={allocateMutation.isPending}
                  onClick={() => void handlePay(invoice.id)}
                >
                  {t('ar.allocateSubmit')}
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
