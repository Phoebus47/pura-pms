'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Panel } from '@/components/shared/panel';
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
    <Panel title={t('lostFound.register')}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lf-description">{t('lostFound.description')}</Label>
          <Input
            id="lf-description"
            name="itemDescription"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="gap-4 grid sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lf-location">{t('lostFound.location')}</Label>
            <Input
              id="lf-location"
              name="locationFound"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lf-room">{t('lostFound.room')}</Label>
            <Input
              id="lf-room"
              name="roomNumber"
              value={roomNumber}
              onChange={(event) => setRoomNumber(event.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          disabled={!description.trim() || !location.trim() || isPending}
          onClick={() => void handleCreate()}
        >
          {t('lostFound.create')}
        </Button>
      </div>
    </Panel>
  );
}
