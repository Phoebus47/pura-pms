/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import RootLayout from './layout';

vi.mock('next/font/google', () => ({
  Geist: vi.fn(() => ({
    variable: '--font-geist-sans',
  })),
  Geist_Mono: vi.fn(() => ({
    variable: '--font-geist-mono',
  })),
}));

vi.mock('../components/layout/app-layout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

vi.mock('../lib/providers/query-provider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
}));

vi.mock('../components/error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock('../components/ui/toast', () => ({
  Toaster: () => <div data-testid="toaster" />,
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

describe('RootLayout', () => {
  it('should render children', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render AppLayout', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });

  it('should render QueryProvider', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId('query-provider')).toBeInTheDocument();
  });
});
