'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntitySelect } from '@/components/shared/entity-select';
import { useOpenFolios } from '@/hooks/use-folios';
import { folioOptionLabel } from '@/lib/entity-labels';
import { useIssueTaxInvoice } from '@/hooks/use-tax-invoices';

const buttonClass = 'w-full sm:w-auto';

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
          value={branchNumber}
          onChange={(event) => setBranchNumber(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="buyerName">{t('taxInvoice.buyerName')}</Label>
        <Input
          id="buyerName"
          name="buyerName"
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
