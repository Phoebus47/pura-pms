'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { DEFAULT_AGENT_URL, localBridge } from '@/lib/api/local-bridge';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHbAgents, useHbJobs } from '@/hooks/use-hardware-bridge';
import type { HardwareAgent, HardwareJob } from '@/lib/api/hardware-bridge';
import { HbAgentsPanel } from './hb-agents-panel';
import { HbActionsPanel } from './hb-actions-panel';
import { HbJobsPanel } from './hb-jobs-panel';

const EMPTY_AGENTS: HardwareAgent[] = [];
const EMPTY_JOBS: HardwareJob[] = [];
const DEFAULT_REQUESTED_BY = 'front-desk';
const fieldClass = 'min-h-11';

export function HardwareBridgeClient() {
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: agents = EMPTY_AGENTS } = useHbAgents(propertyId);
  const { data: jobs = EMPTY_JOBS } = useHbJobs(propertyId);
  const [agentUrl, setAgentUrl] = useState(DEFAULT_AGENT_URL);
  const [requestedBy, setRequestedBy] = useState(DEFAULT_REQUESTED_BY);
  const { data: health } = useQuery({
    queryKey: ['local-bridge-health', agentUrl],
    queryFn: () => localBridge.health(agentUrl),
    retry: false,
  });
  const agentOnline = Boolean(health?.ok);

  return (
    <div className="max-w-5xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('hardwareBridge.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">
          {t('hardwareBridge.subtitle')}
        </p>
      </header>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentUrl">{t('hardwareBridge.agentUrl')}</Label>
            <Input
              id="agentUrl"
              name="agentUrl"
              className={fieldClass}
              value={agentUrl}
              onChange={(event) => setAgentUrl(event.target.value)}
            />
          </div>
          <p className="text-slate-600 text-sm" role="status">
            {agentOnline
              ? t('hardwareBridge.agentOnline')
              : t('hardwareBridge.agentOffline')}
          </p>
          <div className="space-y-2">
            <Label htmlFor="requestedBy">
              {t('hardwareBridge.requestedBy')}
            </Label>
            <Input
              id="requestedBy"
              name="requestedBy"
              className={fieldClass}
              value={requestedBy}
              onChange={(event) => setRequestedBy(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {propertyId ? (
        <HbAgentsPanel propertyId={propertyId} agents={agents} />
      ) : null}

      {propertyId ? (
        <HbActionsPanel
          propertyId={propertyId}
          requestedBy={requestedBy || DEFAULT_REQUESTED_BY}
          agentUrl={agentUrl}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('hardwareBridge.jobs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <HbJobsPanel jobs={jobs} />
        </CardContent>
      </Card>
    </div>
  );
}
