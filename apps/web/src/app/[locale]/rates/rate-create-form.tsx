'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateRate } from '@/hooks/use-rates';
import type { Rate, RateDeriveMode } from '@/lib/api/rates';
import type { RoomType } from '@/lib/api/room-types';

const CONTROL_CLASS =
  'h-(--field-h) w-full rounded-md border border-input bg-surface-desk px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const buttonClass = 'w-full sm:w-auto';

function isoDateOffset(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().slice(0, 10);
}

interface CreateFormProps {
  readonly propertyId: string;
  readonly roomTypes: RoomType[];
  readonly rates: Rate[];
}

export function CreateRateForm({
  propertyId,
  roomTypes,
  rates,
}: CreateFormProps) {
  const createMutation = useCreateRate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id ?? '');
  const [amount, setAmount] = useState('1500');
  const [parentRateId, setParentRateId] = useState('');
  const [deriveMode, setDeriveMode] =
    useState<RateDeriveMode>('PERCENT_OFFSET');
  const [deriveValue, setDeriveValue] = useState('-10');
  const derived = Boolean(parentRateId);
  const effectiveRoomTypeId = roomTypeId || roomTypes[0]?.id || '';

  async function handleSubmit() {
    try {
      await createMutation.mutateAsync({
        propertyId,
        code,
        name,
        roomTypeId: effectiveRoomTypeId,
        startDate: isoDateOffset(0),
        endDate: isoDateOffset(1),
        ...(derived
          ? {
              parentRateId,
              deriveMode,
              deriveValue: Number(deriveValue),
            }
          : { amount: Number(amount) }),
      });
      toast.success(t('rates.createSuccess'));
      setCode('');
      setName('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('rates.createSubmit'));
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
      <div className="gap-4 grid sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rateCode">{t('rates.code')}</Label>
          <Input
            id="rateCode"
            name="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rateName">{t('rates.name')}</Label>
          <Input
            id="rateName"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rateRoomType">{t('rates.roomType')}</Label>
        <select
          id="rateRoomType"
          name="roomTypeId"
          className={CONTROL_CLASS}
          value={effectiveRoomTypeId}
          onChange={(event) => setRoomTypeId(event.target.value)}
          required
        >
          {roomTypes.map((roomType) => (
            <option key={roomType.id} value={roomType.id}>
              {roomType.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rateParent">{t('rates.parent')}</Label>
        <select
          id="rateParent"
          name="parentRateId"
          className={CONTROL_CLASS}
          value={parentRateId}
          onChange={(event) => setParentRateId(event.target.value)}
        >
          <option value="">{t('rates.standalone')}</option>
          {rates.map((rate) => (
            <option key={rate.id} value={rate.id}>
              {rate.code} — {rate.name}
            </option>
          ))}
        </select>
      </div>
      {derived ? (
        <div className="gap-4 grid sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rateDeriveMode">{t('rates.deriveMode')}</Label>
            <select
              id="rateDeriveMode"
              name="deriveMode"
              className={CONTROL_CLASS}
              value={deriveMode}
              onChange={(event) =>
                setDeriveMode(event.target.value as RateDeriveMode)
              }
            >
              <option value="PERCENT_OFFSET">{t('rates.percentOffset')}</option>
              <option value="AMOUNT_OFFSET">{t('rates.amountOffset')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rateDeriveValue">{t('rates.deriveValue')}</Label>
            <Input
              id="rateDeriveValue"
              name="deriveValue"
              type="number"
              step="0.01"
              value={deriveValue}
              onChange={(event) => setDeriveValue(event.target.value)}
              required
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="rateAmount">{t('rates.amount')}</Label>
          <Input
            id="rateAmount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>
      )}
      <Button
        type="submit"
        disabled={createMutation.isPending || !effectiveRoomTypeId}
        className={buttonClass}
      >
        {t('rates.createSubmit')}
      </Button>
    </form>
  );
}
