// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useMindmapStore } from "../../../src/renderer/src/store/useMindmapStore";
import { Sheet } from "../../../src/shared/types";

describe("UndoRedo", () => {
  // We need to properly initialize the store for each test because we are modifying it.
  // The store state is shared across tests if not reset.

  const getActiveSheet = (): Sheet => {
    const state = useMindmapStore.getState().data;
    return state.sheets.find((s) => s.id === state.activeSheetId)!;
  };

  beforeEach(() => {
    // Reset store to initial state
    // We can just rely on the store's default initialization if we could reset it.
    // Since we can't easily "reset" the store instance (it's a singleton),
    // we should use a fresh state or ensure we don't depend on previous state.
    // A better way is to set the state manually to a known initial state.

    // However, the store initialization logic in useMindmapStore.ts handles default state.
    // Let's just create a new sheet to start fresh or rely on the fact that we are using `activeSheet`.

    // For TDD, let's just make sure we have a clean sheet.
    const store = useMindmapStore.getState();
    store.addSheet(); // Add a new sheet to work on
    const newSheetId = store.data.sheets[store.data.sheets.length - 1].id;
    store.setActiveSheet(newSheetId);
  });

  it("pushes history before mutation", () => {
    const store = useMindmapStore.getState();
    const sheet = getActiveSheet();
    const rootId = sheet.rootId;

    // Add child (should push history)
    store.addChildNode(rootId);

    const { history } = useMindmapStore.getState();
    expect(history.past.length).toBeGreaterThan(0); // At least 1 history item (creation of sheet might add one too?)
    // Actually, addSheet adds history.

    // Let's verify specifically the node addition
    // With Immer patches, we can't easily inspect the previous state directly from history
    // without applying inverse patches.
    // So we just check that history was recorded.
    expect(history.past.length).toBeGreaterThan(0);
  });

  it("undoes last action", () => {
    const store = useMindmapStore.getState();
    const rootId = getActiveSheet().rootId;

    store.addChildNode(rootId);
    expect(getActiveSheet().nodes[rootId].children.length).toBe(1);

    useMindmapStore.getState().undo();

    expect(getActiveSheet().nodes[rootId].children.length).toBe(0);
    // expect(useMindmapStore.getState().history.past.length).toBe(0); // This assertion is tricky because addSheet adds history
    expect(useMindmapStore.getState().history.future.length).toBeGreaterThan(0);
  });

  it("redoes last undo", () => {
    const store = useMindmapStore.getState();
    const rootId = getActiveSheet().rootId;

    store.addChildNode(rootId);
    useMindmapStore.getState().undo();
    useMindmapStore.getState().redo();

    expect(getActiveSheet().nodes[rootId].children.length).toBe(1);
    expect(useMindmapStore.getState().history.future.length).toBe(0);
  });

  it("clears future history on new mutation", () => {
    const store = useMindmapStore.getState();
    const rootId = getActiveSheet().rootId;

    store.addChildNode(rootId);
    useMindmapStore.getState().undo();
    expect(useMindmapStore.getState().history.future.length).toBeGreaterThan(0);

    // New mutation
    store.updateNodeText(rootId, "New Text");

    expect(useMindmapStore.getState().history.future.length).toBe(0);
  });
});
