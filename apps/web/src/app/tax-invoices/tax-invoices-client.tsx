'use client';

import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaxInvoices } from '@/hooks/use-tax-invoices';
import { IssueTaxInvoiceForm, TaxInvoiceList } from './tax-invoice-panels';

export function TaxInvoicesClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: invoices = [] } = useTaxInvoices(propertyId);

  return (
    <div className="max-w-3xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-3xl text-pura-blue">
          {t('taxInvoice.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">
          {t('taxInvoice.subtitle')}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('taxInvoice.issue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <IssueTaxInvoiceForm issuedBy={userId} propertyId={propertyId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('taxInvoice.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TaxInvoiceList invoices={invoices} voidedBy={userId} />
        </CardContent>
      </Card>
    </div>
  );
}
