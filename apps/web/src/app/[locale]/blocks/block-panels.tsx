'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateBlock } from '@/hooks/use-blocks';
import type { BlockKind, RoomBlock } from '@/lib/api/blocks';
import type { RoomType } from '@/lib/api/room-types';

const fieldClass = 'min-h-11';
const buttonClass = 'min-h-11 w-full sm:w-auto';

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoTomorrow() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function CreateBlockForm({
  propertyId,
  roomTypes,
}: {
  readonly propertyId: string;
  readonly roomTypes: RoomType[];
}) {
  const createMutation = useCreateBlock();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [kind, setKind] = useState<BlockKind>('ALLOTMENT');
  const [channel, setChannel] = useState('');
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id ?? '');
  const [startDate, setStartDate] = useState(isoToday());
  const [endDate, setEndDate] = useState(isoTomorrow());
  const [cutoffDate, setCutoffDate] = useState(isoToday());
  const [allottedRooms, setAllottedRooms] = useState('5');

  async function handleSubmit() {
    try {
      await createMutation.mutateAsync({
        propertyId,
        roomTypeId: roomTypeId || roomTypes[0]?.id || '',
        code,
        name,
        kind,
        inventoryMode: kind === 'ALLOTMENT' ? 'GENERAL' : 'DEDICATED',
        channel: channel.trim() || undefined,
        startDate,
        endDate,
        cutoffDate,
        allottedRooms: Number(allottedRooms),
      });
      toast.success(t('blocks.createSuccess'));
      setCode('');
      setName('');
      setChannel('');
    } catch {
      toast.error(t('blocks.createFailed'));
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="blockCode">{t('blocks.code')}</Label>
        <Input
          id="blockCode"
          name="code"
          className={fieldClass}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockName">{t('blocks.name')}</Label>
        <Input
          id="blockName"
          name="name"
          className={fieldClass}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockKind">{t('blocks.kind')}</Label>
        <select
          id="blockKind"
          name="kind"
          className={`${fieldClass} w-full rounded-md border border-slate-300 bg-white px-3`}
          value={kind}
          onChange={(event) => setKind(event.target.value as BlockKind)}
        >
          <option value="ALLOTMENT">{t('blocks.kindAllotment')}</option>
          <option value="GROUP">{t('blocks.kindGroup')}</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockChannel">{t('blocks.channel')}</Label>
        <Input
          id="blockChannel"
          name="channel"
          className={fieldClass}
          value={channel}
          onChange={(event) => setChannel(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockRoomType">{t('blocks.roomType')}</Label>
        <select
          id="blockRoomType"
          name="roomTypeId"
          className={`${fieldClass} w-full rounded-md border border-slate-300 bg-white px-3`}
          value={roomTypeId || roomTypes[0]?.id || ''}
          onChange={(event) => setRoomTypeId(event.target.value)}
        >
          {roomTypes.map((roomType) => (
            <option key={roomType.id} value={roomType.id}>
              {roomType.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockStart">{t('blocks.startDate')}</Label>
        <Input
          id="blockStart"
          name="startDate"
          type="date"
          className={fieldClass}
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockEnd">{t('blocks.endDate')}</Label>
        <Input
          id="blockEnd"
          name="endDate"
          type="date"
          className={fieldClass}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockCutoff">{t('blocks.cutoffDate')}</Label>
        <Input
          id="blockCutoff"
          name="cutoffDate"
          type="date"
          className={fieldClass}
          value={cutoffDate}
          onChange={(event) => setCutoffDate(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockAllotted">{t('blocks.allottedRooms')}</Label>
        <Input
          id="blockAllotted"
          name="allottedRooms"
          type="number"
          min="1"
          className={fieldClass}
          value={allottedRooms}
          onChange={(event) => setAllottedRooms(event.target.value)}
          required
        />
      </div>
      <Button type="submit" className={buttonClass}>
        {t('blocks.createSubmit')}
      </Button>
    </form>
  );
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
    return <p className="text-slate-600 text-sm">{t('blocks.empty')}</p>;
  }
  return (
    <ul className="space-y-2">
      {blocks.map((block) => (
        <li key={block.id}>
          <button
            type="button"
            className={`min-h-11 w-full rounded-md border px-3 py-2 text-left text-sm ${
              selectedId === block.id
                ? 'border-pura-blue bg-pura-blue/5'
                : 'border-slate-200'
            }`}
            onClick={() => onSelect(block.id)}
          >
            {block.code} · {block.name} · {block.status} ·{' '}
            {block._count?.reservations ?? 0}/{block.allottedRooms}
          </button>
        </li>
      ))}
    </ul>
  );
}
