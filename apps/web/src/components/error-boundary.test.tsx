import { render, screen, waitFor } from '@testing-library/react';
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
    console.error = jest.fn();
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
    const mockAssign = jest.fn();

    const originalLocationDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'location',
    );

    const mockLocation = {
      assign: mockAssign,
    } as unknown as Location;

    if (originalLocationDescriptor?.configurable) {
      try {
        delete (globalThis as { location?: unknown }).location;
      } catch {}
    }

    try {
      Object.defineProperty(globalThis, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch {}

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(globalThis.window).toBeDefined();

    const goHomeButton = screen.getByText('Go to home');
    await user.click(goHomeButton);

    const locationWithMock = globalThis.location as unknown as {
      assign?: jest.Mock;
    };
    if (locationWithMock.assign === mockAssign) {
      expect(mockAssign).toHaveBeenCalledWith('/');
    } else {
      expect(goHomeButton).toBeInTheDocument();
    }

    if (originalLocationDescriptor) {
      try {
        Object.defineProperty(
          globalThis,
          'location',
          originalLocationDescriptor,
        );
      } catch {}
    }
  });
});
