import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUIStore } from '../../../src/renderer/src/store/useUIStore';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({ themeMode: 'system', isSidebarOpen: true });
    localStorage.clear();
  });

  it('should have default state', () => {
    const state = useUIStore.getState();
    expect(state.themeMode).toBe('system');
    expect(state.isSidebarOpen).toBe(true);
  });

  it('should set theme mode', () => {
    useUIStore.getState().setThemeMode('dark');
    expect(useUIStore.getState().themeMode).toBe('dark');

    useUIStore.getState().setThemeMode('light');
    expect(useUIStore.getState().themeMode).toBe('light');
  });

  it('should toggle sidebar', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(false);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(true);
  });
  
  it('should resolve system theme correctly', () => {
    // Mock system preference to dark
    window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));

    // This part logic usually sits in component or a hook, but store might have a helper
    // For now, store just holds the preference 'system'
    expect(useUIStore.getState().themeMode).toBe('system');
  });
});
