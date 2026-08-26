import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DigitalKeyPanel } from './digital-key-panel';
import { digitalKeysAPI } from '@/lib/api/digital-keys';
import { t } from '@/lib/i18n';
import type { Reservation } from '@/lib/api';

vi.mock('@/lib/api/digital-keys', () => ({
  digitalKeysAPI: {
    list: vi.fn(),
    issue: vi.fn(),
    revoke: vi.fn(),
  },
}));

vi.mock('@/lib/stores/use-auth-store', () => ({
  useAuthStore: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'usr_mock_1' } }),
}));

const reservation = {
  id: 'res-1',
  confirmNumber: 'CN-1',
  status: 'CHECKED_IN',
} as unknown as Reservation;

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DigitalKeyPanel reservation={reservation} />
    </QueryClientProvider>,
  );
}

describe('DigitalKeyPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when no keys are issued', async () => {
    vi.mocked(digitalKeysAPI.list).mockResolvedValue([]);
    renderPanel();

    expect(await screen.findByText(t('digitalKey.empty'))).toBeInTheDocument();
  });

  it('issues a digital key for the reservation', async () => {
    vi.mocked(digitalKeysAPI.list).mockResolvedValue([]);
    vi.mocked(digitalKeysAPI.issue).mockResolvedValue({
      id: 'dk-1',
    } as never);

    renderPanel();
    const user = userEvent.setup();

    await screen.findByText(t('digitalKey.empty'));
    await user.click(
      screen.getByRole('button', { name: t('reservations.digitalKey.issue') }),
    );

    await waitFor(() => {
      expect(digitalKeysAPI.issue).toHaveBeenCalledWith({
        reservationId: 'res-1',
        issuedBy: 'usr_mock_1',
        transport: 'BLE',
      });
    });
  });

  it('lists an issued key and revokes it', async () => {
    vi.mocked(digitalKeysAPI.list).mockResolvedValue([
      {
        id: 'dk-1',
        propertyId: 'prop-1',
        reservationId: 'res-1',
        roomNumber: '101',
        token: 'DK-MOCK-ABC123',
        transport: 'BLE',
        status: 'ACTIVE',
        issuedBy: 'usr_mock_1',
        issuedAt: '2026-08-19T01:00:00.000Z',
        expiresAt: '2026-08-20T12:00:00.000Z',
        revokedAt: null,
        revokedBy: null,
        revokedReason: null,
        createdAt: '2026-08-19T01:00:00.000Z',
      },
    ]);
    vi.mocked(digitalKeysAPI.revoke).mockResolvedValue({
      id: 'dk-1',
      status: 'REVOKED',
    } as never);

    renderPanel();
    const user = userEvent.setup();

    expect(
      await screen.findByDisplayValue('DK-MOCK-ABC123'),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: t('digitalKey.revoke') }),
    );

    await waitFor(() => {
      expect(digitalKeysAPI.revoke).toHaveBeenCalledWith('dk-1', {
        revokedBy: 'usr_mock_1',
      });
    });
  });
});
