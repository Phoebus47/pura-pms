import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DigitalKeysPage from './page';
import { digitalKeysAPI } from '@/lib/api/digital-keys';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/digital-keys', () => ({
  digitalKeysAPI: {
    list: vi.fn(),
    issueByConfirmNumber: vi.fn(),
    revoke: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/lib/stores/use-auth-store', () => ({
  useAuthStore: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'usr_mock_1' } }),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DigitalKeysPage />
    </QueryClientProvider>,
  );
}

describe('DigitalKeysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1', name: 'Pura' } as never,
    ]);
  });

  it('renders title and an issued digital key', async () => {
    vi.mocked(digitalKeysAPI.list).mockResolvedValue([
      {
        id: 'dk_1',
        propertyId: 'prop_1',
        reservationId: 'res_1',
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
        reservation: {
          id: 'res_1',
          confirmNumber: 'CN-1',
          status: 'CHECKED_IN',
        },
      },
    ]);

    renderPage();

    expect(
      await screen.findByRole('heading', { name: t('digitalKey.title') }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/101/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('DK-MOCK-ABC123')).toBeInTheDocument();
  });

  it('issues a new digital key by confirmation number', async () => {
    vi.mocked(digitalKeysAPI.list).mockResolvedValue([]);
    vi.mocked(digitalKeysAPI.issueByConfirmNumber).mockResolvedValue({
      id: 'dk_2',
    } as never);

    renderPage();
    const user = userEvent.setup();

    await screen.findByRole('heading', { name: t('digitalKey.title') });
    await user.type(
      screen.getByLabelText(t('digitalKey.confirmNumber')),
      'CN-2',
    );
    await user.click(
      screen.getByRole('button', { name: t('digitalKey.issue') }),
    );

    await waitFor(() => {
      expect(digitalKeysAPI.issueByConfirmNumber).toHaveBeenCalledWith({
        confirmNumber: 'CN-2',
        issuedBy: 'usr_mock_1',
        transport: 'BLE',
      });
    });
  });

  it('revokes an active digital key', async () => {
    vi.mocked(digitalKeysAPI.list).mockResolvedValue([
      {
        id: 'dk_1',
        propertyId: 'prop_1',
        reservationId: 'res_1',
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
        reservation: {
          id: 'res_1',
          confirmNumber: 'CN-1',
          status: 'CHECKED_IN',
        },
      },
    ]);
    vi.mocked(digitalKeysAPI.revoke).mockResolvedValue({
      id: 'dk_1',
      status: 'REVOKED',
    } as never);

    renderPage();
    const user = userEvent.setup();

    const revokeButton = await screen.findByRole('button', {
      name: t('digitalKey.revoke'),
    });
    await user.click(revokeButton);

    await waitFor(() => {
      expect(digitalKeysAPI.revoke).toHaveBeenCalledWith('dk_1', {
        revokedBy: 'usr_mock_1',
      });
    });
  });
});
