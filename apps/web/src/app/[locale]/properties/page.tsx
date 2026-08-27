'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2 } from 'lucide-react';
import { type Property } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PropertyFormDialog } from '@/components/property-form-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { useProperties } from '@/hooks/use-properties';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';
import { PropertyCard } from './property-card';

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

  function handleDelete(property: Property) {
    confirm(
      'Delete Property',
      `Are you sure you want to delete "${property.name}"? This action cannot be undone.`,
      async () => {
        await deleteProperty(property.id);
      },
    );
  }

  function handleFormSuccess() {
    loadProperties();
  }

  if (loading) {
    return <LoadingSpinner message="Loading properties..." />;
  }

  if (error) {
    return (
      <Panel className={cn('border', statusToneSurface.critical)}>
        <h2 className={cn('font-semibold text-lg', statusToneInk.critical)}>
          Error loading properties
        </h2>
        <p className={cn('mt-2 text-sm', statusToneInk.critical)}>{error}</p>
        <Button onClick={loadProperties} className="mt-4">
          Try Again
        </Button>
      </Panel>
    );
  }

  return (
    <>
      {Dialog}
      <div className="space-y-6">
        <PageHeader
          title="Properties"
          subtitle="Manage your hotel properties and locations"
          actions={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          }
        />

        {properties.length === 0 ? (
          <Panel padding="none">
            <EmptyState
              icon={<Building2 className="h-12 w-12" />}
              title="No properties yet"
              description="Get started by adding your first property"
              action={
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4" />
                  Add Property
                </Button>
              }
            />
          </Panel>
        ) : (
          <div className="gap-6 grid lg:grid-cols-3 md:grid-cols-2">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onView={(target) => router.push(`/properties/${target.id}`)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <PropertyFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        property={selectedProperty}
      />
    </>
  );
}
