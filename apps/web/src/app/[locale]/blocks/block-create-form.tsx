'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateBlock } from '@/hooks/use-blocks';
import type { BlockKind } from '@/lib/api/blocks';
import type { RoomType } from '@/lib/api/room-types';

const CONTROL_CLASS =
  'h-(--field-h) w-full rounded-md border border-input bg-surface-desk px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const buttonClass = 'w-full sm:w-auto';

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
      <div className="gap-4 grid sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="blockCode">{t('blocks.code')}</Label>
          <Input
            id="blockCode"
            name="code"
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
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
      </div>
      <div className="gap-4 grid sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="blockKind">{t('blocks.kind')}</Label>
          <select
            id="blockKind"
            name="kind"
            className={CONTROL_CLASS}
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
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockRoomType">{t('blocks.roomType')}</Label>
        <select
          id="blockRoomType"
          name="roomTypeId"
          className={CONTROL_CLASS}
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
      <div className="gap-4 grid sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="blockStart">{t('blocks.startDate')}</Label>
          <Input
            id="blockStart"
            name="startDate"
            type="date"
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
            value={cutoffDate}
            onChange={(event) => setCutoffDate(event.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockAllotted">{t('blocks.allottedRooms')}</Label>
        <Input
          id="blockAllotted"
          name="allottedRooms"
          type="number"
          min="1"
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
