import { create } from "zustand";
import { produceWithPatches, enablePatches, Patch, applyPatches } from "immer";
import { v4 as uuidv4 } from "uuid";
import {
  LocalMindmap,
  MindmapNode,
  NodeStyle,
  LayoutType,
  Sheet,
} from "../../../shared/types";
import { applyLayout } from "../utils/layoutEngine";
import { THEME_PRESETS } from "../utils/themePresets";
import { measureText } from "../utils/measureText";

// Enable Immer patches
enablePatches();

interface HistoryEntry {
  patches: Patch[];
  inversePatches: Patch[];
}

interface MindmapState {
  data: LocalMindmap;
  currentFilePath: string | null;
  viewCenterTrigger: number; // Increment to trigger view centering
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };

  // Actions
  setMindmap: (data: LocalMindmap) => void;
  setFilePath: (path: string | null) => void;

  // Sheet Actions
  addSheet: () => void;
  deleteSheet: (id: string) => void;
  renameSheet: (id: string, title: string) => void;
  reorderSheets: (fromIndex: number, toIndex: number) => void;
  setActiveSheet: (id: string) => void;

  // Node Actions (operate on active sheet)
  updateNodeText: (id: string, text: string) => void;
  updateNodeStyle: (id: string, style: Partial<NodeStyle>) => void;
  addChildNode: (parentId: string) => void;
  addSiblingNode: (siblingId: string) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  updateEditorState: (state: Partial<Sheet["editorState"]>) => void;
  undo: () => void;
  redo: () => void;
  updateLayout: (layout: LayoutType) => void;
  updateTheme: (themeName: string) => void;
  moveNode: (id: string, targetParentId: string) => void;
}

const createNode = (
  parentId: string,
  style: Partial<NodeStyle> = {},
): MindmapNode => {
  const text = "分支主题";
  const { width, height } = measureText(text, style);
  return {
    id: uuidv4(),
    text,
    x: 0,
    y: 0,
    width,
    height,
    children: [],
    parentId,
    style: Object.keys(style).length > 0 ? style : undefined,
  };
};

// Helper to recursively delete nodes
const deleteNodeRecursively = (
  nodes: Record<string, MindmapNode>,
  id: string,
) => {
  const node = nodes[id];
  if (!node) return;

  // Recursively delete children
  node.children.forEach((childId) => {
    deleteNodeRecursively(nodes, childId);
  });

  // Delete self
  delete nodes[id];
};

// Helper to get active sheet from state (for internal use within produce)
const getActiveSheet = (state: LocalMindmap): Sheet | undefined => {
  if (!state.sheets) return undefined;
  return state.sheets.find((s) => s.id === state.activeSheetId);
};

// Helper to update data with history support
const updateData = (
  set: any,
  updater: (draft: LocalMindmap) => void,
  options: { recordHistory?: boolean; triggerViewCenter?: boolean } = {},
) => {
  set((state: MindmapState) => {
    const [nextData, patches, inversePatches] = produceWithPatches(
      state.data,
      updater,
    );

    if (patches.length === 0) return {};

    let newHistory = state.history;
    if (options.recordHistory) {
      newHistory = {
        past: [...state.history.past, { patches, inversePatches }].slice(-20),
        future: [],
      };
    }

    return {
      data: nextData,
      history: newHistory,
      viewCenterTrigger: options.triggerViewCenter
        ? state.viewCenterTrigger + 1
        : state.viewCenterTrigger,
    };
  });
};

// Initial State Setup
const initialSheetId = "sheet-1";
const initialRootId = "root";

export const useMindmapStore = create<MindmapState>((set) => ({
  data: {
    version: "0.7.0",
    activeSheetId: initialSheetId,
    sheets: [
      {
        id: initialSheetId,
        title: "Sheet 1",
        rootId: initialRootId,
        nodes: {
          [initialRootId]: {
            id: initialRootId,
            text: "中心主题",
            x: 0,
            y: 0,
            width: 100,
            height: 40,
            children: [],
            isRoot: true,
          },
        },
        theme: "business",
        editorState: {
          zoom: 1,
          offset: { x: 0, y: 0 },
        },
      },
    ],
  },
  currentFilePath: null,
  viewCenterTrigger: 0,
  history: {
    past: [],
    future: [],
  },

  setMindmap: (data) =>
    updateData(
      set,
      (draft) => {
        // Migration Logic
        if (!data.sheets || data.sheets.length === 0) {
          const legacyData = data as any;
          const newSheetId = uuidv4();

          const sheet: Sheet = {
            id: newSheetId,
            title: "Sheet 1",
            rootId: legacyData.rootId || "root",
            nodes: legacyData.nodes || {},
            theme: legacyData.theme || "default",
            layout: legacyData.layout,
            themeConfig: legacyData.themeConfig,
            editorState: legacyData.editorState || {
              zoom: 1,
              offset: { x: 0, y: 0 },
            },
          };

          draft.version = "0.7.0";
          draft.activeSheetId = newSheetId;
          draft.sheets = [sheet];
        } else {
          // Direct copy, but need to be careful with Immer draft
          // We can't just assign draft = data, we have to copy properties
          draft.version = data.version;
          draft.activeSheetId = data.activeSheetId;
          draft.sheets = data.sheets;
        }

        // Apply layout for the active sheet
        const activeSheet = getActiveSheet(draft);
        if (activeSheet) {
          if (!activeSheet.layout) activeSheet.layout = "logic";
          applyLayout(
            activeSheet.rootId,
            activeSheet.nodes,
            activeSheet.layout,
          );
        }
      },
      { recordHistory: false, triggerViewCenter: true },
    ), // setMindmap resets history effectively by replacing data, but we need to clear history explicitly below

  setFilePath: (path) => set({ currentFilePath: path }),

  // --- Sheet Actions ---

  addSheet: () =>
    updateData(
      set,
      (draft) => {
        const newSheetId = uuidv4();
        const newRootId = uuidv4();
        const newSheet: Sheet = {
          id: newSheetId,
          title: `Sheet ${draft.sheets.length + 1}`,
          rootId: newRootId,
          nodes: {
            [newRootId]: {
              id: newRootId,
              text: "中心主题",
              x: 0,
              y: 0,
              width: 100,
              height: 40,
              children: [],
              isRoot: true,
            },
          },
          theme: "business",
          editorState: { zoom: 1, offset: { x: 0, y: 0 } },
        };

        draft.sheets.push(newSheet);
        draft.activeSheetId = newSheetId;
      },
      { recordHistory: true, triggerViewCenter: true },
    ),

  deleteSheet: (id) =>
    updateData(
      set,
      (draft) => {
        if (draft.sheets.length <= 1) return;

        const index = draft.sheets.findIndex((s) => s.id === id);
        if (index !== -1) {
          draft.sheets.splice(index, 1);

          if (draft.activeSheetId === id) {
            draft.activeSheetId = draft.sheets[Math.max(0, index - 1)].id;
          }
        }
      },
      { recordHistory: true, triggerViewCenter: true },
    ),

  renameSheet: (id, title) =>
    updateData(
      set,
      (draft) => {
        const sheet = draft.sheets.find((s) => s.id === id);
        if (sheet) {
          sheet.title = title;
        }
      },
      { recordHistory: true },
    ),

  reorderSheets: (fromIndex, toIndex) =>
    updateData(
      set,
      (draft) => {
        if (
          fromIndex < 0 ||
          fromIndex >= draft.sheets.length ||
          toIndex < 0 ||
          toIndex >= draft.sheets.length ||
          fromIndex === toIndex
        ) {
          return;
        }

        const [movedSheet] = draft.sheets.splice(fromIndex, 1);
        draft.sheets.splice(toIndex, 0, movedSheet);
      },
      { recordHistory: true },
    ),

  setActiveSheet: (id) =>
    updateData(
      set,
      (draft) => {
        const sheet = draft.sheets.find((s) => s.id === id);
        if (sheet) {
          draft.activeSheetId = id;
          if (!sheet.layout) sheet.layout = "logic";
          applyLayout(sheet.rootId, sheet.nodes, sheet.layout);
        }
      },
      { recordHistory: false, triggerViewCenter: true },
    ),

  // --- Node Actions ---

  undo: () =>
    set((state) => {
      const lastEntry = state.history.past[state.history.past.length - 1];
      if (lastEntry) {
        const nextData = applyPatches(state.data, lastEntry.inversePatches);
        return {
          data: nextData,
          history: {
            past: state.history.past.slice(0, -1),
            future: [...state.history.future, lastEntry],
          },
        };
      }
      return {};
    }),

  redo: () =>
    set((state) => {
      const nextEntry = state.history.future[state.history.future.length - 1];
      if (nextEntry) {
        const nextData = applyPatches(state.data, nextEntry.patches);
        return {
          data: nextData,
          history: {
            past: [...state.history.past, nextEntry],
            future: state.history.future.slice(0, -1),
          },
        };
      }
      return {};
    }),

  updateNodeText: (id, text) =>
    updateData(
      set,
      (draft) => {
        const sheet = getActiveSheet(draft);
        if (sheet && sheet.nodes[id]) {
          const node = sheet.nodes[id];
          node.text = text;

          const theme = THEME_PRESETS[sheet.theme] || THEME_PRESETS.business;
          let baseStyle = theme.secondaryStyle;
          if (node.isRoot) {
            baseStyle = theme.rootStyle;
          } else if (node.parentId === sheet.rootId) {
            baseStyle = theme.primaryStyle;
          }

          const effectiveStyle = { ...baseStyle, ...node.style };
          const { width, height } = measureText(text, effectiveStyle);
          node.width = width;
          node.height = height;

          applyLayout(sheet.rootId, sheet.nodes, sheet.layout || "logic");
        }
      },
      { recordHistory: true },
    ),

  updateNodeStyle: (id, style) =>
    updateData(
      set,
      (draft) => {
        const sheet = getActiveSheet(draft);
        if (sheet && sheet.nodes[id]) {
          sheet.nodes[id].style = {
            ...sheet.nodes[id].style,
            ...style,
          };

          if (style.fontSize || style.shape || style.borderWidth) {
            const node = sheet.nodes[id];
            const theme = THEME_PRESETS[sheet.theme] || THEME_PRESETS.business;
            let baseStyle = theme.secondaryStyle;
            if (node.isRoot) {
              baseStyle = theme.rootStyle;
            } else if (node.parentId === sheet.rootId) {
              baseStyle = theme.primaryStyle;
            }

            const effectiveStyle = { ...baseStyle, ...node.style };
            const { width, height } = measureText(node.text, effectiveStyle);
            node.width = width;
            node.height = height;

            applyLayout(sheet.rootId, sheet.nodes, sheet.layout || "logic");
          }
        }
      },
      { recordHistory: true },
    ),

  addChildNode: (parentId) =>
    updateData(
      set,
      (draft) => {
        const sheet = getActiveSheet(draft);
        if (!sheet) return;

        const parent = sheet.nodes[parentId];
        if (parent) {
          const theme = THEME_PRESETS[sheet.theme] || THEME_PRESETS.business;
          let nodeStyle = theme.secondaryStyle;

          if (parent.isRoot) {
            nodeStyle = theme.primaryStyle;
          }

          const newNode = createNode(parentId, nodeStyle);
          sheet.nodes[newNode.id] = newNode;
          parent.children.push(newNode.id);

          sheet.editorState.selectedId = newNode.id;

          applyLayout(sheet.rootId, sheet.nodes, sheet.layout || "logic");
        }
      },
      { recordHistory: true },
    ),

  addSiblingNode: (siblingId) =>
    updateData(
      set,
      (draft) => {
        const sheet = getActiveSheet(draft);
        if (!sheet) return;

        const sibling = sheet.nodes[siblingId];
        if (sibling && sibling.parentId) {
          const parent = sheet.nodes[sibling.parentId];
          if (parent) {
            const theme = THEME_PRESETS[sheet.theme] || THEME_PRESETS.business;
            let nodeStyle = theme.secondaryStyle;

            if (parent.isRoot) {
              nodeStyle = theme.primaryStyle;
            }

            const newNode = createNode(sibling.parentId, nodeStyle);
            sheet.nodes[newNode.id] = newNode;

            const index = parent.children.indexOf(siblingId);
            if (index !== -1) {
              parent.children.splice(index + 1, 0, newNode.id);
            } else {
              parent.children.push(newNode.id);
            }

            sheet.editorState.selectedId = newNode.id;

            applyLayout(sheet.rootId, sheet.nodes, sheet.layout || "logic");
          }
        }
      },
      { recordHistory: true },
    ),

  deleteNode: (id) =>
    updateData(
      set,
      (draft) => {
        const sheet = getActiveSheet(draft);
        if (!sheet) return;

        const node = sheet.nodes[id];
        if (node && !node.isRoot && node.parentId) {
          const parent = sheet.nodes[node.parentId];
          if (parent) {
            const index = parent.children.indexOf(id);
            if (index !== -1) {
              parent.children.splice(index, 1);
            }

            deleteNodeRecursively(sheet.nodes, id);

            sheet.editorState.selectedId = node.parentId;

            applyLayout(sheet.rootId, sheet.nodes, sheet.layout);
          }
        }
      },
      { recordHistory: true },
    ),

  selectNode: (id) =>
    updateData(
      set,
      (draft) => {
        const sheet = getActiveSheet(draft);
        if (sheet) {
          sheet.editorState.selectedId = id || undefined;
        }
      },
      { recordHistory: false },
    ),

  updateEditorState: (editorState) =>
    updateData(
      set,
      (draft) => {
        const sheet = getActiveSheet(draft);
        if (sheet) {
          Object.assign(sheet.editorState, editorState);
        }
      },
      { recordHistory: false },
    ),

  updateLayout: (layout) =>
    updateData(
      set,
      (draft) => {
        const sheet = getActiveSheet(draft);
        if (sheet) {
          sheet.layout = layout;
          applyLayout(sheet.rootId, sheet.nodes, sheet.layout);
        }
      },
      { recordHistory: false, triggerViewCenter: true },
    ),

  updateTheme: (themeName) =>
    updateData(
      set,
      (draft) => {
        const sheet = getActiveSheet(draft);
        if (!sheet) return;

        const theme = THEME_PRESETS[themeName];
        if (!theme) return;

        sheet.theme = themeName;
        sheet.themeConfig = theme;

        const applyStyle = (nodeId: string, isRoot: boolean) => {
          const node = sheet.nodes[nodeId];
          if (!node) return;

          if (isRoot) {
            node.style = { ...theme.rootStyle };
          } else if (node.parentId === sheet.rootId) {
            node.style = { ...theme.primaryStyle };
          } else {
            node.style = { ...theme.secondaryStyle };
          }

          const { width, height } = measureText(node.text, node.style);
          node.width = width;
          node.height = height;

          node.children.forEach((childId) => applyStyle(childId, false));
        };

        applyStyle(sheet.rootId, true);
        applyLayout(sheet.rootId, sheet.nodes, sheet.layout || "logic");
      },
      { recordHistory: false },
    ), // Keeping consistent with previous behavior

  moveNode: (id, targetParentId) =>
    updateData(
      set,
      (draft) => {
        const sheet = getActiveSheet(draft);
        if (!sheet) return;

        // Validation
        if (id === targetParentId) return;
        const node = sheet.nodes[id];
        const targetParent = sheet.nodes[targetParentId];
        if (!node || !targetParent) return;
        if (node.parentId === targetParentId) return;
        if (node.isRoot) return;

        // Cycle detection
        let currentId = targetParentId;
        let isCycle = false;
        while (currentId && sheet.nodes[currentId]) {
          if (currentId === id) {
            isCycle = true;
            break;
          }
          if (sheet.nodes[currentId].isRoot) break;
          currentId = sheet.nodes[currentId].parentId || "";
        }
        if (isCycle) return;

        // 1. Remove from old parent
        if (node.parentId) {
          const oldParent = sheet.nodes[node.parentId];
          if (oldParent) {
            const idx = oldParent.children.indexOf(id);
            if (idx !== -1) oldParent.children.splice(idx, 1);
          }
        }

        // 2. Add to new parent
        targetParent.children.push(id);
        node.parentId = targetParentId;

        // 3. Update Styles
        const theme = THEME_PRESETS[sheet.theme] || THEME_PRESETS.business;

        const updateStylesRecursively = (
          nId: string,
          isChildOfRoot: boolean,
        ) => {
          const n = sheet.nodes[nId];
          if (!n) return;

          const newStyleBase = isChildOfRoot
            ? theme.primaryStyle
            : theme.secondaryStyle;

          n.style = {
            ...n.style,
            fontSize: newStyleBase.fontSize,
          };

          const { width, height } = measureText(n.text, n.style);
          n.width = width;
          n.height = height;

          n.children.forEach((cId) => updateStylesRecursively(cId, false));
        };

        updateStylesRecursively(id, !!targetParent.isRoot);

        // 4. Layout
        applyLayout(sheet.rootId, sheet.nodes, sheet.layout || "logic");
      },
      { recordHistory: true },
    ),
}));
