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

export default function NightAuditPage() {
  const queryClient = useQueryClient();

  // 1. Get Property (assuming first one for now)
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });

  const property = properties?.[0];
  const propertyId = property?.id;
  const businessDate = property?.businessDate;

  // 2. Get Audit Status
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

  // 3. Trigger Audit Mutation
  const startMutation = useMutation({
    mutationFn: () =>
      nightAuditAPI.start(propertyId as string, businessDate as string),
    onSuccess: () => {
      toast.success('Night Audit started successfully');
      queryClient.invalidateQueries({ queryKey: ['night-audit-status'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to start Night Audit: ${error.message}`);
    },
  });

  if (!property) {
    return <div className="p-8">Loading property settings...</div>;
  }

  const isCompleted = status?.status === 'COMPLETED';
  const isInProgress = status?.status === 'IN_PROGRESS';
  const isFailed = status?.status === 'FAILED';

  let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' =
    'outline';
  if (isCompleted) badgeVariant = 'default';
  else if (isInProgress) badgeVariant = 'secondary';
  else if (isFailed) badgeVariant = 'destructive';

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold text-(--pura-blue) text-3xl tracking-tight">
            Night Audit
          </h1>
          <p className="flex gap-2 items-center mt-1 text-muted-foreground">
            <Building2 className="size-4" aria-hidden="true" /> {property.name}
          </p>
        </div>
        <div className="bg-background border border-(--pura-blue)/10 flex gap-3 items-center px-4 py-2 rounded-2xl shadow-sm">
          <Clock className="size-5 text-amber-500" aria-hidden="true" />
          <div>
            <p className="font-semibold text-muted-foreground text-xs uppercase">
              Business Date
            </p>
            <p className="font-bold text-(--pura-blue) text-lg">
              {new Date(property.businessDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="gap-6 grid md:grid-cols-2">
        {/* Main Status Card */}
        <Card className="border-(--pura-blue)/5 border-2 md:col-span-2 overflow-hidden rounded-3xl shadow-xl">
          <CardHeader className="bg-(--pura-blue)/5 border-(--pura-blue)/10 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-(--pura-blue)">
                  Current Run Status
                </CardTitle>
                <CardDescription>
                  Tracking the process for{' '}
                  {new Date(property.businessDate).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge
                variant={badgeVariant}
                className="font-bold px-4 py-1.5 rounded-full text-sm"
              >
                {status?.status || 'PENDING'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="gap-6 grid grid-cols-2 mb-8 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Rooms Posted</p>
                <p className="font-bold text-2xl">{status?.roomsPosted || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  Revenue Captured
                </p>
                <p className="font-bold text-2xl text-green-600">
                  ฿{Number(status?.revenuePosted || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Started At</p>
                <p className="font-medium text-sm">
                  {status?.startedAt
                    ? new Date(status.startedAt).toLocaleTimeString()
                    : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Completed At</p>
                <p className="font-medium text-sm">
                  {status?.completedAt
                    ? new Date(status.completedAt).toLocaleTimeString()
                    : '-'}
                </p>
              </div>
            </div>

            {isInProgress && (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="flex font-medium gap-2 items-center">
                    <RefreshCcw className="animate-spin size-4 text-(--pura-blue)" />
                    Processing...
                  </span>
                </div>
                <div className="bg-slate-100 h-2.5 overflow-hidden rounded-full w-full">
                  <div
                    className="animate-pulse bg-(--pura-blue) duration-500 h-2.5 rounded-full transition-all"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="bg-green-50 border border-green-200 flex gap-3 items-start mb-6 p-4 rounded-2xl">
                <CheckCircle2 className="mt-0.5 size-5 text-green-600" />
                <div>
                  <p className="font-bold text-green-800">
                    Night Audit Completed Successfully
                  </p>
                  <p className="text-green-700 text-sm">
                    The business date has been rolled and reports are archived.
                  </p>
                </div>
              </div>
            )}

            {isFailed && (
              <div className="bg-red-50 border border-red-200 flex gap-3 items-start mb-6 p-4 rounded-2xl">
                <AlertCircle className="mt-0.5 size-5 text-red-600" />
                <div>
                  <p className="font-bold text-red-800">Night Audit Failed</p>
                  <p className="text-red-700 text-sm">
                    Please review the errors below and try again.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t flex justify-center py-6">
            {!isCompleted && !isInProgress && (
              <Button
                size="lg"
                className="gap-2 h-14 hover:scale-105 px-12 rounded-2xl shadow-xl text-lg transition-transform"
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
              >
                <Play className="fill-current size-5" />
                {startMutation.isPending ? 'Starting...' : 'Run Night Audit'}
              </Button>
            )}
            {isInProgress && (
              <Button
                size="lg"
                disabled
                className="gap-2 h-14 opacity-70 px-12 rounded-2xl"
              >
                <RefreshCcw className="animate-spin size-5" /> Audit in Progress
              </Button>
            )}
            {isCompleted && (
              <Button
                variant="outline"
                size="lg"
                disabled
                className="border-green-500 gap-2 h-14 px-12 rounded-2xl text-green-600"
              >
                <CheckCircle2 className="size-5" /> Completed for Today
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Errors Section */}
        {status?.errors && status.errors.length > 0 && (
          <Card className="border-red-100 overflow-hidden rounded-3xl shadow-lg">
            <CardHeader className="bg-red-50/50">
              <CardTitle className="flex gap-2 items-center text-red-800">
                <AlertCircle className="size-5" /> Audit Errors
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

        {/* Reports Section */}
        <Card className="border-(--pura-blue)/5 overflow-hidden rounded-3xl shadow-lg">
          <CardHeader className="bg-(--pura-blue)/5">
            <CardTitle className="flex gap-2 items-center text-(--pura-blue)">
              <FileText className="size-5" /> Archived Reports
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
                      <div className="bg-(--pura-blue)/10 p-2 rounded-xl">
                        <FileText className="size-4 text-(--pura-blue)" />
                      </div>
                      <p className="font-medium text-sm">{report.reportName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg text-(--pura-blue)"
                    >
                      View
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="italic p-8 text-center text-muted-foreground text-sm">
                No reports generated yet for this run
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
