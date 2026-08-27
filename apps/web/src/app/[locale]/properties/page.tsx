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
import { formatMessage, t } from '@/lib/i18n';
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
      t('properties.deleteTitle'),
      formatMessage('properties.deleteConfirm', { name: property.name }),
      async () => {
        await deleteProperty(property.id);
      },
    );
  }

  function handleFormSuccess() {
    loadProperties();
  }

  if (loading) {
    return <LoadingSpinner message={t('properties.loading')} />;
  }

  if (error) {
    return (
      <Panel className={cn('border', statusToneSurface.critical)}>
        <h2 className={cn('font-semibold text-lg', statusToneInk.critical)}>
          {t('properties.errorTitle')}
        </h2>
        <p className={cn('mt-2 text-sm', statusToneInk.critical)}>{error}</p>
        <Button onClick={loadProperties} className="mt-4">
          {t('common.tryAgain')}
        </Button>
      </Panel>
    );
  }

  return (
    <>
      {Dialog}
      <div className="space-y-6">
        <PageHeader
          title={t('properties.title')}
          subtitle={t('properties.subtitle')}
          actions={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              {t('properties.add')}
            </Button>
          }
        />

        {properties.length === 0 ? (
          <Panel padding="none">
            <EmptyState
              icon={<Building2 className="h-12 w-12" />}
              title={t('properties.emptyTitle')}
              description={t('properties.emptyBody')}
              action={
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4" />
                  {t('properties.add')}
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
