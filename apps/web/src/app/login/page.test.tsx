import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from './page';
import { authAPI } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  authAPI: {
    login: jest.fn(),
  },
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LoginPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    render(<LoginPage />);

    expect(screen.getByText('PURA PMS')).toBeInTheDocument();
    const signInTexts = screen.getAllByText('Sign In');
    expect(signInTexts.length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    const signInButtons = screen.getAllByRole('button', { name: /sign in/i });
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  it('should display demo credentials', () => {
    render(<LoginPage />);

    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
    expect(screen.getByText(/admin@pura.com/)).toBeInTheDocument();
    expect(screen.getByText(/admin123/)).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    (authAPI.login as jest.Mock).mockResolvedValue({
      access_token: 'test-token',
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getAllByRole('button', { name: /sign in/i })[0];

    await user.type(emailInput, 'admin@pura.com');
    await user.type(passwordInput, 'admin123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'admin@pura.com',
        password: 'admin123',
      });
    });

    await waitFor(() => {
      expect(localStorageMock.getItem('token')).toBe('test-token');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should display error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    (authAPI.login as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getAllByRole('button', { name: /sign in/i })[0];

    await user.type(emailInput, 'admin@pura.com');
    await user.type(passwordInput, 'wrong-password');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    (authAPI.login as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getAllByRole('button', { name: /sign in/i })[0];

    await user.type(emailInput, 'admin@pura.com');
    await user.type(passwordInput, 'admin123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
  });

  it('should require email and password', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});
