'use client';

import { useEffect, useState } from 'react';
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react';
import { type Property } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PropertyFormDialog } from '@/components/property-form-dialog';
import { useProperties } from '@/hooks/use-properties';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

export default function PropertiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const { properties, loading, error, loadProperties, deleteProperty } =
    useProperties();
  const { confirm, Dialog } = useConfirmDialog();

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  function handleCreate() {
    setSelectedProperty(null);
    setIsFormOpen(true);
  }

  function handleEdit(property: Property) {
    setSelectedProperty(property);
    setIsFormOpen(true);
  }

  function handleDelete(id: string, name: string) {
    confirm(
      'Delete Property',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      async () => {
        await deleteProperty(id);
      },
    );
  }

  function handleFormSuccess() {
    loadProperties();
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
        <h3 className="font-semibold text-red-800">Error loading properties</h3>
        <p className="mt-2 text-red-600">{error}</p>
        <Button onClick={loadProperties} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      {Dialog}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-[#1e4b8e] text-3xl">Properties</h1>
            <p className="mt-1 text-slate-600">
              Manage your hotel properties and locations
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#1e4b8e] hover:bg-[#153a6e] rounded-xl"
          >
            <Plus className="h-4 mr-2 w-4" />
            Add Property
          </Button>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="backdrop-blur-2xl bg-white/40 border border-white/50 py-12 rounded-3xl text-center">
            <Building2 className="h-16 mx-auto text-slate-300 w-16" />
            <h3 className="font-semibold mt-4 text-lg text-slate-700">
              No properties yet
            </h3>
            <p className="mt-2 text-slate-500">
              Get started by adding your first property
            </p>
            <Button
              onClick={handleCreate}
              className="bg-[#1e4b8e] hover:bg-[#153a6e] mt-6 rounded-xl"
            >
              <Plus className="h-4 mr-2 w-4" />
              Add Property
            </Button>
          </div>
        ) : (
          <div className="gap-6 grid lg:grid-cols-3 md:grid-cols-2">
            {properties.map((property) => (
              <div
                key={property.id}
                className="backdrop-blur-2xl bg-white/40 border border-white/50 duration-300 group hover:-translate-y-2 hover:bg-white/50 hover:border-white/70 hover:shadow-2xl hover:shadow-black/10 overflow-hidden p-6 relative rounded-3xl shadow-black/5 shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex gap-3 items-center">
                      <div className="bg-[#1e4b8e]/10 p-3 rounded-2xl">
                        <Building2 className="h-6 text-[#1e4b8e] w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">
                          {property.name}
                        </h3>
                        <p className="text-slate-500 text-xs">
                          {property.currency} • {property.timezone}
                        </p>
                      </div>
                    </div>

                    {property.address && (
                      <p className="line-clamp-2 mt-4 text-slate-600 text-sm">
                        {property.address}
                      </p>
                    )}

                    <div className="flex gap-4 mt-4">
                      {property._count && (
                        <>
                          <div className="text-center">
                            <div className="font-bold text-[#1e4b8e] text-2xl">
                              {property._count.rooms}
                            </div>
                            <div className="text-slate-500 text-xs">Rooms</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-[#f5a623] text-2xl">
                              {property._count.roomTypes}
                            </div>
                            <div className="text-slate-500 text-xs">Types</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
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
                    className="hover:bg-blue-50 hover:text-blue-600 rounded-xl"
                    onClick={() => handleEdit(property)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-50 hover:text-red-600 rounded-xl"
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
