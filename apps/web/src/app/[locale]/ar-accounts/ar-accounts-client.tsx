'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { t } from '@/lib/i18n';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { StatTile } from '@/components/shared/stat-tile';
import { buttonVariants } from '@/components/ui/button';
import {
  useArAccounts,
  useArAging,
  useArInvoices,
} from '@/hooks/use-ar-accounts';
import {
  ArAccountList,
  CreateArAccountForm,
  TransferFolioForm,
} from './ar-account-panels';
import { ArInvoicePanel } from './ar-invoice-panel';

export function ArAccountsClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const businessDate = String(properties?.[0]?.businessDate ?? '').slice(0, 10);
  const { data: accounts = [] } = useArAccounts(propertyId);
  const [selectedId, setSelectedId] = useState<string>();
  const { data: invoices = [] } = useArInvoices(propertyId, selectedId);
  const { data: aging } = useArAging(selectedId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title={t('ar.title')} subtitle={t('ar.subtitle')} />

      {propertyId ? (
        <Panel title={t('ar.create')}>
          <CreateArAccountForm propertyId={propertyId} />
        </Panel>
      ) : null}

      <Panel title={t('ar.transfer')}>
        <TransferFolioForm
          userId={userId}
          propertyId={propertyId}
          accounts={accounts}
        />
      </Panel>

      <Panel title={t('ar.list')}>
        <ArAccountList
          accounts={accounts}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </Panel>

      {selectedId && aging ? (
        <Panel
          title={t('ar.aging')}
          actions={
            <Link
              href={`/ar-accounts/${selectedId}/statement`}
              className={buttonVariants({ variant: 'outline' })}
            >
              {t('ar.printStatement')}
            </Link>
          }
        >
          <div className="gap-4 grid lg:grid-cols-4 sm:grid-cols-2">
            <StatTile
              label={t('ar.current')}
              value={aging.current.toFixed(2)}
              tone="positive"
            />
            <StatTile
              label={t('ar.days30')}
              value={aging.days30.toFixed(2)}
              tone="caution"
            />
            <StatTile
              label={t('ar.days60')}
              value={aging.days60.toFixed(2)}
              tone="caution"
            />
            <StatTile
              label={t('ar.days90')}
              value={aging.days90.toFixed(2)}
              tone="critical"
            />
          </div>
        </Panel>
      ) : null}

      <Panel title={t('ar.invoices')} padding="none">
        <ArInvoicePanel
          invoices={invoices}
          paidBy={userId}
          businessDate={businessDate || '2026-08-14'}
        />
      </Panel>
    </div>
  );
}
