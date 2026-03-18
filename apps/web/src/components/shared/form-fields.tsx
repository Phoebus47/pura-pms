'use client';

import { ReactNode } from 'react';

interface BaseFieldProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly error?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

function FieldWrapper({
  id,
  label,
  required,
  error,
  children,
  className = '',
}: BaseFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block font-semibold mb-2 text-slate-700 text-sm"
      >
        {label}
        {required && ' *'}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps {
  readonly id: string;
  readonly name?: string;
  readonly label: string;
  readonly value: string | undefined;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly type?: 'text' | 'email' | 'tel';
  readonly error?: string;
  readonly className?: string;
}

export function TextInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
  error,
  className = '',
}: TextInputProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error}>
      <input
        id={id}
        name={name}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full ${className}`}
      />
    </FieldWrapper>
  );
}

interface NumberInputProps {
  readonly id: string;
  readonly name?: string;
  readonly label: string;
  readonly value: number | undefined;
  readonly onChange: (value: number) => void;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly error?: string;
  readonly className?: string;
  readonly disabled?: boolean;
}

export function NumberInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
  step,
  error,
  className = '',
  disabled,
}: NumberInputProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error}>
      <input
        id={id}
        name={name}
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${className}`}
      />
    </FieldWrapper>
  );
}

interface TextareaProps {
  readonly id: string;
  readonly name?: string;
  readonly label: string;
  readonly value: string | undefined;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly rows?: number;
  readonly error?: string;
  readonly className?: string;
}

export function Textarea({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
  rows = 3,
  error,
  className = '',
}: TextareaProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error}>
      <textarea
        id={id}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 resize-none rounded-xl transition-all w-full ${className}`}
      />
    </FieldWrapper>
  );
}

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface SelectProps {
  readonly id: string;
  readonly name?: string;
  readonly label: string;
  readonly value: string | undefined;
  readonly onChange: (value: string) => void;
  readonly options: readonly SelectOption[];
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly className?: string;
}

export function Select({
  id,
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  error,
  className = '',
}: SelectProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error}>
      <select
        id={id}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`appearance-none bg-white border border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}
