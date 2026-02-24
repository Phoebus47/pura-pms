/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GuestDetailPage from './page';
import { guestsAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

vi.mock('@/lib/api', () => ({
  guestsAPI: {
    getById: vi.fn(),
    delete: vi.fn(),
    toggleBlacklist: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

describe('GuestDetailPage', () => {
  const mockGuest = {
    id: 'guest-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    vipLevel: 0,
    isBlacklist: false,
    totalStays: 5,
    totalRevenue: 10000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useParams as any).mockReturnValue({ id: 'guest-1' });
    (guestsAPI.getById as any).mockResolvedValue(mockGuest);
  });

  it('renders guest details', async () => {
    render(<GuestDetailPage />);
    expect(screen.getByText('Loading guest profile...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('renders guest with fallbacks for missing optional info', async () => {
    (guestsAPI.getById as any).mockResolvedValue({
      id: 'guest-2',
      firstName: 'Jane',
      lastName: 'Smith',
      vipLevel: 0,
      isBlacklist: false,
      totalStays: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Missing email, phone, nationality, idNumber
    });

    render(<GuestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Check for fallbacks '-'
    const fallbacks = screen.getAllByText('-');
    expect(fallbacks.length).toBeGreaterThanOrEqual(4);
  });

  it('renders guest with address and notes', async () => {
    (guestsAPI.getById as any).mockResolvedValue({
      ...mockGuest,
      address: '123 Test St',
      notes: 'Test Notes',
    });

    render(<GuestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('123 Test St')).toBeInTheDocument();
      expect(screen.getByText('Test Notes')).toBeInTheDocument();
    });
  });

  it('handles loading error', async () => {
    (guestsAPI.getById as any).mockRejectedValue(new Error('Failed'));
    render(<GuestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading guest')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  it('handles delete', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    const deleteBtn = screen.getByText('Delete');
    await userEvent.click(deleteBtn);

    expect(guestsAPI.delete).toHaveBeenCalledWith('guest-1');
    expect(mockPush).toHaveBeenCalledWith('/guests');
  });

  it('navigates to edit page', async () => {
    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    const editBtn = screen.getByText('Edit');
    await userEvent.click(editBtn);

    expect(mockPush).toHaveBeenCalledWith('/guests/guest-1/edit');
  });

  it('handles blacklist toggle', async () => {
    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    const blacklistBtn = screen.getByText('Add to Blacklist');
    await userEvent.click(blacklistBtn);

    expect(guestsAPI.toggleBlacklist).toHaveBeenCalledWith('guest-1');
    expect(guestsAPI.getById).toHaveBeenCalledTimes(2); // Initial + Reload
  });
  it('cancels delete', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Delete'));
    expect(guestsAPI.delete).not.toHaveBeenCalled();
  });

  it('handles delete error', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    (guestsAPI.delete as any).mockRejectedValue(new Error('Delete failed'));

    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Delete failed');
    });
  });

  it('handles blacklist toggle error', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    (guestsAPI.toggleBlacklist as any).mockRejectedValue(
      new Error('Toggle failed'),
    );

    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Add to Blacklist'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Toggle failed');
    });
  });

  it('renders blacklisted state', async () => {
    (guestsAPI.getById as any).mockResolvedValue({
      ...mockGuest,
      isBlacklist: true,
    });
    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    expect(screen.getAllByText('Blacklisted')[0]).toBeInTheDocument();
    expect(screen.getByText('Remove from Blacklist')).toBeInTheDocument();
  });

  it('renders not found state when guest is null', async () => {
    (guestsAPI.getById as any).mockResolvedValue(null);
    render(<GuestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Guest not found')).toBeInTheDocument();
    });
  });
  it('handles delete error with non-Error object', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    (guestsAPI.delete as any).mockRejectedValue('String error');

    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to delete guest');
    });
  });

  it('renders VIP guest properly', async () => {
    (guestsAPI.getById as any).mockResolvedValue({
      ...mockGuest,
      vipLevel: 3,
    });
    render(<GuestDetailPage />);

    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    // Header stars
    const stars = document.getElementsByClassName('text-[#f5a623]');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('handles loading error with non-Error object', async () => {
    (guestsAPI.getById as any).mockRejectedValue('String error');
    render(<GuestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading guest')).toBeInTheDocument();
      expect(screen.getByText('Failed to load guest')).toBeInTheDocument();
    });
  });

  it('handles blacklist toggle error with non-Error object', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    (guestsAPI.toggleBlacklist as any).mockRejectedValue('String error');

    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Add to Blacklist'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to update blacklist status',
      );
    });
  });
});
