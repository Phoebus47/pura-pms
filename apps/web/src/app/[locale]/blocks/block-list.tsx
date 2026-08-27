'use client';

import { CalendarRange } from 'lucide-react';
import { t } from '@/lib/i18n';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import type { RoomBlock } from '@/lib/api/blocks';
import type { StatusTone } from '@/lib/design/status-tone';

function blockTone(status: RoomBlock['status']): StatusTone {
  if (status === 'OPEN') return 'positive';
  if (status === 'RELEASED') return 'neutral';
  return 'caution';
}

export function BlockList({
  blocks,
  selectedId,
  onSelect,
}: {
  readonly blocks: RoomBlock[];
  readonly selectedId?: string;
  readonly onSelect: (id: string) => void;
}) {
  if (blocks.length === 0) {
    return (
      <EmptyState
        icon={<CalendarRange className="h-10 w-10" />}
        title={t('blocks.empty')}
      />
    );
  }

  return (
    <ul className="space-y-2">
      {blocks.map((block) => (
        <li key={block.id}>
          <button
            type="button"
            className={`flex min-h-11 w-full flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm text-ink-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              selectedId === block.id
                ? 'border-pura-blue bg-pura-blue/5'
                : 'border-rule-mist'
            }`}
            onClick={() => onSelect(block.id)}
          >
            <span className="font-semibold text-ink-strong">{block.code}</span>
            <span>{block.name}</span>
            <StatusBadge
              tone={blockTone(block.status)}
              label={block.status}
              size="sm"
            />
            <span className="ml-auto tabular-nums text-ink-subtle">
              {block._count?.reservations ?? 0}/{block.allottedRooms}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
