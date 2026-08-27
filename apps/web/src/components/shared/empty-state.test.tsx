import { render, screen } from '@testing-library/react';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders the title as a heading', () => {
    render(<EmptyState title="No reservations" />);

    expect(screen.getByRole('heading')).toHaveTextContent('No reservations');
  });

  it('renders the description and action', () => {
    render(
      <EmptyState
        title="No reservations"
        description="Create the first one to get started"
        action={<button type="button">New reservation</button>}
      />,
    );

    expect(
      screen.getByText('Create the first one to get started'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'New reservation' }),
    ).toBeInTheDocument();
  });

  it('is announceable as a status region', () => {
    render(<EmptyState title="No reservations" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('hides the decorative icon from assistive tech', () => {
    render(
      <EmptyState title="No reservations" icon={<svg data-testid="icon" />} />,
    );

    expect(screen.getByTestId('icon').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
