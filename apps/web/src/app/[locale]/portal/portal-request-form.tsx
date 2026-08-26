'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { t } from '@/lib/i18n';

interface PortalRequestFormProps {
  readonly content: string;
  readonly loading: boolean;
  readonly onContentChange: (value: string) => void;
  readonly onSubmit: () => void;
}

export function PortalRequestForm({
  content,
  loading,
  onContentChange,
  onSubmit,
}: PortalRequestFormProps) {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{t('portal.requestTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="portal-request-content">
            {t('portal.requestLabel')}
          </Label>
          <Textarea
            id="portal-request-content"
            name="requestContent"
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder={t('portal.requestPlaceholder')}
            rows={3}
          />
        </div>
        <Button
          type="button"
          className="min-h-[44px] w-full"
          onClick={onSubmit}
          disabled={loading || !content.trim()}
        >
          {loading ? t('portal.requestSubmitting') : t('portal.requestSubmit')}
        </Button>
      </CardContent>
    </Card>
  );
}
