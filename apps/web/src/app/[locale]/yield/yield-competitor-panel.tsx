'use client';

import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/empty-state';
import { useCreateCompetitorRate } from '@/hooks/use-yield';
import type { CompetitorRate } from '@/lib/api/yield';
import type { RoomType } from '@/lib/api/room-types';

const CONTROL_CLASS =
  'h-(--field-h) w-full rounded-md border border-input bg-surface-desk px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
const buttonClass = 'w-full sm:w-auto';

interface CompetitorFormProps {
  readonly propertyId: string;
  readonly roomTypes: RoomType[];
  readonly competitors: CompetitorRate[];
}

export function CompetitorPanel({
  propertyId,
  roomTypes,
  competitors,
}: CompetitorFormProps) {
  const createMutation = useCreateCompetitorRate();
  const [competitorName, setCompetitorName] = useState('');
  const [stayDate, setStayDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [amount, setAmount] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createMutation.mutateAsync({
        propertyId,
        competitorName,
        stayDate,
        amount: Number(amount),
        ...(roomTypeId ? { roomTypeId } : {}),
      });
      toast.success(t('yield.competitorSuccess'));
      setCompetitorName('');
      setAmount('');
    } catch {
      toast.error(t('yield.competitorFailed'));
    }
  }

  return (
    <div className="space-y-4">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="competitorName">{t('yield.competitorName')}</Label>
          <Input
            id="competitorName"
            name="competitorName"
            value={competitorName}
            onChange={(event) => setCompetitorName(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="competitorStayDate">{t('yield.stayDate')}</Label>
          <Input
            id="competitorStayDate"
            name="stayDate"
            type="date"
            value={stayDate}
            onChange={(event) => setStayDate(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="competitorAmount">
            {t('yield.competitorAmount')}
          </Label>
          <Input
            id="competitorAmount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="competitorRoomType">{t('yield.roomType')}</Label>
          <select
            id="competitorRoomType"
            name="roomTypeId"
            className={CONTROL_CLASS}
            value={roomTypeId}
            onChange={(event) => setRoomTypeId(event.target.value)}
          >
            <option value="">{t('yield.allRoomTypes')}</option>
            {roomTypes.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className={buttonClass}>
          {t('yield.competitorSubmit')}
        </Button>
      </form>
      {competitors.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title={t('yield.competitorEmpty')}
        />
      ) : (
        <ul className="space-y-2">
          {competitors.map((row) => (
            <li key={row.id} className="tabular-nums text-ink-default text-sm">
              {row.competitorName} · {String(row.stayDate).slice(0, 10)} ·{' '}
              {row.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
