'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nightAuditAPI, NightAuditStatus } from '@/lib/api/night-audit';
import { propertiesAPI } from '@/lib/api/properties';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getDateLocale, t } from '@/lib/i18n';

function formatAuditStatus(status?: string): string {
  if (!status) {
    return t('nightAudit.status.PENDING');
  }
  const key = `nightAudit.status.${status}`;
  const label = t(key);
  return label === key ? status : label;
}

export default function NightAuditPage() {
  const queryClient = useQueryClient();

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });

  const property = properties?.[0];
  const propertyId = property?.id;
  const businessDate = property?.businessDate;

  const { data: status } = useQuery<NightAuditStatus>({
    queryKey: ['night-audit-status', propertyId, businessDate],
    queryFn: () =>
      nightAuditAPI.getStatus(propertyId as string, businessDate as string),
    enabled: !!propertyId && !!businessDate,
    refetchInterval: (query: unknown) => {
      const q = query as { state?: { data?: NightAuditStatus } };
      return q?.state?.data?.status === 'IN_PROGRESS' ? 3000 : false;
    },
  });

  const startMutation = useMutation({
    mutationFn: () =>
      nightAuditAPI.start(propertyId as string, businessDate as string),
    onSuccess: () => {
      toast.success(t('nightAudit.startSuccess'));
      queryClient.invalidateQueries({ queryKey: ['night-audit-status'] });
    },
    onError: (error: Error) => {
      toast.error(`${t('nightAudit.startFailed')}: ${error.message}`);
    },
  });

  if (!property) {
    return <div className="p-8">{t('nightAudit.loading')}</div>;
  }

  const isCompleted = status?.status === 'COMPLETED';
  const isInProgress = status?.status === 'IN_PROGRESS';
  const isFailed = status?.status === 'FAILED';

  let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' =
    'outline';
  if (isCompleted) badgeVariant = 'default';
  else if (isInProgress) badgeVariant = 'secondary';
  else if (isFailed) badgeVariant = 'destructive';

  const dateLocale = getDateLocale();
  const businessDateLabel = new Date(property.businessDate).toLocaleDateString(
    dateLocale,
  );

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold text-3xl text-pura-blue tracking-tight">
            {t('nightAudit.title')}
          </h1>
          <p className="flex gap-2 items-center mt-1 text-slate-600">
            <Building2 className="size-4" aria-hidden="true" /> {property.name}
          </p>
        </div>
        <div className="bg-white border border-slate-200 flex gap-3 items-center px-4 py-2 rounded-lg">
          <Clock className="size-5 text-amber-500" aria-hidden="true" />
          <div>
            <p className="font-semibold text-slate-600 text-xs uppercase">
              {t('nightAudit.businessDate')}
            </p>
            <p className="font-bold text-lg text-pura-blue">
              {businessDateLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="gap-6 grid md:grid-cols-2">
        <Card className="md:col-span-2 overflow-hidden">
          <CardHeader className="bg-pura-blue/5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-pura-blue">
                  {t('nightAudit.currentStatus')}
                </CardTitle>
                <CardDescription>
                  {t('nightAudit.tracking')} {businessDateLabel}
                </CardDescription>
              </div>
              <Badge
                variant={badgeVariant}
                className="font-bold px-4 py-1.5 rounded-full text-sm"
              >
                {formatAuditStatus(status?.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="gap-6 grid grid-cols-2 mb-8 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-slate-600 text-sm">
                  {t('nightAudit.roomsPosted')}
                </p>
                <p className="font-bold text-2xl">{status?.roomsPosted || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-600 text-sm">
                  {t('nightAudit.revenueCaptured')}
                </p>
                <p className="font-bold text-2xl text-green-600">
                  ฿{Number(status?.revenuePosted || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-600 text-sm">
                  {t('nightAudit.startedAt')}
                </p>
                <p className="font-medium text-sm">
                  {status?.startedAt
                    ? new Date(status.startedAt).toLocaleTimeString(dateLocale)
                    : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-600 text-sm">
                  {t('nightAudit.completedAt')}
                </p>
                <p className="font-medium text-sm">
                  {status?.completedAt
                    ? new Date(status.completedAt).toLocaleTimeString(
                        dateLocale,
                      )
                    : '-'}
                </p>
              </div>
            </div>

            {isInProgress && (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="flex font-medium gap-2 items-center">
                    <RefreshCcw className="animate-spin size-4 text-pura-blue" />
                    {t('nightAudit.processing')}
                  </span>
                </div>
                <div className="bg-slate-100 h-2.5 overflow-hidden rounded-full w-full">
                  <div
                    className="animate-pulse bg-pura-blue duration-500 h-2.5 rounded-full transition-all"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="bg-green-50 border border-green-200 flex gap-3 items-start mb-6 p-4 rounded-lg">
                <CheckCircle2 className="mt-0.5 size-5 text-green-600" />
                <div>
                  <p className="font-bold text-green-800">
                    {t('nightAudit.completedTitle')}
                  </p>
                  <p className="text-green-700 text-sm">
                    {t('nightAudit.completedBody')}
                  </p>
                </div>
              </div>
            )}

            {isFailed && (
              <div className="bg-red-50 border border-red-200 flex gap-3 items-start mb-6 p-4 rounded-lg">
                <AlertCircle className="mt-0.5 size-5 text-red-600" />
                <div>
                  <p className="font-bold text-red-800">
                    {t('nightAudit.failedTitle')}
                  </p>
                  <p className="text-red-700 text-sm">
                    {t('nightAudit.failedBody')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 border-t flex justify-center py-6">
            {!isCompleted && !isInProgress && (
              <Button
                size="lg"
                className="gap-2 h-14 px-12 text-lg"
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
              >
                <Play className="fill-current size-5" />
                {startMutation.isPending
                  ? t('nightAudit.starting')
                  : t('nightAudit.run')}
              </Button>
            )}
            {isInProgress && (
              <Button
                size="lg"
                disabled
                className="gap-2 h-14 opacity-70 px-12"
              >
                <RefreshCcw className="animate-spin size-5" />{' '}
                {t('nightAudit.inProgress')}
              </Button>
            )}
            {isCompleted && (
              <Button
                variant="outline"
                size="lg"
                disabled
                className="border-green-500 gap-2 h-14 px-12 text-green-600"
              >
                <CheckCircle2 className="size-5" />{' '}
                {t('nightAudit.completedToday')}
              </Button>
            )}
          </CardFooter>
        </Card>

        {status?.errors && status.errors.length > 0 && (
          <Card className="border-red-200 overflow-hidden">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex gap-2 items-center text-red-800">
                <AlertCircle className="size-5" /> {t('nightAudit.errors')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-red-100 divide-y">
                {status.errors.map((error) => (
                  <li
                    key={error.id}
                    className="hover:bg-slate-50 p-4 transition-colors"
                  >
                    <p className="font-bold text-slate-800 text-sm">
                      {error.errorType}
                    </p>
                    <p className="mt-1 text-slate-600 text-xs">
                      {error.description}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="bg-pura-blue/5">
            <CardTitle className="flex gap-2 items-center text-pura-blue">
              <FileText className="size-5" /> {t('nightAudit.reports')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {status?.reports && status.reports.length > 0 ? (
              <ul className="divide-slate-100 divide-y">
                {status.reports.map((report) => (
                  <li
                    key={report.id}
                    className="flex hover:bg-slate-50 items-center justify-between p-4 transition-colors"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="bg-pura-blue/10 p-2 rounded-lg">
                        <FileText className="size-4 text-pura-blue" />
                      </div>
                      <p className="font-medium text-sm">{report.reportName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-pura-blue"
                    >
                      {t('nightAudit.view')}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="italic p-8 text-center text-slate-600 text-sm">
                {t('nightAudit.noReports')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
