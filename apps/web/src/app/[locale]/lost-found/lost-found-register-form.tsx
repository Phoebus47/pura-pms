'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';

interface LostFoundRegisterFormProps {
  isPending: boolean;
  onSubmit: (values: {
    itemDescription: string;
    locationFound: string;
    roomNumber?: string;
  }) => Promise<void>;
}

export function LostFoundRegisterForm({
  isPending,
  onSubmit,
}: LostFoundRegisterFormProps) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  async function handleCreate() {
    if (!description.trim() || !location.trim()) return;
    await onSubmit({
      itemDescription: description.trim(),
      locationFound: location.trim(),
      roomNumber: roomNumber.trim() || undefined,
    });
    setDescription('');
    setLocation('');
    setRoomNumber('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('lostFound.register')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="lf-description">{t('lostFound.description')}</Label>
          <Input
            id="lf-description"
            name="itemDescription"
            className="mt-1"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="gap-3 grid sm:grid-cols-2">
          <div>
            <Label htmlFor="lf-location">{t('lostFound.location')}</Label>
            <Input
              id="lf-location"
              name="locationFound"
              className="mt-1"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lf-room">{t('lostFound.room')}</Label>
            <Input
              id="lf-room"
              name="roomNumber"
              className="mt-1"
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          className="min-h-11"
          disabled={!description.trim() || !location.trim() || isPending}
          onClick={() => void handleCreate()}
        >
          {t('lostFound.create')}
        </Button>
      </CardContent>
    </Card>
  );
}
