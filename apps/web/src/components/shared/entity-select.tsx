'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export interface EntitySelectOption {
  readonly value: string;
  readonly label: string;
}

interface EntitySelectProps {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly EntitySelectOption[];
  readonly required?: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

export function EntitySelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
  disabled,
}: EntitySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'flex min-h-11 w-full rounded-md border border-rule-mist',
          'bg-surface-desk px-3 py-2 text-sm text-foreground scheme-light dark:scheme-dark',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-(--pura-blue)/20 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <option value="">{placeholder ?? t('common.select')}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
