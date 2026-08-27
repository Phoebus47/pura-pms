'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { reportsAPI } from '@/lib/api/reports';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DailyRevenueTable } from './daily-revenue-table';
import { DailyFlashPanel } from './daily-flash-panel';
import { JournalsPanel } from './journals-panel';
import { TrialBalancePanel } from './trial-balance-panel';
import { CompHousePanel } from './comp-house-panel';

function toDateInputValue(value: string | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function ReportsClient() {
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const property = properties?.[0];
  const defaultDate = toDateInputValue(property?.businessDate);
  const [date, setDate] = useState('');
  const selectedDate = date || defaultDate;

  const { data: flash, isLoading: flashLoading } = useQuery({
    queryKey: ['reports', 'flash', property?.id, selectedDate],
    queryFn: () =>
      reportsAPI.getDailyFlash(property?.id as string, selectedDate),
    enabled: Boolean(property?.id && selectedDate),
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ['reports', 'drr', property?.id, selectedDate],
    queryFn: () =>
      reportsAPI.getDailyRevenueReport(property?.id as string, selectedDate),
    enabled: Boolean(property?.id && selectedDate),
  });

  const {
    data: journals = [],
    isLoading: journalsLoading,
    refetch,
  } = useQuery({
    queryKey: ['reports', 'journals', property?.id, selectedDate],
    queryFn: () =>
      reportsAPI.listJournals(property?.id as string, selectedDate),
    enabled: Boolean(property?.id && selectedDate),
  });

  const { data: trialBalance, isLoading: tbLoading } = useQuery({
    queryKey: ['reports', 'trial-balance', property?.id, selectedDate],
    queryFn: () =>
      reportsAPI.getTrialBalance(property?.id as string, selectedDate),
    enabled: Boolean(property?.id && selectedDate),
  });

  const groups = useMemo(() => Object.entries(report?.summary ?? {}), [report]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-bold text-3xl text-pura-blue">
            {t('reports.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">{t('reports.subtitle')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reportDate">{t('reports.businessDate')}</Label>
          <Input
            id="reportDate"
            name="reportDate"
            type="date"
            className="min-h-11"
            value={selectedDate}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      </header>

      {property ? (
        <p className="text-muted-foreground text-sm">
          {t('reports.property')}: {property.name}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.flashTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyFlashPanel flash={flash} loading={flashLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.drrTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">
              {t('reports.loading')}
            </p>
          ) : (
            <DailyRevenueTable
              groups={groups}
              totalRevenue={report?.totalRevenue ?? 0}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.journalsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <JournalsPanel
            propertyId={property?.id}
            date={selectedDate}
            journals={journals}
            loading={journalsLoading}
            onPosted={() => {
              void refetch();
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.tbTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TrialBalancePanel
            report={trialBalance}
            journals={journals}
            loading={tbLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.compHouseTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CompHousePanel propertyId={property?.id} date={selectedDate} />
        </CardContent>
      </Card>
    </div>
  );
}
