import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TaxInvoicePrintPage from './page';
import { taxInvoicesAPI } from '@/lib/api/tax-invoices';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ti_1' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/tax-invoices/ti_1/print',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/api/tax-invoices', () => ({
  taxInvoicesAPI: {
    list: vi.fn(),
    getById: vi.fn(),
    issue: vi.fn(),
    void: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TaxInvoicePrintPage />
    </QueryClientProvider>,
  );
}

describe('TaxInvoicePrintPage', () => {
  it('renders printable invoice amounts', async () => {
    vi.mocked(taxInvoicesAPI.getById).mockResolvedValue({
      id: 'ti_1',
      invoiceNumber: 'TI-2026-000001',
      propertyId: 'prop_1',
      folioId: 'fol_1',
      reservationId: 'res_1',
      businessDate: '2026-08-14',
      taxId: '1234567890123',
      branchNumber: null,
      buyerName: 'Ann Guest',
      amountNet: 1000,
      amountTax: 70,
      amountTotal: 1070,
      status: 'OPEN',
      issuedAt: '2026-08-14',
      issuedBy: 'user-1',
      voidReason: null,
      voidedAt: null,
      voidedBy: null,
      property: {
        id: 'prop_1',
        name: 'Pura',
        address: 'Bangkok',
        taxId: '999',
      },
    });

    renderPage();

    expect(
      await screen.findByRole('heading', { name: t('taxInvoice.printTitle') }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('TI-2026-000001', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText('1000.00')).toBeInTheDocument();
    expect(screen.getByText('1070.00')).toBeInTheDocument();
  });
});
