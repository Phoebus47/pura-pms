'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react';
import { type Property } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PropertyFormDialog } from '@/components/property-form-dialog';
import { useProperties } from '@/hooks/use-properties';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

export default function PropertiesPage() {
  const router = useRouter();
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
          <div className="animate-spin border-b-2 border-pura-blue h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
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
            <h1 className="font-bold text-3xl text-pura-blue">Properties</h1>
            <p className="mt-1 text-slate-600">
              Manage your hotel properties and locations
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 mr-2 w-4" />
            Add Property
          </Button>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="bg-white border border-slate-200 py-12 rounded-xl text-center">
            <Building2 className="h-16 mx-auto text-slate-300 w-16" />
            <h3 className="font-semibold mt-4 text-lg text-slate-700">
              No properties yet
            </h3>
            <p className="mt-2 text-slate-500">
              Get started by adding your first property
            </p>
            <Button onClick={handleCreate} className="mt-6">
              <Plus className="h-4 mr-2 w-4" />
              Add Property
            </Button>
          </div>
        ) : (
          <div className="gap-6 grid lg:grid-cols-3 md:grid-cols-2">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white border border-slate-200 group hover:border-slate-300 overflow-hidden p-6 relative rounded-xl shadow-sm transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex gap-3 items-center">
                      <div className="bg-pura-blue/10 p-3 rounded-lg">
                        <Building2 className="h-6 text-pura-blue w-6" />
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
                            <div className="font-bold text-2xl text-pura-blue">
                              {property._count.rooms}
                            </div>
                            <div className="text-slate-500 text-xs">Rooms</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-2xl text-pura-orange">
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
                    className="flex-1"
                    onClick={() => {
                      router.push(`/properties/${property.id}`);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => handleEdit(property)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-50 hover:text-red-600"
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
