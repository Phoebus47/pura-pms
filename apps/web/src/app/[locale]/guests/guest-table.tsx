'use client';

import { Ban, Pencil, Star, Trash2 } from 'lucide-react';
import { type Guest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { t } from '@/lib/i18n';

interface GuestTableProps {
  readonly guests: Guest[];
  readonly onSelect: (guest: Guest) => void;
  readonly onEdit: (event: React.MouseEvent, guest: Guest) => void;
  readonly onDelete: (event: React.MouseEvent, guest: Guest) => void;
}

function GuestIdentity({ guest }: { readonly guest: Guest }) {
  return (
    <div className="flex gap-3 items-center">
      <span className="bg-pura-blue/10 flex h-10 items-center justify-center rounded-full shrink-0 text-pura-blue text-sm w-10">
        {guest.firstName[0]}
        {guest.lastName[0]}
      </span>
      <span className="min-w-0">
        <span className="block truncate">
          {guest.firstName} {guest.lastName}
        </span>
        {guest.nationality && (
          <span className="block font-normal text-ink-subtle text-xs">
            {guest.nationality}
          </span>
        )}
      </span>
    </div>
  );
}

function VipLevel({ guest }: { readonly guest: Guest }) {
  if (guest.vipLevel === 0) {
    return (
      <span className="text-ink-subtle text-xs">{t('common.standard')}</span>
    );
  }

  return (
    <span className="flex gap-1 items-center">
      {Array.from({ length: guest.vipLevel }).map((_, index) => (
        <Star
          key={`${guest.id}-star-${index}`}
          className="fill-pura-orange h-4 text-pura-orange w-4"
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function GuestTable({
  guests,
  onSelect,
  onEdit,
  onDelete,
}: GuestTableProps) {
  const columns: DataTableColumn<Guest>[] = [
    {
      id: 'guest',
      header: t('common.guest'),
      cell: (guest) => <GuestIdentity guest={guest} />,
    },
    {
      id: 'contact',
      header: t('common.contact'),
      cell: (guest) => (
        <>
          <span className="block">{guest.email || '-'}</span>
          <span className="block text-ink-subtle text-xs">
            {guest.phone || '-'}
          </span>
        </>
      ),
    },
    {
      id: 'vipLevel',
      header: t('common.vipLevel'),
      hideOnMobile: true,
      cell: (guest) => <VipLevel guest={guest} />,
    },
    {
      id: 'stays',
      header: t('common.stays'),
      numeric: true,
      hideOnMobile: true,
      cell: (guest) => guest.totalStays,
    },
    {
      id: 'revenue',
      header: t('common.revenue'),
      numeric: true,
      cell: (guest) => (
        <span className="font-semibold text-pura-blue">
          ฿{Number(guest.totalRevenue).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'status',
      header: t('common.status'),
      cell: (guest) =>
        guest.isBlacklist ? (
          <StatusBadge
            tone="critical"
            label={t('common.blacklisted')}
            icon={<Ban className="h-3 w-3" aria-hidden="true" />}
          />
        ) : (
          <StatusBadge tone="positive" label={t('common.active')} />
        ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (guest) => (
        <span className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => onEdit(event, guest)}
            aria-label={t('common.edit')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-status-critical-tint text-status-critical-ink"
            onClick={(event) => onDelete(event, guest)}
            aria-label={t('common.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </span>
      ),
    },
  ];

  return (
    <DataTable
      caption={t('guests.list.tableCaption')}
      columns={columns}
      rows={guests}
      rowKey={(guest) => guest.id}
      stickyHeader
      onRowClick={onSelect}
    />
  );
}
