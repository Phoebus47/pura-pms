import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomFormDialog } from './room-form-dialog';
import { roomsAPI, roomTypesAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

jest.mock('@/lib/toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('@/lib/api', () => ({
  roomsAPI: {
    create: jest.fn(),
    update: jest.fn(),
  },
  propertiesAPI: {
    getAll: jest.fn().mockResolvedValue([{ id: 'p-1', name: 'Hotel A' }]),
  },
  roomTypesAPI: {
    getAll: jest
      .fn()
      .mockResolvedValue([{ id: 'rt-1', name: 'Deluxe', baseRate: 1000 }]),
  },
  useRoomTypes: () => ({
    roomTypes: [{ id: 'rt-1', name: 'Deluxe', baseRate: 1000 }],
    isLoading: false,
  }),
  useProperties: () => ({
    properties: [{ id: 'p-1', name: 'Hotel A' }],
    isLoading: false,
  }),
}));

// We need to mock the hooks used inside the component
jest.mock('@/hooks/use-room-types', () => ({
  useRoomTypes: () => ({
    roomTypes: [{ id: 'rt-1', name: 'Deluxe' }],
    isLoading: false,
  }),
}));

jest.mock('@/hooks/use-properties', () => ({
  useProperties: () => ({
    properties: [{ id: 'p-1', name: 'Hotel A' }],
    isLoading: false,
  }),
}));

describe('RoomFormDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and submits', async () => {
    (roomsAPI.create as jest.Mock).mockResolvedValue({});
    render(
      <RoomFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await userEvent.type(screen.getByLabelText(/room number/i), '101');
    await userEvent.clear(screen.getByLabelText(/floor/i));
    await userEvent.type(screen.getByLabelText(/floor/i), '3');
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /property/i }),
      'p-1',
    );

    // Wait for room types to load after property selection
    await waitFor(() => {
      expect(screen.getByLabelText(/room type/i)).not.toBeDisabled();
    });

    await userEvent.selectOptions(screen.getByLabelText(/room type/i), 'rt-1');
    await userEvent.selectOptions(
      screen.getByLabelText(/status/i),
      'VACANT_CLEAN',
    );

    await userEvent.click(screen.getByRole('button', { name: /create room/i }));

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

  it('handles room types load failure', async () => {
    (roomTypesAPI.getAll as jest.Mock).mockRejectedValue(
      new Error('Load Error'),
    );
    render(
      <RoomFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: /property/i }),
      'p-1',
    );
    // Wait for room types load attempt
    await waitFor(() => {
      expect(roomTypesAPI.getAll).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load room types');
    });
  });

  it('handles submit error', async () => {
    const errorMsg = 'Save failed';
    (roomTypesAPI.getAll as jest.Mock).mockResolvedValue([
      { id: 'rt-1', name: 'Deluxe', baseRate: 1000 },
    ]);
    (roomsAPI.create as jest.Mock).mockRejectedValue(new Error(errorMsg));

    render(
      <RoomFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    // Fill required fields
    await userEvent.type(screen.getByLabelText(/room number/i), '101');
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: /property/i }),
      'p-1',
    );

    await waitFor(() => {
      expect(roomTypesAPI.getAll).toHaveBeenCalled();
    });

    expect(await screen.findByText(/Deluxe/i)).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(/room type/i), 'rt-1');
    await userEvent.selectOptions(
      screen.getByLabelText(/status/i),
      'VACANT_CLEAN',
    );

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /create room/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    const { container } = render(
      <RoomFormDialog
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('pre-fills and updates in edit mode', async () => {
    (roomsAPI.update as jest.Mock).mockResolvedValue({});
    (roomTypesAPI.getAll as jest.Mock).mockResolvedValue([
      { id: 'rt-1', name: 'Deluxe', baseRate: 1000 },
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

    // Verify pre-fill
    expect(screen.getByLabelText(/room number/i)).toHaveValue('102');
    expect(screen.getByLabelText(/floor/i)).toHaveValue(2);
    expect(screen.getByLabelText(/status/i)).toHaveValue('OCCUPIED_CLEAN');

    // Update number
    await userEvent.clear(screen.getByLabelText(/room number/i));
    await userEvent.type(screen.getByLabelText(/room number/i), '105');

    await userEvent.click(screen.getByRole('button', { name: /update room/i }));

    expect(roomsAPI.update).toHaveBeenCalledWith(
      'r-1',
      expect.objectContaining({
        number: '105',
        propertyId: 'p-1',
      }),
    );
  });
});
