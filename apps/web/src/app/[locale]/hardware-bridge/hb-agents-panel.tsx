'use client';

import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/empty-state';
import { Panel } from '@/components/shared/panel';
import { StatusBadge } from '@/components/shared/status-badge';
import { useHeartbeat, useRegisterAgent } from '@/hooks/use-hardware-bridge';
import type { HardwareAgent } from '@/lib/api/hardware-bridge';

const buttonClass = 'w-full sm:w-auto';
const ONLINE_MS = 120_000;

function isAgentOnline(agent: HardwareAgent) {
  if (!agent.lastSeenAt) return false;
  return Date.now() - new Date(agent.lastSeenAt).getTime() < ONLINE_MS;
}

export function HbAgentsPanel({
  propertyId,
  agents,
}: {
  readonly propertyId: string;
  readonly agents: HardwareAgent[];
}) {
  const register = useRegisterAgent();
  const heartbeat = useHeartbeat();
  const [name, setName] = useState('');
  const [machineId, setMachineId] = useState('');

  async function handleRegister() {
    try {
      await register.mutateAsync({ propertyId, name, machineId });
      toast.success(t('hardwareBridge.registerSuccess'));
      setName('');
      setMachineId('');
    } catch {
      toast.error(t('hardwareBridge.registerFailed'));
    }
  }

  async function ping(agentId: string) {
    try {
      await heartbeat.mutateAsync(agentId);
      toast.success(t('hardwareBridge.heartbeatSuccess'));
    } catch {
      toast.error(t('hardwareBridge.heartbeatFailed'));
    }
  }

  return (
    <Panel title={t('hardwareBridge.agents')}>
      <div className="space-y-6">
        <form
          className="gap-4 grid md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void handleRegister();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="agentName">{t('hardwareBridge.name')}</Label>
            <Input
              id="agentName"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="machineId">{t('hardwareBridge.machineId')}</Label>
            <Input
              id="machineId"
              name="machineId"
              value={machineId}
              onChange={(event) => setMachineId(event.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className={buttonClass}>
              {t('hardwareBridge.register')}
            </Button>
          </div>
        </form>

        {agents.length === 0 ? (
          <EmptyState
            icon={<Cpu className="h-10 w-10" />}
            title={t('hardwareBridge.emptyAgents')}
          />
        ) : (
          <ul className="space-y-3">
            {agents.map((agent) => (
              <li
                key={agent.id}
                className="border border-rule-mist flex flex-wrap gap-3 items-center justify-between p-4 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap font-semibold gap-2 items-center text-ink-strong text-sm">
                    {agent.name}
                    <StatusBadge
                      tone={isAgentOnline(agent) ? 'positive' : 'neutral'}
                      label={
                        isAgentOnline(agent)
                          ? t('hardwareBridge.agentOnline')
                          : t('hardwareBridge.agentOffline')
                      }
                      size="sm"
                    />
                  </p>
                  <p className="text-ink-subtle text-sm">{agent.machineId}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className={buttonClass}
                  onClick={() => void ping(agent.id)}
                >
                  {t('hardwareBridge.heartbeat')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
