import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import PropertyDetailPage from './page';
import { propertiesAPI } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  propertiesAPI: {
    getById: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('PropertyDetailPage', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
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
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    (propertiesAPI.getById as jest.Mock).mockResolvedValue(mockProperty);
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    (propertiesAPI.getById as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<PropertyDetailPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display property details after loading', async () => {
    render(<PropertyDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Property A')).toBeInTheDocument();
    });

    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('property@example.com')).toBeInTheDocument();
  });

  it('should display error message if loading fails', async () => {
    const errorMessage = 'Failed to load property';
    (propertiesAPI.getById as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    render(<PropertyDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading property')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should navigate back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<PropertyDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Property A')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });
});
