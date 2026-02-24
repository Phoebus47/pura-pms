import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
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
