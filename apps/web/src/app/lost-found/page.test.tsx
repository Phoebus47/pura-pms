import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LostFoundPage from './page';
import { lostFoundAPI } from '@/lib/api/lost-found';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/lost-found', () => ({
  lostFoundAPI: {
    list: vi.fn(),
    create: vi.fn(),
    claim: vi.fn(),
    returnItem: vi.fn(),
    dispose: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: { getAll: vi.fn() },
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
      <LostFoundPage />
    </QueryClientProvider>,
  );
}

describe('LostFoundPage', () => {
  it('renders the title and a found item', async () => {
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' } as never,
    ]);
    vi.mocked(lostFoundAPI.list).mockResolvedValue([
      {
        id: 'lf_1',
        propertyId: 'prop_1',
        itemDescription: 'Black wallet',
        locationFound: 'Lobby',
        roomNumber: '101',
        foundBy: 'usr_1',
        foundAt: new Date().toISOString(),
        notes: null,
        guestId: null,
        status: 'FOUND',
        claimedAt: null,
        claimedBy: null,
        returnedAt: null,
        returnedTo: null,
        disposedAt: null,
        disposedBy: null,
        disposeReason: null,
        retentionDays: 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guest: null,
      },
    ]);

    renderPage();

    expect(
      await screen.findByRole('heading', { name: t('lostFound.title') }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Black wallet/)).toBeInTheDocument();
    expect(screen.getByText(/Lobby/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('lostFound.claim') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('lostFound.dispose') }),
    ).toBeInTheDocument();
  });
});
