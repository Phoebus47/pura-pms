/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from './page';
import { authAPI } from '@/lib/api';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
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
  const mockPush = vi.fn();

  beforeEach(() => {
    (useRouter as any).mockReturnValue({ push: mockPush });
    localStorageMock.clear();
    vi.clearAllMocks();
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
    vi.spyOn(authAPI, 'login').mockResolvedValue({
      access_token: 'test-token',
    } as any);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getAllByRole('button', { name: /sign in/i })[0];

    fireEvent.change(emailInput, { target: { value: 'admin@pura.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

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
    const errorMessage = 'Invalid credentials';
    vi.spyOn(authAPI, 'login').mockRejectedValue(new Error(errorMessage));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getAllByRole('button', { name: /sign in/i })[0];

    fireEvent.change(emailInput, { target: { value: 'admin@pura.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display error message on login failure with non-Error', async () => {
    vi.spyOn(authAPI, 'login').mockRejectedValue('String Error');

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getAllByRole('button', { name: /sign in/i })[0];

    fireEvent.change(emailInput, { target: { value: 'admin@pura.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    vi.spyOn(authAPI, 'login').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getAllByRole('button', { name: /sign in/i })[0];

    fireEvent.change(emailInput, { target: { value: 'admin@pura.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

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
