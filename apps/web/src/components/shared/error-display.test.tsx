import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from './error-display';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';

describe('ErrorDisplay', () => {
  it('should not render when error is null', () => {
    render(<ErrorDisplay error={null} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render error message when error is provided', () => {
    render(<ErrorDisplay error="Test error message" />);

    const errorMessage = screen.getByText('Test error message');
    expect(errorMessage).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should use the critical tone for the message and the panel', () => {
    render(<ErrorDisplay error="Test error" />);

    expect(screen.getByText('Test error')).toHaveClass(
      ...statusToneInk.critical.split(' '),
    );
    expect(screen.getByRole('alert')).toHaveClass(
      ...statusToneSurface.critical.split(' '),
    );
  });
});
