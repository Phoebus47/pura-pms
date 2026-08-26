'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';

interface PortalUnlockFormProps {
  readonly confirmNumber: string;
  readonly lastName: string;
  readonly loading: boolean;
  readonly onConfirmNumberChange: (value: string) => void;
  readonly onLastNameChange: (value: string) => void;
  readonly onUnlock: () => void;
}

export function PortalUnlockForm({
  confirmNumber,
  lastName,
  loading,
  onConfirmNumberChange,
  onLastNameChange,
  onUnlock,
}: PortalUnlockFormProps) {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{t('portal.unlockTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="portal-confirm-number" className="text-lg">
            {t('portal.confirmNumber')}
          </Label>
          <Input
            id="portal-confirm-number"
            name="confirmNumber"
            value={confirmNumber}
            onChange={(event) => onConfirmNumberChange(event.target.value)}
            placeholder={t('portal.confirmNumberPlaceholder')}
            className="h-14 text-xl"
            autoComplete="off"
            inputMode="text"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portal-last-name" className="text-lg">
            {t('portal.lastName')}
          </Label>
          <Input
            id="portal-last-name"
            name="lastName"
            value={lastName}
            onChange={(event) => onLastNameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onUnlock();
            }}
            placeholder={t('portal.lastNamePlaceholder')}
            className="h-14 text-xl"
            autoComplete="off"
          />
        </div>
        <Button
          type="button"
          className="h-14 min-h-[44px] text-lg w-full"
          onClick={onUnlock}
          disabled={loading || !confirmNumber.trim() || !lastName.trim()}
        >
          {loading ? t('common.loading') : t('portal.unlock')}
        </Button>
      </CardContent>
    </Card>
  );
}
