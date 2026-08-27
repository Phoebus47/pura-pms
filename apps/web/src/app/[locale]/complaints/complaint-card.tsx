'use client';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import type { GuestComplaint } from '@/lib/api/guest-complaints';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import {
  complaintSeverityLabel,
  complaintSeverityTone,
  complaintStatusLabel,
  complaintStatusTone,
} from './complaints-helpers';

interface ComplaintCardProps {
  complaint: GuestComplaint;
  userId: string;
  onStart: (id: string, assignedTo?: string) => Promise<unknown>;
  onResolve: (
    id: string,
    resolvedBy: string,
    resolutionNote: string,
  ) => Promise<unknown>;
  onClose: (id: string, closedBy: string) => Promise<unknown>;
}

export function ComplaintCard({
  complaint,
  userId,
  onStart,
  onResolve,
  onClose,
}: ComplaintCardProps) {
  const guestName = complaint.guest
    ? `${complaint.guest.firstName} ${complaint.guest.lastName}`
    : (complaint.guestId ?? t('complaints.noGuest'));

  return (
    <li className="border border-rule-mist p-4 rounded-lg space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <p className="font-semibold text-ink-strong">{complaint.subject}</p>
        <StatusBadge
          tone={complaintSeverityTone(complaint.severity)}
          label={complaintSeverityLabel(complaint.severity)}
          size="sm"
        />
        <StatusBadge
          tone={complaintStatusTone(complaint.status)}
          label={complaintStatusLabel(complaint.status)}
          size="sm"
        />
      </div>
      <p className="text-ink-subtle text-sm">
        {complaint.category}
        {' · '}
        {guestName}
      </p>
      <p className="text-ink-default text-sm">{complaint.description}</p>
      {complaint.resolutionNote ? (
        <p className="text-ink-subtle text-sm">
          {t('complaints.resolutionNote')}: {complaint.resolutionNote}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {complaint.status === 'OPEN' ? (
          <Button
            type="button"
            onClick={() =>
              void onStart(complaint.id, userId)
                .then(() => toast.success(t('complaints.startSuccess')))
                .catch(() => toast.error(t('complaints.actionFailed')))
            }
          >
            {t('complaints.start')}
          </Button>
        ) : null}
        {complaint.status === 'OPEN' || complaint.status === 'IN_PROGRESS' ? (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void onResolve(
                complaint.id,
                userId,
                t('complaints.defaultResolutionNote'),
              )
                .then(() => toast.success(t('complaints.resolveSuccess')))
                .catch(() => toast.error(t('complaints.actionFailed')))
            }
          >
            {t('complaints.resolve')}
          </Button>
        ) : null}
        {complaint.status === 'RESOLVED' ? (
          <Button
            type="button"
            onClick={() =>
              void onClose(complaint.id, userId)
                .then(() => toast.success(t('complaints.closeSuccess')))
                .catch(() => toast.error(t('complaints.actionFailed')))
            }
          >
            {t('complaints.close')}
          </Button>
        ) : null}
      </div>
    </li>
  );
}
