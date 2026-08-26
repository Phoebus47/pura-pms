import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileCheckInPage from './page';
import { mobileCheckInAPI } from '@/lib/api/mobile-check-in';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/mobile-check-in', () => ({
  mobileCheckInAPI: {
    lookup: vi.fn(),
    getAvailableRooms: vi.fn(),
    selectRoom: vi.fn(),
    checkIn: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function baseReservation(overrides: Record<string, unknown> = {}) {
  return {
    confirmNumber: 'CN-DEMO-002',
    status: 'CONFIRMED',
    checkIn: '2026-08-25T14:00:00.000Z',
    checkOut: '2026-08-27T11:00:00.000Z',
    nights: 2,
    adults: 2,
    children: 0,
    guestFirstName: 'Jane',
    guestLastName: 'Smith',
    room: null,
    propertyId: 'prop_mock_1',
    ...overrides,
  };
}

describe('MobileCheckInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mobile check-in title and lookup form', () => {
    render(<MobileCheckInPage />);
    expect(
      screen.getByRole('heading', { name: t('mobileCheckIn.title') }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(t('mobileCheckIn.confirmNumber')),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(t('mobileCheckIn.lastNameOptional')),
    ).toBeInTheDocument();
  });

  it('shows reservation details after a successful lookup', async () => {
    vi.mocked(mobileCheckInAPI.lookup).mockResolvedValue(
      baseReservation() as never,
    );

    render(<MobileCheckInPage />);
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText(t('mobileCheckIn.confirmNumber')),
      'CN-DEMO-002',
    );
    await user.click(
      screen.getByRole('button', { name: t('mobileCheckIn.lookup') }),
    );

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: t('mobileCheckIn.confirmCheckIn') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('mobileCheckIn.changeRoom') }),
    ).toBeInTheDocument();
  });

  it('checks in a confirmed reservation and shows the digital key stub', async () => {
    vi.mocked(mobileCheckInAPI.lookup).mockResolvedValue(
      baseReservation({
        room: { id: 'room-1', number: '205', floor: 2, roomType: {} },
      }) as never,
    );
    vi.mocked(mobileCheckInAPI.checkIn).mockResolvedValue({
      reservation: baseReservation({ status: 'CHECKED_IN' }),
      digitalKey: {
        status: 'UNAVAILABLE',
        message: 'Digital key issuance is not available yet.',
      },
    } as never);

    render(<MobileCheckInPage />);
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText(t('mobileCheckIn.confirmNumber')),
      'CN-DEMO-002',
    );
    await user.click(
      screen.getByRole('button', { name: t('mobileCheckIn.lookup') }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: t('mobileCheckIn.confirmCheckIn'),
        }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: t('mobileCheckIn.confirmCheckIn') }),
    );

    await waitFor(() => {
      expect(mobileCheckInAPI.checkIn).toHaveBeenCalledWith(
        'CN-DEMO-002',
        undefined,
      );
    });
    expect(
      screen.getByText('Digital key issuance is not available yet.'),
    ).toBeInTheDocument();
  });

  it('lets the guest browse and select an alternative room', async () => {
    vi.mocked(mobileCheckInAPI.lookup).mockResolvedValue(
      baseReservation() as never,
    );
    vi.mocked(mobileCheckInAPI.getAvailableRooms).mockResolvedValue([
      {
        roomType: { id: 'rt_1', name: 'Standard', code: 'STD' },
        availableCount: 1,
        rooms: [
          { id: 'room-2', number: '301', floor: 3, status: 'VACANT_CLEAN' },
        ],
      },
    ] as never);
    vi.mocked(mobileCheckInAPI.selectRoom).mockResolvedValue(
      baseReservation({
        room: { id: 'room-2', number: '301', floor: 3, roomType: {} },
      }) as never,
    );

    render(<MobileCheckInPage />);
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText(t('mobileCheckIn.confirmNumber')),
      'CN-DEMO-002',
    );
    await user.click(
      screen.getByRole('button', { name: t('mobileCheckIn.lookup') }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: t('mobileCheckIn.changeRoom') }),
      ).toBeInTheDocument();
    });
    await user.click(
      screen.getByRole('button', { name: t('mobileCheckIn.changeRoom') }),
    );

    await waitFor(() => {
      expect(mobileCheckInAPI.getAvailableRooms).toHaveBeenCalledWith(
        'CN-DEMO-002',
        undefined,
      );
    });

    const roomButton = await screen.findByRole('button', {
      name: /301/,
    });
    await user.click(roomButton);

    await waitFor(() => {
      expect(mobileCheckInAPI.selectRoom).toHaveBeenCalledWith(
        'CN-DEMO-002',
        'room-2',
        undefined,
      );
    });
  });
});
