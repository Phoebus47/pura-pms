'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntitySelect } from '@/components/shared/entity-select';
import type { TransactionCode } from '@/lib/api/transaction-codes';
import { propertiesAPI } from '@/lib/api/properties';
import { submitFolioTransaction } from '@/lib/posting';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { t } from '@/lib/i18n';

const CASH_PAYMENT_CODE = '9000';

interface PostPaymentDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly folioId: string;
  readonly windowNumber: number;
  readonly onSuccess: () => void;
  readonly transactionCodes: TransactionCode[];
}

export function PostPaymentDialog({
  isOpen,
  onClose,
  folioId,
  windowNumber,
  onSuccess,
  transactionCodes,
}: PostPaymentDialogProps) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'CURRENT_USER';
  const { data: rates = [] } = useExchangeRates();
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyCurrency = properties?.[0]?.currency ?? 'THB';
  const [loading, setLoading] = useState(false);
  const [trxCodeId, setTrxCodeId] = useState('');
  const [amountNet, setAmountNet] = useState('');
  const [reference, setReference] = useState('');
  const [currency, setCurrency] = useState('');
  const [foreignAmount, setForeignAmount] = useState('');

  const paymentCodes = transactionCodes.filter((c) => c.type === 'PAYMENT');
  const selectedCode = paymentCodes.find((code) => code.id === trxCodeId);
  const isCash = selectedCode?.code === CASH_PAYMENT_CODE;
  const guestCurrency = currency || propertyCurrency;
  const needsFx =
    isCash && guestCurrency.toUpperCase() !== propertyCurrency.toUpperCase();
  const net = Number.parseFloat(amountNet || '0') || 0;
  const currencies = [
    propertyCurrency,
    ...rates.map((rate) => rate.targetCurrency),
  ].filter((code, index, all) => all.indexOf(code) === index);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trxCodeId) return;
    if (!needsFx && !amountNet) return;
    if (needsFx && !foreignAmount) return;

    try {
      setLoading(true);
      await submitFolioTransaction({
        folioId,
        payload: {
          windowNumber,
          trxCodeId,
          amountNet: Number.parseFloat(amountNet || foreignAmount),
          reference,
          userId,
          businessDate: new Date().toISOString().slice(0, 10),
          ...(needsFx
            ? {
                currency: guestCurrency,
                foreignAmount: Number.parseFloat(foreignAmount),
              }
            : {}),
        },
        successMessage: t('folios.paymentSuccess'),
        errorPrefix: t('folios.paymentError'),
        onSuccess,
        onClose,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl text-emerald-700">
            {t('folios.postPayment')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="method">{t('folios.paymentMethod')}</Label>
            <Select value={trxCodeId} onValueChange={setTrxCodeId}>
              <SelectTrigger id="method" className="rounded-xl">
                <SelectValue placeholder={t('folios.selectMethod')} />
              </SelectTrigger>
              <SelectContent>
                {paymentCodes.map((code) => (
                  <SelectItem key={code.id} value={code.id}>
                    {code.code} - {code.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isCash ? (
            <EntitySelect
              id="paymentCurrency"
              name="currency"
              label={t('folios.currency')}
              value={guestCurrency}
              onChange={setCurrency}
              options={currencies.map((code) => ({
                value: code,
                label: code,
              }))}
            />
          ) : null}
          {needsFx ? (
            <div className="space-y-2">
              <Label htmlFor="foreignAmount">{t('folios.foreignAmount')}</Label>
              <Input
                id="foreignAmount"
                name="foreignAmount"
                type="number"
                step="0.01"
                min={0}
                value={foreignAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForeignAmount(e.target.value)
                }
                className="rounded-xl"
                required
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('folios.amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amountNet}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAmountNet(e.target.value)
              }
              placeholder="0.00"
              className="rounded-xl"
              required={!needsFx}
            />
          </div>
          <div className="bg-surface-inset border border-rule-mist flex items-center justify-between p-4 rounded-lg text-sm">
            <p className="font-semibold text-foreground">{t('folios.total')}</p>
            <p className="font-bold text-foreground">
              ฿{net.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">{t('folios.reference')}</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setReference(e.target.value)
              }
              placeholder={t('folios.referencePlaceholder')}
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('folios.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? t('folios.posting') : t('folios.postPaymentSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
