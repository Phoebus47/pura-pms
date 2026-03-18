import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BillingClient } from './billing-client';

const mockGetById = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  reservationsAPI: {
    getById: (...args: unknown[]) => mockGetById(...args),
  },
}));

vi.mock('@/components/folio-detail', () => ({
  FolioDetail: ({ reservationId }: { reservationId: string }) => (
    <div data-testid="folio-detail">{reservationId}</div>
  ),
}));

import { useSearchParams } from 'next/navigation';

describe('BillingClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as ReturnType<typeof useSearchParams>,
    );
  });

  it('shows selector when reservationId is missing', () => {
    render(<BillingClient />);

    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText(/select a reservation/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /go to reservations/i }),
    ).toHaveAttribute('href', '/reservations');
  });

  it('loads reservation and renders FolioDetail', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('reservationId=res-99') as ReturnType<
        typeof useSearchParams
      >,
    );
    mockGetById.mockResolvedValue({
      id: 'res-99',
      confirmNumber: 'CONF-1',
      guest: { firstName: 'Jane', lastName: 'Doe' },
      room: { number: '205' },
    });

    render(<BillingClient />);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('CONF-1')).toBeInTheDocument();
    expect(screen.getByText('Room 205')).toBeInTheDocument();
    expect(screen.getByTestId('folio-detail')).toHaveTextContent('res-99');
    expect(
      screen.getByRole('link', { name: /view reservation/i }),
    ).toHaveAttribute('href', '/reservations/res-99');
  });

  it('shows error when reservation fetch fails', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('reservationId=bad') as ReturnType<
        typeof useSearchParams
      >,
    );
    mockGetById.mockRejectedValue(new Error('Network down'));

    render(<BillingClient />);

    await waitFor(() => {
      expect(screen.getByText('Network down')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('folio-detail')).not.toBeInTheDocument();
  });

  it('falls back to default error message for non-Error throws', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('reservationId=weird') as ReturnType<
        typeof useSearchParams
      >,
    );
    mockGetById.mockRejectedValue('string failure');

    render(<BillingClient />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load reservation'),
      ).toBeInTheDocument();
    });
  });

  it('renders placeholder when room number is missing', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('reservationId=res-no-room') as ReturnType<
        typeof useSearchParams
      >,
    );
    mockGetById.mockResolvedValue({
      id: 'res-no-room',
      confirmNumber: 'CONF-2',
      guest: { firstName: 'No', lastName: 'Room' },
      room: { number: '' },
    });

    render(<BillingClient />);

    await waitFor(() => {
      expect(screen.getByText('No Room')).toBeInTheDocument();
    });
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
