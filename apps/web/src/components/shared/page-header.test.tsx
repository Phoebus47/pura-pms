import { render, screen } from '@testing-library/react';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders the title as the page h1', () => {
    render(<PageHeader title="Reservations" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Reservations');
  });

  it('renders subtitle and eyebrow', () => {
    render(
      <PageHeader
        title="Reservations"
        eyebrow="Front office"
        subtitle="Manage arrivals and departures"
      />,
    );

    expect(screen.getByText('Front office')).toBeInTheDocument();
    expect(
      screen.getByText('Manage arrivals and departures'),
    ).toBeInTheDocument();
  });

  it('renders actions', () => {
    render(
      <PageHeader
        title="Reservations"
        actions={<button type="button">New reservation</button>}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'New reservation' }),
    ).toBeInTheDocument();
  });

  it('renders a back link when backHref is given', () => {
    render(<PageHeader title="Room 101" backHref="/rooms" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/rooms');
  });

  it('renders no link when backHref is omitted', () => {
    render(<PageHeader title="Room 101" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
