/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import LocaleLayout, { viewport } from './layout';

vi.mock('next/font/google', () => ({
  Geist: vi.fn(() => ({
    variable: '--font-geist-sans',
  })),
  Geist_Mono: vi.fn(() => ({
    variable: '--font-geist-mono',
  })),
  Sarabun: vi.fn(() => ({
    variable: '--font-sarabun',
  })),
  Prompt: vi.fn(() => ({
    variable: '--font-prompt',
  })),
}));

vi.mock('next-intl/server', () => ({
  getMessages: vi.fn(async () => ({})),
  setRequestLocale: vi.fn(),
}));

vi.mock('@/components/layout/app-layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

vi.mock('@/lib/providers/query-provider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
}));

vi.mock('@/components/error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock('@/components/ui/toast', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock('@/components/pwa/pwa-provider', () => ({
  PwaProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pwa-provider">{children}</div>
  ),
}));

vi.mock('@/lib/i18n-provider', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="i18n-provider">{children}</div>
  ),
}));

const originalError = console.error;
beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const message = args
      .map((arg) => (typeof arg === 'string' ? arg : String(arg)))
      .join(' ');
    if (
      message.includes('cannot be a child of <div>') ||
      message.includes('hydration error') ||
      message.includes('<html> cannot be a child') ||
      message.includes('<body> cannot be a child')
    ) {
      return;
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  (console.error as any).mockRestore();
});

describe('LocaleLayout', () => {
  it('should render children', async () => {
    const Layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params: Promise.resolve({ locale: 'en' }),
    });

    render(Layout);

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('advertises both color schemes so the night theme is honoured', () => {
    expect(viewport.colorScheme).toBe('light dark');
  });

  it('should render AppLayout', async () => {
    const Layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params: Promise.resolve({ locale: 'en' }),
    });

    render(Layout);

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });

  it('should render QueryProvider', async () => {
    const Layout = await LocaleLayout({
      children: <div>Test Content</div>,
      params: Promise.resolve({ locale: 'en' }),
    });

    render(Layout);

    expect(screen.getByTestId('query-provider')).toBeInTheDocument();
  });
});
