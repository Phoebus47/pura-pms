'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { EntitySelect } from '@/components/shared/entity-select';
import { reservationOptionLabel } from '@/lib/entity-labels';
import { reservationsAPI } from '@/lib/api/reservations';
import { useCreateCardPreauth } from '@/hooks/use-card-preauths';

interface HoldFormProps {
  readonly createdBy: string;
}

export function HoldCardPreauthForm({ createdBy }: HoldFormProps) {
  const createMutation = useCreateCardPreauth();
  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => reservationsAPI.getAll(),
  });
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
      <EntitySelect
        id="preauthReservationId"
        name="reservationId"
        label={t('preauth.reservationId')}
        value={reservationId}
        onChange={setReservationId}
        options={reservations.map((reservation) => ({
          value: reservation.id,
          label: reservationOptionLabel(reservation),
        }))}
        required
      />
      <div className="space-y-2">
        <Label htmlFor="preauthAmount">{t('preauth.amount')}</Label>
        <Input
          id="preauthAmount"
          name="amount"
          type="number"
          min={0.01}
          step="0.01"
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
          value={manualRef}
          onChange={(event) => setManualRef(event.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={createMutation.isPending}>
        {t('preauth.holdSubmit')}
      </Button>
    </form>
  );
}
