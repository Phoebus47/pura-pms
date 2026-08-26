/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { AppLayout } from './app-layout';
import { usePathname } from '@/i18n/navigation';

vi.mock('@/i18n/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  Link: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

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
  beforeEach(() => {
    (usePathname as any).mockReturnValue('/');
    vi.clearAllMocks();
  });

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

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByText('Test Content'));
    expect(main).toHaveClass('pb-20', 'lg:p-8', 'lg:pb-8');
    expect(main).not.toHaveClass('md:pb-8');
    expect(main).not.toHaveClass('md:p-6');
  });

  it('should only render children when pathname is /login', () => {
    (usePathname as any).mockReturnValue('/login');
    render(
      <AppLayout>
        <div>Test Login Content</div>
      </AppLayout>,
    );

    expect(screen.getByText('Test Login Content')).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bottom-navigation')).not.toBeInTheDocument();
  });

  it('should only render children for the guest-facing mobile check-in route', () => {
    (usePathname as any).mockReturnValue('/mobile-check-in');
    render(
      <AppLayout>
        <div>Test Mobile Check-in Content</div>
      </AppLayout>,
    );

    expect(
      screen.getByText('Test Mobile Check-in Content'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bottom-navigation')).not.toBeInTheDocument();
  });
});
