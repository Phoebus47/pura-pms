/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RoomFormDialog } from './room-form-dialog';
import { roomsAPI, roomTypesAPI, propertiesAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

vi.mock('@/lib/toast', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// We need to mock the hooks used inside the component

describe('RoomFormDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and submits', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    vi.spyOn(roomsAPI, 'create').mockResolvedValue({} as any);
    vi.spyOn(roomTypesAPI, 'getAll').mockResolvedValue([
      { id: 'rt-1', name: 'Deluxe', baseRate: 1000 } as any,
    ]);

    render(
      <RoomFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/room number/i), {
      target: { value: '101' },
    });
    fireEvent.change(screen.getByLabelText(/floor/i), {
      target: { value: '3' },
    });
    fireEvent.change(
      await screen.findByRole('combobox', { name: /property/i }),
      {
        target: { value: 'p-1' },
      },
    );

    // Wait for room types to load after property selection
    await waitFor(() => {
      expect(screen.getByLabelText(/room type/i)).not.toBeDisabled();
    });

    fireEvent.change(screen.getByLabelText(/room type/i), {
      target: { value: 'rt-1' },
    });
    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'VACANT_CLEAN' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create room/i }));

    await waitFor(() => {
      expect(roomsAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          number: '101',
          floor: 3,
          roomTypeId: 'rt-1',
          propertyId: 'p-1',
          status: 'VACANT_CLEAN',
        }),
      );
    });
  });

  it('handles room types load failure', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    vi.spyOn(roomTypesAPI, 'getAll').mockRejectedValue(new Error('Load Error'));
    render(
      <RoomFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );
    fireEvent.change(
      await screen.findByRole('combobox', { name: /property/i }),
      { target: { value: 'p-1' } },
    );

    // Wait for room types load attempt
    await waitFor(() => {
      expect(roomTypesAPI.getAll).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Failed to load room types');
    });
  });

  it('handles submit error', async () => {
    const errorMsg = 'Save failed';
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    vi.spyOn(roomTypesAPI, 'getAll').mockResolvedValue([
      { id: 'rt-1', name: 'Deluxe', baseRate: 1000 } as any,
    ]);
    vi.spyOn(roomsAPI, 'create').mockRejectedValue(new Error(errorMsg));

    render(
      <RoomFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/room number/i), {
      target: { value: '101' },
    });
    fireEvent.change(
      await screen.findByRole('combobox', { name: /property/i }),
      { target: { value: 'p-1' } },
    );

    await waitFor(() => {
      expect(roomTypesAPI.getAll).toHaveBeenCalled();
    });

    expect(await screen.findByText(/Deluxe/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/room type/i), {
      target: { value: 'rt-1' },
    });
    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'VACANT_CLEAN' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create room/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });
  });

  it('pre-fills and updates in edit mode', async () => {
    vi.spyOn(roomsAPI, 'update').mockResolvedValue({} as any);
    vi.spyOn(roomTypesAPI, 'getAll').mockResolvedValue([
      { id: 'rt-1', name: 'Deluxe', baseRate: 1000 } as any,
    ]);

    const mockRoom = {
      id: 'r-1',
      number: '102',
      floor: 2,
      status: 'OCCUPIED_CLEAN',
      roomTypeId: 'rt-1',
      propertyId: 'p-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as import('@/lib/api').Room;

    render(
      <RoomFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        room={mockRoom}
      />,
    );
    await screen.findByRole('combobox', { name: /property/i });
    await waitFor(() => expect(roomTypesAPI.getAll).toHaveBeenCalled());

    // Verify pre-fill
    expect(screen.getByLabelText(/room number/i)).toHaveValue('102');
    expect(screen.getByLabelText(/floor/i)).toHaveValue(2);
    expect(screen.getByLabelText(/status/i)).toHaveValue('OCCUPIED_CLEAN');

    // Update number
    fireEvent.change(screen.getByLabelText(/room number/i), {
      target: { value: '105' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update room/i }));

    await waitFor(() => {
      expect(roomsAPI.update).toHaveBeenCalledWith(
        'r-1',
        expect.objectContaining({
          number: '105',
          propertyId: 'p-1',
        }),
      );
    });
  });

  it('handles non-Error exception during submission', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    vi.spyOn(roomTypesAPI, 'getAll').mockResolvedValue([
      { id: 'rt-1', name: 'Deluxe' } as any,
    ]);
    vi.spyOn(roomsAPI, 'create').mockRejectedValue('String Error');
    render(
      <RoomFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/room number/i), {
      target: { value: '101' },
    });
    fireEvent.change(
      await screen.findByRole('combobox', { name: /property/i }),
      { target: { value: 'p-1' } },
    );
    await waitFor(() =>
      expect(screen.getByLabelText(/room type/i)).not.toBeDisabled(),
    );
    fireEvent.change(screen.getByLabelText(/room type/i), {
      target: { value: 'rt-1' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create room/i }));

    await waitFor(() =>
      expect(screen.getByText('Failed to save room')).toBeInTheDocument(),
    );
  });

  it('handles editing room with missing optional fields', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    vi.spyOn(roomTypesAPI, 'getAll').mockResolvedValue([
      { id: 'rt-1', name: 'Deluxe' } as any,
    ]);
    const mockRoom = {
      id: 'r-1',
      number: '102',
      status: 'OCCUPIED_CLEAN',
      roomTypeId: 'rt-1',
      propertyId: 'p-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as import('@/lib/api').Room;
    render(
      <RoomFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        room={mockRoom}
      />,
    );
    await screen.findByRole('combobox', { name: /property/i });
    await waitFor(() => expect(roomTypesAPI.getAll).toHaveBeenCalled());
    expect(screen.getByLabelText(/floor/i)).toHaveValue(1);
  });

  it('resets room types when propertyId is cleared', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    vi.spyOn(roomTypesAPI, 'getAll').mockResolvedValue([
      { id: 'rt-1', name: 'Deluxe' } as any,
    ]);

    render(
      <RoomFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    // Select property
    fireEvent.change(
      await screen.findByRole('combobox', { name: /property/i }),
      { target: { value: 'p-1' } },
    );
    await waitFor(() =>
      expect(screen.getByLabelText(/room type/i)).not.toBeDisabled(),
    );

    // Clear property
    fireEvent.change(screen.getByRole('combobox', { name: /property/i }), {
      target: { value: '' },
    });
    await waitFor(() =>
      expect(screen.getByLabelText(/room type/i)).toBeDisabled(),
    );
  });
});
