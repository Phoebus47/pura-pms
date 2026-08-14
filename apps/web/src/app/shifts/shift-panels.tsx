import type { Shift, ShiftStatus } from '@/lib/api/shifts';
import { t } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function statusLabel(status: ShiftStatus): string {
  if (status === 'OPEN') return t('shifts.openStatus');
  if (status === 'CLOSED') return t('shifts.closed');
  return t('shifts.balanced');
}

export function formatMoney(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString();
}

interface CurrentShiftCardProps {
  readonly shift: Shift | null | undefined;
}

export function CurrentShiftCard({ shift }: CurrentShiftCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('shifts.current')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {shift ? (
          <>
            <div className="flex flex-wrap gap-4 items-center">
              <Badge>{statusLabel(shift.status)}</Badge>
              <p>
                {t('shifts.openingCash')}: {formatMoney(shift.openingCash)}
              </p>
              <p>
                {t('shifts.expectedCash')}: {formatMoney(shift.expectedCash)}
              </p>
              <p>
                {t('shifts.cashier')}: {shift.userId}
              </p>
            </div>
            {shift.status === 'OPEN' ? (
              <p className="text-muted-foreground text-sm">
                {t('shifts.nightAuditBlocked')}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('shifts.noShiftHint')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface TodayShiftListProps {
  readonly shifts: Shift[];
  readonly onApprove?: (shiftId: string) => void;
  readonly approvePending?: boolean;
}

export function TodayShiftList({
  shifts,
  onApprove,
  approvePending = false,
}: TodayShiftListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('shifts.today')}</CardTitle>
      </CardHeader>
      <CardContent>
        {shifts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t('shifts.noShiftHint')}
          </p>
        ) : (
          <ul className="space-y-3">
            {shifts.map((shift) => (
              <li
                key={shift.id}
                className="border-b border-border flex flex-wrap gap-2 justify-between pb-3"
              >
                <span>{shift.shiftNumber}</span>
                <span>
                  {t('shifts.status')}: {statusLabel(shift.status)}
                </span>
                <span>
                  {t('shifts.variance')}: {formatMoney(shift.cashVariance)}
                </span>
                {shift.status === 'CLOSED' && onApprove ? (
                  <Button
                    type="button"
                    className="min-h-11"
                    onClick={() => onApprove(shift.id)}
                    disabled={approvePending}
                  >
                    {t('shifts.submitApprove')}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
