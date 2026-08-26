'use client';

import { useParams } from 'next/navigation';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { PrintDocument } from '@/components/shared/print-document';
import { useTaxInvoice } from '@/hooks/use-tax-invoices';

function money(value: number): string {
  return Number(value).toFixed(2);
}

export function TaxInvoicePrintClient() {
  const params = useParams<{ id: string }>();
  const { data: invoice, isLoading } = useTaxInvoice(params.id);

  if (isLoading) {
    return <p className="p-6">{t('taxInvoice.loading')}</p>;
  }

  if (!invoice) {
    return <p className="p-6">{t('taxInvoice.notFound')}</p>;
  }

  const guest = invoice.reservation?.guest;
  const buyer =
    invoice.buyerName || (guest ? `${guest.firstName} ${guest.lastName}` : '');

  return (
    <PrintDocument>
      <header className="space-y-1">
        <h1 className="font-bold text-2xl">{t('taxInvoice.printTitle')}</h1>
        <p>
          {t('taxInvoice.invoiceNumber')}: {invoice.invoiceNumber}
        </p>
        <p>
          {t('taxInvoice.status')}: {invoice.status}
        </p>
      </header>

      <section>
        <h2 className="font-semibold">{t('taxInvoice.seller')}</h2>
        <p>{invoice.property?.name}</p>
        <p>{invoice.property?.address}</p>
        <p>
          {t('taxInvoice.taxId')}: {invoice.property?.taxId}
        </p>
      </section>

      <section>
        <h2 className="font-semibold">{t('taxInvoice.buyer')}</h2>
        <p>{buyer}</p>
        <p>
          {t('taxInvoice.taxId')}: {invoice.taxId}
        </p>
        {invoice.branchNumber ? (
          <p>
            {t('taxInvoice.branchNumber')}: {invoice.branchNumber}
          </p>
        ) : null}
      </section>

      <table className="text-left w-full">
        <caption className="sr-only">{t('taxInvoice.amounts')}</caption>
        <tbody>
          <tr>
            <th scope="row">{t('taxInvoice.net')}</th>
            <td className="text-right">{money(invoice.amountNet)}</td>
          </tr>
          <tr>
            <th scope="row">{t('taxInvoice.tax')}</th>
            <td className="text-right">{money(invoice.amountTax)}</td>
          </tr>
          <tr>
            <th scope="row">{t('taxInvoice.total')}</th>
            <td className="text-right">{money(invoice.amountTotal)}</td>
          </tr>
        </tbody>
      </table>

      {invoice.status === 'VOID' && invoice.voidReason ? (
        <p>
          {t('taxInvoice.voidReason')}: {invoice.voidReason}
        </p>
      ) : null}

      <Button
        type="button"
        className="min-h-11 print:hidden"
        onClick={() => window.print()}
      >
        {t('taxInvoice.print')}
      </Button>
    </PrintDocument>
  );
}
