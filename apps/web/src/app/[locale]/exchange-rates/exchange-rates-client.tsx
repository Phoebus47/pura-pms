'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateExchangeRate,
  useExchangeRates,
  useUpdateExchangeRate,
} from '@/hooks/use-exchange-rates';
import type { ExchangeRate } from '@/lib/api/exchange-rates';

const fieldClass = 'min-h-11';
const buttonClass = 'min-h-11 w-full sm:w-auto';

function formatRate(rate: number): string {
  return Number(rate).toFixed(4);
}

function ExchangeRateForm() {
  const createMutation = useCreateExchangeRate();
  const [baseCurrency, setBaseCurrency] = useState('THB');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [rate, setRate] = useState('35');
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  async function handleSubmit() {
    try {
      await createMutation.mutateAsync({
        baseCurrency,
        targetCurrency,
        rate: Number(rate),
        effectiveDate,
      });
      toast.success(t('fx.createSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('fx.submit'));
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
        <Label htmlFor="baseCurrency">{t('fx.baseCurrency')}</Label>
        <Input
          id="baseCurrency"
          name="baseCurrency"
          className={fieldClass}
          value={baseCurrency}
          onChange={(event) => setBaseCurrency(event.target.value)}
          required
          maxLength={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="targetCurrency">{t('fx.targetCurrency')}</Label>
        <Input
          id="targetCurrency"
          name="targetCurrency"
          className={fieldClass}
          value={targetCurrency}
          onChange={(event) => setTargetCurrency(event.target.value)}
          required
          maxLength={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fxRate">{t('fx.rate')}</Label>
        <Input
          id="fxRate"
          name="rate"
          type="number"
          min={0.0001}
          step="0.0001"
          inputMode="decimal"
          className={fieldClass}
          value={rate}
          onChange={(event) => setRate(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="effectiveDate">{t('fx.effectiveDate')}</Label>
        <Input
          id="effectiveDate"
          name="effectiveDate"
          type="date"
          className={fieldClass}
          value={effectiveDate}
          onChange={(event) => setEffectiveDate(event.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        disabled={createMutation.isPending}
        className={buttonClass}
      >
        {t('fx.submit')}
      </Button>
    </form>
  );
}

function ExchangeRateList({ rates }: { readonly rates: ExchangeRate[] }) {
  const updateMutation = useUpdateExchangeRate();

  async function handleToggle(rate: ExchangeRate) {
    try {
      await updateMutation.mutateAsync({
        id: rate.id,
        data: { isActive: !rate.isActive },
      });
      toast.success(t('fx.updateSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('fx.updateSuccess'));
    }
  }

  if (rates.length === 0) {
    return <p className="text-slate-600 text-sm">{t('fx.empty')}</p>;
  }

  return (
    <ul className="space-y-3">
      {rates.map((rate) => (
        <li
          key={rate.id}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm">
            {rate.baseCurrency}/{rate.targetCurrency} {formatRate(rate.rate)}{' '}
            {rate.effectiveDate.slice(0, 10)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={updateMutation.isPending}
            onClick={() => void handleToggle(rate)}
          >
            {rate.isActive ? t('fx.deactivate') : t('fx.activate')}
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function ExchangeRatesClient() {
  const { data: rates = [] } = useExchangeRates();

  return (
    <div className="max-w-3xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-3xl text-pura-blue">{t('fx.title')}</h1>
        <p className="mt-1 text-slate-600 text-sm">{t('fx.subtitle')}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('fx.add')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ExchangeRateForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('fx.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ExchangeRateList rates={rates} />
        </CardContent>
      </Card>
    </div>
  );
}
