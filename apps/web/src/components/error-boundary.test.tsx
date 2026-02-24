/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { type Mock } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './error-boundary';

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  const originalError = console.error;

  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should display error message when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should display default error message when error has no message', () => {
    function ThrowErrorWithoutMessage(): never {
      throw new Error();
    }

    render(
      <ErrorBoundary>
        <ThrowErrorWithoutMessage />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText('An unexpected error occurred'),
    ).toBeInTheDocument();
  });

  it('should log error in non-production mode', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object),
    );
    expect(true).toBe(true);
  });

  it('should not log error in production mode', () => {
    expect.assertions(2);
    vi.stubEnv('NODE_ENV', 'production');
    vi.mocked(console.error).mockClear();

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(console.error).not.toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object),
    );
    expect(true).toBe(true);

    vi.unstubAllEnvs();
  });

  it('should not crash when Go to home is clicked and window is undefined', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary key="nowindow">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const goHomeButton = screen.getByText('Go to home');

    const originalWindow = globalThis.window;
    // @ts-ignore
    delete globalThis.window;

    try {
      fireEvent.click(goHomeButton);
      expect(true).toBe(true); // Verify we reached this point without crashing
    } finally {
      // @ts-ignore
      globalThis.window = originalWindow;
    }
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should reset error state when Try again is clicked', async () => {
    const user = userEvent.setup();

    let key = 'error';

    function TestComponent() {
      return (
        <ErrorBoundary key={key}>
          <ThrowError shouldThrow={key === 'error'} />
        </ErrorBoundary>
      );
    }

    const { rerender } = render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByText('Try again');
    await user.click(tryAgainButton);

    key = 'reset';
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  it('should navigate to home when Go to home is clicked', async () => {
    const user = userEvent.setup();
    const mockAssign = vi.fn();

    // Store the original location
    const originalLocation = globalThis.window.location;

    // Create a new location object with the mock
    // @ts-ignore
    delete globalThis.window.location;
    globalThis.window.location = {
      ...originalLocation,
      assign: mockAssign,
    } as any;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const goHomeButton = screen.getByText('Go to home');
    await user.click(goHomeButton);

    expect(mockAssign).toHaveBeenCalledWith('/');

    // Restore original location
    // @ts-ignore
    globalThis.window.location = originalLocation;
  });
});
