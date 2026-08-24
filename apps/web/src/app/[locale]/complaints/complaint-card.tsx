'use client';

import { Button } from '@/components/ui/button';
import type { GuestComplaint } from '@/lib/api/guest-complaints';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import {
  complaintSeverityLabel,
  complaintStatusLabel,
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
    <li className="border border-slate-200 p-3 rounded-md">
      <p className="font-semibold text-slate-800">
        {complaint.subject}
        {' · '}
        {complaintSeverityLabel(complaint.severity)}
        {' · '}
        {complaintStatusLabel(complaint.status)}
      </p>
      <p className="text-slate-600 text-sm">
        {complaint.category}
        {' · '}
        {guestName}
      </p>
      <p className="mt-1 text-slate-700 text-sm">{complaint.description}</p>
      {complaint.resolutionNote ? (
        <p className="mt-1 text-slate-600 text-sm">
          {t('complaints.resolutionNote')}: {complaint.resolutionNote}
        </p>
      ) : null}
      {complaint.status === 'OPEN' ? (
        <Button
          type="button"
          className="min-h-11 mt-2"
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
          className="min-h-11 ml-2 mt-2"
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
          className="min-h-11 mt-2"
          onClick={() =>
            void onClose(complaint.id, userId)
              .then(() => toast.success(t('complaints.closeSuccess')))
              .catch(() => toast.error(t('complaints.actionFailed')))
          }
        >
          {t('complaints.close')}
        </Button>
      ) : null}
    </li>
  );
}
