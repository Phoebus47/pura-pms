"use client";

import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { guestsAPI, type Guest, type CreateGuestDto } from "@/lib/api";
import { Button } from "@/components/ui/button";

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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    idNumber: "",
    address: "",
    vipLevel: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email || "",
        phone: guest.phone || "",
        nationality: guest.nationality || "",
        idNumber: guest.idNumber || "",
        address: guest.address || "",
        vipLevel: guest.vipLevel,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nationality: "",
        idNumber: "",
        address: "",
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
      setError(err instanceof Error ? err.message : "Failed to save guest");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#1e4b8e]">
            {guest ? "Edit Guest" : "New Guest"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john.doe@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+66 81 234 5678"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* ID Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                  placeholder="Thai"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  ID Number
                </label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, idNumber: e.target.value })
                  }
                  placeholder="Passport or ID number"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Full address"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all resize-none"
              />
            </div>

            {/* VIP Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                        ? "border-[#f5a623] bg-[#f5a623]/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {level === 0 ? (
                      <span className="text-sm font-semibold">Standard</span>
                    ) : (
                      <>
                        {Array.from({ length: level }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-[#f5a623] text-[#f5a623]"
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
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
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
              className="flex-1 rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
              disabled={loading}
            >
              {loading ? "Saving..." : guest ? "Update Guest" : "Create Guest"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
