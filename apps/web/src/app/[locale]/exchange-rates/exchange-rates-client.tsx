'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import {
  useCreateExchangeRate,
  useExchangeRates,
} from '@/hooks/use-exchange-rates';
import { ExchangeRateList } from './exchange-rate-list';

const buttonClass = 'w-full sm:w-auto';

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

export function ExchangeRatesClient() {
  const { data: rates = [] } = useExchangeRates();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title={t('fx.title')} subtitle={t('fx.subtitle')} />

      <Panel title={t('fx.add')}>
        <ExchangeRateForm />
      </Panel>

      <Panel title={t('fx.list')} padding="none">
        <ExchangeRateList rates={rates} />
      </Panel>
    </div>
  );
}
