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
import { foliosAPI, type TransactionCode } from '@/lib/api/folios';
import { toast } from '@/lib/toast';

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trxCodeId || !amountNet) return;

    try {
      setLoading(true);
      await foliosAPI.postTransaction(folioId, {
        windowNumber,
        trxCodeId,
        amountNet: Number.parseFloat(amountNet),
        reference,
        remark,
        userId: 'CURRENT_USER', // Replace with actual auth user
      });
      toast.success('Charge posted successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(`Failed to post charge: ${(err as Error).message}`);
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
