'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntitySelect } from '@/components/shared/entity-select';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { usePartnerHotels } from '@/hooks/use-partner-hotels';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';

interface WalkPanelProps {
  readonly reservation: Reservation;
  readonly onWalked: () => void;
}

export function WalkPanel({ reservation, onWalked }: WalkPanelProps) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const queryClient = useQueryClient();
  const propertyId = reservation.room?.property?.id;
  const [partnerHotelId, setPartnerHotelId] = useState('');
  const [cost, setCost] = useState('');
  const [compensationAmount, setCompensationAmount] = useState('');
  const [compensationNotes, setCompensationNotes] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: hotels = [] } = usePartnerHotels(propertyId);

  const { data: history = [] } = useQuery({
    queryKey: ['walks', reservation.id],
    queryFn: () => reservationsAPI.listWalks(reservation.id),
  });

  const options = useMemo(
    () =>
      hotels
        .filter((hotel) => hotel.isActive)
        .map((hotel) => ({ value: hotel.id, label: hotel.name })),
    [hotels],
  );

  async function handleWalk() {
    try {
      setBusy(true);
      await reservationsAPI.walk(reservation.id, {
        partnerHotelId,
        cost: Number.parseFloat(cost || '0') || 0,
        compensationAmount: compensationAmount
          ? Number.parseFloat(compensationAmount) || 0
          : undefined,
        compensationNotes: compensationNotes.trim() || undefined,
        reason: reason.trim() || undefined,
        walkedBy: userId,
      });
      await queryClient.invalidateQueries({
        queryKey: ['walks', reservation.id],
      });
      toast.success(t('reservations.walk.success'));
      setPartnerHotelId('');
      setCost('');
      setCompensationAmount('');
      setCompensationNotes('');
      setReason('');
      onWalked();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('reservations.walk.submit'),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reservations.walk.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleWalk();
          }}
        >
          <EntitySelect
            id="walk-partner-hotel"
            name="partnerHotelId"
            label={t('reservations.walk.partnerHotel')}
            value={partnerHotelId}
            onChange={setPartnerHotelId}
            options={options}
            required
            placeholder={t('reservations.walk.placeholder')}
            disabled={busy || options.length === 0}
          />
          {options.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('reservations.walk.noHotels')}
            </p>
          ) : null}
          <div className="gap-4 grid grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="walk-cost">{t('reservations.walk.cost')}</Label>
              <Input
                id="walk-cost"
                name="cost"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={cost}
                onChange={(event) => setCost(event.target.value)}
                disabled={busy}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walk-compensation">
                {t('reservations.walk.compensation')}
              </Label>
              <Input
                id="walk-compensation"
                name="compensationAmount"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={compensationAmount}
                onChange={(event) => setCompensationAmount(event.target.value)}
                disabled={busy}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="walk-compensation-notes">
              {t('reservations.walk.compensationNotes')}
            </Label>
            <Input
              id="walk-compensation-notes"
              name="compensationNotes"
              value={compensationNotes}
              onChange={(event) => setCompensationNotes(event.target.value)}
              disabled={busy}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="walk-reason">{t('reservations.walk.reason')}</Label>
            <Input
              id="walk-reason"
              name="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={busy}
            />
          </div>
          <Button type="submit" disabled={busy || !partnerHotelId || !cost}>
            {t('reservations.walk.submit')}
          </Button>
        </form>
        <div className="border-rule-mist border-t pt-4">
          <h4 className="font-semibold mb-2 text-sm">
            {t('reservations.walk.history')}
          </h4>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('reservations.walk.emptyHistory')}
            </p>
          ) : (
            <ul className="space-y-2 text-foreground text-sm">
              {history.map((walk) => (
                <li key={walk.id}>
                  {walk.partnerHotel?.name ?? walk.partnerHotelId} · ฿
                  {walk.cost.toLocaleString()}
                  {walk.reason ? ` — ${walk.reason}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
