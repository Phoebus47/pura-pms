import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TaxInvoicesPage from './page';
import { taxInvoicesAPI } from '@/lib/api/tax-invoices';
import { propertiesAPI } from '@/lib/api/properties';
import { foliosAPI } from '@/lib/api/folios';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/tax-invoices',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/tax-invoices', () => ({
  taxInvoicesAPI: {
    list: vi.fn(),
    getById: vi.fn(),
    issue: vi.fn(),
    void: vi.fn(),
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
      <TaxInvoicesPage />
    </QueryClientProvider>,
  );
}

describe('TaxInvoicesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1', businessDate: '2026-08-14' },
    ] as never);
    vi.mocked(taxInvoicesAPI.list).mockResolvedValue([]);
    vi.mocked(foliosAPI.list).mockResolvedValue([]);
  });

  it('renders the tax invoice title', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: t('taxInvoice.title') }),
    ).toBeInTheDocument();
    expect(screen.getByText(t('taxInvoice.subtitle'))).toHaveClass(
      'text-muted-foreground',
    );
  });

  it('renders labeled issue form fields', async () => {
    renderPage();
    expect(
      await screen.findByLabelText(t('taxInvoice.folioId')),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t('taxInvoice.taxId'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('taxInvoice.issueSubmit') }),
    ).toBeInTheDocument();
  });
});
