import { render, screen } from '@testing-library/react';
import { Toolbar } from './toolbar';

describe('Toolbar', () => {
  it('renders search, filters and actions slots', () => {
    render(
      <Toolbar
        search={<input aria-label="Search guests" />}
        filters={<button type="button">Status</button>}
        actions={<button type="button">Add guest</button>}
      />,
    );

    expect(screen.getByLabelText('Search guests')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Status' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add guest' }),
    ).toBeInTheDocument();
  });

  it('renders nothing but the shell when no slot is passed', () => {
    const { container } = render(<Toolbar />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
