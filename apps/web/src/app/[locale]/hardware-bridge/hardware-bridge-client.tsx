'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesAPI } from '@/lib/api/properties';
import { DEFAULT_AGENT_URL, localBridge } from '@/lib/api/local-bridge';
import { t } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { StatusBadge } from '@/components/shared/status-badge';
import { useHbAgents, useHbJobs } from '@/hooks/use-hardware-bridge';
import type { HardwareAgent, HardwareJob } from '@/lib/api/hardware-bridge';
import { HbAgentsPanel } from './hb-agents-panel';
import { HbActionsPanel } from './hb-actions-panel';
import { HbJobsPanel } from './hb-jobs-panel';

const EMPTY_AGENTS: HardwareAgent[] = [];
const EMPTY_JOBS: HardwareJob[] = [];
const DEFAULT_REQUESTED_BY = 'front-desk';

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
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={t('hardwareBridge.title')}
        subtitle={t('hardwareBridge.subtitle')}
        actions={
          <span role="status">
            <StatusBadge
              tone={agentOnline ? 'positive' : 'neutral'}
              label={
                agentOnline
                  ? t('hardwareBridge.agentOnline')
                  : t('hardwareBridge.agentOffline')
              }
            />
          </span>
        }
      />

      <Panel title={t('hardwareBridge.connection')}>
        <div className="gap-4 grid sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="agentUrl">{t('hardwareBridge.agentUrl')}</Label>
            <Input
              id="agentUrl"
              name="agentUrl"
              value={agentUrl}
              onChange={(event) => setAgentUrl(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requestedBy">
              {t('hardwareBridge.requestedBy')}
            </Label>
            <Input
              id="requestedBy"
              name="requestedBy"
              value={requestedBy}
              onChange={(event) => setRequestedBy(event.target.value)}
            />
          </div>
        </div>
      </Panel>

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

      <Panel title={t('hardwareBridge.jobs')}>
        <HbJobsPanel jobs={jobs} />
      </Panel>
    </div>
  );
}
