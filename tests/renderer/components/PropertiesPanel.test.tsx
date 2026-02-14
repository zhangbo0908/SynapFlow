/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import PropertiesPanel from "../../../src/renderer/src/components/PropertiesPanel";
import { useMindmapStore } from "../../../src/renderer/src/store/useMindmapStore";
import { MindmapNode } from "../../../src/shared/types";

// Mock the store
vi.mock("../../../src/renderer/src/store/useMindmapStore", () => ({
  useMindmapStore: vi.fn(),
}));

describe("PropertiesPanel", () => {
  const mockUpdateNodeStyle = vi.fn();
  const mockUpdateLayout = vi.fn();
  const mockUpdateTheme = vi.fn();
  const mockNode: MindmapNode = {
    id: "node-1",
    text: "Test Node",
    x: 0,
    y: 0,
    width: 100,
    height: 40,
    children: [],
    style: {
      backgroundColor: "#ffffff",
      color: "#000000",
      fontSize: 14,
      borderColor: "#000000",
      borderWidth: 1,
    },
  };

  const mockStore = {
    data: {
      version: "0.7.0",
      sheets: [
        {
          id: "sheet-1",
          title: "Sheet 1",
          rootId: "root",
          nodes: {
            "node-1": mockNode,
            root: { ...mockNode, id: "root" },
          },
          theme: "default",
          layout: "logic",
          editorState: {
            zoom: 1,
            offset: { x: 0, y: 0 },
            selectedId: "node-1",
          },
        },
      ],
      activeSheetId: "sheet-1",
      // Legacy fields (optional but good to have for type compatibility if needed)
      rootId: "root",
      nodes: {},
      editorState: {},
    },
    viewCenterTrigger: 0,
    updateNodeStyle: mockUpdateNodeStyle,
    updateLayout: mockUpdateLayout,
    updateTheme: mockUpdateTheme,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useMindmapStore as any).mockImplementation((selector) =>
      selector(mockStore),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders global settings when no node is selected", () => {
    const emptyStore = {
      ...mockStore,
      data: {
        ...mockStore.data,
        sheets: [
          {
            ...mockStore.data.sheets[0],
            editorState: { selectedId: undefined },
          },
        ],
      },
    };
    (useMindmapStore as any).mockImplementation((selector) =>
      selector(emptyStore),
    );
    render(<PropertiesPanel />);

    // Default should be canvas tab
    expect(screen.getByText("布局结构")).toBeDefined();
    expect(screen.getByText("风格主题")).toBeDefined();
  });

  it("renders property inputs when a node is selected", () => {
    render(<PropertiesPanel />);

    // Should automatically switch to Style tab
    expect(screen.getByLabelText("背景颜色")).toBeDefined();
    expect(screen.getByLabelText("文本颜色")).toBeDefined();
    expect(screen.getByLabelText("字体大小")).toBeDefined();
  });

  it("calls updateNodeStyle when background color changes", () => {
    render(<PropertiesPanel />);

    const bgInput = screen.getByLabelText("背景颜色");
    fireEvent.change(bgInput, { target: { value: "#ff0000" } });

    expect(mockUpdateNodeStyle).toHaveBeenCalledWith(
      "node-1",
      expect.objectContaining({
        backgroundColor: "#ff0000",
      }),
    );
  });

  it("calls updateNodeStyle when font size changes", () => {
    render(<PropertiesPanel />);

    const sizeInput = screen.getByLabelText("字体大小");
    fireEvent.change(sizeInput, { target: { value: "20" } });

    expect(mockUpdateNodeStyle).toHaveBeenCalledWith(
      "node-1",
      expect.objectContaining({
        fontSize: 20,
      }),
    );
  });

  it("calls updateLayout when layout changes", () => {
    const emptyStore = {
      ...mockStore,
      data: {
        ...mockStore.data,
        sheets: [
          {
            ...mockStore.data.sheets[0],
            editorState: { selectedId: undefined },
          },
        ],
      },
    };
    (useMindmapStore as any).mockImplementation((selector) =>
      selector(emptyStore),
    );
    render(<PropertiesPanel />);

    const mindmapButton = screen.getByText("思维导图");
    fireEvent.click(mindmapButton);

    expect(mockUpdateLayout).toHaveBeenCalledWith("mindmap");
  });

  it("uses theme defaults for border color when node has no specific style", () => {
    const nodeWithoutBorderColor = {
      ...mockNode,
      id: "node-2",
      isRoot: false,
      parentId: "root",
      style: {
        // No borderColor
        backgroundColor: "#ffffff",
        color: "#000000",
        fontSize: 14,
      },
    };

    const businessThemeStore = {
      ...mockStore,
      data: {
        ...mockStore.data,
        sheets: [
          {
            ...mockStore.data.sheets[0],
            theme: "business",
            nodes: {
              root: { ...mockNode, id: "root", isRoot: true },
              "node-2": nodeWithoutBorderColor,
            },
            editorState: {
              ...mockStore.data.sheets[0].editorState,
              selectedId: "node-2",
            },
          },
        ],
      },
    };

    (useMindmapStore as any).mockImplementation((selector) =>
      selector(businessThemeStore),
    );

    render(<PropertiesPanel />);

    // The business theme primaryStyle borderColor is #CCF2ED
    const colorInput = screen.getByLabelText("边框颜色") as HTMLInputElement;
    expect(colorInput.value.toUpperCase()).toBe("#CCF2ED");
  });
});
