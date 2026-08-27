import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

/** Shared with the inline boot script in the locale layout. */
export const UI_STORE_KEY = 'pura-ui';

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  activePropertyId?: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setActivePropertyId: (id?: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      activePropertyId: undefined,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setActivePropertyId: (id) => set({ activePropertyId: id }),
    }),
    {
      name: UI_STORE_KEY,
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
