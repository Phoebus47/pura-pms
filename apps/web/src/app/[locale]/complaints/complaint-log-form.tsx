'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { GuestComplaintSeverity } from '@/lib/api/guest-complaints';
import { t } from '@/lib/i18n';

const SEVERITIES: GuestComplaintSeverity[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

const CONTROL_CLASS =
  'h-(--field-h) w-full rounded-md border border-input bg-surface-desk px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export interface ComplaintLogValues {
  guestId?: string;
  category: string;
  severity: GuestComplaintSeverity;
  subject: string;
  description: string;
}

interface ComplaintLogFormProps {
  readonly isPending: boolean;
  /** Resolves true when the complaint was stored, so the form can reset. */
  readonly onSubmit: (values: ComplaintLogValues) => Promise<boolean>;
}

export function ComplaintLogForm({
  isPending,
  onSubmit,
}: ComplaintLogFormProps) {
  const [guestId, setGuestId] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState<GuestComplaintSeverity>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit() {
    const stored = await onSubmit({
      guestId: guestId.trim() || undefined,
      category: category.trim(),
      severity,
      subject: subject.trim(),
      description: description.trim(),
    });
    if (!stored) return;
    setSubject('');
    setDescription('');
    setCategory('');
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="gc-guest">{t('complaints.guestId')}</Label>
        <Input
          id="gc-guest"
          name="guestId"
          value={guestId}
          onChange={(event) => setGuestId(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gc-category">{t('complaints.category')}</Label>
        <Input
          id="gc-category"
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gc-severity">{t('complaints.severity')}</Label>
        <select
          id="gc-severity"
          name="severity"
          className={CONTROL_CLASS}
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
      <div className="space-y-2">
        <Label htmlFor="gc-subject">{t('complaints.subject')}</Label>
        <Input
          id="gc-subject"
          name="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gc-description">{t('complaints.description')}</Label>
        <Textarea
          id="gc-description"
          name="description"
          className="min-h-24"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <Button
        type="button"
        disabled={
          !category.trim() ||
          !subject.trim() ||
          !description.trim() ||
          isPending
        }
        onClick={() => void handleSubmit()}
      >
        {t('complaints.submit')}
      </Button>
    </div>
  );
}
