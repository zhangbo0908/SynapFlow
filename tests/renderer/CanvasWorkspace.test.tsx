// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import CanvasWorkspace from "../../src/renderer/src/components/CanvasWorkspace";
import { useMindmapStore } from "../../src/renderer/src/store/useMindmapStore";
import "@testing-library/jest-dom";

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("CanvasWorkspace", () => {
  beforeEach(() => {
    useMindmapStore.setState({
      data: {
        version: "0.7.0",
        sheets: [
          {
            id: "sheet-1",
            title: "Sheet 1",
            rootId: "root",
            nodes: {
              root: {
                id: "root",
                text: "Central Topic",
                x: 0,
                y: 0,
                width: 100,
                height: 40,
                children: ["child1"],
                isRoot: true,
              },
              child1: {
                id: "child1",
                text: "Child Node",
                x: 200,
                y: 0,
                width: 100,
                height: 40,
                children: [],
                parentId: "root",
              },
            },
            theme: "default",
            editorState: { zoom: 1, offset: { x: 0, y: 0 } },
          },
        ],
        activeSheetId: "sheet-1",
        // Legacy fields
        rootId: "root",
        nodes: {},
        editorState: { zoom: 1, offset: { x: 0, y: 0 } },
      },
    });
  });

  it("renders root and child nodes from store", () => {
    render(<CanvasWorkspace />);
    expect(screen.getByText("Central Topic")).toBeInTheDocument();
    expect(screen.getByText("Child Node")).toBeInTheDocument();
  });

  it("handles zoom on wheel", () => {
    const { container } = render(<CanvasWorkspace />);
    const svg = container.querySelector("svg");

    // Simulate wheel down (zoom out)
    act(() => {
      fireEvent.wheel(svg!, { ctrlKey: true, deltaY: 100 });
    });

    const state = useMindmapStore.getState().data;
    const activeSheet = state.sheets.find((s) => s.id === state.activeSheetId);
    expect(activeSheet?.editorState.zoom).toBeLessThan(1);
  });

  it("handles pan on drag", () => {
    const { container } = render(<CanvasWorkspace />);
    const svg = container.querySelector("svg");

    // Get initial offset after mount (auto-centering might have run)
    const state = useMindmapStore.getState().data;
    const initialOffset = state.sheets.find(
      (s) => s.id === state.activeSheetId,
    )!.editorState.offset;

    // Start drag
    act(() => {
      fireEvent.mouseDown(svg!, { clientX: 0, clientY: 0 });
    });

    // Move
    act(() => {
      fireEvent.mouseMove(svg!, { clientX: 100, clientY: 100 });
    });

    // End drag
    act(() => {
      fireEvent.mouseUp(svg!);
    });

    const newState = useMindmapStore.getState().data;
    const offset = newState.sheets.find((s) => s.id === newState.activeSheetId)!
      .editorState.offset;
    expect(offset.x).toBe(initialOffset.x + 100);
    expect(offset.y).toBe(initialOffset.y + 100);
  });

  it("renders correct connection path for OrgChart layout (Top-Down)", () => {
    // Setup OrgChart layout
    useMindmapStore.setState({
      data: {
        version: "0.7.0",
        sheets: [
          {
            id: "sheet-1",
            title: "Sheet 1",
            rootId: "root",
            nodes: {
              root: {
                id: "root",
                text: "Root",
                x: 100,
                y: 0,
                width: 100,
                height: 40,
                children: ["child1"],
                isRoot: true,
              },
              child1: {
                id: "child1",
                text: "Child",
                x: 100,
                y: 100,
                width: 100,
                height: 40,
                children: [],
                parentId: "root",
              },
            },
            theme: "fresh",
            layout: "orgChart",
            editorState: { zoom: 1, offset: { x: 0, y: 0 } },
          },
        ],
        activeSheetId: "sheet-1",
        rootId: "root",
        nodes: {},
        editorState: { zoom: 1, offset: { x: 0, y: 0 } },
      },
    });

    const { container } = render(<CanvasWorkspace />);
    const path = container.querySelector("path");

    expect(path).toBeInTheDocument();

    // Root Bottom: (150, 40)
    // Child Top: (150, 100)
    // MidY: (40 + 100) / 2 = 70
    // Path: M 150 40 C 150 70, 150 70, 150 100
    // Note: The actual path generation might vary slightly depending on implementation details,
    // but we check for attributes.
    expect(path).toHaveAttribute("d", "M 150 40 C 150 70, 150 70, 150 100");
  });

  it("renders correct connection path for Logic layout (Left-Right)", () => {
    // Setup Logic layout
    useMindmapStore.setState({
      data: {
        version: "0.7.0",
        sheets: [
          {
            id: "sheet-1",
            title: "Sheet 1",
            rootId: "root",
            nodes: {
              root: {
                id: "root",
                text: "Root",
                x: 0,
                y: 0,
                width: 100,
                height: 40,
                children: ["child1"],
                isRoot: true,
              },
              child1: {
                id: "child1",
                text: "Child",
                x: 150,
                y: 0,
                width: 100,
                height: 40,
                children: [],
                parentId: "root",
              },
            },
            theme: "fresh",
            layout: "logic",
            editorState: { zoom: 1, offset: { x: 0, y: 0 } },
          },
        ],
        activeSheetId: "sheet-1",
        rootId: "root",
        nodes: {},
        editorState: { zoom: 1, offset: { x: 0, y: 0 } },
      },
    });

    const { container } = render(<CanvasWorkspace />);
    const path = container.querySelector("path");

    expect(path).toBeInTheDocument();

    // Root Right: (100, 20)
    // Child Left: (150, 20)
    // MidX: (100 + 150) / 2 = 125
    // Path: M 100 20 C 125 20, 125 20, 150 20
    expect(path).toHaveAttribute("d", "M 100 20 C 125 20, 125 20, 150 20");
  });
});
