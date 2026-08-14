import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ArAccountsPage from './page';
import { arAccountsAPI } from '@/lib/api/ar-accounts';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/ar-accounts',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/ar-accounts', () => ({
  arAccountsAPI: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    aging: vi.fn(),
    statement: vi.fn(),
    transfer: vi.fn(),
  },
  arInvoicesAPI: {
    list: vi.fn().mockResolvedValue([]),
    allocate: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ArAccountsPage />
    </QueryClientProvider>,
  );
}

describe('ArAccountsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1', businessDate: '2026-08-14' },
    ] as never);
    vi.mocked(arAccountsAPI.list).mockResolvedValue([]);
  });

  it('renders the AR title', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: t('ar.title') }),
    ).toBeInTheDocument();
  });

  it('renders labeled create and transfer fields', async () => {
    renderPage();
    expect(
      await screen.findByLabelText(t('ar.companyName')),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t('ar.creditLimit'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('ar.folioId'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('ar.createSubmit') }),
    ).toBeInTheDocument();
  });
});
