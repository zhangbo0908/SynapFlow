// @vitest-environment jsdom
import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import CanvasWorkspace from "../../src/renderer/src/components/CanvasWorkspace";
import { useMindmapStore } from "../../src/renderer/src/store/useMindmapStore";

describe("Shortcuts", () => {
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
                text: "Root",
                x: 0,
                y: 0,
                width: 100,
                height: 40,
                children: [],
                isRoot: true,
              },
            },
            theme: "default",
            editorState: {
              zoom: 1,
              offset: { x: 0, y: 0 },
              selectedId: "root",
            },
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

  const getActiveSheet = () => {
    const state = useMindmapStore.getState().data;
    return state.sheets.find((s) => s.id === state.activeSheetId)!;
  };

  const setupComplexTree = () => {
    const store = useMindmapStore.getState();
    act(() => {
      store.addChildNode("root"); // child-1
      store.addChildNode("root"); // child-2
    });
    const sheet = getActiveSheet();
    const child1 = sheet.nodes[sheet.nodes["root"].children[0]];
    const child2 = sheet.nodes[sheet.nodes["root"].children[1]];
    act(() => {
      store.addChildNode(child1.id); // grandchild-1
      store.addChildNode(child1.id); // grandchild-2
    });
    return { root: "root", child1: child1.id, child2: child2.id, sheet };
  };

  it("adds child node on Tab", () => {
    render(<CanvasWorkspace />);

    act(() => {
      fireEvent.keyDown(document, { key: "Tab" });
    });

    const root = getActiveSheet().nodes["root"];
    expect(root.children.length).toBe(1);
  });

  it("adds sibling node on Enter", () => {
    // Setup: Root -> Child
    act(() => {
      useMindmapStore.getState().addChildNode("root");
    });
    const childId = getActiveSheet().nodes["root"].children[0];
    act(() => {
      useMindmapStore.getState().selectNode(childId);
    });

    render(<CanvasWorkspace />);

    act(() => {
      fireEvent.keyDown(document, { key: "Enter" });
    });

    const root = getActiveSheet().nodes["root"];
    expect(root.children.length).toBe(2);
  });

  it("deletes node on Delete", () => {
    // Setup: Root -> Child
    act(() => {
      useMindmapStore.getState().addChildNode("root");
    });
    const childId = getActiveSheet().nodes["root"].children[0];
    act(() => {
      useMindmapStore.getState().selectNode(childId);
    });

    render(<CanvasWorkspace />);

    act(() => {
      fireEvent.keyDown(document, { key: "Delete" });
    });

    const root = getActiveSheet().nodes["root"];
    expect(root.children.length).toBe(0);
  });

  it("does not trigger shortcuts when editing text", () => {
    // This is hard to test purely with unit tests because "editing mode" is internal state of NodeComponent
    // or implies an active input element.
    // We can simulate having an input focused.

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    render(<CanvasWorkspace />);

    fireEvent.keyDown(input, { key: "Delete" });

    // Should NOT delete
    expect(getActiveSheet().nodes["root"]).toBeDefined(); // Root won't be deleted anyway, but let's check side effects

    // Let's test with a child node to be sure
    useMindmapStore.getState().addChildNode("root");
    const root = getActiveSheet().nodes["root"];
    const childId = root.children[0];
    useMindmapStore.getState().selectNode(childId);

    fireEvent.keyDown(input, { key: "Delete" });
    expect(getActiveSheet().nodes[childId]).toBeDefined();

    document.body.removeChild(input);
  });
});

describe("Full Keyboard Navigation (F17)", () => {
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
                text: "Root",
                x: 0,
                y: 0,
                width: 100,
                height: 40,
                children: [],
                isRoot: true,
              },
            },
            theme: "default",
            editorState: {
              zoom: 1,
              offset: { x: 0, y: 0 },
              selectedId: "root",
            },
            layout: "logic",
          },
        ],
        activeSheetId: "sheet-1",
      },
    });
  });

  const getActiveSheet = () => {
    const state = useMindmapStore.getState().data;
    return state.sheets.find((s) => s.id === state.activeSheetId)!;
  };

  it("navigates to child node with ArrowRight and back to parent with ArrowLeft", () => {
    const store = useMindmapStore.getState();
    act(() => {
      store.addChildNode("root");
    });
    const sheet = getActiveSheet();
    const childId = sheet.nodes["root"].children[0];
    
    render(<CanvasWorkspace />);
    
    // Navigate Right to child
    act(() => {
      fireEvent.keyDown(document, { key: "ArrowRight" });
    });
    expect(getActiveSheet().editorState.selectedId).toBe(childId);
    
    // Navigate Left back to root
    act(() => {
      fireEvent.keyDown(document, { key: "ArrowLeft" });
    });
    expect(getActiveSheet().editorState.selectedId).toBe("root");
  });

  it("navigates between siblings with ArrowUp and ArrowDown", () => {
    const store = useMindmapStore.getState();
    act(() => {
      store.addChildNode("root"); // child-1
      store.addChildNode("root"); // child-2
    });
    const sheet = getActiveSheet();
    const child1 = sheet.nodes["root"].children[0];
    const child2 = sheet.nodes["root"].children[1];
    act(() => {
      store.selectNode(child1);
    });
    
    render(<CanvasWorkspace />);
    
    // Navigate Down to child-2
    act(() => {
      fireEvent.keyDown(document, { key: "ArrowDown" });
    });
    expect(getActiveSheet().editorState.selectedId).toBe(child2);
    
    // Navigate Up back to child-1
    act(() => {
      fireEvent.keyDown(document, { key: "ArrowUp" });
    });
    expect(getActiveSheet().editorState.selectedId).toBe(child1);
  });

  it("does not navigate beyond first or last sibling", () => {
    const store = useMindmapStore.getState();
    act(() => {
      store.addChildNode("root"); // child-1
    });
    const sheet = getActiveSheet();
    const childId = sheet.nodes["root"].children[0];
    act(() => {
      store.selectNode(childId);
    });
    
    render(<CanvasWorkspace />);
    
    // Try to navigate Up (no previous sibling)
    act(() => {
      fireEvent.keyDown(document, { key: "ArrowUp" });
    });
    expect(getActiveSheet().editorState.selectedId).toBe(childId);
    
    // Try to navigate Down (no next sibling)
    act(() => {
      fireEvent.keyDown(document, { key: "ArrowDown" });
    });
    expect(getActiveSheet().editorState.selectedId).toBe(childId);
  });

  it("does not navigate left when at root", () => {
    render(<CanvasWorkspace />);
    
    act(() => {
      fireEvent.keyDown(document, { key: "ArrowLeft" });
    });
    expect(getActiveSheet().editorState.selectedId).toBe("root");
  });

  it("does not trigger navigation when input is focused", () => {
    const store = useMindmapStore.getState();
    act(() => {
      store.addChildNode("root");
    });
    const sheet = getActiveSheet();
    const childId = sheet.nodes["root"].children[0];
    act(() => {
      store.selectNode("root"); // Ensure we're back on root
    });
    
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    
    render(<CanvasWorkspace />);
    
    act(() => {
      fireEvent.keyDown(input, { key: "ArrowRight" });
    });
    
    // Should still be on root
    expect(getActiveSheet().editorState.selectedId).toBe("root");
    
    document.body.removeChild(input);
  });
});
