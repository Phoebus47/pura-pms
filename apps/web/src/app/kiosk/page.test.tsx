import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KioskPage from './page';
import { kioskAPI } from '@/lib/api/kiosk';
import { propertiesAPI } from '@/lib/api/properties';
import { reservationsAPI } from '@/lib/api/reservations';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/kiosk', () => ({
  kioskAPI: {
    checkIn: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/lib/api/reservations', () => ({
  reservationsAPI: {
    getByConfirmNumber: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <KioskPage />
    </QueryClientProvider>,
  );
}

describe('KioskPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1', name: 'Pura Resort' } as never,
    ]);
  });

  it('renders kiosk title and lookup flow', async () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: t('kiosk.title') }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t('kiosk.confirmNumber'))).toBeInTheDocument();
  });

  it('shows reservation details after lookup', async () => {
    vi.mocked(reservationsAPI.getByConfirmNumber).mockResolvedValue({
      id: 'res_1',
      confirmNumber: 'CN-DEMO-002',
      checkIn: '2026-08-25T14:00:00.000Z',
      checkOut: '2026-08-27T11:00:00.000Z',
      status: 'CONFIRMED',
      guest: { id: 'g1', firstName: 'Jane', lastName: 'Smith' },
      room: null,
    } as never);

    renderPage();
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText(t('kiosk.confirmNumber')),
      'CN-DEMO-002',
    );
    await user.click(screen.getByRole('button', { name: t('kiosk.lookup') }));

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: t('kiosk.confirmCheckIn') }),
    ).toBeInTheDocument();
  });

  it('checks in a confirmed reservation', async () => {
    vi.mocked(reservationsAPI.getByConfirmNumber).mockResolvedValue({
      id: 'res_1',
      confirmNumber: 'CN-DEMO-002',
      checkIn: '2026-08-25T14:00:00.000Z',
      checkOut: '2026-08-27T11:00:00.000Z',
      status: 'CONFIRMED',
      guest: { id: 'g1', firstName: 'Jane', lastName: 'Smith' },
      room: { id: 'room_1', number: '205' },
    } as never);
    vi.mocked(kioskAPI.checkIn).mockResolvedValue({
      id: 'res_1',
      confirmNumber: 'CN-DEMO-002',
      status: 'CHECKED_IN',
      checkIn: '2026-08-25T14:00:00.000Z',
      checkOut: '2026-08-27T11:00:00.000Z',
      guest: { id: 'g1', firstName: 'Jane', lastName: 'Smith' },
      room: { id: 'room_1', number: '205' },
    } as never);

    renderPage();
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText(t('kiosk.confirmNumber')),
      'CN-DEMO-002',
    );
    await user.click(screen.getByRole('button', { name: t('kiosk.lookup') }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: t('kiosk.confirmCheckIn') }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: t('kiosk.confirmCheckIn') }),
    );

    await waitFor(() => {
      expect(kioskAPI.checkIn).toHaveBeenCalledWith({
        confirmNumber: 'CN-DEMO-002',
        propertyId: 'prop_1',
      });
    });
  });
});
