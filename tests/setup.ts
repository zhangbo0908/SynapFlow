import { vi } from "vitest";
import "@testing-library/jest-dom";

// Only mock DOM-related APIs if we are in a browser-like environment
if (typeof window !== "undefined" && typeof HTMLCanvasElement !== "undefined") {
  // Mock HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
    if (contextId === "2d") {
      return {
        font: "",
        measureText: (text: string) => ({
          width: text.length * 10, // Simple mock: 10px per character
          actualBoundingBoxAscent: 10,
          actualBoundingBoxDescent: 2,
        }),
        // Add other methods if needed
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  }) as any;

  // Mock ResizeObserver if not present
  if (!global.ResizeObserver) {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  // Mock localStorage if not present or broken
  if (
    !window.localStorage ||
    typeof window.localStorage.setItem !== "function"
  ) {
    const localStorageMock = (function () {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
        key: vi.fn((index: number) => Object.keys(store)[index] || null),
        get length() {
          return Object.keys(store).length;
        },
      };
    })();

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  }
}
