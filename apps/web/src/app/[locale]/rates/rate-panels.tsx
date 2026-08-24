'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateRate, useUpdateRate } from '@/hooks/use-rates';
import type { Rate, RateDeriveMode } from '@/lib/api/rates';
import type { RoomType } from '@/lib/api/room-types';

const fieldClass = 'min-h-11';
const buttonClass = 'min-h-11 w-full sm:w-auto';

function isoDateOffset(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().slice(0, 10);
}

function formulaLabel(rate: Rate, rates: Rate[]): string | null {
  if (!rate.parentRateId || !rate.deriveMode || rate.deriveValue == null) {
    return null;
  }
  const parent =
    rate.parentRate ?? rates.find((item) => item.id === rate.parentRateId);
  if (!parent) {
    return null;
  }
  const value = Number(rate.deriveValue);
  const signed = value >= 0 ? `+${value}` : `${value}`;
  if (rate.deriveMode === 'PERCENT_OFFSET') {
    return `${parent.code} ${signed}%`;
  }
  return `${parent.code} ${signed}`;
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
            className={fieldClass}
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
            className={fieldClass}
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
          className={`${fieldClass} bg-white border border-slate-200 px-3 rounded-md w-full`}
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
          className={`${fieldClass} bg-white border border-slate-200 px-3 rounded-md w-full`}
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
              className={`${fieldClass} bg-white border border-slate-200 px-3 rounded-md w-full`}
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
              className={fieldClass}
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
            className={fieldClass}
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

interface ListProps {
  readonly rates: Rate[];
}

export function RateList({ rates }: ListProps) {
  const updateMutation = useUpdateRate();

  async function saveAmount(rate: Rate, raw: string) {
    try {
      await updateMutation.mutateAsync({
        id: rate.id,
        data: { amount: Number(raw) },
      });
      toast.success(t('rates.updateSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('rates.updateFailed'));
    }
  }

  if (rates.length === 0) {
    return <p className="text-slate-600 text-sm">{t('rates.empty')}</p>;
  }

  return (
    <ul className="space-y-2">
      {rates.map((rate) => {
        const formula = formulaLabel(rate, rates);
        return (
          <li
            key={rate.id}
            className="border flex flex-col gap-2 p-3 rounded-md sm:flex-row sm:items-center sm:justify-between text-sm"
          >
            <div>
              <p className="font-medium">
                {rate.code} — {rate.name}
              </p>
              <p className="text-slate-500">
                {formula ?? t('rates.standalone')} · ฿
                {Number(rate.amount).toLocaleString()}
              </p>
            </div>
            {formula ? null : (
              <form
                className="flex gap-2 items-center"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const input = form.elements.namedItem(
                    `amount-${rate.id}`,
                  ) as HTMLInputElement;
                  void saveAmount(rate, input.value);
                }}
              >
                <Label htmlFor={`amount-${rate.id}`} className="sr-only">
                  {t('rates.amount')}
                </Label>
                <Input
                  id={`amount-${rate.id}`}
                  name={`amount-${rate.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={Number(rate.amount)}
                  className="min-h-11 w-28"
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="min-h-11"
                  disabled={updateMutation.isPending}
                >
                  {t('rates.updateAmount')}
                </Button>
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}
