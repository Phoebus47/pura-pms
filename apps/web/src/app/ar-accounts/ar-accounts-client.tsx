'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="max-w-3xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('ar.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">{t('ar.subtitle')}</p>
      </header>

      {propertyId ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('ar.create')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateArAccountForm propertyId={propertyId} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('ar.transfer')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TransferFolioForm userId={userId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('ar.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ArAccountList
            accounts={accounts}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </CardContent>
      </Card>

      {selectedId && aging ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('ar.aging')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              {t('ar.current')} {aging.current.toFixed(2)} · {t('ar.days30')}{' '}
              {aging.days30.toFixed(2)} · {t('ar.days60')}{' '}
              {aging.days60.toFixed(2)} · {t('ar.days90')}{' '}
              {aging.days90.toFixed(2)}
            </p>
            <Link
              href={`/ar-accounts/${selectedId}/statement`}
              className="border inline-flex items-center justify-center min-h-11 px-4 rounded-md text-sm"
            >
              {t('ar.printStatement')}
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('ar.invoices')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ArInvoicePanel
            invoices={invoices}
            paidBy={userId}
            businessDate={businessDate || '2026-08-14'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
