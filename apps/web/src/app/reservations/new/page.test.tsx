/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewReservationPage from './page';
import { useRouter } from 'next/navigation';
import { roomsAPI, reservationsAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('@/lib/api', () => ({
  roomsAPI: {
    getAll: vi.fn(),
  },
  reservationsAPI: {
    create: vi.fn(),
  },
}));

vi.mock('@/components/date-range-picker', () => ({
  DateRangePicker: ({
    onCheckInChange,
    onCheckOutChange,
  }: {
    onCheckInChange: (d: string) => void;
    onCheckOutChange: (d: string) => void;
  }) => (
    <div data-testid="date-picker">
      <button
        onClick={() => {
          onCheckInChange('2024-01-01');
          onCheckOutChange('2024-01-05');
        }}
      >
        Select Dates
      </button>
      <button
        onClick={() => {
          onCheckInChange('2024-01-01');
          onCheckOutChange('2024-01-01');
        }}
      >
        Select 0 Dates
      </button>
    </div>
  ),
}));

vi.mock('@/components/property-selector', () => ({
  PropertySelector: ({ onChange }: { onChange: (id: string) => void }) => (
    <div data-testid="property-selector">
      <button onClick={() => onChange('prop-1')}>Select Property</button>
    </div>
  ),
}));

vi.mock('@/components/guest-search-dialog', () => ({
  GuestSearchDialog: ({
    isOpen,
    onClose,
    onSelectGuest,
    onCreateNew,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSelectGuest: (g: unknown) => void;
    onCreateNew: () => void;
  }) =>
    isOpen ? (
      <div data-testid="guest-search">
        <button onClick={onClose}>Close Search</button>
        <button
          onClick={() =>
            onSelectGuest({
              id: 'guest-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
            })
          }
        >
          Select John
        </button>
        <button onClick={onCreateNew}>Create New</button>
      </div>
    ) : null,
}));

vi.mock('@/components/guest-form-dialog', () => ({
  GuestFormDialog: ({
    isOpen,
    onClose,
    onSuccess,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (g: unknown) => void;
  }) =>
    isOpen ? (
      <div data-testid="guest-form">
        <button onClick={onClose}>Close Form</button>
        <button
          onClick={() =>
            onSuccess({
              id: 'guest-2',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
            })
          }
        >
          Create Jane
        </button>
      </div>
    ) : null,
}));

const mockRooms = [
  {
    id: 'room-1',
    number: '101',
    roomType: {
      name: 'Deluxe',
      baseRate: 1000,
      maxOccupancy: 2,
    },
  },
];

describe('NewReservationPage', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (roomsAPI.getAll as any).mockResolvedValue(mockRooms);
    (reservationsAPI.create as any).mockResolvedValue({ id: 'res-1' });
  });

  it('completes the reservation flow', async () => {
    render(<NewReservationPage />);

    // Step 1: Dates & Property
    expect(screen.getByText('Select Dates and Property')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select Dates'));
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(roomsAPI.getAll).toHaveBeenCalledWith({
        propertyId: 'prop-1',
        status: 'VACANT_CLEAN',
      });
    });

    // Step 2: Select Room
    expect(screen.getByText('Select a Room')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Room 101'));
    await userEvent.click(screen.getByText('Next'));

    // Step 3: Select Guest
    expect(screen.getByText('Select Guest')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Search Existing Guest'));
    const createNewBtn = screen.getByText('Create New');
    await userEvent.click(createNewBtn);

    // Form opens, creating Jane
    expect(screen.getByTestId('guest-form')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Create Jane'));

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Next'));

    // Step 4: Confirm
    expect(
      screen.getByRole('heading', { name: 'Confirm Reservation' }),
    ).toBeInTheDocument();

    // Fill Guest Count and Special Requests
    const guestInput = screen.getByLabelText('Number of Guests');
    await userEvent.clear(guestInput);
    await userEvent.type(guestInput, '2');

    const requestInput = screen.getByLabelText('Special Requests');
    await userEvent.type(requestInput, 'Late check-in');

    // Submit
    const confirmBtn = screen.getByRole('button', {
      name: /confirm reservation/i,
    });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(reservationsAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          guestId: 'guest-2',
          roomId: 'room-1',
          totalAmount: 4000,
        }),
      );
    });

    expect(mockPush).toHaveBeenCalledWith('/reservations/res-1');
  });

  it('handles room loading error', async () => {
    (roomsAPI.getAll as any).mockRejectedValue(new Error('Failed'));
    render(<NewReservationPage />);

    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select Dates'));
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.queryByText('Select a Room')).not.toBeInTheDocument();
    });
  });

  it('navigates back and forth', async () => {
    render(<NewReservationPage />);

    // Go to Step 2
    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select Dates'));
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() =>
      expect(screen.getByText('Select a Room')).toBeInTheDocument(),
    );

    // Back to Step 1
    await userEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Select Dates and Property')).toBeInTheDocument();

    // Forward to Step 2
    await userEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Select a Room')).toBeInTheDocument();

    // Select Room and Go to Step 3
    await userEvent.click(screen.getByText('Room 101'));
    await userEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Select Guest')).toBeInTheDocument();

    // Back to Step 2
    await userEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Select a Room')).toBeInTheDocument();

    // Forward to Step 3
    await userEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Select Guest')).toBeInTheDocument();

    // Select Guest and Go to Step 4
    await userEvent.click(screen.getByText('Search Existing Guest'));
    await userEvent.click(screen.getByText('Select John'));
    await userEvent.click(screen.getByText('Next'));
    expect(
      screen.getByRole('heading', { name: 'Confirm Reservation' }),
    ).toBeInTheDocument();

    // Back to Step 3
    await userEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Select Guest')).toBeInTheDocument();
  });

  it('handles guest creation flow', async () => {
    render(<NewReservationPage />);

    // Fast forward to Step 3
    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select Dates'));
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => screen.getByText('Select a Room'));
    await userEvent.click(screen.getByText('Room 101'));
    await userEvent.click(screen.getByText('Next'));

    // Create New Guest
    await userEvent.click(screen.getByText('Create New Guest'));
    expect(screen.getByTestId('guest-form')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Create Jane'));
    expect(screen.queryByTestId('guest-form')).not.toBeInTheDocument();

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();

    // Change guest
    await userEvent.click(screen.getByText('Change'));
    expect(screen.getByText('Search Existing Guest')).toBeInTheDocument();
  });

  it('handles reservation submission error', async () => {
    (reservationsAPI.create as any).mockRejectedValue(new Error('API Error'));
    render(<NewReservationPage />);

    // Fast forward to Step 4
    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select Dates'));
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => screen.getByText('Select a Room'));
    await userEvent.click(screen.getByText('Room 101'));
    await userEvent.click(screen.getByText('Next'));
    await userEvent.click(screen.getByText('Search Existing Guest'));
    await userEvent.click(screen.getByText('Select John'));
    await userEvent.click(screen.getByText('Next'));

    // Submit
    const confirmBtn = screen.getByRole('button', {
      name: /confirm reservation/i,
    });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(reservationsAPI.create).toHaveBeenCalled();
    });
    // Check if we are still on Step 4 (submission failed)
    expect(
      screen.getByRole('heading', { name: 'Confirm Reservation' }),
    ).toBeInTheDocument();
  });

  it('handles dialog close callbacks', async () => {
    render(<NewReservationPage />);

    // Fast forward to Step 3
    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select Dates'));
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => screen.getByText('Select a Room'));
    await userEvent.click(screen.getByText('Room 101'));
    await userEvent.click(screen.getByText('Next'));

    // Open and close Guest Search Dialog
    await userEvent.click(screen.getByText('Search Existing Guest'));
    expect(screen.getByTestId('guest-search')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Close Search'));
    expect(screen.queryByTestId('guest-search')).not.toBeInTheDocument();

    // Open and close Guest Form Dialog
    await userEvent.click(screen.getByText('Create New Guest'));
    expect(screen.getByTestId('guest-form')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Close Form'));
    expect(screen.queryByTestId('guest-form')).not.toBeInTheDocument();
  });

  it('renders properties empty state correctly', async () => {
    (roomsAPI.getAll as any).mockResolvedValue([]);
    render(<NewReservationPage />);

    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select Dates'));
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(
        screen.getByText('No available rooms for selected dates'),
      ).toBeInTheDocument();
    });
  });

  it('handles rendering with missing room type data (fallbacks)', async () => {
    const roomWithMissingData = {
      id: 'room-missing',
      number: '999',
      // Missing roomType entirely or partial
    };
    (roomsAPI.getAll as any).mockResolvedValue([roomWithMissingData]);

    render(<NewReservationPage />);

    // To Step 2
    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select Dates'));
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('Room 999')).toBeInTheDocument();
    });

    // Proceed to Step 4 to cover fallback rendering inside Step 4 and handleSubmit
    await userEvent.click(screen.getByText('Room 999'));
    await userEvent.click(screen.getByText('Next'));
    await userEvent.click(screen.getByText('Search Existing Guest'));
    await userEvent.click(screen.getByText('Select John'));
    await userEvent.click(screen.getByText('Next'));

    expect(
      screen.getByRole('heading', { name: 'Confirm Reservation' }),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', {
      name: /confirm reservation/i,
    });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(reservationsAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roomRate: 0,
          totalAmount: 0,
        }),
      );
    });
  });

  it('calculates total as 0 when nights is 0', async () => {
    render(<NewReservationPage />);

    // Fast forward to Step 4 with 0 nights
    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select 0 Dates'));
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => screen.getByText('Select a Room'));
    await userEvent.click(screen.getByText('Room 101'));
    await userEvent.click(screen.getByText('Next'));
    await userEvent.click(screen.getByText('Search Existing Guest'));
    await userEvent.click(screen.getByText('Select John'));
    await userEvent.click(screen.getByText('Next'));

    const confirmBtn = screen.getByRole('button', {
      name: /confirm reservation/i,
    });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(reservationsAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 0,
        }),
      );
    });
  });

  it('handles non-Error exception during submission', async () => {
    (reservationsAPI.create as any).mockRejectedValue('String Error');
    render(<NewReservationPage />);

    // Fast forward to Step 4 (Confirm)
    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select Dates'));
    await userEvent.click(screen.getByText('Next'));
    await waitFor(() => screen.getByText('Select a Room'));
    await userEvent.click(screen.getByText('Room 101'));
    await userEvent.click(screen.getByText('Next'));
    await userEvent.click(screen.getByText('Search Existing Guest'));
    await userEvent.click(screen.getByText('Select John'));
    await userEvent.click(screen.getByText('Next'));

    const confirmBtn = screen.getByRole('button', {
      name: /confirm reservation/i,
    });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create reservation');
    });
  });

  it('triggers warning toasts when clicking next without selections', async () => {
    render(<NewReservationPage />);

    // Step 1 warning
    // We need to bypass the disabled state of the button
    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);
    expect(toast.warning).toHaveBeenCalledWith(
      'Please select property and dates',
    );

    // Proceed to Step 2
    await userEvent.click(screen.getByText('Select Property'));
    await userEvent.click(screen.getByText('Select Dates'));
    await userEvent.click(nextBtn);
    await waitFor(() => screen.getByText('Select a Room'));

    // Step 2 warning
    const nextBtn2 = screen.getByText('Next');
    fireEvent.click(nextBtn2);
    expect(toast.warning).toHaveBeenCalledWith('Please select a room');

    // Proceed to Step 3
    await userEvent.click(screen.getByText('Room 101'));
    await userEvent.click(nextBtn2);
    await waitFor(() => screen.getByText('Select Guest'));

    // Step 3 warning
    const nextBtn3 = screen.getByText('Next');
    fireEvent.click(nextBtn3);
    expect(toast.warning).toHaveBeenCalledWith('Please select a guest');
  });
});
