'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntitySelect } from '@/components/shared/entity-select';
import { foliosAPI, type Folio } from '@/lib/api/folios';
import { propertiesAPI } from '@/lib/api/properties';
import { APIError } from '@/lib/api/client';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { useArAccounts } from '@/hooks/use-ar-accounts';
import { arAccountOptionLabel } from '@/lib/entity-labels';

interface FolioCheckoutBarProps {
  readonly folio: Folio;
  readonly onUpdated: () => void;
}

export function FolioCheckoutBar({ folio, onUpdated }: FolioCheckoutBarProps) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const { data: accounts = [] } = useArAccounts(properties?.[0]?.id);
  const [limit, setLimit] = useState(
    folio.creditLimit == null ? '' : String(folio.creditLimit),
  );
  const [arAccountId, setArAccountId] = useState(folio.arAccountId ?? '');
  const [busy, setBusy] = useState(false);

  async function handleSaveLimit() {
    try {
      setBusy(true);
      await foliosAPI.setCreditLimit(
        folio.id,
        limit === '' ? null : Number(limit),
      );
      toast.success(t('folios.setLimit'));
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('folios.setLimit'));
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveArAccount() {
    try {
      setBusy(true);
      await foliosAPI.setArAccount(folio.id, arAccountId.trim() || null);
      toast.success(t('folios.setArAccount'));
      onUpdated();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('folios.setArAccount'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckout() {
    try {
      setBusy(true);
      await foliosAPI.checkout(folio.id, { userId });
      toast.success(t('folios.checkoutSuccess'));
      onUpdated();
    } catch (err) {
      if (err instanceof APIError && err.status === 409) {
        toast.error(t('folios.creditLimitExceeded'));
        return;
      }
      toast.error(
        err instanceof Error ? err.message : t('folios.creditLimitExceeded'),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleReopen() {
    try {
      setBusy(true);
      await foliosAPI.reopen(folio.id);
      toast.success(t('folios.reopenSuccess'));
      onUpdated();
    } catch (err) {
      if (err instanceof APIError && err.status === 409) {
        toast.error(t('folios.reopenFailed'));
        return;
      }
      toast.error(
        err instanceof Error ? err.message : t('folios.reopenFailed'),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="folioCreditLimit">{t('folios.creditLimit')}</Label>
        <Input
          id="folioCreditLimit"
          name="creditLimit"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          className="min-h-11"
          value={limit}
          onChange={(event) => setLimit(event.target.value)}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={busy}
        onClick={() => void handleSaveLimit()}
      >
        {t('folios.setLimit')}
      </Button>
      <EntitySelect
        id="folioArAccountId"
        name="arAccountId"
        label={t('folios.arAccountId')}
        value={arAccountId}
        onChange={setArAccountId}
        options={accounts.map((account) => ({
          value: account.id,
          label: arAccountOptionLabel(account),
        }))}
      />
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={busy}
        onClick={() => void handleSaveArAccount()}
      >
        {t('folios.setArAccount')}
      </Button>
      <Button
        type="button"
        className="min-h-11"
        disabled={busy || folio.status === 'CLOSED'}
        onClick={() => void handleCheckout()}
      >
        {t('folios.checkout')}
      </Button>
      {folio.status === 'CLOSED' && (
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={busy}
          onClick={() => void handleReopen()}
        >
          {t('folios.reopen')}
        </Button>
      )}
    </div>
  );
}
