'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { StatusBadge } from '@/components/shared/status-badge';
import { propertiesAPI } from '@/lib/api/properties';
import type { GuestFeedback } from '@/lib/api/guest-feedback';
import type { StatusTone } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useCreateGuestFeedback,
  useGuestFeedback,
  useReviewGuestFeedback,
} from '@/hooks/use-guest-feedback';

const CONTROL_CLASS =
  'h-(--field-h) w-full rounded-md border border-input bg-surface-desk px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

function statusLabel(status: GuestFeedback['status']): string {
  if (status === 'OPEN') return t('feedback.statusOpen');
  if (status === 'REVIEWED') return t('feedback.statusReviewed');
  return t('feedback.statusArchived');
}

function statusTone(status: GuestFeedback['status']): StatusTone {
  if (status === 'OPEN') return 'caution';
  if (status === 'REVIEWED') return 'positive';
  return 'neutral';
}

/** 1–2 reads as a service failure, 3 as a watch item, 4–5 as a win. */
function scoreTone(score: number): StatusTone {
  if (score <= 2) return 'critical';
  if (score === 3) return 'caution';
  return 'positive';
}

export function FeedbackClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: rows = [], isLoading } = useGuestFeedback({ propertyId });
  const createFeedback = useCreateGuestFeedback();
  const reviewFeedback = useReviewGuestFeedback();
  const [guestId, setGuestId] = useState('');
  const [score, setScore] = useState('5');
  const [comment, setComment] = useState('');

  async function handleCreate() {
    if (!propertyId || !guestId.trim()) return;
    const parsedScore = Number.parseInt(score, 10);
    if (Number.isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
      return;
    }
    try {
      await createFeedback.mutateAsync({
        propertyId,
        guestId: guestId.trim(),
        score: parsedScore,
        comment: comment.trim() || undefined,
      });
      toast.success(t('feedback.createSuccess'));
      setComment('');
    } catch {
      toast.error(t('feedback.createFailed'));
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={t('feedback.title')}
        subtitle={t('feedback.subtitle')}
      />

      <Panel title={t('feedback.record')}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fb-guest">{t('feedback.guestId')}</Label>
            <Input
              id="fb-guest"
              name="guestId"
              value={guestId}
              onChange={(event) => setGuestId(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fb-score">{t('feedback.score')}</Label>
            <select
              id="fb-score"
              name="score"
              className={CONTROL_CLASS}
              value={score}
              onChange={(event) => setScore(event.target.value)}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={String(value)}>
                  {t(`feedback.score${value}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fb-comment">{t('feedback.comment')}</Label>
            <Textarea
              id="fb-comment"
              name="comment"
              className="min-h-24"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={!guestId.trim() || createFeedback.isPending}
            onClick={() => void handleCreate()}
          >
            {t('feedback.submit')}
          </Button>
        </div>
      </Panel>

      <Panel title={t('feedback.list')}>
        {isLoading ? <LoadingSpinner message={t('common.loading')} /> : null}
        {!isLoading && rows.length === 0 ? (
          <EmptyState
            icon={<Star className="h-10 w-10" />}
            title={t('feedback.empty')}
          />
        ) : null}
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="border border-rule-mist p-4 rounded-lg space-y-2"
            >
              <div className="flex flex-wrap gap-2 items-center">
                <p className="font-semibold text-ink-strong">
                  {row.guest
                    ? `${row.guest.firstName} ${row.guest.lastName}`
                    : row.guestId}
                </p>
                <StatusBadge
                  tone={scoreTone(row.score)}
                  label={t('feedback.scoreValue').replace(
                    '{score}',
                    String(row.score),
                  )}
                  size="sm"
                />
                <StatusBadge
                  tone={statusTone(row.status)}
                  label={statusLabel(row.status)}
                  size="sm"
                />
              </div>
              {row.comment ? (
                <p className="text-ink-default text-sm">{row.comment}</p>
              ) : null}
              {row.status === 'OPEN' ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    void reviewFeedback
                      .mutateAsync({ id: row.id, reviewedBy: userId })
                      .then(() => toast.success(t('feedback.reviewSuccess')))
                      .catch(() => toast.error(t('feedback.actionFailed')))
                  }
                >
                  {t('feedback.markReviewed')}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
