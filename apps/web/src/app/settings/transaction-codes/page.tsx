'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
          <td className="px-3 py-6 text-slate-600" colSpan={8}>
            Loading...
          </td>
        </tr>
      );
    }
    if (filtered.length === 0) {
      return (
        <tr>
          <td className="px-3 py-6 text-slate-600" colSpan={8}>
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
            className="border-slate-200/60 border-t text-slate-800 text-sm"
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
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => openEdit(x)}
              >
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
          <p className="text-slate-500 text-sm">
            <Link href="/settings" className="hover:underline">
              Settings
            </Link>{' '}
            / Transaction Codes
          </p>
          <h1 className="font-bold text-[#1e4b8e] text-3xl">
            Transaction Codes
          </h1>
          <p className="mt-1 text-slate-600">
            Manage the PMS chart of accounts mapping used for posting.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#1e4b8e] hover:bg-[#153a6e] rounded-xl"
        >
          New Code
        </Button>
      </div>

      <div className="backdrop-blur-2xl bg-white/40 border border-white/60 p-4 rounded-2xl shadow-2xl shadow-black/5">
        <div className="flex gap-3 items-center justify-between">
          <div className="max-w-md w-full">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code or description..."
              className="rounded-xl"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
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
          <table className="min-w-[860px] text-left w-full">
            <thead>
              <tr className="text-slate-500 text-xs uppercase">
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

  const submitLabel = useMemo(() => {
    if (loading) return 'Saving...';
    if (editing) return 'Save Changes';
    return 'Create Code';
  }, [editing, loading]);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="rounded-3xl sm:max-w-2xl"
        onEscapeKeyDown={onClose}
        onPointerDownOutside={onClose}
      >
        <DialogHeader>
          <DialogTitle className="font-bold text-[#1e4b8e] text-2xl">
            {editing ? 'Edit Transaction Code' : 'New Transaction Code'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tc-code">Code</Label>
              <Input
                id="tc-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 1000"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tc-gl">GL Account</Label>
              <Input
                id="tc-gl"
                value={glAccountCode}
                onChange={(e) => setGlAccountCode(e.target.value)}
                placeholder="e.g. 4000-01"
                className="rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tc-desc">Description</Label>
            <Input
              id="tc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Room Charge"
              className="rounded-xl"
              required
            />
          </div>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tc-type">Type</Label>
              <select
                id="tc-type"
                className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-3 py-2 rounded-xl transition-all w-full"
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
              >
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tc-group">Group</Label>
              <select
                id="tc-group"
                className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-3 py-2 rounded-xl transition-all w-full"
                value={group}
                onChange={(e) => setGroup(e.target.value as TrxGroup)}
              >
                {ALL_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            <label className="flex gap-2 items-center text-slate-700 text-sm">
              <input
                type="checkbox"
                checked={hasTax}
                onChange={(e) => setHasTax(e.target.checked)}
              />
              <span>Apply VAT</span>
            </label>
            <label className="flex gap-2 items-center text-slate-700 text-sm">
              <input
                type="checkbox"
                checked={hasService}
                onChange={(e) => setHasService(e.target.checked)}
              />
              <span>Apply Service Charge</span>
            </label>
            <div className="space-y-2">
              <Label htmlFor="tc-serviceRate">Service %</Label>
              <Input
                id="tc-serviceRate"
                type="number"
                step="0.01"
                value={serviceRate}
                onChange={(e) => setServiceRate(e.target.value)}
                className="rounded-xl"
                disabled={!hasService}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#1e4b8e] hover:bg-[#153a6e] rounded-xl"
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
