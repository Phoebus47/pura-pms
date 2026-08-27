import { render } from '@testing-library/react';
import { act } from 'react';
import { ThemeProvider } from './theme-provider';
import { useUIStore } from '@/lib/stores/use-ui-store';

vi.mock('zustand/middleware', () => ({
  persist: <T,>(fn: T) => fn,
}));

describe('ThemeProvider', () => {
  afterEach(() => {
    act(() => {
      useUIStore.setState({ theme: 'light' });
    });
  });

  it('mirrors the stored theme onto the document element', () => {
    render(
      <ThemeProvider>
        <span>shell</span>
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => {
      useUIStore.setState({ theme: 'dark' });
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      useUIStore.setState({ theme: 'light' });
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
