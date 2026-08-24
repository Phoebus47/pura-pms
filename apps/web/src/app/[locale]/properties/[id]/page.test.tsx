/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import PropertyDetailPage from './page';
import { propertiesAPI } from '@/lib/api';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  propertiesAPI: {
    getById: vi.fn(),
  },
}));

describe('PropertyDetailPage', () => {
  const mockPush = vi.fn();
  const mockBack = vi.fn();
  const mockProperty = {
    id: '1',
    name: 'Property A',
    address: '123 Main St',
    phone: '+66123456789',
    email: 'property@example.com',
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as any).mockReturnValue({ id: '1' });
    (useRouter as any).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    (propertiesAPI.getById as any).mockResolvedValue(mockProperty);
  });

  it('should display loading state initially', () => {
    (propertiesAPI.getById as any).mockReturnValue(new Promise(() => {}));
    render(<PropertyDetailPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display property details after loading', async () => {
    (propertiesAPI.getById as any).mockResolvedValue({
      ...mockProperty,
      phone: undefined,
      email: undefined,
      taxId: undefined,
    });
    render(<PropertyDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Property A')).toBeInTheDocument();
    });
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });

  it('should skip loading if params.id is missing', () => {
    (useParams as any).mockReturnValue({ id: undefined });
    render(<PropertyDetailPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display error if property is null', async () => {
    (propertiesAPI.getById as any).mockResolvedValue(null);
    render(<PropertyDetailPage />);
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText('Property not found')).toBeInTheDocument();
    });
  });

  it('should render property with taxId correctly', async () => {
    (propertiesAPI.getById as any).mockResolvedValue({
      ...mockProperty,
      taxId: 'TAX123',
    });
    render(<PropertyDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('TAX123')).toBeInTheDocument();
    });
  });

  it('should display error message if loading fails', async () => {
    (propertiesAPI.getById as any).mockRejectedValue(new Error('Failed API'));
    render(<PropertyDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Failed API')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('should handle non-Error failures', async () => {
    (propertiesAPI.getById as any).mockRejectedValue('String Error');
    render(<PropertyDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load property')).toBeInTheDocument();
    });
  });

  it('should navigate back on header button', async () => {
    const user = userEvent.setup();
    render(<PropertyDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('Property A')).toBeInTheDocument(),
    );
    const backBtns = screen.getAllByRole('button', { name: /back/i });
    await user.click(backBtns[0]);
    expect(mockBack).toHaveBeenCalled();
  });

  it('should render stats if _count is present', async () => {
    (propertiesAPI.getById as any).mockResolvedValue({
      ...mockProperty,
      _count: { rooms: 42, roomTypes: 5 },
    });
    render(<PropertyDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Total Rooms')).toBeInTheDocument();
    });
  });

  it('should not render stats if _count is missing', async () => {
    (propertiesAPI.getById as any).mockResolvedValue({
      ...mockProperty,
      _count: undefined,
    });
    render(<PropertyDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('Property A')).toBeInTheDocument(),
    );
    expect(screen.queryByText('Total Rooms')).not.toBeInTheDocument();
  });
});
