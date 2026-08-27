import { t } from '@/lib/i18n';

interface SplitStayOptionsProps {
  readonly enabled: boolean;
  readonly disabled: boolean;
  readonly splitDate: string;
  readonly minDate: string;
  readonly maxDate: string;
  readonly onEnabledChange: (enabled: boolean) => void;
  readonly onSplitDateChange: (date: string) => void;
}

export function SplitStayOptions({
  enabled,
  disabled,
  splitDate,
  minDate,
  maxDate,
  onEnabledChange,
  onSplitDateChange,
}: SplitStayOptionsProps) {
  return (
    <div className="space-y-3">
      <label className="cursor-pointer flex gap-3 items-start min-h-11">
        <input
          id="split-stay"
          name="isSplitStay"
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          aria-label={t('reservations.splitStay.label')}
          onChange={(event) => onEnabledChange(event.target.checked)}
          className="border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-4 mt-1 rounded text-pura-blue w-4"
        />
        <span>
          <span className="block font-semibold text-foreground text-sm">
            {t('reservations.splitStay.label')}
          </span>
          <span className="block mt-1 text-muted-foreground text-xs">
            {t('reservations.splitStay.hint')}
          </span>
        </span>
      </label>

      {enabled ? (
        <div>
          <label
            htmlFor="split-date"
            className="block font-semibold mb-2 text-foreground text-sm"
          >
            {t('reservations.splitStay.splitDate')}
          </label>
          <input
            id="split-date"
            name="splitDate"
            type="date"
            value={splitDate}
            min={minDate}
            max={maxDate}
            onChange={(event) => onSplitDateChange(event.target.value)}
            className="border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring min-h-11 px-4 py-3 rounded-xl transition-all w-full"
          />
        </div>
      ) : null}
    </div>
  );
}
