'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { propertiesAPI } from '@/lib/api/properties';
import type { GuestComplaintSeverity } from '@/lib/api/guest-complaints';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useCloseGuestComplaint,
  useCreateGuestComplaint,
  useGuestComplaints,
  useResolveGuestComplaint,
  useStartGuestComplaint,
} from '@/hooks/use-guest-complaints';
import { ComplaintCard } from './complaint-card';

const SEVERITIES: GuestComplaintSeverity[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

export function ComplaintsClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: rows = [], isLoading } = useGuestComplaints({ propertyId });
  const createComplaint = useCreateGuestComplaint();
  const startComplaint = useStartGuestComplaint();
  const resolveComplaint = useResolveGuestComplaint();
  const closeComplaint = useCloseGuestComplaint();
  const [guestId, setGuestId] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState<GuestComplaintSeverity>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  async function handleCreate() {
    if (!propertyId || !category.trim() || !subject.trim()) return;
    if (!description.trim()) return;
    try {
      await createComplaint.mutateAsync({
        propertyId,
        guestId: guestId.trim() || undefined,
        category: category.trim(),
        severity,
        subject: subject.trim(),
        description: description.trim(),
        openedBy: userId,
      });
      toast.success(t('complaints.createSuccess'));
      setSubject('');
      setDescription('');
      setCategory('');
    } catch {
      toast.error(t('complaints.createFailed'));
    }
  }

  return (
    <div className="max-w-4xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('complaints.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">
          {t('complaints.subtitle')}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('complaints.record')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="gc-guest">{t('complaints.guestId')}</Label>
            <Input
              id="gc-guest"
              name="guestId"
              className="mt-1"
              value={guestId}
              onChange={(event) => setGuestId(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gc-category">{t('complaints.category')}</Label>
            <Input
              id="gc-category"
              name="category"
              className="mt-1"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gc-severity">{t('complaints.severity')}</Label>
            <select
              id="gc-severity"
              name="severity"
              className="border border-slate-200 min-h-11 mt-1 px-3 rounded-md w-full"
              value={severity}
              onChange={(event) =>
                setSeverity(event.target.value as GuestComplaintSeverity)
              }
            >
              {SEVERITIES.map((value) => (
                <option key={value} value={value}>
                  {t(
                    `complaints.severity${value.charAt(0)}${value.slice(1).toLowerCase()}`,
                  )}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="gc-subject">{t('complaints.subject')}</Label>
            <Input
              id="gc-subject"
              name="subject"
              className="mt-1"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gc-description">
              {t('complaints.description')}
            </Label>
            <textarea
              id="gc-description"
              name="description"
              className="border border-slate-200 min-h-24 mt-1 p-3 rounded-md w-full"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <Button
            type="button"
            className="min-h-11"
            disabled={
              !category.trim() ||
              !subject.trim() ||
              !description.trim() ||
              createComplaint.isPending
            }
            onClick={() => void handleCreate()}
          >
            {t('complaints.submit')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('complaints.list')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>{t('common.loading')}</p> : null}
          {!isLoading && rows.length === 0 ? (
            <p className="text-slate-600 text-sm">{t('complaints.empty')}</p>
          ) : null}
          <ul className="space-y-3">
            {rows.map((row) => (
              <ComplaintCard
                key={row.id}
                complaint={row}
                userId={userId}
                onStart={(id, assignedTo) =>
                  startComplaint.mutateAsync({ id, assignedTo })
                }
                onResolve={(id, resolvedBy, resolutionNote) =>
                  resolveComplaint.mutateAsync({
                    id,
                    resolvedBy,
                    resolutionNote,
                  })
                }
                onClose={(id, closedBy) =>
                  closeComplaint.mutateAsync({ id, closedBy })
                }
              />
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
