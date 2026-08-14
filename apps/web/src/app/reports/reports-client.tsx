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

  const { data: report, isLoading } = useQuery({
    queryKey: ['reports', 'drr', property?.id, selectedDate],
    queryFn: () =>
      reportsAPI.getDailyRevenueReport(property?.id as string, selectedDate),
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
          <p className="mt-1 text-slate-600">{t('reports.subtitle')}</p>
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
    </div>
  );
}
