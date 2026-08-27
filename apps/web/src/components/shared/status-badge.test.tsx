import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('renders the label', () => {
    render(<StatusBadge tone="positive" label="Checked in" />);

    expect(screen.getByText('Checked in')).toBeInTheDocument();
  });

  it('applies the tone classes', () => {
    render(<StatusBadge tone="critical" label="Cancelled" />);

    expect(screen.getByText('Cancelled')).toHaveClass(
      'bg-status-critical-tint',
      'text-status-critical-ink',
    );
  });

  it('applies the small size', () => {
    render(<StatusBadge tone="neutral" label="Vacant" size="sm" />);

    expect(screen.getByText('Vacant')).toHaveClass('text-2xs');
  });
});
