import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExchangeRatesPage from './page';
import { exchangeRatesAPI } from '@/lib/api/exchange-rates';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/exchange-rates',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/exchange-rates', () => ({
  exchangeRatesAPI: {
    list: vi.fn(),
    findForDate: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ExchangeRatesPage />
    </QueryClientProvider>,
  );
}

describe('ExchangeRatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(exchangeRatesAPI.list).mockResolvedValue([]);
  });

  it('renders the exchange rates title', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: t('fx.title') }),
    ).toBeInTheDocument();
    expect(screen.getByText(t('fx.subtitle'))).toHaveClass(
      'text-muted-foreground',
    );
  });

  it('renders labeled create form fields', async () => {
    renderPage();
    expect(
      await screen.findByLabelText(t('fx.baseCurrency')),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t('fx.targetCurrency'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('fx.rate'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('fx.effectiveDate'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('fx.submit') }),
    ).toBeInTheDocument();
  });
});
