'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHeartbeat, useRegisterAgent } from '@/hooks/use-hardware-bridge';
import type { HardwareAgent } from '@/lib/api/hardware-bridge';

const fieldClass = 'min-h-11';
const buttonClass = 'min-h-11 w-full sm:w-auto';
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
    <Card>
      <CardHeader>
        <CardTitle>{t('hardwareBridge.agents')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
              className={fieldClass}
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
              className={fieldClass}
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
          <p className="text-muted-foreground text-sm">
            {t('hardwareBridge.emptyAgents')}
          </p>
        ) : (
          <ul className="space-y-3">
            {agents.map((agent) => (
              <li
                key={agent.id}
                className="border border-rule-mist flex flex-wrap gap-3 items-center justify-between p-3 rounded-md"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {agent.name}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {agent.machineId}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {isAgentOnline(agent)
                      ? t('hardwareBridge.agentOnline')
                      : t('hardwareBridge.agentOffline')}
                  </p>
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
      </CardContent>
    </Card>
  );
}
