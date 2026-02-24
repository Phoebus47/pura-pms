import { render, screen } from '@testing-library/react';
import { AppLayout } from './app-layout';

vi.mock('./sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('./header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('./bottom-navigation', () => ({
  BottomNavigation: () => (
    <nav data-testid="bottom-navigation">Bottom Navigation</nav>
  ),
}));

describe('AppLayout', () => {
  it('should render sidebar', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('should render header', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render bottom navigation', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
    );

    expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render children in main element', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
    );

    const main = screen.getByText('Test Content').closest('main');
    expect(main).toBeInTheDocument();
  });
});
