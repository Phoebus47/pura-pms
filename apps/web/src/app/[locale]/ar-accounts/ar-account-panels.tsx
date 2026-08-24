'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntitySelect } from '@/components/shared/entity-select';
import { useOpenFolios } from '@/hooks/use-folios';
import { arAccountOptionLabel, folioOptionLabel } from '@/lib/entity-labels';
import {
  useCreateArAccount,
  useTransferToCityLedger,
} from '@/hooks/use-ar-accounts';
import type { ArAccount } from '@/lib/api/ar-accounts';

const fieldClass = 'min-h-11';
const buttonClass = 'min-h-11 w-full sm:w-auto';

interface CreateFormProps {
  readonly propertyId: string;
}

export function CreateArAccountForm({ propertyId }: CreateFormProps) {
  const createMutation = useCreateArAccount();
  const [companyName, setCompanyName] = useState('');
  const [creditLimit, setCreditLimit] = useState('50000');
  const [paymentTerms, setPaymentTerms] = useState('30');

  async function handleSubmit() {
    try {
      await createMutation.mutateAsync({
        propertyId,
        companyName,
        creditLimit: Number(creditLimit),
        paymentTerms: Number(paymentTerms),
      });
      toast.success(t('ar.createSuccess'));
      setCompanyName('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('ar.createSubmit'));
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
        <Label htmlFor="arCompanyName">{t('ar.companyName')}</Label>
        <Input
          id="arCompanyName"
          name="companyName"
          className={fieldClass}
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="arCreditLimit">{t('ar.creditLimit')}</Label>
        <Input
          id="arCreditLimit"
          name="creditLimit"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          className={fieldClass}
          value={creditLimit}
          onChange={(event) => setCreditLimit(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="arPaymentTerms">{t('ar.paymentTerms')}</Label>
        <Input
          id="arPaymentTerms"
          name="paymentTerms"
          type="number"
          min={0}
          className={fieldClass}
          value={paymentTerms}
          onChange={(event) => setPaymentTerms(event.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        disabled={createMutation.isPending}
        className={buttonClass}
      >
        {t('ar.createSubmit')}
      </Button>
    </form>
  );
}

interface TransferFormProps {
  readonly userId: string;
  readonly propertyId?: string;
  readonly accounts: ArAccount[];
}

export function TransferFolioForm({
  userId,
  propertyId,
  accounts,
}: TransferFormProps) {
  const transferMutation = useTransferToCityLedger();
  const { data: folios = [] } = useOpenFolios(propertyId);
  const [folioId, setFolioId] = useState('');
  const [arAccountId, setArAccountId] = useState('');

  async function handleSubmit() {
    try {
      await transferMutation.mutateAsync({
        id: arAccountId,
        data: { folioId, userId },
      });
      toast.success(t('ar.transferSuccess'));
      setFolioId('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('ar.transferSubmit'));
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
      <EntitySelect
        id="arFolioId"
        name="folioId"
        label={t('ar.folioId')}
        value={folioId}
        onChange={setFolioId}
        options={folios.map((folio) => ({
          value: folio.id,
          label: folioOptionLabel(folio),
        }))}
        required
      />
      <EntitySelect
        id="arAccountId"
        name="arAccountId"
        label={t('ar.arAccountId')}
        value={arAccountId}
        onChange={setArAccountId}
        options={accounts.map((account) => ({
          value: account.id,
          label: arAccountOptionLabel(account),
        }))}
        required
      />
      <Button
        type="submit"
        disabled={transferMutation.isPending}
        className={buttonClass}
      >
        {t('ar.transferSubmit')}
      </Button>
    </form>
  );
}

interface AccountListProps {
  readonly accounts: ArAccount[];
  readonly selectedId?: string;
  readonly onSelect: (id: string) => void;
}

export function ArAccountList({
  accounts,
  selectedId,
  onSelect,
}: AccountListProps) {
  if (accounts.length === 0) {
    return <p className="text-slate-600 text-sm">{t('ar.empty')}</p>;
  }

  return (
    <ul className="space-y-2">
      {accounts.map((account) => (
        <li key={account.id}>
          <button
            type="button"
            className="border min-h-11 px-3 py-2 rounded-md text-left text-sm w-full"
            aria-pressed={account.id === selectedId}
            onClick={() => onSelect(account.id)}
          >
            {account.accountNumber} · {account.companyName} · {t('ar.balance')}{' '}
            {Number(account.currentBalance).toFixed(2)}
          </button>
        </li>
      ))}
    </ul>
  );
}
