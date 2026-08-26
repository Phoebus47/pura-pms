'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PortalFolio } from '@/lib/api/portal';
import { t } from '@/lib/i18n';
import { formatStayDate } from './portal-format';

interface PortalFolioCardProps {
  readonly folios: PortalFolio[];
}

function totalBalance(folios: PortalFolio[]): number {
  return folios.reduce((sum, folio) => sum + Number(folio.balance), 0);
}

export function PortalFolioCard({ folios }: PortalFolioCardProps) {
  const isEmpty = folios.every((folio) => folio.transactions.length === 0);

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-2xl">{t('portal.folioTitle')}</CardTitle>
        <span className="font-semibold text-(--pura-blue) text-xl">
          {t('portal.folioBalance')}: ฿{totalBalance(folios).toLocaleString()}
        </span>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="text-center text-slate-500">{t('portal.folioEmpty')}</p>
        ) : (
          <table className="text-left w-full">
            <thead>
              <tr className="border-b text-slate-500 text-sm">
                <th scope="col" className="pb-2">
                  {t('portal.transactionDate')}
                </th>
                <th scope="col" className="pb-2">
                  {t('portal.transactionDescription')}
                </th>
                <th scope="col" className="pb-2 text-right">
                  {t('portal.transactionAmount')}
                </th>
              </tr>
            </thead>
            <tbody>
              {folios.flatMap((folio) =>
                folio.transactions.map((trx) => (
                  <tr key={trx.id} className="border-b">
                    <td className="py-2">{formatStayDate(trx.businessDate)}</td>
                    <td className="py-2">{trx.description}</td>
                    <td className="py-2 text-right">
                      ฿{(Number(trx.amountTotal) * trx.sign).toLocaleString()}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
