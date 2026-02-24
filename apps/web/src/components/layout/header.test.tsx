/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './header';
import { useRouter } from 'next/navigation';
import * as clientAPI from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/use-auth-store';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('Header', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    (useRouter as any).mockReturnValue({ push: mockPush });
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<Header />);

    const searchInput = screen.getByLabelText(
      'Search guests, reservations, rooms',
    );
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'search');
    expect(searchInput).toHaveAttribute('id', 'global-search');
    expect(searchInput).toHaveAttribute('name', 'search');
  });

  it('should render notifications button', () => {
    render(<Header />);

    const notificationsButton = screen.getByLabelText('Notifications');
    expect(notificationsButton).toBeInTheDocument();
  });

  it('should render user dropdown menu', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // By default the Zustand store is empty in tests, so it falls back to Guest User
    const userButton = screen.getByText('Guest User');
    expect(userButton).toBeInTheDocument();

    await user.click(userButton);

    expect(screen.getByText('guest@pura.com')).toBeInTheDocument();
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('should have accessible search input', () => {
    render(<Header />);

    const searchInput = screen.getByLabelText(
      'Search guests, reservations, rooms',
    );
    expect(searchInput).toHaveAttribute('aria-label');
  });

  it('should successfully log out the user', async () => {
    const user = userEvent.setup();
    const clearAuthSpy = vi.fn();
    const clearAuthTokenSpy = vi.spyOn(clientAPI, 'clearAuthToken');

    // Set some state in the auth store manually to test the clear functionality
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'test@pura.com',
        name: 'Test User',
        role: 'ADMIN',
      },
      token: 'fake-token',
      clearAuth: clearAuthSpy,
    });

    render(<Header />);

    // Click on the user avatar to open dropdown
    const userButton = screen.getByText('Test User');
    await user.click(userButton);

    // Click log out
    const logoutItem = screen.getByText('Log out');
    await user.click(logoutItem);

    await waitFor(() => {
      expect(clearAuthTokenSpy).toHaveBeenCalled();
      expect(clearAuthSpy).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    // reset state
    act(() => {
      useAuthStore.setState({
        user: null,
        token: null,
        clearAuth: vi.fn(),
      });
    });
  });
});
