'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { guestsAPI, type Guest, type CreateGuestDto } from '@/lib/api';
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
      setError(err instanceof Error ? err.message : 'Failed to save guest');
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={guest ? 'Edit Guest' : 'New Guest'}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(90vh-140px)] overflow-y-auto p-6"
      >
        <div className="space-y-4">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <TextInput
              id="guest-first-name"
              label="First Name"
              value={formData.firstName}
              onChange={(value) =>
                setFormData({ ...formData, firstName: value })
              }
              required
              placeholder="John"
            />
            <TextInput
              id="guest-last-name"
              label="Last Name"
              value={formData.lastName}
              onChange={(value) =>
                setFormData({ ...formData, lastName: value })
              }
              required
              placeholder="Doe"
            />
          </div>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <TextInput
              id="guest-email"
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              placeholder="john.doe@email.com"
            />
            <TextInput
              id="guest-phone"
              name="phone"
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              placeholder="+66 81 234 5678"
            />
          </div>

          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <TextInput
              id="guest-nationality"
              name="nationality"
              label="Nationality"
              value={formData.nationality}
              onChange={(value) =>
                setFormData({ ...formData, nationality: value })
              }
              placeholder="Thai"
            />
            <TextInput
              id="guest-id-number"
              name="idNumber"
              label="ID Number"
              value={formData.idNumber}
              onChange={(value) =>
                setFormData({ ...formData, idNumber: value })
              }
              placeholder="Passport or ID number"
            />
          </div>

          <Textarea
            id="guest-address"
            name="address"
            label="Address"
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
            placeholder="Full address"
            rows={3}
          />

          <div>
            <label
              htmlFor="vip-level-group"
              className="block font-semibold mb-2 text-slate-700 text-sm"
            >
              VIP Level
            </label>
            <fieldset id="vip-level-group" className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, vipLevel: level })}
                  aria-label={`VIP Level ${level === 0 ? 'Standard' : level}`}
                  aria-pressed={formData.vipLevel === level}
                  className={`flex items-center gap-1 px-4 py-2 rounded-xl border-2 transition-all ${
                    formData.vipLevel === level
                      ? 'border-[#f5a623] bg-[#f5a623]/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {level === 0 ? (
                    <span className="font-semibold text-sm">Standard</span>
                  ) : (
                    <>
                      {Array.from({ length: level }).map((_, i) => (
                        <Star
                          key={`level-${level}-star-${i}`}
                          className="fill-[#f5a623] h-4 text-[#f5a623] w-4"
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
          submitLabel={guest ? 'Update Guest' : 'Create Guest'}
        />
      </form>
    </BaseFormDialog>
  );
}
