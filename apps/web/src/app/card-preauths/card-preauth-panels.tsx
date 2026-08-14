'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCaptureCardPreauth,
  useCreateCardPreauth,
  useIncrementCardPreauth,
  useReleaseCardPreauth,
} from '@/hooks/use-card-preauths';
import type { CardPreauth } from '@/lib/api/card-preauths';

const fieldClass = 'min-h-11';

interface HoldFormProps {
  readonly createdBy: string;
}

export function HoldCardPreauthForm({ createdBy }: HoldFormProps) {
  const createMutation = useCreateCardPreauth();
  const [reservationId, setReservationId] = useState('');
  const [amount, setAmount] = useState('');
  const [last4, setLast4] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('2028');
  const [manualRef, setManualRef] = useState('');

  async function handleSubmit() {
    try {
      await createMutation.mutateAsync({
        reservationId,
        amount: Number(amount),
        last4,
        expiryMonth: Number(expiryMonth),
        expiryYear: Number(expiryYear),
        manualRef,
        createdBy,
      });
      toast.success(t('preauth.holdSuccess'));
      setReservationId('');
      setAmount('');
      setLast4('');
      setManualRef('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('preauth.holdSubmit'));
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="preauthReservationId">
          {t('preauth.reservationId')}
        </Label>
        <Input
          id="preauthReservationId"
          name="reservationId"
          className={fieldClass}
          value={reservationId}
          onChange={(event) => setReservationId(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="preauthAmount">{t('preauth.amount')}</Label>
        <Input
          id="preauthAmount"
          name="amount"
          type="number"
          min={0.01}
          step="0.01"
          className={fieldClass}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="preauthLast4">{t('preauth.last4')}</Label>
        <Input
          id="preauthLast4"
          name="last4"
          className={fieldClass}
          maxLength={4}
          value={last4}
          onChange={(event) => setLast4(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="preauthExpiryMonth">{t('preauth.expiryMonth')}</Label>
        <Input
          id="preauthExpiryMonth"
          name="expiryMonth"
          type="number"
          min={1}
          max={12}
          className={fieldClass}
          value={expiryMonth}
          onChange={(event) => setExpiryMonth(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="preauthExpiryYear">{t('preauth.expiryYear')}</Label>
        <Input
          id="preauthExpiryYear"
          name="expiryYear"
          type="number"
          min={2020}
          className={fieldClass}
          value={expiryYear}
          onChange={(event) => setExpiryYear(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="preauthManualRef">{t('preauth.manualRef')}</Label>
        <Input
          id="preauthManualRef"
          name="manualRef"
          className={fieldClass}
          value={manualRef}
          onChange={(event) => setManualRef(event.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="min-h-11"
        disabled={createMutation.isPending}
      >
        {t('preauth.holdSubmit')}
      </Button>
    </form>
  );
}

interface ListProps {
  readonly holds: CardPreauth[];
  readonly userId: string;
}

export function CardPreauthList({ holds, userId }: ListProps) {
  const incrementMutation = useIncrementCardPreauth();
  const captureMutation = useCaptureCardPreauth();
  const releaseMutation = useReleaseCardPreauth();
  const [amountById, setAmountById] = useState<Record<string, string>>({});
  const [folioById, setFolioById] = useState<Record<string, string>>({});

  if (holds.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t('preauth.empty')}</p>
    );
  }

  return (
    <ul className="space-y-4">
      {holds.map((hold) => {
        const open = hold.status === 'HELD' || hold.status === 'INCREMENTAL';
        return (
          <li key={hold.id} className="border-b last:border-0 pb-4 space-y-2">
            <p className="text-sm">
              ****{hold.last4} · {Number(hold.amount).toFixed(2)} ·{' '}
              {hold.status} · {hold.manualRef}
            </p>
            {open ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id={`inc-${hold.id}`}
                  name={`inc-${hold.id}`}
                  type="number"
                  min={0.01}
                  className="min-h-11"
                  aria-label={t('preauth.incrementAmount')}
                  value={amountById[hold.id] ?? ''}
                  onChange={(event) =>
                    setAmountById((current) => ({
                      ...current,
                      [hold.id]: event.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  disabled={incrementMutation.isPending}
                  onClick={() =>
                    void incrementMutation
                      .mutateAsync({
                        id: hold.id,
                        amount: Number(amountById[hold.id]),
                      })
                      .then(() => toast.success(t('preauth.incrementSuccess')))
                      .catch((err: unknown) =>
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : t('preauth.increment'),
                        ),
                      )
                  }
                >
                  {t('preauth.increment')}
                </Button>
                <Input
                  id={`folio-${hold.id}`}
                  name={`folio-${hold.id}`}
                  className="min-h-11"
                  aria-label={t('preauth.folioId')}
                  value={folioById[hold.id] ?? ''}
                  onChange={(event) =>
                    setFolioById((current) => ({
                      ...current,
                      [hold.id]: event.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  className="min-h-11"
                  disabled={captureMutation.isPending}
                  onClick={() =>
                    void captureMutation
                      .mutateAsync({
                        id: hold.id,
                        folioId: folioById[hold.id],
                        userId,
                      })
                      .then(() => toast.success(t('preauth.captureSuccess')))
                      .catch((err: unknown) =>
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : t('preauth.capture'),
                        ),
                      )
                  }
                >
                  {t('preauth.capture')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  disabled={releaseMutation.isPending}
                  onClick={() =>
                    void releaseMutation
                      .mutateAsync(hold.id)
                      .then(() => toast.success(t('preauth.releaseSuccess')))
                      .catch((err: unknown) =>
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : t('preauth.release'),
                        ),
                      )
                  }
                >
                  {t('preauth.release')}
                </Button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
