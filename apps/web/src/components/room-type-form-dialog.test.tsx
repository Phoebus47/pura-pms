/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomTypeFormDialog } from './room-type-form-dialog';
import { roomTypesAPI, propertiesAPI } from '@/lib/api';

describe('RoomTypeFormDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
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
    vi.clearAllMocks();
  });

  it('manages amenities', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    render(
      <RoomTypeFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    // Wait for properties to load
    await screen.findByRole('combobox', { name: /property/i });

    // Add amenity
    const amenityInput = screen.getByPlaceholderText(/e.g., WiFi/i);
    const addButton = screen.getByRole('button', { name: /add amenity/i });

    fireEvent.change(amenityInput, { target: { value: 'WiFi' } });
    fireEvent.click(addButton);

    expect(screen.getByText('WiFi')).toBeInTheDocument();

    // Add another via button
    fireEvent.change(amenityInput, { target: { value: 'TV' } });
    fireEvent.click(addButton);

    expect(screen.getByText('TV')).toBeInTheDocument();

    // Add amenity via Enter key
    fireEvent.change(amenityInput, { target: { value: 'Mini Bar' } });
    fireEvent.keyDown(amenityInput, {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
    });
    expect(screen.getByText('Mini Bar')).toBeInTheDocument();

    // Ignore other keys
    fireEvent.keyDown(amenityInput, { key: 'Escape', code: 'Escape' });

    // Remove amenity (WiFi)
    const removeWifiButton = screen.getByRole('button', {
      name: /remove WiFi/i,
    });
    fireEvent.click(removeWifiButton);

    expect(screen.queryByText('WiFi')).not.toBeInTheDocument();
    expect(screen.getByText('TV')).toBeInTheDocument();
  });

  it('renders correctly', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
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

  it('renders with existing room type', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    render(
      <RoomTypeFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        roomType={mockRoomType}
      />,
    );
    await screen.findByRole('combobox', { name: /property/i });
    expect(screen.getByLabelText(/name/i)).toHaveValue('Deluxe');
  });

  it('submits new room type', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    vi.spyOn(roomTypesAPI, 'create').mockResolvedValue({} as any);
    render(
      <RoomTypeFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Suite' },
    });
    fireEvent.change(screen.getByLabelText(/code/i), {
      target: { value: 'SUI' },
    });
    fireEvent.change(screen.getByLabelText(/base rate/i), {
      target: { value: '5000' },
    });

    fireEvent.change(
      await screen.findByRole('combobox', { name: /property/i }),
      { target: { value: 'p-1' } },
    );

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Luxury' },
    });

    // Test helper text input/textarea interaction explicitly
    const adultsInput = screen.getByLabelText(/max adults/i);
    fireEvent.change(adultsInput, { target: { value: '3' } });

    const childrenInput = screen.getByLabelText(/max children/i);
    fireEvent.change(childrenInput, { target: { value: '2' } });

    fireEvent.click(screen.getByRole('button', { name: /create room type/i }));

    await waitFor(() => {
      expect(roomTypesAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Suite',
          code: 'SUI',
          baseRate: 5000,
        }),
      );
    });
  });

  it('handles update and error', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    vi.spyOn(roomTypesAPI, 'update').mockRejectedValue(
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

    await screen.findByRole('combobox', { name: /property/i });

    fireEvent.click(screen.getByRole('button', { name: /update room type/i }));

    await waitFor(() => expect(roomTypesAPI.update).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByText('Update Fail')).toBeInTheDocument(),
    );
  });

  it('handles non-Error exception during submission', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    vi.spyOn(roomTypesAPI, 'create').mockRejectedValue('String Error');
    render(
      <RoomTypeFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Suite' },
    });
    fireEvent.change(screen.getByLabelText(/code/i), {
      target: { value: 'SUI' },
    });
    fireEvent.change(screen.getByLabelText(/base rate/i), {
      target: { value: '5000' },
    });
    fireEvent.change(
      await screen.findByRole('combobox', { name: /property/i }),
      { target: { value: 'p-1' } },
    );
    fireEvent.click(screen.getByRole('button', { name: /create room type/i }));

    await waitFor(() =>
      expect(screen.getByText('Failed to save room type')).toBeInTheDocument(),
    );
  });

  it('handles editing room type with missing optional fields', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    const minRoomType = {
      ...mockRoomType,
      description: undefined,
      amenities: undefined,
    };
    render(
      <RoomTypeFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        roomType={minRoomType as any}
      />,
    );
    await screen.findByRole('combobox', { name: /property/i });
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
  });

  it('adds and removes amenities', async () => {
    vi.spyOn(propertiesAPI, 'getAll').mockResolvedValue([
      { id: 'p-1', name: 'Hotel A' } as any,
    ]);
    const user = userEvent.setup();
    render(
      <RoomTypeFormDialog
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    const amenityInput = screen.getByPlaceholderText(/e.g., WiFi/i);
    const addButton = screen.getByRole('button', { name: /add amenity/i });

    // Add amenity via button
    await user.type(amenityInput, 'WiFi');
    await user.click(addButton);

    expect(screen.getByText('WiFi')).toBeInTheDocument();

    // Add amenity via Enter key
    await user.type(amenityInput, 'Pool{enter}');
    expect(screen.getByText('Pool')).toBeInTheDocument();

    // Ignore adding empty or existing amenity branches
    await user.type(amenityInput, 'WiFi{enter}');

    // Remove amenity
    const removeWifiButton = screen.getByRole('button', {
      name: /remove WiFi/i,
    });
    await user.click(removeWifiButton);

    expect(screen.queryByText('WiFi')).not.toBeInTheDocument();
    expect(screen.getByText('Pool')).toBeInTheDocument();
  });
});
