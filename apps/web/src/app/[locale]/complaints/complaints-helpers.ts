import type { GuestComplaint } from '@/lib/api/guest-complaints';
import type { StatusTone } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';

export function complaintStatusLabel(status: GuestComplaint['status']): string {
  if (status === 'OPEN') return t('complaints.statusOpen');
  if (status === 'IN_PROGRESS') return t('complaints.statusInProgress');
  if (status === 'RESOLVED') return t('complaints.statusResolved');
  return t('complaints.statusClosed');
}

export function complaintSeverityLabel(
  severity: GuestComplaint['severity'],
): string {
  if (severity === 'LOW') return t('complaints.severityLow');
  if (severity === 'MEDIUM') return t('complaints.severityMedium');
  if (severity === 'HIGH') return t('complaints.severityHigh');
  return t('complaints.severityCritical');
}

export function complaintStatusTone(
  status: GuestComplaint['status'],
): StatusTone {
  if (status === 'OPEN') return 'caution';
  if (status === 'IN_PROGRESS') return 'info';
  if (status === 'RESOLVED') return 'positive';
  return 'neutral';
}

export function complaintSeverityTone(
  severity: GuestComplaint['severity'],
): StatusTone {
  if (severity === 'LOW') return 'neutral';
  if (severity === 'MEDIUM') return 'info';
  if (severity === 'HIGH') return 'caution';
  return 'critical';
}
