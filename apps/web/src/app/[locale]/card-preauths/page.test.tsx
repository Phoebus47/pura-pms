import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CardPreauthsPage from './page';
import { cardPreauthsAPI } from '@/lib/api/card-preauths';
import { reservationsAPI } from '@/lib/api/reservations';
import { propertiesAPI } from '@/lib/api/properties';
import { foliosAPI } from '@/lib/api/folios';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/card-preauths',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/card-preauths', () => ({
  cardPreauthsAPI: {
    list: vi.fn(),
    create: vi.fn(),
    increment: vi.fn(),
    capture: vi.fn(),
    release: vi.fn(),
  },
}));

vi.mock('@/lib/api/reservations', () => ({
  reservationsAPI: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/lib/api/folios', () => ({
  foliosAPI: {
    list: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CardPreauthsPage />
    </QueryClientProvider>,
  );
}

describe('CardPreauthsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cardPreauthsAPI.list).mockResolvedValue([]);
    vi.mocked(reservationsAPI.getAll).mockResolvedValue([]);
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' },
    ] as never);
    vi.mocked(foliosAPI.list).mockResolvedValue([]);
  });

  it('renders the pre-auth title and hold fields', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: t('preauth.title') }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(t('preauth.reservationId')),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t('preauth.last4'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('preauth.holdSubmit') }),
    ).toBeInTheDocument();
  });
});
