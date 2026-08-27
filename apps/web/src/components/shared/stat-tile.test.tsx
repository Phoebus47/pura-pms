import { render, screen } from '@testing-library/react';
import { StatTile } from './stat-tile';

describe('StatTile', () => {
  it('renders label, value and hint', () => {
    render(<StatTile label="Occupancy" value="82%" hint="12 of 68 vacant" />);

    expect(screen.getByText('Occupancy')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('12 of 68 vacant')).toBeInTheDocument();
  });

  it('renders numeric values', () => {
    render(<StatTile label="Arrivals" value={14} />);

    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('becomes a link when href is given', () => {
    render(<StatTile label="Arrivals" value={14} href="/reservations" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/reservations');
  });

  it('is not a link without href', () => {
    render(<StatTile label="Arrivals" value={14} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('applies the tone ink to the value', () => {
    render(<StatTile label="Overdue" value={3} tone="critical" />);

    expect(screen.getByText('3')).toHaveClass('text-status-critical-ink');
  });

  it('falls back to brand ink when no tone is given', () => {
    render(<StatTile label="Overdue" value={3} />);

    expect(screen.getByText('3')).toHaveClass('text-pura-blue');
  });
});
