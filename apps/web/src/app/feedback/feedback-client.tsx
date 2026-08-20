'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { propertiesAPI } from '@/lib/api/properties';
import type { GuestFeedback } from '@/lib/api/guest-feedback';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useCreateGuestFeedback,
  useGuestFeedback,
  useReviewGuestFeedback,
} from '@/hooks/use-guest-feedback';

function statusLabel(status: GuestFeedback['status']): string {
  if (status === 'OPEN') return t('feedback.statusOpen');
  if (status === 'REVIEWED') return t('feedback.statusReviewed');
  return t('feedback.statusArchived');
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
    <div className="max-w-4xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('feedback.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">{t('feedback.subtitle')}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('feedback.record')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="fb-guest">{t('feedback.guestId')}</Label>
            <Input
              id="fb-guest"
              name="guestId"
              className="mt-1"
              value={guestId}
              onChange={(event) => setGuestId(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fb-score">{t('feedback.score')}</Label>
            <select
              id="fb-score"
              name="score"
              className="border border-slate-200 min-h-11 mt-1 px-3 rounded-md w-full"
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
          <div>
            <Label htmlFor="fb-comment">{t('feedback.comment')}</Label>
            <textarea
              id="fb-comment"
              name="comment"
              className="border border-slate-200 min-h-24 mt-1 p-3 rounded-md w-full"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
          <Button
            type="button"
            className="min-h-11"
            disabled={!guestId.trim() || createFeedback.isPending}
            onClick={() => void handleCreate()}
          >
            {t('feedback.submit')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('feedback.list')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>{t('common.loading')}</p> : null}
          {!isLoading && rows.length === 0 ? (
            <p className="text-slate-600 text-sm">{t('feedback.empty')}</p>
          ) : null}
          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="border border-slate-200 p-3 rounded-md"
              >
                <p className="font-semibold text-slate-800">
                  {row.guest
                    ? `${row.guest.firstName} ${row.guest.lastName}`
                    : row.guestId}
                  {' · '}
                  {t('feedback.scoreValue').replace(
                    '{score}',
                    String(row.score),
                  )}
                  {' · '}
                  {statusLabel(row.status)}
                </p>
                {row.comment ? (
                  <p className="mt-1 text-slate-700 text-sm">{row.comment}</p>
                ) : null}
                {row.status === 'OPEN' ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 mt-2"
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
        </CardContent>
      </Card>
    </div>
  );
}
