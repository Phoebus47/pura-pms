'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCompetitorRate } from '@/hooks/use-yield';
import type { CompetitorRate } from '@/lib/api/yield';
import type { RoomType } from '@/lib/api/room-types';

const fieldClass = 'min-h-11';
const buttonClass = 'min-h-11 w-full sm:w-auto';

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
            className={fieldClass}
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
            className={fieldClass}
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
            className={fieldClass}
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
            className={`${fieldClass} w-full rounded-md border border-slate-300 bg-surface-desk px-3`}
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
        <p className="text-muted-foreground text-sm">
          {t('yield.competitorEmpty')}
        </p>
      ) : (
        <ul className="space-y-2">
          {competitors.map((row) => (
            <li key={row.id} className="text-foreground text-sm">
              {row.competitorName} · {String(row.stayDate).slice(0, 10)} ·{' '}
              {row.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
