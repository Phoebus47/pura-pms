'use client';

import { useState } from 'react';
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
import type { TransactionCode } from '@/lib/api/transaction-codes';
import { submitFolioTransaction } from '@/lib/posting';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { t } from '@/lib/i18n';

interface PostChargeDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly folioId: string;
  readonly windowNumber: number;
  readonly onSuccess: () => void;
  readonly transactionCodes: TransactionCode[];
}

export function PostChargeDialog({
  isOpen,
  onClose,
  folioId,
  windowNumber,
  onSuccess,
  transactionCodes,
}: PostChargeDialogProps) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'CURRENT_USER';
  const [loading, setLoading] = useState(false);
  const [trxCodeId, setTrxCodeId] = useState('');
  const [amountNet, setAmountNet] = useState('');
  const [reference, setReference] = useState('');
  const [remark, setRemark] = useState('');

  const chargeCodes = transactionCodes.filter((c) => c.type === 'CHARGE');
  const selected = transactionCodes.find((c) => c.id === trxCodeId);
  const net = Number.parseFloat(amountNet || '0') || 0;
  const serviceRate = selected?.hasService ? (selected.serviceRate ?? 0) : 0;
  const service = selected?.hasService ? (net * Number(serviceRate)) / 100 : 0;
  const tax = selected?.hasTax ? (net + service) * 0.07 : 0;
  const total = net + service + tax;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trxCodeId || !amountNet) return;

    try {
      setLoading(true);
      await submitFolioTransaction({
        folioId,
        payload: {
          windowNumber,
          trxCodeId,
          amountNet: Number.parseFloat(amountNet),
          reference,
          remark,
          userId,
          businessDate: new Date().toISOString().slice(0, 10),
        },
        successMessage: t('folios.charge.success'),
        errorPrefix: t('folios.charge.error'),
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
          <DialogTitle className="font-bold text-2xl text-pura-blue">
            {t('billing.postCharge')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trxCode">
              {t('folios.charge.transactionCode')}
            </Label>
            <Select value={trxCodeId} onValueChange={setTrxCodeId}>
              <SelectTrigger id="trxCode" name="trxCode" className="rounded-xl">
                <SelectValue placeholder={t('folios.charge.selectCode')} />
              </SelectTrigger>
              <SelectContent>
                {chargeCodes.map((code) => (
                  <SelectItem key={code.id} value={code.id}>
                    {code.code} - {code.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">{t('folios.charge.amountNet')}</Label>
            <Input
              id="amount"
              name="amountNet"
              type="number"
              step="0.01"
              value={amountNet}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setAmountNet(e.target.value)
              }
              placeholder="0.00"
              className="rounded-xl"
              required
            />
          </div>
          <div className="bg-surface-inset border border-rule-mist gap-x-4 gap-y-2 grid grid-cols-2 p-4 rounded-lg text-sm">
            <p className="text-muted-foreground">
              {t('folios.charge.service')}
            </p>
            <p className="font-semibold text-foreground text-right">
              ฿{service.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-muted-foreground">{t('folios.charge.tax')}</p>
            <p className="font-semibold text-foreground text-right">
              ฿{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="font-semibold text-foreground">{t('folios.total')}</p>
            <p className="font-bold text-foreground text-right">
              ฿{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">{t('folios.charge.reference')}</Label>
            <Input
              id="reference"
              name="reference"
              value={reference}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setReference(e.target.value)
              }
              placeholder={t('folios.charge.referencePlaceholder')}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remark">{t('folios.charge.remark')}</Label>
            <Input
              id="remark"
              name="remark"
              value={remark}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRemark(e.target.value)
              }
              placeholder={t('folios.charge.remarkPlaceholder')}
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('folios.posting') : t('billing.postCharge')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
