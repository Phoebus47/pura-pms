/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertiesPage from './page';
import { useProperties } from '@/hooks/use-properties';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/use-properties', () => ({
  useProperties: vi.fn(),
}));

const mockConfirm = vi.fn((title, msg, action) => action());
vi.mock('@/components/ui/confirm-dialog', () => ({
  useConfirmDialog: () => ({
    confirm: mockConfirm,
    Dialog: <div data-testid="confirm-dialog" />,
  }),
}));

// Mock child components
vi.mock('@/components/property-form-dialog', () => ({
  PropertyFormDialog: vi.fn(({ isOpen, property, onSuccess, onClose }) =>
    isOpen ? (
      <div data-testid="property-form-dialog">
        {property ? `Edit ${property.name}` : 'Create Property'}
        <button onClick={onSuccess}>Success</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  ),
}));

const mockProperties = [
  {
    id: '1',
    name: 'Hotel California',
    currency: 'USD',
    timezone: 'UTC',
    address: '123 Test St',
    _count: { rooms: 10, roomTypes: 2 },
  },
  {
    id: '2',
    name: 'Grand Budapest',
    currency: 'EUR',
    timezone: 'CET',
    // Missing address and counts for edge case coverage
  },
];

describe('PropertiesPage', () => {
  const mockLoadProperties = vi.fn();
  const mockDeleteProperty = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useProperties as any).mockReturnValue({
      properties: mockProperties,
      loading: false,
      error: null,
      loadProperties: mockLoadProperties,
      deleteProperty: mockDeleteProperty,
    });
  });

  it('renders loading state', () => {
    (useProperties as any).mockReturnValue({
      loading: true,
      properties: [],
      loadProperties: mockLoadProperties,
    });
    render(<PropertiesPage />);
    expect(screen.getByText(t('properties.loading'))).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useProperties as any).mockReturnValue({
      loading: false,
      error: 'Failed to fetch',
      properties: [],
      loadProperties: mockLoadProperties,
    });
    render(<PropertiesPage />);
    expect(screen.getByText(t('properties.errorTitle'))).toBeInTheDocument();

    fireEvent.click(screen.getByText(t('common.tryAgain')));
    expect(mockLoadProperties).toHaveBeenCalled();
  });

  it('renders empty state', () => {
    (useProperties as any).mockReturnValue({
      properties: [],
      loading: false,
      loadProperties: mockLoadProperties,
    });
    render(<PropertiesPage />);
    expect(screen.getByText(t('properties.emptyTitle'))).toBeInTheDocument();

    // Empty state has an add button
    const addButtons = screen.getAllByText(t('properties.add'));
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('renders properties list and handles view details', async () => {
    render(<PropertiesPage />);
    expect(screen.getByText('Hotel California')).toBeInTheDocument();
    expect(screen.getByText('Grand Budapest')).toBeInTheDocument();

    // Check for edge cases
    expect(screen.queryByText('123 Test St')).toBeInTheDocument();
    // Grand Budapest has no address, shouldn't render empty paragraph or crash?
    // Implementation: {property.address && ...}

    // View Details button
    await userEvent.click(screen.getAllByText(t('properties.viewDetails'))[0]);
    expect(mockPush).toHaveBeenCalledWith('/properties/1');
  });

  it('opens create dialog', async () => {
    render(<PropertiesPage />);
    // There are 2 "Add Property" buttons (header + potentially empty state, but here list is populated so only header)
    // Wait, empty state is only when properties.length === 0.
    await userEvent.click(screen.getByText(t('properties.add')));

    expect(screen.getByText('Create Property')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Success'));
    expect(mockLoadProperties).toHaveBeenCalled();
  });

  it('closes dialog', async () => {
    render(<PropertiesPage />);
    await userEvent.click(screen.getByText(t('properties.add')));
    expect(screen.getByText('Create Property')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Close'));
    expect(screen.queryByText('Create Property')).not.toBeInTheDocument();
  });

  it('handles edit property', async () => {
    render(<PropertiesPage />);

    // Find edit button (Pencil) via card
    screen.getByText('Hotel California').closest('div');

    const viewDetailsBtns = screen.getAllByText(t('properties.viewDetails'));
    const firstDetailsBtn = viewDetailsBtns[0];
    const actionsContainer = firstDetailsBtn.parentElement;
    if (!actionsContainer) throw new Error('Actions container not found');

    const editBtn = within(actionsContainer).getAllByRole('button')[1];
    await userEvent.click(editBtn);

    expect(screen.getByText('Edit Hotel California')).toBeInTheDocument();
  });

  it('handles delete property', async () => {
    render(<PropertiesPage />);

    const viewDetailsBtns = screen.getAllByText(t('properties.viewDetails'));
    const actionsContainer = viewDetailsBtns[0].parentElement!;

    const deleteBtn = within(actionsContainer).getAllByRole('button')[2];
    await userEvent.click(deleteBtn);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockDeleteProperty).toHaveBeenCalledWith('1');
  });
});
