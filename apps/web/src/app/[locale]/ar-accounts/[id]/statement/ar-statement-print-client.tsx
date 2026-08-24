'use client';

import { useParams } from 'next/navigation';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { arAccountsAPI } from '@/lib/api/ar-accounts';

function money(value: number): string {
  return Number(value).toFixed(2);
}

export function ArStatementPrintClient() {
  const params = useParams<{ id: string }>();
  const { data: statement, isLoading } = useQuery({
    queryKey: ['ar-statement', params.id],
    queryFn: () => arAccountsAPI.statement(params.id),
    enabled: Boolean(params.id),
  });

  if (isLoading) {
    return <p className="p-6">{t('ar.statement')}</p>;
  }

  if (!statement) {
    return <p className="p-6">{t('ar.empty')}</p>;
  }

  return (
    <article className="max-w-2xl mx-auto p-6 print:p-0 space-y-6">
      <header className="space-y-1">
        <h1 className="font-bold text-2xl">{t('ar.statement')}</h1>
        <p>
          {statement.companyName} · {statement.accountNumber}
        </p>
        <p>
          {t('ar.asOf')}: {statement.asOf}
        </p>
        <p>
          {t('ar.balance')}: {money(statement.currentBalance)}
        </p>
      </header>

      <section>
        <h2 className="font-semibold">{t('ar.aging')}</h2>
        <p>
          {t('ar.current')} {money(statement.aging.current)} · {t('ar.days30')}{' '}
          {money(statement.aging.days30)} · {t('ar.days60')}{' '}
          {money(statement.aging.days60)} · {t('ar.days90')}{' '}
          {money(statement.aging.days90)}
        </p>
      </section>

      <table className="text-left w-full">
        <caption className="sr-only">{t('ar.invoices')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('ar.invoiceNumber')}</th>
            <th scope="col">{t('ar.amount')}</th>
            <th scope="col">{t('ar.paid')}</th>
            <th scope="col">{t('ar.status')}</th>
          </tr>
        </thead>
        <tbody>
          {statement.invoices.map((invoice) => (
            <tr key={invoice.invoiceNumber}>
              <td>{invoice.invoiceNumber}</td>
              <td>{money(invoice.amount)}</td>
              <td>{money(invoice.paidAmount)}</td>
              <td>{invoice.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button
        type="button"
        className="min-h-11 print:hidden"
        onClick={() => window.print()}
      >
        {t('ar.printStatement')}
      </Button>
    </article>
  );
}
