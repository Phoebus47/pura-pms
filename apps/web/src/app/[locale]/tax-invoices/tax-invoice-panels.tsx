'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntitySelect } from '@/components/shared/entity-select';
import { useOpenFolios } from '@/hooks/use-folios';
import { folioOptionLabel } from '@/lib/entity-labels';
import {
  useIssueTaxInvoice,
  useVoidTaxInvoice,
} from '@/hooks/use-tax-invoices';
import type { TaxInvoice } from '@/lib/api/tax-invoices';

const fieldClass = 'min-h-11';
const buttonClass = 'min-h-11 w-full sm:w-auto';

interface IssueFormProps {
  readonly issuedBy: string;
  readonly propertyId?: string;
}

export function IssueTaxInvoiceForm({ issuedBy, propertyId }: IssueFormProps) {
  const issueMutation = useIssueTaxInvoice();
  const { data: folios = [] } = useOpenFolios(propertyId);
  const [folioId, setFolioId] = useState('');
  const [taxId, setTaxId] = useState('');
  const [branchNumber, setBranchNumber] = useState('');
  const [buyerName, setBuyerName] = useState('');

  async function handleSubmit() {
    try {
      await issueMutation.mutateAsync({
        folioId,
        taxId,
        branchNumber: branchNumber || undefined,
        buyerName: buyerName || undefined,
        issuedBy,
      });
      toast.success(t('taxInvoice.issueSuccess'));
      setFolioId('');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('taxInvoice.issueSubmit'),
      );
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <div className="space-y-2">
        <EntitySelect
          id="folioId"
          name="folioId"
          label={t('taxInvoice.folioId')}
          value={folioId}
          onChange={setFolioId}
          options={folios.map((folio) => ({
            value: folio.id,
            label: folioOptionLabel(folio),
          }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="buyerTaxId">{t('taxInvoice.taxId')}</Label>
        <Input
          id="buyerTaxId"
          name="taxId"
          className={fieldClass}
          value={taxId}
          onChange={(event) => setTaxId(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="branchNumber">{t('taxInvoice.branchNumber')}</Label>
        <Input
          id="branchNumber"
          name="branchNumber"
          className={fieldClass}
          value={branchNumber}
          onChange={(event) => setBranchNumber(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="buyerName">{t('taxInvoice.buyerName')}</Label>
        <Input
          id="buyerName"
          name="buyerName"
          className={fieldClass}
          value={buyerName}
          onChange={(event) => setBuyerName(event.target.value)}
        />
      </div>
      <Button
        type="submit"
        disabled={issueMutation.isPending}
        className={buttonClass}
      >
        {t('taxInvoice.issueSubmit')}
      </Button>
    </form>
  );
}

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
    return (
      <p className="text-muted-foreground text-sm">{t('taxInvoice.empty')}</p>
    );
  }

  return (
    <ul className="space-y-4">
      {invoices.map((invoice) => (
        <li key={invoice.id} className="border-b last:border-0 pb-4 space-y-2">
          <p className="text-sm">
            {invoice.invoiceNumber} · {invoice.buyerName} ·{' '}
            {Number(invoice.amountTotal).toFixed(2)} · {invoice.status}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/tax-invoices/${invoice.id}/print`}
              className="border inline-flex items-center justify-center min-h-11 px-4 rounded-md text-sm"
            >
              {t('taxInvoice.print')}
            </Link>
            {invoice.status !== 'VOID' && (
              <>
                <Input
                  id={`voidReason-${invoice.id}`}
                  name={`voidReason-${invoice.id}`}
                  className={fieldClass}
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
                  className="min-h-11"
                  disabled={voidMutation.isPending}
                  onClick={() => void handleVoid(invoice.id)}
                >
                  {t('taxInvoice.void')}
                </Button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
