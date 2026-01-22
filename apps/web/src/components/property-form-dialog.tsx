'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  propertiesAPI,
  type Property,
  type CreatePropertyDto,
} from '@/lib/api';
import { Button } from '@/components/ui/button';

interface PropertyFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  property?: Property | null;
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
      setError(err instanceof Error ? err.message : 'Failed to save property');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="backdrop-blur-sm bg-black/50 fixed flex inset-0 items-center justify-center p-4 z-50">
      <div className="bg-white max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl shadow-2xl w-full">
        {/* Header */}
        <div className="border-b border-slate-200 flex items-center justify-between p-6">
          <h2 className="font-bold text-[#1e4b8e] text-2xl">
            {property ? 'Edit Property' : 'New Property'}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-slate-100 p-2 rounded-xl transition-colors"
          >
            <X className="h-5 text-slate-600 w-5" />
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
                className="block font-semibold mb-2 text-slate-700 text-sm"
              >
                Property Name *
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
                placeholder="e.g., Grand Hotel Bangkok"
                className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
              />
            </div>

            <div>
              <label
                htmlFor="property-address"
                className="block font-semibold mb-2 text-slate-700 text-sm"
              >
                Address
              </label>
              <textarea
                id="property-address"
                name="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Full address"
                rows={3}
                className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 resize-none rounded-xl transition-all w-full"
              />
            </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label
                  htmlFor="property-phone"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Phone
                </label>
                <input
                  id="property-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+66 2 123 4567"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="property-email"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Email
                </label>
                <input
                  id="property-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@property.com"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-slate-200 border-t flex gap-3 mt-6 pt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#1e4b8e] flex-1 hover:bg-[#153a6e] rounded-xl"
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : property
                  ? 'Update Property'
                  : 'Create Property'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
