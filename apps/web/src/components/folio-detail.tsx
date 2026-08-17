'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Receipt, CreditCard, AlertCircle } from 'lucide-react';
import { foliosAPI, type Folio } from '@/lib/api/folios';
import type { TransactionCode } from '@/lib/api/transaction-codes';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { PostChargeDialog } from './post-charge-dialog';
import { PostPaymentDialog } from './post-payment-dialog';
import { VoidTransactionDialog } from './void-transaction-dialog';
import { FolioCheckoutBar } from './folio-checkout-bar';

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
      toast.error(`Failed to refresh folio: ${(err as Error).message}`);
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
      <div className="p-8 text-center text-slate-500">
        Loading billing data...
      </div>
    );
  }

  if (folios.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-12 rounded-xl text-center">
        <Receipt className="h-12 mb-4 mx-auto text-slate-300 w-12" />
        <h3 className="font-semibold text-slate-700 text-xl">No Folio Found</h3>
        <p className="mt-2 text-slate-600">
          This reservation doesn&apos;t have an active folio yet.
        </p>
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
                  ? 'bg-pura-blue text-white border-pura-blue'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              )}
            >
              Folio {folio.folioNumber} ({folio.type})
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 flex gap-6 items-center px-6 py-3 rounded-xl shadow-sm">
          <div>
            <p className="font-bold text-slate-500 text-xs tracking-wider uppercase">
              Total Balance
            </p>
            <p
              className={cn(
                'text-2xl font-black mt-0.5',
                (activeFolio?.balance || 0) > 0
                  ? 'text-red-600'
                  : 'text-emerald-600',
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
      <div className="border-b border-slate-200 flex gap-2 pb-px">
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
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300',
              )}
            >
              Window {num}
              {window && window.balance !== 0 && (
                <span className="-right-1 -top-1 absolute bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-full text-[10px] text-red-600">
                  {Number(window.balance).toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 overflow-hidden rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-6">
          <h3 className="font-bold text-pura-blue text-xl">Transactions</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setIsChargeDialogOpen(true)}>
              <Plus className="h-4 mr-2 w-4" />
              Post Charge
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(true)}
            >
              <CreditCard className="h-4 mr-2 w-4" />
              Post Payment
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="text-left w-full">
            <thead>
              <tr className="bg-slate-50 border-slate-200 border-y">
                <th className="font-bold px-6 py-4 text-slate-500 text-xs tracking-wider uppercase">
                  Date
                </th>
                <th className="font-bold px-6 py-4 text-slate-500 text-xs tracking-wider uppercase">
                  Code
                </th>
                <th className="font-bold px-6 py-4 text-slate-500 text-xs tracking-wider uppercase">
                  Description
                </th>
                <th className="font-bold px-6 py-4 text-right text-slate-500 text-xs tracking-wider uppercase">
                  Net
                </th>
                <th className="font-bold px-6 py-4 text-right text-slate-500 text-xs tracking-wider uppercase">
                  Tax/Svc
                </th>
                <th className="font-bold px-6 py-4 text-right text-slate-500 text-xs tracking-wider uppercase">
                  Total
                </th>
                <th className="font-bold px-6 py-4 text-right text-slate-500 text-xs tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-slate-100 divide-y">
              {activeWindow?.transactions &&
              activeWindow.transactions.length > 0 ? (
                activeWindow.transactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className={cn(
                      'hover:bg-slate-50 transition-colors',
                      trx.isVoid && 'opacity-50 line-through bg-slate-50',
                    )}
                  >
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(trx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 font-bold font-mono px-2 py-1 rounded text-slate-700 text-xs">
                        {trx.trxCode.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 text-sm">
                        {trx.trxCode.description}
                      </p>
                      {trx.reference && (
                        <p className="text-[10px] text-slate-500">
                          {trx.reference}
                        </p>
                      )}
                    </td>
                    <td className="font-medium px-6 py-4 text-right text-sm">
                      ฿{Number(trx.amountNet).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 text-sm">
                      ฿
                      {Number(
                        trx.amountTax + trx.amountService,
                      ).toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        'px-6 py-4 text-sm text-right font-bold',
                        trx.sign > 0 ? 'text-red-600' : 'text-emerald-600',
                      )}
                    >
                      {trx.sign > 0 ? '' : '-'}฿
                      {Number(trx.amountTotal).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 hover:bg-red-50 text-red-600"
                        disabled={trx.isVoid}
                        onClick={() => {
                          setSelectedTransactionId(trx.id);
                          setIsVoidDialogOpen(true);
                        }}
                      >
                        Void
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="italic px-6 py-12 text-center text-slate-500"
                  >
                    No transactions found in this window.
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
                    Window Balance:
                  </td>
                  <td
                    className={cn(
                      'px-6 py-4 text-right text-lg',
                      Number(activeWindow.balance) > 0
                        ? 'text-red-600'
                        : 'text-emerald-600',
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
      <div className="bg-blue-50 border border-blue-100 flex gap-3 items-start p-4 rounded-xl">
        <AlertCircle className="h-5 mt-0.5 text-pura-blue w-5" />
        <div>
          <h4 className="font-bold text-pura-blue text-sm">
            Billing Instructions
          </h4>
          <p className="mt-1 text-slate-600 text-xs">
            Select a window (1–4) before posting. Charges and payments apply to
            the active window only.
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
