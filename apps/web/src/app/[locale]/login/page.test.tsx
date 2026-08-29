/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from '@/i18n/navigation';
import LoginPage from './page';
import { authAPI } from '@/lib/api';
import { formatMessage, t } from '@/lib/i18n';

vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
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
    const signInTexts = screen.getAllByText(t('login.title'));
    expect(signInTexts.length).toBeGreaterThan(0);
    expect(screen.getByLabelText(t('common.email'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('login.password'))).toBeInTheDocument();
    const signInButtons = screen.getAllByRole('button', {
      name: t('login.submit'),
    });
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  it('should display demo credentials', () => {
    render(<LoginPage />);

    expect(screen.getByText(t('login.demoTitle'))).toBeInTheDocument();
    expect(
      screen.getByText(
        formatMessage('login.demoEmail', { email: 'admin@pura.com' }),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        formatMessage('login.demoPassword', { password: 'admin123' }),
      ),
    ).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    vi.spyOn(authAPI, 'login').mockResolvedValue({
      access_token: 'test-token',
      user: {
        id: '1',
        email: 'admin@pura.com',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    } as any);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(t('common.email'));
    const passwordInput = screen.getByLabelText(t('login.password'));
    const submitButton = screen.getAllByRole('button', {
      name: t('login.submit'),
    })[0];

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

    const emailInput = screen.getByLabelText(t('common.email'));
    const passwordInput = screen.getByLabelText(t('login.password'));
    const submitButton = screen.getAllByRole('button', {
      name: t('login.submit'),
    })[0];

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

    const emailInput = screen.getByLabelText(t('common.email'));
    const passwordInput = screen.getByLabelText(t('login.password'));
    const submitButton = screen.getAllByRole('button', {
      name: t('login.submit'),
    })[0];

    fireEvent.change(emailInput, { target: { value: 'admin@pura.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(t('login.failed'))).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    vi.spyOn(authAPI, 'login').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(t('common.email'));
    const passwordInput = screen.getByLabelText(t('login.password'));
    const submitButton = screen.getAllByRole('button', {
      name: t('login.submit'),
    })[0];

    fireEvent.change(emailInput, { target: { value: 'admin@pura.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(t('login.submitting'))).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
  });

  it('should require email and password', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(t('common.email'));
    const passwordInput = screen.getByLabelText(t('login.password'));

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});
