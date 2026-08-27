import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const buttonClass = 'w-full sm:w-auto';

interface OpenShiftFormProps {
  readonly openingCash: string;
  readonly onOpeningCashChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly pending: boolean;
}

export function OpenShiftForm({
  openingCash,
  onOpeningCashChange,
  onSubmit,
  pending,
}: OpenShiftFormProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="openingCash">{t('shifts.openingCash')}</Label>
        <Input
          id="openingCash"
          name="openingCash"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={openingCash}
          onChange={(event) => onOpeningCashChange(event.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={pending} className={buttonClass}>
        {t('shifts.submitOpen')}
      </Button>
    </form>
  );
}

interface CloseShiftFormProps {
  readonly closingCash: string;
  readonly varianceReason: string;
  readonly notes: string;
  readonly onClosingCashChange: (value: string) => void;
  readonly onVarianceReasonChange: (value: string) => void;
  readonly onNotesChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly pending: boolean;
}

export function CloseShiftForm({
  closingCash,
  varianceReason,
  notes,
  onClosingCashChange,
  onVarianceReasonChange,
  onNotesChange,
  onSubmit,
  pending,
}: CloseShiftFormProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="closingCash">{t('shifts.closingCash')}</Label>
        <Input
          id="closingCash"
          name="closingCash"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={closingCash}
          onChange={(event) => onClosingCashChange(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="varianceReason">{t('shifts.varianceReason')}</Label>
        <Input
          id="varianceReason"
          name="varianceReason"
          value={varianceReason}
          onChange={(event) => onVarianceReasonChange(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="closeNotes">{t('shifts.notes')}</Label>
        <Input
          id="closeNotes"
          name="closeNotes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={pending} className={buttonClass}>
        {t('shifts.submitClose')}
      </Button>
    </form>
  );
}

interface HandoverShiftFormProps {
  readonly toUserId: string;
  readonly countedCash: string;
  readonly notes: string;
  readonly onToUserIdChange: (value: string) => void;
  readonly onCountedCashChange: (value: string) => void;
  readonly onNotesChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly pending: boolean;
}

export function HandoverShiftForm({
  toUserId,
  countedCash,
  notes,
  onToUserIdChange,
  onCountedCashChange,
  onNotesChange,
  onSubmit,
  pending,
}: HandoverShiftFormProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="toUserId">{t('shifts.toUserId')}</Label>
        <Input
          id="toUserId"
          name="toUserId"
          value={toUserId}
          onChange={(event) => onToUserIdChange(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="countedCash">{t('shifts.countedCash')}</Label>
        <Input
          id="countedCash"
          name="countedCash"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={countedCash}
          onChange={(event) => onCountedCashChange(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="handoverNotes">{t('shifts.notes')}</Label>
        <Input
          id="handoverNotes"
          name="handoverNotes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={pending} className={buttonClass}>
        {t('shifts.submitHandover')}
      </Button>
    </form>
  );
}
