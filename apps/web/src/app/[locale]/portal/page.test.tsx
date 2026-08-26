import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PortalPage from './page';
import { portalAPI } from '@/lib/api/portal';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/portal', () => ({
  portalAPI: {
    getReservation: vi.fn(),
    getFolio: vi.fn(),
    requestService: vi.fn(),
  },
}));

async function unlockPortal() {
  const user = userEvent.setup();
  await user.type(
    screen.getByLabelText(t('portal.confirmNumber')),
    'CN-DEMO-002',
  );
  await user.type(screen.getByLabelText(t('portal.lastName')), 'Smith');
  await user.click(screen.getByRole('button', { name: t('portal.unlock') }));
  return user;
}

describe('PortalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the unlock form by default', () => {
    render(<PortalPage />);
    expect(
      screen.getByRole('heading', { name: t('portal.title') }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(t('portal.confirmNumber')),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t('portal.lastName'))).toBeInTheDocument();
  });

  it('shows an error toast when the confirm number and last name do not match', async () => {
    vi.mocked(portalAPI.getReservation).mockRejectedValue(
      new Error('Not Found'),
    );
    vi.mocked(portalAPI.getFolio).mockRejectedValue(new Error('Not Found'));

    render(<PortalPage />);
    await unlockPortal();

    await waitFor(() => {
      expect(portalAPI.getReservation).toHaveBeenCalledWith(
        'CN-DEMO-002',
        'Smith',
      );
    });
    expect(
      screen.queryByText(t('portal.reservationDetails')),
    ).not.toBeInTheDocument();
  });

  it('shows the reservation, folio balance, and request form after unlock', async () => {
    vi.mocked(portalAPI.getReservation).mockResolvedValue({
      id: 'res-1',
      confirmNumber: 'CN-DEMO-002',
      status: 'CHECKED_IN',
      checkIn: '2026-08-25T14:00:00.000Z',
      checkOut: '2026-08-27T11:00:00.000Z',
      room: { number: '205' },
      guest: { firstName: 'Jane', lastName: 'Smith' },
    });
    vi.mocked(portalAPI.getFolio).mockResolvedValue([
      {
        id: 'folio-1',
        folioNumber: 'F000001',
        status: 'OPEN',
        balance: 1500,
        transactions: [
          {
            id: 'trx-1',
            businessDate: '2026-08-25T00:00:00.000Z',
            description: 'Room Charge',
            amountTotal: 1500,
            sign: 1,
          },
        ],
      },
    ]);

    render(<PortalPage />);
    await unlockPortal();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    expect(screen.getByText('Room Charge')).toBeInTheDocument();
    expect(screen.getByLabelText(t('portal.requestLabel'))).toBeInTheDocument();
  });

  it('sends a service request with the reservation and last name', async () => {
    vi.mocked(portalAPI.getReservation).mockResolvedValue({
      id: 'res-1',
      confirmNumber: 'CN-DEMO-002',
      status: 'CHECKED_IN',
      checkIn: '2026-08-25T14:00:00.000Z',
      checkOut: '2026-08-27T11:00:00.000Z',
      room: { number: '205' },
      guest: { firstName: 'Jane', lastName: 'Smith' },
    });
    vi.mocked(portalAPI.getFolio).mockResolvedValue([]);
    vi.mocked(portalAPI.requestService).mockResolvedValue({
      id: 'msg-1',
      content: 'Extra towels please',
      createdAt: '2026-08-25T15:00:00.000Z',
    });

    render(<PortalPage />);
    const user = await unlockPortal();

    await waitFor(() => {
      expect(
        screen.getByLabelText(t('portal.requestLabel')),
      ).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(t('portal.requestLabel')),
      'Extra towels please',
    );
    await user.click(
      screen.getByRole('button', { name: t('portal.requestSubmit') }),
    );

    await waitFor(() => {
      expect(portalAPI.requestService).toHaveBeenCalledWith('CN-DEMO-002', {
        lastName: 'Smith',
        content: 'Extra towels please',
      });
    });
  });
});
