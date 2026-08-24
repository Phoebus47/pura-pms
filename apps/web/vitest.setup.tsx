/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { t } from '@/lib/i18n';

// Global ResizeObserver mock
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Basic Next.js mocks (can be overridden in individual tests)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  notFound: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: (namespace?: string) => (key: string) =>
    t(namespace ? `${namespace}.${key}` : key),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  hasLocale: (locales: readonly string[], locale: string) =>
    locales.includes(locale),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  redirect: vi.fn(),
  getPathname: vi.fn(),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

vi.mock('next/font/google', () => ({
  Geist: vi.fn(() => ({ variable: '--font-geist-sans' })),
  Geist_Mono: vi.fn(() => ({ variable: '--font-geist-mono' })),
  Sarabun: vi.fn(() => ({ variable: '--font-sarabun' })),
  Prompt: vi.fn(() => ({ variable: '--font-prompt' })),
}));

if (typeof window !== 'undefined') {
  window.ResizeObserver = MockResizeObserver;

  // Mock PointerEvent etc for Radix UI
  class MockPointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;

    constructor(type: string, props: any) {
      super(type, props);
      this.button = props?.button || 0;
      this.ctrlKey = props?.ctrlKey || false;
      this.pointerType = props?.pointerType || 'mouse';
    }
  }

  window.PointerEvent = MockPointerEvent as any;
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
}
