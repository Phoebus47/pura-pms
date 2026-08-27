'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Receipt, CreditCard, AlertCircle } from 'lucide-react';
import { foliosAPI, type Folio } from '@/lib/api/folios';
import type { TransactionCode } from '@/lib/api/transaction-codes';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { PostChargeDialog } from './post-charge-dialog';
import { PostPaymentDialog } from './post-payment-dialog';
import { VoidTransactionDialog } from './void-transaction-dialog';
import { FolioCheckoutBar } from './folio-checkout-bar';
import { t } from '@/lib/i18n';

interface FolioDetailProps {
  readonly reservationId: string;
}

export function FolioDetail({ reservationId }: FolioDetailProps) {
  const [folios, setFolios] = useState<Folio[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolioId, setActiveFolioId] = useState<string | null>(null);
  const [activeWindowNumber, setActiveWindowNumber] = useState(1);
  const [transactionCodes, setTransactionCodes] = useState<TransactionCode[]>(
    [],
  );
  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  const loadFolioData = useCallback(async () => {
    try {
      setLoading(true);
      const [foliosData, trxCodes] = await Promise.all([
        foliosAPI.getByReservationId(reservationId),
        foliosAPI.getTransactionCodes(),
      ]);
      setFolios(foliosData);
      setTransactionCodes(trxCodes);

      if (foliosData.length > 0 && !activeFolioId) {
        setActiveFolioId(foliosData[0].id);
      }
    } catch (err) {
      toast.error(
        `${t('billing.folioRefreshFailed')}: ${(err as Error).message}`,
      );
    } finally {
      setLoading(false);
    }
  }, [reservationId, activeFolioId]);

  useEffect(() => {
    loadFolioData();
  }, [loadFolioData]);

  const activeFolio = folios.find((f) => f.id === activeFolioId);
  const activeWindow = activeFolio?.windows.find(
    (w) => w.windowNumber === activeWindowNumber,
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t('billing.loadingFolio')}
      </div>
    );
  }

  if (folios.length === 0) {
    return (
      <div className="bg-surface-desk border border-rule-mist p-12 rounded-xl text-center">
        <Receipt className="h-12 mb-4 mx-auto text-muted-foreground/40 w-12" />
        <h3 className="font-semibold text-foreground text-xl">
          {t('billing.noFolioTitle')}
        </h3>
        <p className="mt-2 text-muted-foreground">{t('billing.noFolioBody')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Folio Selector & Summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          {folios.map((folio) => (
            <button
              key={folio.id}
              onClick={() => {
                setActiveFolioId(folio.id);
                setActiveWindowNumber(1);
              }}
              className={cn(
                'px-4 py-2 rounded-xl border transition-colors font-medium text-sm',
                activeFolioId === folio.id
                  ? 'bg-pura-blue text-ink-onbrand border-pura-blue'
                  : 'bg-surface-desk text-muted-foreground border-rule-mist hover:bg-surface-inset',
              )}
            >
              {t('billing.folioNumber')} {folio.folioNumber} ({folio.type})
              {folio.isInterim ? (
                <span className="ml-1 opacity-70">
                  · {t('folios.interimLabel')}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="bg-surface-desk border border-rule-mist flex gap-6 items-center px-6 py-3 rounded-xl shadow-sm">
          <div>
            <p className="font-bold text-muted-foreground text-xs tracking-wider uppercase">
              {t('billing.totalBalance')}
            </p>
            <p
              className={cn(
                'text-2xl font-bold mt-0.5',
                (activeFolio?.balance || 0) > 0
                  ? statusToneInk.critical
                  : statusToneInk.positive,
              )}
            >
              ฿{Number(activeFolio?.balance || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {activeFolio && (
        <FolioCheckoutBar folio={activeFolio} onUpdated={loadFolioData} />
      )}

      {/* Window Selector */}
      <div className="border-b border-rule-mist flex gap-2 pb-px">
        {[1, 2, 3, 4].map((num) => {
          const window = activeFolio?.windows.find(
            (w) => w.windowNumber === num,
          );
          return (
            <button
              key={num}
              onClick={() => setActiveWindowNumber(num)}
              className={cn(
                'px-6 py-3 text-sm font-bold transition-colors border-b-2 relative',
                activeWindowNumber === num
                  ? 'border-pura-blue text-pura-blue'
                  : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-rule-mist',
              )}
            >
              {t('billing.window')} {num}
              {window && window.balance !== 0 && (
                <span
                  className={cn(
                    '-right-1 -top-1 absolute border px-1.5 py-0.5 rounded-full text-2xs',
                    statusToneSurface.critical,
                    statusToneInk.critical,
                  )}
                >
                  {Number(window.balance).toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-desk border border-rule-mist overflow-hidden rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-6">
          <h3 className="font-bold text-pura-blue text-xl">
            {t('billing.transactions')}
          </h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsChargeDialogOpen(true)}>
              <Plus className="h-4 mr-2 w-4" />
              {t('billing.postCharge')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(true)}
            >
              <CreditCard className="h-4 mr-2 w-4" />
              {t('billing.postPayment')}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="text-left w-full">
            <thead>
              <tr className="bg-surface-inset border-rule-mist border-y">
                <th className="font-bold px-6 py-4 text-muted-foreground text-xs tracking-wider uppercase">
                  {t('common.date')}
                </th>
                <th className="font-bold px-6 py-4 text-muted-foreground text-xs tracking-wider uppercase">
                  {t('common.code')}
                </th>
                <th className="font-bold px-6 py-4 text-muted-foreground text-xs tracking-wider uppercase">
                  {t('common.description')}
                </th>
                <th className="font-bold px-6 py-4 text-muted-foreground text-right text-xs tracking-wider uppercase">
                  {t('common.net')}
                </th>
                <th className="font-bold px-6 py-4 text-muted-foreground text-right text-xs tracking-wider uppercase">
                  {t('common.taxSvc')}
                </th>
                <th className="font-bold px-6 py-4 text-muted-foreground text-right text-xs tracking-wider uppercase">
                  {t('common.total')}
                </th>
                <th className="font-bold px-6 py-4 text-muted-foreground text-right text-xs tracking-wider uppercase">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-rule-mist divide-y">
              {activeWindow?.transactions &&
              activeWindow.transactions.length > 0 ? (
                activeWindow.transactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className={cn(
                      'hover:bg-surface-inset transition-colors',
                      trx.isVoid && 'opacity-50 line-through bg-surface-inset',
                    )}
                  >
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {new Date(trx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-surface-inset font-bold font-mono px-2 py-1 rounded text-ink-strong text-xs">
                        {trx.trxCode.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground text-sm">
                        {trx.trxCode.description}
                      </p>
                      {trx.reference && (
                        <p className="text-2xs text-muted-foreground">
                          {trx.reference}
                        </p>
                      )}
                    </td>
                    <td className="font-medium px-6 py-4 text-right text-sm">
                      ฿{Number(trx.amountNet).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-right text-sm">
                      ฿
                      {Number(
                        trx.amountTax + trx.amountService,
                      ).toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        'px-6 py-4 text-sm text-right font-bold',
                        trx.sign > 0
                          ? statusToneInk.critical
                          : statusToneInk.positive,
                      )}
                    >
                      {trx.sign > 0 ? '' : '-'}฿
                      {Number(trx.amountTotal).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          'border-status-critical-line/40 hover:bg-status-critical-tint',
                          statusToneInk.critical,
                        )}
                        disabled={trx.isVoid}
                        onClick={() => {
                          setSelectedTransactionId(trx.id);
                          setIsVoidDialogOpen(true);
                        }}
                      >
                        {t('common.void')}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="italic px-6 py-12 text-center text-muted-foreground"
                  >
                    {t('billing.noTransactions')}
                  </td>
                </tr>
              )}
            </tbody>
            {activeWindow && activeWindow.transactions.length > 0 && (
              <tfoot>
                <tr className="bg-pura-blue/5 font-bold">
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-pura-blue text-right"
                  >
                    {t('billing.windowBalance')}
                  </td>
                  <td
                    className={cn(
                      'px-6 py-4 text-right text-lg',
                      Number(activeWindow.balance) > 0
                        ? statusToneInk.critical
                        : statusToneInk.positive,
                    )}
                  >
                    ฿{Number(activeWindow.balance).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Routing Info (Placeholder for now) */}
      <div
        className={cn(
          'border flex gap-3 items-start p-4 rounded-xl',
          statusToneSurface.info,
        )}
      >
        <AlertCircle className="h-5 mt-0.5 text-pura-blue w-5" />
        <div>
          <h4 className="font-bold text-pura-blue text-sm">
            {t('billing.billingInstructions')}
          </h4>
          <p className="mt-1 text-muted-foreground text-xs">
            {t('billing.billingInstructionsBody')}
          </p>
        </div>
      </div>

      {activeFolioId && (
        <>
          <PostChargeDialog
            isOpen={isChargeDialogOpen}
            onClose={() => setIsChargeDialogOpen(false)}
            folioId={activeFolioId}
            windowNumber={activeWindowNumber}
            onSuccess={loadFolioData}
            transactionCodes={transactionCodes}
          />
          <PostPaymentDialog
            isOpen={isPaymentDialogOpen}
            onClose={() => setIsPaymentDialogOpen(false)}
            folioId={activeFolioId}
            windowNumber={activeWindowNumber}
            onSuccess={loadFolioData}
            transactionCodes={transactionCodes}
          />
          <VoidTransactionDialog
            isOpen={isVoidDialogOpen}
            onClose={() => {
              setIsVoidDialogOpen(false);
              setSelectedTransactionId(null);
            }}
            transactionId={selectedTransactionId}
            onSuccess={loadFolioData}
          />
        </>
      )}
    </div>
  );
}
