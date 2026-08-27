'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  propertiesAPI,
  type Property,
  type CreatePropertyDto,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

interface PropertyFormDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly property?: Property | null;
}

export function PropertyFormDialog({
  isOpen,
  onClose,
  onSuccess,
  property,
}: PropertyFormDialogProps) {
  const [formData, setFormData] = useState<CreatePropertyDto>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        address: property.address || '',
        phone: property.phone || '',
        email: property.email || '',
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
      });
    }
    setError(null);
  }, [property, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (property) {
        await propertiesAPI.update(property.id, formData);
      } else {
        await propertiesAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('properties.formSaveFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="bg-black/50 fixed flex inset-0 items-center justify-center p-4 z-50">
      <div className="bg-surface-desk max-h-[90vh] max-w-2xl overflow-hidden rounded-xl shadow-lg w-full">
        {/* Header */}
        <div className="border-b border-rule-mist flex items-center justify-between p-6">
          <h2 className="font-bold text-2xl text-pura-blue">
            {property ? t('properties.formEdit') : t('properties.formNew')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.cancel')}
            className="hover:bg-muted p-2 rounded-lg transition-colors"
          >
            <X className="h-5 text-muted-foreground w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(90vh-140px)] overflow-y-auto p-6"
        >
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="property-name"
                className="block font-semibold mb-2 text-foreground text-sm"
              >
                {t('properties.formName')}
              </label>
              <input
                id="property-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder={t('properties.formNamePlaceholder')}
                className="border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring px-4 py-3 rounded-lg transition-colors w-full"
              />
            </div>

            <div>
              <label
                htmlFor="property-address"
                className="block font-semibold mb-2 text-foreground text-sm"
              >
                {t('common.address')}
              </label>
              <textarea
                id="property-address"
                name="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder={t('properties.formAddressPlaceholder')}
                rows={3}
                className="border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring px-4 py-3 resize-none rounded-lg transition-colors w-full"
              />
            </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label
                  htmlFor="property-phone"
                  className="block font-semibold mb-2 text-foreground text-sm"
                >
                  {t('common.phone')}
                </label>
                <input
                  id="property-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder={t('properties.formPhonePlaceholder')}
                  className="border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring px-4 py-3 rounded-lg transition-colors w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="property-email"
                  className="block font-semibold mb-2 text-foreground text-sm"
                >
                  {t('common.email')}
                </label>
                <input
                  id="property-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={t('properties.formEmailPlaceholder')}
                  className="border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring px-4 py-3 rounded-lg transition-colors w-full"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-status-critical-tint border border-status-critical-line/30 p-4 rounded-xl">
                <p className="text-sm text-status-critical-ink">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-rule-mist border-t flex gap-3 mt-6 pt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading
                ? t('properties.formSaving')
                : getSubmitButtonLabel(!!property)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getSubmitButtonLabel(isEdit: boolean): string {
  if (isEdit) return t('properties.formUpdate');
  return t('properties.formCreate');
}
