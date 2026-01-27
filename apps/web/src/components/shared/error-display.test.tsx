import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from './error-display';

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

  it('should have correct styling for error message', () => {
    render(<ErrorDisplay error="Test error" />);

    const errorElement = screen.getByText('Test error');
    expect(errorElement).toHaveClass('text-red-600');
  });
});
