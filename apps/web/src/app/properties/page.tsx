"use client";

import { useEffect, useState } from "react";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";
import { propertiesAPI, type Property } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PropertyFormDialog } from "@/components/property-form-dialog";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesAPI.getAll();
      setProperties(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load properties",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setSelectedProperty(null);
    setIsFormOpen(true);
  }

  function handleEdit(property: Property) {
    setSelectedProperty(property);
    setIsFormOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await propertiesAPI.delete(id);
      loadProperties();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete property");
    }
  }

  function handleFormSuccess() {
    loadProperties();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b8e] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
        <h3 className="text-red-800 font-semibold">Error loading properties</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <Button onClick={loadProperties} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1e4b8e]">Properties</h1>
            <p className="text-slate-600 mt-1">
              Manage your hotel properties and locations
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="text-center py-12 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50">
            <Building2 className="h-16 w-16 text-slate-300 mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-slate-700">
              No properties yet
            </h3>
            <p className="text-slate-500 mt-2">
              Get started by adding your first property
            </p>
            <Button
              onClick={handleCreate}
              className="mt-6 rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl shadow-black/5 transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 hover:border-white/70 hover:bg-white/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#1e4b8e]/10 p-3">
                        <Building2 className="h-6 w-6 text-[#1e4b8e]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">
                          {property.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {property.currency} • {property.timezone}
                        </p>
                      </div>
                    </div>

                    {property.address && (
                      <p className="mt-4 text-sm text-slate-600 line-clamp-2">
                        {property.address}
                      </p>
                    )}

                    <div className="mt-4 flex gap-4">
                      {property._count && (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#1e4b8e]">
                              {property._count.rooms}
                            </div>
                            <div className="text-xs text-slate-500">Rooms</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#f5a623]">
                              {property._count.roomTypes}
                            </div>
                            <div className="text-xs text-slate-500">Types</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      window.location.href = `/properties/${property.id}`;
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => handleEdit(property)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(property.id, property.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Form Dialog */}
      <PropertyFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        property={selectedProperty}
      />
    </>
  );
}
