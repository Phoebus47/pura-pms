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
          userId: 'CURRENT_USER', // Replace with actual auth user
          businessDate: new Date().toISOString().slice(0, 10),
        },
        successMessage: 'Charge posted successfully',
        errorPrefix: 'Failed to post charge',
        onSuccess,
        onClose,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="rounded-3xl sm:max-w-106.25"
      >
        <DialogHeader>
          <DialogTitle className="font-bold text-[#1e4b8e] text-2xl">
            Post Charge
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trxCode">Transaction Code</Label>
            <Select value={trxCodeId} onValueChange={setTrxCodeId}>
              <SelectTrigger id="trxCode" className="rounded-xl">
                <SelectValue placeholder="Select code..." />
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
            <Label htmlFor="amount">Amount (Net)</Label>
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
              required
            />
          </div>
          <div className="bg-slate-50 border border-slate-200 gap-x-4 gap-y-2 grid grid-cols-2 p-4 rounded-2xl text-sm">
            <p className="text-slate-500">Service</p>
            <p className="font-semibold text-right text-slate-700">
              ฿{service.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-slate-500">Tax</p>
            <p className="font-semibold text-right text-slate-700">
              ฿{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="font-semibold text-slate-700">Total</p>
            <p className="font-bold text-right text-slate-900">
              ฿{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setReference(e.target.value)
              }
              placeholder="e.g. Receipt #123"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remark">Remark</Label>
            <Input
              id="remark"
              value={remark}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRemark(e.target.value)
              }
              placeholder="Internal notes..."
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#1e4b8e] hover:bg-[#153a6e] rounded-xl"
            >
              {loading ? 'Posting...' : 'Post Charge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
