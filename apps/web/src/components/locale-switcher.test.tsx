import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleSwitcher } from './locale-switcher';

const mockReplace = vi.fn();

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: (namespace: string) => (key: string) => {
    const messages: Record<string, Record<string, string>> = {
      locale: {
        label: 'Language',
        en: 'English',
        th: 'Thai',
      },
    };
    return messages[namespace]?.[key] ?? key;
  },
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/settings',
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
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
  redirect: vi.fn(),
  getPathname: vi.fn(),
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('renders locale options', () => {
    render(<LocaleSwitcher />);

    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'English', pressed: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thai' })).toBeInTheDocument();
  });

  it('switches locale via router.replace', async () => {
    const user = userEvent.setup();

    render(<LocaleSwitcher />);

    await user.click(screen.getByRole('button', { name: 'Thai' }));

    expect(mockReplace).toHaveBeenCalledWith('/settings', { locale: 'th' });
  });

  it('keeps readable contrast on dark surfaces', () => {
    render(<LocaleSwitcher appearance="onDark" />);

    const active = screen.getByRole('button', {
      name: 'English',
      pressed: true,
    });
    const inactive = screen.getByRole('button', { name: 'Thai' });

    expect(active).toHaveClass('bg-white', 'text-pura-blue');
    expect(inactive).toHaveClass('text-white');
    expect(inactive.className).toMatch(/hover:bg-white\/15/);
    expect(inactive.className).toMatch(/hover:text-white/);
  });
});
