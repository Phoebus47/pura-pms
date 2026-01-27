import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomTypeFormDialog } from './room-type-form-dialog';
import { roomTypesAPI } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  roomTypesAPI: {
    create: jest.fn(),
    update: jest.fn(),
  },
  propertiesAPI: {
    getAll: jest.fn().mockResolvedValue([{ id: 'p-1', name: 'Hotel A' }]),
  },
}));

jest.mock('@/hooks/use-properties', () => ({
  useProperties: () => ({
    properties: [{ id: 'p-1', name: 'Hotel A' }],
    isLoading: false,
  }),
}));

describe('RoomTypeFormDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockRoomType = {
    id: '1',
    name: 'Deluxe',
    code: 'DLX',
    description: 'Desc',
    baseRate: 1000,
    baseAdults: 2,
    baseChildren: 1,
    maxAdults: 3,
    maxChildren: 2,
    maxOccupancy: 4,
    amenities: ['Wifi'],
    photos: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    _count: { rooms: 0, rates: 0 },
    propertyId: 'p-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('manages amenities', async () => {
    render(
      <RoomTypeFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    // Wait for properties to load to avoid act warning
    await screen.findByRole('combobox', { name: /property/i });

    // Add amenity
    const amenityInput = screen.getByPlaceholderText(/e.g., WiFi/i);
    const addButton = screen.getByRole('button', { name: /add amenity/i });
    // Actually the button has no text, just an icon. The code uses <Plus /> inside.
    // I should check if I can select by something else or add aria-label.
    // Looking at source: propertiesAPI mock is needed too.

    await userEvent.type(amenityInput, 'WiFi');
    // Pressing Enter
    await userEvent.keyboard('{Enter}');

    expect(screen.getByText('WiFi')).toBeInTheDocument();

    // Add another via button
    await userEvent.type(amenityInput, 'TV');
    await userEvent.click(addButton);

    expect(screen.getByText('TV')).toBeInTheDocument();

    // Remove amenity (WiFi)
    // Find the remove button for WiFi. It's inside the pill.
    // The pill text is "WiFi". The button is next to it.
    // I can get by role button within the pill?
    // Or just getAllByRole('button') and click the one that looks like trash?
    // Trash icon is used.
    // I'll assume it's the first remove button?
    // "WiFi" was added first, then "TV".
    // So "WiFi" is index 0.
    // We have 2 amenities. 2 delete buttons.
    // Use accessible name if possible?
    // The component has: <Trash2 ... /> inside button. No aria-label.
    // I need to add aria-label to remove button too.
    const removeWifiButton = screen.getByRole('button', {
      name: /remove WiFi/i,
    });
    await userEvent.click(removeWifiButton);

    expect(screen.queryByText('WiFi')).not.toBeInTheDocument();
    expect(screen.getByText('TV')).toBeInTheDocument();
  });

  it('renders correctly', async () => {
    render(
      <RoomTypeFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );
    expect(screen.getByText('New Room Type')).toBeInTheDocument();
    await screen.findByRole('combobox', { name: /property/i });
  });

  it('submits new room type', async () => {
    (roomTypesAPI.create as jest.Mock).mockResolvedValue({});
    render(
      <RoomTypeFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    await userEvent.type(screen.getByLabelText(/name/i), 'Suite');
    await userEvent.type(screen.getByLabelText(/code/i), 'SUI');
    await userEvent.type(screen.getByLabelText(/base rate/i), '5000');
    await userEvent.selectOptions(screen.getByLabelText(/property/i), 'p-1');
    await userEvent.type(screen.getByLabelText(/description/i), 'Luxury');

    // Test helper text input/textarea interaction explicitly
    const adultsInput = screen.getByLabelText(/max adults/i);
    await userEvent.clear(adultsInput);
    await userEvent.type(adultsInput, '2');

    await userEvent.click(
      screen.getByRole('button', { name: /create room type/i }),
    );

    expect(roomTypesAPI.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Suite',
        code: 'SUI',
        baseRate: 5000,
      }),
    );
  });

  it('handles update and error', async () => {
    (roomTypesAPI.update as jest.Mock).mockRejectedValue(
      new Error('Update Fail'),
    );
    render(
      <RoomTypeFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        roomType={mockRoomType}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /update room type/i }),
    );

    await waitFor(() => expect(roomTypesAPI.update).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByText('Update Fail')).toBeInTheDocument(),
    );
  });
});
