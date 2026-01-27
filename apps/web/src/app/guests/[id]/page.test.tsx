import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GuestDetailPage from './page';
import { guestsAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

jest.mock('@/lib/api', () => ({
  guestsAPI: {
    getById: jest.fn(),
    delete: jest.fn(),
    toggleBlacklist: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
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

  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue({ id: 'guest-1' });
    (guestsAPI.getById as jest.Mock).mockResolvedValue(mockGuest);
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

  it('handles loading error', async () => {
    (guestsAPI.getById as jest.Mock).mockRejectedValue(new Error('Failed'));
    render(<GuestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading guest')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  it('handles delete', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    const deleteBtn = screen.getByText('Delete');
    await userEvent.click(deleteBtn);

    expect(guestsAPI.delete).toHaveBeenCalledWith('guest-1');
    expect(mockPush).toHaveBeenCalledWith('/guests');
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
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<GuestDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Delete'));
    expect(guestsAPI.delete).not.toHaveBeenCalled();
  });

  it('handles delete error', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (guestsAPI.delete as jest.Mock).mockRejectedValue(
      new Error('Delete failed'),
    );

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
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (guestsAPI.toggleBlacklist as jest.Mock).mockRejectedValue(
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
    (guestsAPI.getById as jest.Mock).mockResolvedValue({
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
    (guestsAPI.getById as jest.Mock).mockResolvedValue(null);
    render(<GuestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Guest not found')).toBeInTheDocument();
    });
  });
  it('handles delete error with non-Error object', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (guestsAPI.delete as jest.Mock).mockRejectedValue('String error');

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
    (guestsAPI.getById as jest.Mock).mockResolvedValue({
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
    (guestsAPI.getById as jest.Mock).mockRejectedValue('String error');
    render(<GuestDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading guest')).toBeInTheDocument();
      expect(screen.getByText('Failed to load guest')).toBeInTheDocument();
    });
  });

  it('handles blacklist toggle error with non-Error object', async () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (guestsAPI.toggleBlacklist as jest.Mock).mockRejectedValue('String error');

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
