'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';

interface MetadataCardProps {
  readonly createdAt: string | Date;
  readonly updatedAt: string | Date;
}

export function MetadataCard({ createdAt, updatedAt }: MetadataCardProps) {
  const createdDate = new Date(createdAt).toLocaleString();
  const updatedDate = new Date(updatedAt).toLocaleString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pura-blue text-xl">
          {t('common.metadata')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="gap-4 grid grid-cols-2 text-sm">
          <div>
            <span className="text-muted-foreground">
              {t('common.created')}:
            </span>{' '}
            <span className="font-medium text-foreground">{createdDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground">
              {t('common.lastUpdated')}:
            </span>{' '}
            <span className="font-medium text-foreground">{updatedDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
