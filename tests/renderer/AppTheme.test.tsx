import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "../../src/renderer/src/App";
import { useUIStore } from "../../src/renderer/src/store/useUIStore";

// Mock Stores
vi.mock("../../src/renderer/src/store/useUIStore", () => ({
  useUIStore: vi.fn(),
}));

vi.mock("../../src/renderer/src/store/useMindmapStore", () => ({
  useMindmapStore: vi.fn((selector) =>
    selector({
      data: { sheets: [], activeSheetId: "1" },
      currentFilePath: null,
      setMindmap: vi.fn(),
      setFilePath: vi.fn(),
    }),
  ),
}));

vi.mock("../../src/renderer/src/hooks/useAutoSave", () => ({
  useAutoSave: () => ({
    isSaving: false,
    lastSavedTime: null,
    markAsSaved: vi.fn(),
  }),
}));

// Mock Child Components to simplify testing
vi.mock("../../src/renderer/src/components/CanvasWorkspace", () => ({
  default: () => <div data-testid="canvas-workspace" />,
}));
vi.mock("../../src/renderer/src/components/PropertiesPanel", () => ({
  default: () => <div data-testid="properties-panel" />,
}));
vi.mock("../../src/renderer/src/components/SheetBar", () => ({
  default: () => <div data-testid="sheet-bar" />,
}));
vi.mock("../../src/renderer/src/components/SaveStatus", () => ({
  default: () => <div data-testid="save-status" />,
}));
vi.mock("../../src/renderer/src/components/ExportDropdown", () => ({
  default: () => <div data-testid="export-dropdown" />,
}));
vi.mock("../../src/renderer/src/components/WelcomeScreen", () => ({
  default: () => <div data-testid="welcome-screen" />,
}));

// Mock API
window.api = {
  file: { open: vi.fn(), save: vi.fn(), importXMind: vi.fn() },
  app: {
    getRecentFiles: vi.fn().mockResolvedValue([]),
    getHasSeenOnboarding: vi.fn().mockResolvedValue(true), // Mock as true to skip onboarding
    setHasSeenOnboarding: vi.fn().mockResolvedValue(undefined),
  },
  user: {
    getPreferences: vi.fn().mockResolvedValue({}),
    setPreferences: vi.fn(),
  },
} as any;

describe("App Theme Logic", () => {
  let setThemeMode: any;
  let setViewMode: any;
  let matchMediaListeners: Function[] = [];

  const mockMatchMedia = (matches: boolean) => {
    return (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn((event, callback) => {
        if (event === "change") matchMediaListeners.push(callback);
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setThemeMode = vi.fn();
    setViewMode = vi.fn();
    matchMediaListeners = [];

    // Default store mock
    (useUIStore as any).mockImplementation((selector: any) =>
      selector({
        themeMode: "system",
        viewMode: "editor", // Ensure we render the toolbar
        setThemeMode,
        setViewMode,
      }),
    );
  });

  afterEach(() => {
    document.documentElement.className = "";
  });

  it("renders Dark Mode when system is Dark and themeMode is system", async () => {
    window.matchMedia = vi.fn().mockImplementation(mockMatchMedia(true)); // System Dark

    render(<App />);

    // Expect DOM to have 'dark' class
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // Expect button to show Sun (toggle to Light)
    expect(screen.getByTitle("切换主题")).toHaveTextContent("🌞");
  });

  it("renders Light Mode when system is Light and themeMode is system", async () => {
    window.matchMedia = vi.fn().mockImplementation(mockMatchMedia(false)); // System Light

    render(<App />);

    // Expect DOM NOT to have 'dark' class
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Expect button to show Moon (toggle to Dark)
    expect(screen.getByTitle("切换主题")).toHaveTextContent("🌙");
  });

  it("toggles from System(Dark) to Light correctly", async () => {
    window.matchMedia = vi.fn().mockImplementation(mockMatchMedia(true)); // System Dark
    render(<App />);

    // Initially Dark, Button is Sun
    const button = screen.getByTitle("切换主题");
    expect(button).toHaveTextContent("🌞");

    // Click button
    fireEvent.click(button);

    // Should call setThemeMode with 'light' (because current effective is dark)
    expect(setThemeMode).toHaveBeenCalledWith("light");
  });

  it("toggles from System(Light) to Dark correctly", async () => {
    window.matchMedia = vi.fn().mockImplementation(mockMatchMedia(false)); // System Light
    render(<App />);

    // Initially Light, Button is Moon
    const button = screen.getByTitle("切换主题");
    expect(button).toHaveTextContent("🌙");

    // Click button
    fireEvent.click(button);

    // Should call setThemeMode with 'dark' (because current effective is light)
    expect(setThemeMode).toHaveBeenCalledWith("dark");
  });
});
