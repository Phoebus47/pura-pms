/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PropertyFormDialog } from './property-form-dialog';
import { propertiesAPI } from '@/lib/api';

describe('PropertyFormDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockProperty = {
    id: '1',
    name: 'Existing Property',
    address: '123 Main St',
    phone: '555-1234',
    email: 'test@example.com',
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty form for new property', () => {
    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText('New Property')).toBeInTheDocument();
    expect(screen.getByLabelText(/property name/i)).toHaveValue('');
  });

  it('does not render when closed', () => {
    const { container } = render(
      <PropertyFormDialog
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('pre-fills form for existing property', () => {
    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        property={mockProperty}
      />,
    );

    expect(screen.getByText('Edit Property')).toBeInTheDocument();
    expect(screen.getByLabelText(/property name/i)).toHaveValue(
      'Existing Property',
    );
    expect(screen.getByLabelText(/address/i)).toHaveValue('123 Main St');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('555-1234');
    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
  });

  it('creates new property on submit', async () => {
    vi.spyOn(propertiesAPI, 'create').mockResolvedValue({} as any);

    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/property name/i), {
      target: { value: 'New Hotel' },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: '123 New St' },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '123-456-7890' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'hotel@test.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create property/i }));

    await waitFor(() => {
      expect(propertiesAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Hotel',
          address: '123 New St',
          phone: '123-456-7890',
          email: 'hotel@test.com',
        }),
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('updates existing property on submit', async () => {
    const updateSpy = vi
      .spyOn(propertiesAPI, 'update')
      .mockResolvedValue({} as any);

    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        property={mockProperty}
      />,
    );

    const nameInput = screen.getByLabelText(/property name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Hotel' } });

    fireEvent.click(screen.getByRole('button', { name: /update property/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          name: 'Updated Hotel',
        }),
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('displays error message on failure', async () => {
    vi.spyOn(propertiesAPI, 'create').mockRejectedValue(
      new Error('Failed to create'),
    );

    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/property name/i), {
      target: { value: 'Fail Hotel' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create property/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create')).toBeInTheDocument();
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('handles optional fields correctly when editing', () => {
    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        property={{
          ...mockProperty,
          address: undefined,
          phone: undefined,
          email: undefined,
        }}
      />,
    );

    expect(screen.getByLabelText(/address/i)).toHaveValue('');
    expect(screen.getByLabelText(/phone/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });

  it('handles generic non-Error failures', async () => {
    vi.spyOn(propertiesAPI, 'create').mockRejectedValue('String Error');

    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/property name/i), {
      target: { value: 'Fail Hotel' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create property/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save property')).toBeInTheDocument();
    });
  });

  it('updates form when property prop changes', () => {
    const { rerender } = render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );
    expect(screen.getByLabelText(/property name/i)).toHaveValue('');

    rerender(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        property={mockProperty}
      />,
    );
    expect(screen.getByLabelText(/property name/i)).toHaveValue(
      'Existing Property',
    );
  });

  it('resets form state when opened without property', () => {
    render(
      <PropertyFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    const nameInput = screen.getByLabelText(/property name/i);
    expect(nameInput).toHaveValue('');
  });
});
