'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { guestsAPI, type Guest, type CreateGuestDto } from '@/lib/api';
import { formatMessage, t } from '@/lib/i18n';
import { BaseFormDialog } from '@/components/shared/base-form-dialog';
import { TextInput, Textarea } from '@/components/shared/form-fields';
import { FormDialogFooter } from '@/components/shared/form-dialog-footer';
import { ErrorDisplay } from '@/components/shared/error-display';

interface GuestFormDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: (guest: Guest) => void;
  readonly guest?: Guest | null;
}

export function GuestFormDialog({
  isOpen,
  onClose,
  onSuccess,
  guest,
}: GuestFormDialogProps) {
  const [formData, setFormData] = useState<CreateGuestDto>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    idNumber: '',
    address: '',
    vipLevel: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email || '',
        phone: guest.phone || '',
        nationality: guest.nationality || '',
        idNumber: guest.idNumber || '',
        address: guest.address || '',
        vipLevel: guest.vipLevel,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        idNumber: '',
        address: '',
        vipLevel: 0,
      });
    }
    setError(null);
  }, [guest, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let savedGuest: Guest;
      if (guest) {
        savedGuest = await guestsAPI.update(guest.id, formData);
      } else {
        savedGuest = await guestsAPI.create(formData);
      }
      onSuccess(savedGuest);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('guests.form.saveFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={guest ? t('guests.form.edit') : t('guests.form.new')}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(90vh-140px)] overflow-y-auto p-6"
      >
        <div className="space-y-4">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <TextInput
              id="guest-first-name"
              name="firstName"
              label={t('common.firstName')}
              value={formData.firstName}
              onChange={(value) =>
                setFormData({ ...formData, firstName: value })
              }
              required
              placeholder={t('guests.form.firstNamePlaceholder')}
            />
            <TextInput
              id="guest-last-name"
              name="lastName"
              label={t('common.lastName')}
              value={formData.lastName}
              onChange={(value) =>
                setFormData({ ...formData, lastName: value })
              }
              required
              placeholder={t('guests.form.lastNamePlaceholder')}
            />
          </div>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <TextInput
              id="guest-email"
              name="email"
              label={t('common.email')}
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              placeholder={t('guests.form.emailPlaceholder')}
            />
            <TextInput
              id="guest-phone"
              name="phone"
              label={t('common.phone')}
              type="tel"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              placeholder={t('guests.form.phonePlaceholder')}
            />
          </div>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <TextInput
              id="guest-nationality"
              name="nationality"
              label={t('common.nationality')}
              value={formData.nationality}
              onChange={(value) =>
                setFormData({ ...formData, nationality: value })
              }
              placeholder={t('guests.form.nationalityPlaceholder')}
            />
            <TextInput
              id="guest-id-number"
              name="idNumber"
              label={t('common.idNumber')}
              value={formData.idNumber}
              onChange={(value) =>
                setFormData({ ...formData, idNumber: value })
              }
              placeholder={t('guests.form.idPlaceholder')}
            />
          </div>

          <Textarea
            id="guest-address"
            name="address"
            label={t('common.address')}
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
            placeholder={t('guests.form.addressPlaceholder')}
            rows={3}
          />

          <div>
            <label
              htmlFor="vip-level-group"
              className="block font-semibold mb-2 text-foreground text-sm"
            >
              {t('common.vipLevel')}
            </label>
            <fieldset id="vip-level-group" className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, vipLevel: level })}
                  aria-label={
                    level === 0
                      ? t('guests.form.vipStandardAria')
                      : formatMessage('guests.form.vipLevelAria', { level })
                  }
                  aria-pressed={formData.vipLevel === level}
                  className={`flex items-center gap-1 px-4 py-2 rounded-xl border-2 transition-colors ${
                    formData.vipLevel === level
                      ? 'border-pura-orange bg-pura-orange/10'
                      : 'border-rule-mist hover:border-rule-strong'
                  }`}
                >
                  {level === 0 ? (
                    <span className="font-semibold text-sm">
                      {t('common.standard')}
                    </span>
                  ) : (
                    <>
                      {Array.from({ length: level }).map((_, i) => (
                        <Star
                          key={`level-${level}-star-${i}`}
                          className="fill-pura-orange h-4 text-pura-orange w-4"
                        />
                      ))}
                    </>
                  )}
                </button>
              ))}
            </fieldset>
          </div>

          <ErrorDisplay error={error} />
        </div>

        <FormDialogFooter
          onCancel={onClose}
          loading={loading}
          submitLabel={
            guest ? t('guests.form.update') : t('guests.form.create')
          }
        />
      </form>
    </BaseFormDialog>
  );
}
