import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";
export type ViewMode = "welcome" | "editor";

interface UIState {
  themeMode: ThemeMode;
  isSidebarOpen: boolean;
  viewMode: ViewMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      themeMode: "system",
      isSidebarOpen: true,
      viewMode: "welcome",
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: "synapflow-ui-storage",
      partialize: (state) => ({
        themeMode: state.themeMode,
        isSidebarOpen: state.isSidebarOpen,
        viewMode: state.viewMode,
      }),
    },
  ),
);
