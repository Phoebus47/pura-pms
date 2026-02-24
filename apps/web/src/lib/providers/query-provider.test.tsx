import { render, screen } from '@testing-library/react';
import { QueryProvider } from './query-provider';

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => (
    <div data-testid="react-query-devtools">DevTools</div>
  ),
}));

describe('QueryProvider', () => {
  it('should render children', () => {
    render(
      <QueryProvider>
        <div>Test Content</div>
      </QueryProvider>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should not render devtools in production', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: 'production' },
      writable: true,
      configurable: true,
    });

    render(
      <QueryProvider>
        <div>Test Content</div>
      </QueryProvider>,
    );

    expect(
      screen.queryByTestId('react-query-devtools'),
    ).not.toBeInTheDocument();

    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: originalEnv },
      writable: true,
      configurable: true,
    });
  });

  it('should render devtools in development', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: 'development' },
      writable: true,
      configurable: true,
    });

    render(
      <QueryProvider>
        <div>Test Content</div>
      </QueryProvider>,
    );

    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument();

    Object.defineProperty(process, 'env', {
      value: { ...process.env, NODE_ENV: originalEnv },
      writable: true,
      configurable: true,
    });
  });
});
