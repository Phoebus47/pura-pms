'use client';

import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { t } from '@/lib/i18n';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { useTaxInvoices } from '@/hooks/use-tax-invoices';
import { IssueTaxInvoiceForm } from './tax-invoice-panels';
import { TaxInvoiceList } from './tax-invoice-list';

export function TaxInvoicesClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: invoices = [] } = useTaxInvoices(propertyId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={t('taxInvoice.title')}
        subtitle={t('taxInvoice.subtitle')}
      />

      <Panel title={t('taxInvoice.issue')}>
        <IssueTaxInvoiceForm issuedBy={userId} propertyId={propertyId} />
      </Panel>

      <Panel title={t('taxInvoice.list')} padding="none">
        <TaxInvoiceList invoices={invoices} voidedBy={userId} />
      </Panel>
    </div>
  );
}
