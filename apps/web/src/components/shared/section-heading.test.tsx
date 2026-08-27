import { render, screen } from '@testing-library/react';
import { SectionHeading } from './section-heading';

describe('SectionHeading', () => {
  it('renders the title as a heading', () => {
    render(<SectionHeading title="Arrivals" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Arrivals',
    );
  });

  it('renders actions', () => {
    render(
      <SectionHeading title="Arrivals" actions={<button>View all</button>} />,
    );

    expect(
      screen.getByRole('button', { name: 'View all' }),
    ).toBeInTheDocument();
  });
});
