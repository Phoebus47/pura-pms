import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompHousePanel } from './comp-house-panel';
import { reservationsAPI } from '@/lib/api/reservations';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/reservations', () => ({
  reservationsAPI: {
    getAll: vi.fn(),
  },
}));

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CompHousePanel propertyId="prop-1" date="2026-08-17" />
    </QueryClientProvider>,
  );
}

describe('CompHousePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists complimentary stays overlapping the business date', async () => {
    vi.mocked(reservationsAPI.getAll).mockImplementation(async (filters) => {
      if (filters?.stayPurpose === 'COMPLIMENTARY') {
        return [
          {
            id: 'res-comp',
            confirmNumber: 'CN-C',
            checkIn: '2026-08-16',
            checkOut: '2026-08-18',
            nights: 2,
            stayPurpose: 'COMPLIMENTARY',
            approvedBy: 'GM',
            stayPurposeNote: 'Press',
            guest: { firstName: 'Ann', lastName: 'Lee' },
            room: { number: '201', roomType: { baseRate: 3000 } },
          },
        ] as never;
      }
      return [] as never;
    });

    renderPanel();

    expect(
      await screen.findByRole('table', { name: t('reports.compHouseTitle') }),
    ).toBeInTheDocument();
    expect(screen.getByText('201')).toBeInTheDocument();
    expect(screen.getByText('Ann Lee')).toBeInTheDocument();
    expect(screen.getByText('GM')).toBeInTheDocument();
    expect(
      screen.getByText(t('reservations.stayPurpose.badgeComp')),
    ).toBeInTheDocument();
  });

  it('shows an empty state when no non-revenue stays overlap', async () => {
    vi.mocked(reservationsAPI.getAll).mockResolvedValue([]);

    renderPanel();

    expect(
      await screen.findByText(t('reports.compHouseEmpty')),
    ).toBeInTheDocument();
  });
});
