'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import {
  useApproveShift,
  useCloseShift,
  useCurrentShift,
  useHandoverShift,
  useOpenShift,
  useTodayShifts,
} from '@/hooks/use-shifts';
import {
  CloseShiftForm,
  HandoverShiftForm,
  OpenShiftForm,
} from './shift-forms';
import { CurrentShiftCard, TodayShiftList } from './shift-panels';

export function ShiftsClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const property = properties?.[0];
  const propertyId = property?.id;
  const businessDate = property?.businessDate;

  const { data: current } = useCurrentShift(propertyId, userId);
  const { data: todayShifts = [] } = useTodayShifts(propertyId, businessDate);

  const openMutation = useOpenShift();
  const closeMutation = useCloseShift();
  const handoverMutation = useHandoverShift();
  const approveMutation = useApproveShift();

  const [openingCash, setOpeningCash] = useState('0');
  const [closingCash, setClosingCash] = useState('');
  const [varianceReason, setVarianceReason] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [toUserId, setToUserId] = useState('usr_mock_2');
  const [countedCash, setCountedCash] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');

  async function handleOpen() {
    if (!propertyId) return;
    try {
      await openMutation.mutateAsync({
        propertyId,
        userId,
        openingCash: Number(openingCash),
        businessDate,
      });
      toast.success(t('shifts.openSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('shifts.open'));
    }
  }

  async function handleClose() {
    if (!current) return;
    try {
      await closeMutation.mutateAsync({
        id: current.id,
        data: {
          closingCash: Number(closingCash),
          userId,
          varianceReason: varianceReason || undefined,
          notes: closeNotes || undefined,
        },
      });
      toast.success(t('shifts.closeSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('shifts.close'));
    }
  }

  async function handleHandover() {
    if (!current) return;
    try {
      await handoverMutation.mutateAsync({
        id: current.id,
        data: {
          toUserId,
          countedCash: Number(countedCash),
          userId,
          notes: handoverNotes || undefined,
          varianceReason: varianceReason || undefined,
        },
      });
      toast.success(t('shifts.handoverSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('shifts.handover'));
    }
  }

  async function handleApprove(shiftId?: string) {
    const id = shiftId ?? current?.id;
    if (!id) return;
    try {
      await approveMutation.mutateAsync({
        id,
        data: { userId },
      });
      toast.success(t('shifts.approveSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('shifts.approve'));
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={t('shifts.title')}
        subtitle={
          property ? `${t('shifts.property')}: ${property.name}` : undefined
        }
      />

      <CurrentShiftCard shift={current} />

      {!current || current.status !== 'OPEN' ? (
        <Panel title={t('shifts.open')}>
          <OpenShiftForm
            openingCash={openingCash}
            onOpeningCashChange={setOpeningCash}
            onSubmit={handleOpen}
            pending={openMutation.isPending}
          />
        </Panel>
      ) : null}

      {current?.status === 'OPEN' ? (
        <>
          <Panel title={t('shifts.close')}>
            <CloseShiftForm
              closingCash={closingCash}
              varianceReason={varianceReason}
              notes={closeNotes}
              onClosingCashChange={setClosingCash}
              onVarianceReasonChange={setVarianceReason}
              onNotesChange={setCloseNotes}
              onSubmit={handleClose}
              pending={closeMutation.isPending}
            />
          </Panel>
          <Panel title={t('shifts.handover')}>
            <HandoverShiftForm
              toUserId={toUserId}
              countedCash={countedCash}
              notes={handoverNotes}
              onToUserIdChange={setToUserId}
              onCountedCashChange={setCountedCash}
              onNotesChange={setHandoverNotes}
              onSubmit={handleHandover}
              pending={handoverMutation.isPending}
            />
          </Panel>
        </>
      ) : null}

      {current?.status === 'CLOSED' ? (
        <Button
          type="button"
          onClick={() => handleApprove()}
          disabled={approveMutation.isPending}
        >
          {t('shifts.submitApprove')}
        </Button>
      ) : null}
      <TodayShiftList
        shifts={todayShifts}
        onApprove={handleApprove}
        approvePending={approveMutation.isPending}
      />
    </div>
  );
}
