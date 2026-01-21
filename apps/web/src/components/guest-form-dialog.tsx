'use client';

import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { guestsAPI, type Guest, type CreateGuestDto } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface GuestFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (guest: Guest) => void;
  guest?: Guest | null;
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

  if (!isOpen) return null;

  return (
    <div className="backdrop-blur-sm bg-black/50 fixed flex inset-0 items-center justify-center p-4 z-50">
      <div className="bg-white max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl shadow-2xl w-full">
        {/* Header */}
        <div className="border-b border-slate-200 flex items-center justify-between p-6">
          <h2 className="font-bold text-[#1e4b8e] text-2xl">
            {guest ? 'Edit Guest' : 'New Guest'}
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
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block font-semibold mb-2 text-slate-700 text-sm">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  placeholder="John"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-slate-700 text-sm">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  placeholder="Doe"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block font-semibold mb-2 text-slate-700 text-sm">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john.doe@email.com"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-slate-700 text-sm">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+66 81 234 5678"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>
            </div>

            {/* ID Info */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block font-semibold mb-2 text-slate-700 text-sm">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                  placeholder="Thai"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-slate-700 text-sm">
                  ID Number
                </label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, idNumber: e.target.value })
                  }
                  placeholder="Passport or ID number"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block font-semibold mb-2 text-slate-700 text-sm">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Full address"
                rows={3}
                className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 resize-none rounded-xl transition-all w-full"
              />
            </div>

            {/* VIP Level */}
            <div>
              <label className="block font-semibold mb-2 text-slate-700 text-sm">
                VIP Level
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, vipLevel: level })
                    }
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
                            key={i}
                            className="fill-[#f5a623] h-4 text-[#f5a623] w-4"
                          />
                        ))}
                      </>
                    )}
                  </button>
                ))}
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
              {loading ? 'Saving...' : guest ? 'Update Guest' : 'Create Guest'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
