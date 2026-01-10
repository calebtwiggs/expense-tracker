import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  // API key is now stored securely via Electron's safeStorage
  // This is just a flag to indicate if an API key is configured
  hasApiKey: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setHasApiKey: (hasKey: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      hasApiKey: false,

      setTheme: (theme: Theme) => {
        set({ theme });

        // Apply theme to document
        const root = document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
          const isDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          root.classList.add(isDark ? 'dark' : 'light');
        } else {
          root.classList.add(theme);
        }
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setHasApiKey: (hasKey: boolean) => {
        set({ hasApiKey: hasKey });
      },
    }),
    {
      name: 'expense-tracker-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        // API key is NO LONGER stored in localStorage - only a flag
        hasApiKey: state.hasApiKey,
      }),
    }
  )
);

// Initialize theme on load
const initializeTheme = () => {
  const { theme } = useUIStore.getState();
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(isDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
};

// Run on module load
if (typeof window !== 'undefined') {
  initializeTheme();
}
