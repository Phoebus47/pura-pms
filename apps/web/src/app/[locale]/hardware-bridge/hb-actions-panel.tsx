'use client';

import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { localBridge } from '@/lib/api/local-bridge';
import {
  useCompleteJob,
  useCreateJob,
  useFailJob,
  useSimulateJob,
} from '@/hooks/use-hardware-bridge';
import type { HardwareJobType } from '@/lib/api/hardware-bridge';

const buttonClass = 'min-h-11 w-full sm:w-auto';

const PRINT_PAYLOAD: Record<string, unknown> = { jobType: 'receipt' };
const ENCODE_PAYLOAD: Record<string, unknown> = {
  roomNumber: '101',
  vendor: 'GENERIC',
};

interface HbActionsPanelProps {
  readonly propertyId: string;
  readonly requestedBy: string;
  readonly agentUrl: string;
}

export function HbActionsPanel({
  propertyId,
  requestedBy,
  agentUrl,
}: HbActionsPanelProps) {
  const createJob = useCreateJob();
  const simulateJob = useSimulateJob();
  const completeJob = useCompleteJob();
  const failJob = useFailJob();

  async function simulate(
    type: HardwareJobType,
    payload: Record<string, unknown>,
  ) {
    try {
      const job = await createJob.mutateAsync({
        propertyId,
        type,
        requestedBy,
        payload,
      });
      await simulateJob.mutateAsync(job.id);
      toast.success(t('hardwareBridge.simulateSuccess'));
    } catch {
      toast.error(t('hardwareBridge.jobFailed'));
    }
  }

  async function sendToAgent(
    type: HardwareJobType,
    payload: Record<string, unknown>,
    runLocal: () => Promise<unknown>,
    successKey: string,
  ) {
    let jobId: string;
    try {
      const job = await createJob.mutateAsync({
        propertyId,
        type,
        requestedBy,
        payload,
      });
      jobId = job.id;
    } catch {
      toast.error(t('hardwareBridge.jobFailed'));
      return;
    }
    try {
      const result = await runLocal();
      await completeJob.mutateAsync({ id: jobId, result });
      toast.success(t(successKey));
    } catch {
      await failJob
        .mutateAsync({ id: jobId, errorMessage: 'local-agent-failed' })
        .catch(() => undefined);
      toast.error(t('hardwareBridge.jobFailed'));
    }
  }

  return (
    <Card>
      <CardContent className="gap-4 grid md:grid-cols-2 pt-6">
        <ActionGroup
          titleKey="hardwareBridge.testPrint"
          onSimulate={() => void simulate('PRINT', PRINT_PAYLOAD)}
          onSend={() =>
            void sendToAgent(
              'PRINT',
              PRINT_PAYLOAD,
              () => localBridge.print(PRINT_PAYLOAD, agentUrl),
              'hardwareBridge.printSuccess',
            )
          }
        />
        <ActionGroup
          titleKey="hardwareBridge.testEncode"
          onSimulate={() => void simulate('KEYCARD_ENCODE', ENCODE_PAYLOAD)}
          onSend={() =>
            void sendToAgent(
              'KEYCARD_ENCODE',
              ENCODE_PAYLOAD,
              () => localBridge.encodeKeyCard(ENCODE_PAYLOAD, agentUrl),
              'hardwareBridge.encodeSuccess',
            )
          }
        />
        <ActionGroup
          titleKey="hardwareBridge.testPassport"
          onSimulate={() => void simulate('PASSPORT_SCAN', {})}
          onSend={() =>
            void sendToAgent(
              'PASSPORT_SCAN',
              {},
              () => localBridge.scanPassport(agentUrl),
              'hardwareBridge.scanResult',
            )
          }
        />
        <ActionGroup
          titleKey="hardwareBridge.testThaiId"
          onSimulate={() => void simulate('ID_CARD_READ', {})}
          onSend={() =>
            void sendToAgent(
              'ID_CARD_READ',
              {},
              () => localBridge.scanThaiId(agentUrl),
              'hardwareBridge.scanResult',
            )
          }
        />
      </CardContent>
    </Card>
  );
}

function ActionGroup({
  titleKey,
  onSimulate,
  onSend,
}: {
  readonly titleKey: string;
  readonly onSimulate: () => void;
  readonly onSend: () => void;
}) {
  return (
    <section className="border border-rule-mist p-3 rounded-md space-y-3">
      <h2 className="font-semibold text-foreground text-sm">{t(titleKey)}</h2>
      <div className="flex flex-wrap gap-2">
        <Button type="button" className={buttonClass} onClick={onSimulate}>
          {t('hardwareBridge.simulate')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={buttonClass}
          onClick={onSend}
          aria-label={`${t(titleKey)} ${t('hardwareBridge.sendToAgent')}`}
        >
          {t('hardwareBridge.sendToAgent')}
        </Button>
      </div>
    </section>
  );
}
