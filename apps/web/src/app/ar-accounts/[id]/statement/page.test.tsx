import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ArStatementPrintPage from './page';
import { arAccountsAPI } from '@/lib/api/ar-accounts';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/ar-accounts/ar_1/statement',
  useParams: () => ({ id: 'ar_1' }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/api/ar-accounts', () => ({
  arAccountsAPI: {
    statement: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ArStatementPrintPage />
    </QueryClientProvider>,
  );
}

describe('ArStatementPrintPage', () => {
  it('renders company name and aging totals', async () => {
    vi.mocked(arAccountsAPI.statement).mockResolvedValue({
      accountNumber: 'AR-000001',
      companyName: 'Acme',
      asOf: '2026-08-14',
      currentBalance: 80,
      aging: { current: 80, days30: 0, days60: 0, days90: 0 },
      invoices: [
        {
          id: 'inv_1',
          invoiceNumber: 'AR-2026-000001',
          propertyId: 'prop_1',
          arAccountId: 'ar_1',
          folioId: 'fol_1',
          invoiceDate: '2026-08-01',
          dueDate: '2026-08-31',
          amount: 100,
          paidAmount: 20,
          status: 'PARTIAL',
        },
      ],
    });

    renderPage();

    expect(
      await screen.findByRole('heading', { name: t('ar.statement') }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
    expect(screen.getByText('AR-2026-000001')).toBeInTheDocument();
  });
});
