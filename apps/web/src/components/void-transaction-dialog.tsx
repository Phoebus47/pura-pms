import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { reasonCodesAPI, type ReasonCode } from '@/lib/api/reason-codes';
import { foliosAPI } from '@/lib/api/folios';
import { toast } from '@/lib/toast';

interface VoidTransactionDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly transactionId: string | null;
  readonly onSuccess: () => void;
}

export function VoidTransactionDialog({
  isOpen,
  onClose,
  transactionId,
  onSuccess,
}: VoidTransactionDialogProps) {
  const [reasonCodes, setReasonCodes] = useState<ReasonCode[]>([]);
  const [selectedReasonId, setSelectedReasonId] = useState<string>('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedReasonId('');
      setRemark('');
      return;
    }

    let isCancelled = false;
    const loadReasonCodes = async () => {
      try {
        setLoading(true);
        const codes = await reasonCodesAPI.list();
        if (!isCancelled) {
          setReasonCodes(codes);
        }
      } catch (err) {
        if (!isCancelled) {
          toast.error(
            `Failed to load reason codes: ${(err as Error).message ?? ''}`,
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void loadReasonCodes();

    return () => {
      isCancelled = true;
    };
    /* v8 ignore next */
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!transactionId || !selectedReasonId || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      await foliosAPI.voidTransaction(transactionId, {
        userId: 'CURRENT_USER',
        reasonCodeId: selectedReasonId,
        remark: remark || undefined,
      } as unknown as Parameters<typeof foliosAPI.voidTransaction>[1]);

      toast.success('Transaction voided successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        `Failed to void transaction: ${(err as Error).message ?? ''}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const disableConfirm =
    !transactionId || !selectedReasonId || loading || submitting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Void Transaction</DialogTitle>
          <DialogDescription>
            This will create a correcting entry and mark the original
            transaction as void. A reason code is required for audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="void-reason"
              className="font-medium text-slate-700 text-sm"
            >
              Reason code
            </label>
            <Select
              disabled={loading || submitting}
              value={selectedReasonId}
              onValueChange={setSelectedReasonId}
            >
              <SelectTrigger id="void-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasonCodes.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id}>
                    {reason.code} — {reason.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="void-remark"
              className="font-medium text-slate-700 text-sm"
            >
              Remark (optional)
            </label>
            <Textarea
              id="void-remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={disableConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {submitting ? 'Voiding...' : 'Confirm Void'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
