import { describe, it, expect, beforeEach } from "vitest";
import { useMindmapStore } from "../../../src/renderer/src/store/useMindmapStore";
import { Sheet } from "../../../src/shared/types";

describe("useMindmapStore Multi-Sheet", () => {
  // Helper to get active sheet
  const getActiveSheet = (): Sheet => {
    const store = useMindmapStore.getState();
    const activeId = store.data.activeSheetId;
    return store.data.sheets.find((s) => s.id === activeId)!;
  };

  beforeEach(() => {
    // Reset store to initial state before each test
    // We assume the store initializes with at least one default sheet
    useMindmapStore.setState({
      data: {
        version: "0.7.0",
        activeSheetId: "sheet-1",
        sheets: [
          {
            id: "sheet-1",
            title: "Sheet 1",
            rootId: "root-1",
            nodes: {
              "root-1": {
                id: "root-1",
                text: "Central Topic",
                x: 0,
                y: 0,
                width: 100,
                height: 40,
                children: [],
                isRoot: true,
              },
            },
            theme: "default",
            editorState: { zoom: 1, offset: { x: 0, y: 0 } },
          },
        ],
      },
    });
  });

  it("should initialize with one sheet", () => {
    const store = useMindmapStore.getState();
    expect(store.data.sheets.length).toBe(1);
    expect(store.data.activeSheetId).toBe("sheet-1");
  });

  it("should add a new sheet", () => {
    const store = useMindmapStore.getState();
    store.addSheet(); // Should add a new sheet

    const updatedStore = useMindmapStore.getState();
    expect(updatedStore.data.sheets.length).toBe(2);
    expect(updatedStore.data.activeSheetId).not.toBe("sheet-1"); // Should switch to new sheet

    const newSheet = getActiveSheet();
    expect(newSheet.title).toMatch(/Sheet/);
    expect(newSheet.nodes[newSheet.rootId]).toBeDefined();
    expect(newSheet.theme).toBe("business"); // Verify default theme
  });

  it("should switch active sheet", () => {
    const store = useMindmapStore.getState();
    store.addSheet();
    const newSheetId = useMindmapStore.getState().data.activeSheetId;

    store.setActiveSheet("sheet-1");
    expect(useMindmapStore.getState().data.activeSheetId).toBe("sheet-1");

    store.setActiveSheet(newSheetId);
    expect(useMindmapStore.getState().data.activeSheetId).toBe(newSheetId);
  });

  it("should rename a sheet", () => {
    const store = useMindmapStore.getState();
    store.renameSheet("sheet-1", "My Project");

    const sheet = useMindmapStore
      .getState()
      .data.sheets.find((s) => s.id === "sheet-1");
    expect(sheet?.title).toBe("My Project");
  });

  it("should delete a sheet", () => {
    const store = useMindmapStore.getState();
    store.addSheet(); // Create sheet 2
    const sheet2Id = useMindmapStore.getState().data.activeSheetId;

    store.deleteSheet(sheet2Id);

    const updatedStore = useMindmapStore.getState();
    expect(updatedStore.data.sheets.length).toBe(1);
    expect(
      updatedStore.data.sheets.find((s) => s.id === sheet2Id),
    ).toBeUndefined();
    expect(updatedStore.data.activeSheetId).toBe("sheet-1"); // Should fallback to remaining sheet
  });

  it("should prevent deleting the last sheet", () => {
    const store = useMindmapStore.getState();
    store.deleteSheet("sheet-1");

    const updatedStore = useMindmapStore.getState();
    expect(updatedStore.data.sheets.length).toBe(1);
    expect(updatedStore.data.sheets[0].id).toBe("sheet-1");
  });

  it("node operations should affect only the active sheet", () => {
    const store = useMindmapStore.getState();

    // Modify Sheet 1
    const root1 = getActiveSheet().rootId;
    store.addChildNode(root1);

    // Switch to Sheet 2
    store.addSheet();
    const sheet2 = getActiveSheet();

    // Sheet 2 root should have no children initially
    expect(sheet2.nodes[sheet2.rootId].children.length).toBe(0);

    // Modify Sheet 2
    store.addChildNode(sheet2.rootId);
    expect(getActiveSheet().nodes[sheet2.rootId].children.length).toBe(1);

    // Switch back to Sheet 1 and verify
    store.setActiveSheet("sheet-1");
    const sheet1 = getActiveSheet();
    expect(sheet1.nodes[sheet1.rootId].children.length).toBe(1);

    // IDs should be distinct (simplified check)
    const child1 = sheet1.nodes[sheet1.nodes[sheet1.rootId].children[0]];
    // Logic ensures new IDs are generated, so no conflict usually
    expect(child1).toBeDefined();
  });

  it("should reorder sheets", () => {
    const store = useMindmapStore.getState();
    store.addSheet(); // Add Sheet 2
    store.addSheet(); // Add Sheet 3
    // Order: Sheet 1, Sheet 2, Sheet 3

    const initialSheets = [...useMindmapStore.getState().data.sheets];
    expect(initialSheets.length).toBe(3);

    // Move Sheet 3 (index 2) to start (index 0)
    store.reorderSheets(2, 0);

    const updatedSheets = useMindmapStore.getState().data.sheets;
    expect(updatedSheets[0].id).toBe(initialSheets[2].id);
    expect(updatedSheets[1].id).toBe(initialSheets[0].id);
    expect(updatedSheets[2].id).toBe(initialSheets[1].id);
  });

  it("should ignore invalid reorder indices", () => {
    useMindmapStore.getState().addSheet(); // Add Sheet 2
    const initialSheets = JSON.stringify(
      useMindmapStore.getState().data.sheets,
    );

    useMindmapStore.getState().reorderSheets(-1, 0);
    expect(JSON.stringify(useMindmapStore.getState().data.sheets)).toBe(
      initialSheets,
    );

    useMindmapStore.getState().reorderSheets(0, 5);
    expect(JSON.stringify(useMindmapStore.getState().data.sheets)).toBe(
      initialSheets,
    );

    useMindmapStore.getState().reorderSheets(0, 0); // Same index
    expect(JSON.stringify(useMindmapStore.getState().data.sheets)).toBe(
      initialSheets,
    );
  });

  it("should support undo/redo for reorder", () => {
    useMindmapStore.getState().addSheet(); // Sheet 2

    const state = useMindmapStore.getState();
    const sheet1Id = state.data.sheets[0].id;
    const sheet2Id = state.data.sheets[1].id;

    // Initial: [Sheet1, Sheet2]

    // Move Sheet 2 to 0
    useMindmapStore.getState().reorderSheets(1, 0);

    // Now: [Sheet2, Sheet1]
    expect(useMindmapStore.getState().data.sheets[0].id).toBe(sheet2Id);

    // Undo
    useMindmapStore.getState().undo();
    // Should be: [Sheet1, Sheet2]
    expect(useMindmapStore.getState().data.sheets[0].id).toBe(sheet1Id);

    // Redo
    useMindmapStore.getState().redo();
    // Should be: [Sheet2, Sheet1]
    expect(useMindmapStore.getState().data.sheets[0].id).toBe(sheet2Id);
  });
});
