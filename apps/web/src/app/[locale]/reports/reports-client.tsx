'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { reportsAPI } from '@/lib/api/reports';
import { t } from '@/lib/i18n';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { Toolbar } from '@/components/shared/toolbar';
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
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />

      <Toolbar
        filters={
          <div className="space-y-2">
            <Label htmlFor="reportDate">{t('reports.businessDate')}</Label>
            <Input
              id="reportDate"
              name="reportDate"
              type="date"
              value={selectedDate}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        }
        actions={
          property ? (
            <p className="text-ink-subtle text-sm">
              {t('reports.property')}: {property.name}
            </p>
          ) : null
        }
      />

      <Panel title={t('reports.flashTitle')}>
        <DailyFlashPanel flash={flash} loading={flashLoading} />
      </Panel>

      <Panel title={t('reports.drrTitle')}>
        {isLoading ? (
          <p className="text-ink-subtle text-sm">{t('reports.loading')}</p>
        ) : (
          <DailyRevenueTable
            groups={groups}
            totalRevenue={report?.totalRevenue ?? 0}
          />
        )}
      </Panel>

      <Panel title={t('reports.journalsTitle')}>
        <JournalsPanel
          propertyId={property?.id}
          date={selectedDate}
          journals={journals}
          loading={journalsLoading}
          onPosted={() => {
            void refetch();
          }}
        />
      </Panel>

      <Panel title={t('reports.tbTitle')}>
        <TrialBalancePanel
          report={trialBalance}
          journals={journals}
          loading={tbLoading}
        />
      </Panel>

      <Panel title={t('reports.compHouseTitle')}>
        <CompHousePanel propertyId={property?.id} date={selectedDate} />
      </Panel>
    </div>
  );
}
