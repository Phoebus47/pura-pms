'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { transactionCodesAPI } from '@/lib/api/transaction-codes';
import type {
  CreateTransactionCodeDto,
  TransactionCode,
  TransactionType,
  TrxGroup,
} from '@/lib/api/transaction-codes';
import { BaseFormDialog } from '@/components/shared/base-form-dialog';
import { FormDialogFooter } from '@/components/shared/form-dialog-footer';
import {
  TextInput,
  Select,
  NumberInput,
} from '@/components/shared/form-fields';
import { statusToneSurface } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { tc } from './transaction-code-copy';

const ALL_TYPES: readonly TransactionType[] = [
  'CHARGE',
  'PAYMENT',
  'ADJUSTMENT',
  'TRANSFER',
  'DEPOSIT',
  'REFUND',
];

const ALL_GROUPS: readonly TrxGroup[] = [
  'ROOM',
  'FOOD',
  'BEVERAGE',
  'SPA',
  'FITNESS',
  'LAUNDRY',
  'TELEPHONE',
  'INTERNET',
  'MINIBAR',
  'PARKING',
  'MISC',
  'TAX',
  'SERVICE',
  'DISCOUNT',
];

const CHECKBOX_LABEL_CLASS =
  'flex gap-2 items-center mb-4 text-ink-default text-sm';

interface TransactionCodeDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved: () => Promise<void>;
  readonly editing: TransactionCode | null;
}

export function TransactionCodeDialog({
  isOpen,
  onClose,
  onSaved,
  editing,
}: TransactionCodeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('CHARGE');
  const [group, setGroup] = useState<TrxGroup>('ROOM');
  const [hasTax, setHasTax] = useState(true);
  const [hasService, setHasService] = useState(true);
  const [serviceRate, setServiceRate] = useState('10');
  const [glAccountCode, setGlAccountCode] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editing) {
      setCode(editing.code);
      setDescription(editing.description);
      setType(editing.type);
      setGroup(editing.group);
      setHasTax(editing.hasTax);
      setHasService(editing.hasService);
      setServiceRate(String(editing.serviceRate ?? 10));
      setGlAccountCode(editing.glAccountCode);
    } else {
      setCode('');
      setDescription('');
      setType('CHARGE');
      setGroup('ROOM');
      setHasTax(true);
      setHasService(true);
      setServiceRate('10');
      setGlAccountCode('');
    }
  }, [editing, isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: CreateTransactionCodeDto = {
        code,
        description,
        type,
        group,
        hasTax,
        hasService,
        serviceRate: hasService ? Number.parseFloat(serviceRate) : undefined,
        glAccountCode,
      };
      if (editing) {
        await transactionCodesAPI.update(editing.id, payload);
      } else {
        await transactionCodesAPI.create(payload);
      }
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : tc('saveFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? tc('editTitle') : tc('newTitle')}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <TextInput
            id="tc-code"
            name="code"
            label={t('common.code')}
            value={code}
            onChange={setCode}
            placeholder={tc('codePlaceholder')}
            required
          />
          <TextInput
            id="tc-gl"
            name="glAccountCode"
            label={tc('glAccount')}
            value={glAccountCode}
            onChange={setGlAccountCode}
            placeholder={tc('glPlaceholder')}
            required
          />
        </div>

        <TextInput
          id="tc-desc"
          name="description"
          label={t('common.description')}
          value={description}
          onChange={setDescription}
          placeholder={tc('descriptionPlaceholder')}
          required
        />

        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <Select
            id="tc-type"
            name="type"
            label={tc('type')}
            value={type}
            onChange={(v) => setType(v as TransactionType)}
            options={ALL_TYPES.map((option) => ({
              value: option,
              label: option,
            }))}
          />
          <Select
            id="tc-group"
            name="group"
            label={tc('group')}
            value={group}
            onChange={(v) => setGroup(v as TrxGroup)}
            options={ALL_GROUPS.map((option) => ({
              value: option,
              label: option,
            }))}
          />
        </div>

        <div className="gap-4 grid grid-cols-1 items-end md:grid-cols-3">
          <label className={CHECKBOX_LABEL_CLASS}>
            <input
              type="checkbox"
              name="hasTax"
              checked={hasTax}
              onChange={(e) => setHasTax(e.target.checked)}
            />
            <span className="font-semibold">{tc('applyVat')}</span>
          </label>
          <label className={CHECKBOX_LABEL_CLASS}>
            <input
              type="checkbox"
              name="hasService"
              checked={hasService}
              onChange={(e) => setHasService(e.target.checked)}
            />
            <span className="font-semibold">{tc('applyService')}</span>
          </label>
          <NumberInput
            id="tc-serviceRate"
            name="serviceRate"
            label={tc('servicePercent')}
            value={Number(serviceRate)}
            onChange={(v) => setServiceRate(v.toString())}
            step={0.01}
            disabled={!hasService}
          />
        </div>

        {error && (
          <div
            className={cn('border p-4 rounded-xl', statusToneSurface.critical)}
          >
            <p className="text-sm text-status-critical-ink">{error}</p>
          </div>
        )}

        <FormDialogFooter
          onCancel={onClose}
          loading={loading}
          submitLabel={editing ? tc('saveChanges') : tc('createCode')}
        />
      </form>
    </BaseFormDialog>
  );
}
