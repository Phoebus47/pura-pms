import { render, screen } from '@testing-library/react';
import { Panel } from './panel';

describe('Panel', () => {
  it('renders children', () => {
    render(
      <Panel>
        <p>Panel body</p>
      </Panel>,
    );

    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });

  it('renders the title as an h2 with actions', () => {
    render(
      <Panel title="Folio" actions={<button type="button">Post charge</button>}>
        <p>Panel body</p>
      </Panel>,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Folio',
    );
    expect(
      screen.getByRole('button', { name: 'Post charge' }),
    ).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<Panel title="Folio" description="Charges and payments" />);

    expect(screen.getByText('Charges and payments')).toBeInTheDocument();
  });

  it('applies panel padding by default', () => {
    const { container } = render(<Panel>body</Panel>);

    expect(container.querySelector('section')).toHaveClass('p-(--panel-pad)');
  });

  it('applies no padding to the section when padding is none', () => {
    const { container } = render(
      <Panel padding="none" title="Rooms">
        body
      </Panel>,
    );

    const section = container.querySelector('section');
    expect(section).not.toHaveClass('p-(--panel-pad)');
    expect(section).not.toHaveClass('p-(--panel-pad-lg)');
  });

  it('applies large padding when padding is lg', () => {
    const { container } = render(<Panel padding="lg">body</Panel>);

    expect(container.querySelector('section')).toHaveClass(
      'p-(--panel-pad-lg)',
    );
  });
});
