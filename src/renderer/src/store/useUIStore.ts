import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";
export type ViewMode = "welcome" | "editor";
export type UpdateStatus = "idle" | "checking" | "downloading" | "ready" | "error";

interface SearchResult {
  nodeId: string;
  nodeText: string;
  path: string[];
}

interface UIState {
  themeMode: ThemeMode;
  isSidebarOpen: boolean;
  viewMode: ViewMode;
  searchQuery: string;
  searchResults: SearchResult[];
  searchIndex: number;
  updateModalVisible: boolean;
  updateStatus: UpdateStatus;
  updateVersion: string;
  updateProgress: number;
  setThemeMode: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setSearchIndex: (index: number) => void;
  clearSearch: () => void;
  setUpdateModalVisible: (visible: boolean) => void;
  setUpdateStatus: (status: UpdateStatus) => void;
  setUpdateVersion: (version: string) => void;
  setUpdateProgress: (progress: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      themeMode: "system",
      isSidebarOpen: true,
      viewMode: "welcome",
      searchQuery: "",
      searchResults: [],
      searchIndex: -1,
      updateModalVisible: false,
      updateStatus: "idle",
      updateVersion: "",
      updateProgress: 0,
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      setSearchIndex: (index) => set({ searchIndex: index }),
      clearSearch: () => set({ searchQuery: "", searchResults: [], searchIndex: -1 }),
      setUpdateModalVisible: (visible) => set({ updateModalVisible: visible }),
      setUpdateStatus: (status) => set({ updateStatus: status }),
      setUpdateVersion: (version) => set({ updateVersion: version }),
      setUpdateProgress: (progress) => set({ updateProgress: progress }),
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
