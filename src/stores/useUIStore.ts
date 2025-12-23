import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  claudeApiKey: string | null;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setClaudeApiKey: (key: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      claudeApiKey: null,

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

      setClaudeApiKey: (key: string | null) => {
        set({ claudeApiKey: key });
      },
    }),
    {
      name: 'expense-tracker-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        // Note: API key is stored but should ideally be encrypted
        claudeApiKey: state.claudeApiKey,
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
