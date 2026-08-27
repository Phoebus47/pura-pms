'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { transactionCodesAPI } from '@/lib/api/transaction-codes';
import type {
  CreateTransactionCodeDto,
  TransactionCode,
  TransactionType,
  TrxGroup,
} from '@/lib/api/transaction-codes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseFormDialog } from '@/components/shared/base-form-dialog';
import { FormDialogFooter } from '@/components/shared/form-dialog-footer';
import {
  TextInput,
  Select,
  NumberInput,
} from '@/components/shared/form-fields';

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

export default function TransactionCodesSettingsPage() {
  const [items, setItems] = useState<TransactionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionCode | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (x) =>
        x.code.toLowerCase().includes(q) ||
        x.description.toLowerCase().includes(q),
    );
  }, [items, query]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionCodesAPI.list();
      setItems(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to load transaction codes',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function openCreate() {
    setEditing(null);
    setIsDialogOpen(true);
  }

  function openEdit(item: TransactionCode) {
    setEditing(item);
    setIsDialogOpen(true);
  }

  const tableRows = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td className="px-3 py-6 text-muted-foreground" colSpan={8}>
            Loading...
          </td>
        </tr>
      );
    }
    if (filtered.length === 0) {
      return (
        <tr>
          <td className="px-3 py-6 text-muted-foreground" colSpan={8}>
            No transaction codes found.
          </td>
        </tr>
      );
    }
    return (
      <>
        {filtered.map((x) => (
          <tr
            key={x.id}
            className="border-rule-mist border-t text-foreground text-sm"
          >
            <td className="font-semibold px-3 py-3">{x.code}</td>
            <td className="px-3 py-3">{x.description}</td>
            <td className="px-3 py-3">{x.type}</td>
            <td className="px-3 py-3">{x.group}</td>
            <td className="px-3 py-3">{x.hasTax ? 'Yes' : 'No'}</td>
            <td className="px-3 py-3">
              {x.hasService ? `${x.serviceRate ?? 0}%` : 'No'}
            </td>
            <td className="px-3 py-3">{x.glAccountCode}</td>
            <td className="px-3 py-3 text-right">
              <Button variant="outline" onClick={() => openEdit(x)}>
                Edit
              </Button>
            </td>
          </tr>
        ))}
      </>
    );
  }, [filtered, loading]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            <Link href="/settings" className="hover:underline">
              Settings
            </Link>{' '}
            / Transaction Codes
          </p>
          <h1 className="font-bold text-3xl text-pura-blue">
            Transaction Codes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage the PMS chart of accounts mapping used for posting.
          </p>
        </div>
        <Button onClick={openCreate}>New Code</Button>
      </div>

      <div className="bg-surface-desk border border-rule-mist p-4 rounded-xl">
        <div className="flex gap-3 items-center justify-between">
          <div className="max-w-md relative w-full">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Search className="-translate-y-1/2 absolute h-4 left-3.5 text-muted-foreground top-1/2 w-4" />
            <Input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code or description..."
              className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none pl-10 pr-4 py-2.5 rounded-lg text-foreground text-sm w-full"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refresh()}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 mt-4 p-4 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-215 text-left w-full">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase">
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Group</th>
                <th className="px-3 py-2">Tax</th>
                <th className="px-3 py-2">Service</th>
                <th className="px-3 py-2">GL</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      </div>

      <TransactionCodeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSaved={async () => {
          setIsDialogOpen(false);
          await refresh();
        }}
        editing={editing}
      />
    </div>
  );
}

function TransactionCodeDialog({
  isOpen,
  onClose,
  onSaved,
  editing,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved: () => Promise<void>;
  readonly editing: TransactionCode | null;
}) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editing) {
        await transactionCodesAPI.update(editing.id, {
          code,
          description,
          type,
          group,
          hasTax,
          hasService,
          serviceRate: hasService ? Number.parseFloat(serviceRate) : undefined,
          glAccountCode,
        });
      } else {
        const dto: CreateTransactionCodeDto = {
          code,
          description,
          type,
          group,
          hasTax,
          hasService,
          serviceRate: hasService ? Number.parseFloat(serviceRate) : undefined,
          glAccountCode,
        };
        await transactionCodesAPI.create(dto);
      }
      await onSaved();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to save transaction code',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Edit Transaction Code' : 'New Transaction Code'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <TextInput
            id="tc-code"
            label="Code"
            value={code}
            onChange={setCode}
            placeholder="e.g. 1000"
            required
          />
          <TextInput
            id="tc-gl"
            label="GL Account"
            value={glAccountCode}
            onChange={setGlAccountCode}
            placeholder="e.g. 4000-01"
            required
          />
        </div>

        <TextInput
          id="tc-desc"
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="e.g. Room Charge"
          required
        />

        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <Select
            id="tc-type"
            label="Type"
            value={type}
            onChange={(v) => setType(v as TransactionType)}
            options={ALL_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <Select
            id="tc-group"
            label="Group"
            value={group}
            onChange={(v) => setGroup(v as TrxGroup)}
            options={ALL_GROUPS.map((g) => ({ value: g, label: g }))}
          />
        </div>

        <div className="gap-4 grid grid-cols-1 items-end md:grid-cols-3">
          <label className="flex gap-2 items-center mb-4 text-foreground text-sm">
            <input
              type="checkbox"
              checked={hasTax}
              onChange={(e) => setHasTax(e.target.checked)}
            />
            <span className="font-semibold">Apply VAT</span>
          </label>
          <label className="flex gap-2 items-center mb-4 text-foreground text-sm">
            <input
              type="checkbox"
              checked={hasService}
              onChange={(e) => setHasService(e.target.checked)}
            />
            <span className="font-semibold">Apply Service Charge</span>
          </label>
          <NumberInput
            id="tc-serviceRate"
            label="Service %"
            value={Number(serviceRate)}
            onChange={(v) => setServiceRate(v.toString())}
            step={0.01}
            disabled={!hasService}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <FormDialogFooter
          onCancel={onClose}
          loading={loading}
          submitLabel={editing ? 'Save Changes' : 'Create Code'}
        />
      </form>
    </BaseFormDialog>
  );
}
