import { create } from 'zustand';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { LocalMindmap, MindmapNode, NodeStyle, LayoutType, Sheet } from '../../../shared/types';
import { applyLayout } from '../utils/layoutEngine';
import { THEME_PRESETS } from '../utils/themePresets';
import { measureText } from '../utils/measureText';

interface MindmapState {
  data: LocalMindmap;
  currentFilePath: string | null;
  viewCenterTrigger: number; // Increment to trigger view centering
  history: {
    past: LocalMindmap[];
    future: LocalMindmap[];
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
  updateEditorState: (state: Partial<Sheet['editorState']>) => void;
  undo: () => void;
  redo: () => void;
  updateLayout: (layout: LayoutType) => void;
  updateTheme: (themeName: string) => void;
  moveNode: (id: string, targetParentId: string) => void;
}

const createNode = (parentId: string, style: Partial<NodeStyle> = {}): MindmapNode => {
  const text = '分支主题';
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
    style: Object.keys(style).length > 0 ? style : undefined
  };
};

// Helper to recursively delete nodes
const deleteNodeRecursively = (nodes: Record<string, MindmapNode>, id: string) => {
  const node = nodes[id];
  if (!node) return;
  
  // Recursively delete children
  node.children.forEach(childId => {
    deleteNodeRecursively(nodes, childId);
  });
  
  // Delete self
  delete nodes[id];
};

// Helper to get active sheet from state (for internal use within produce)
const getActiveSheet = (state: LocalMindmap): Sheet | undefined => {
  if (!state.sheets) return undefined;
  return state.sheets.find(s => s.id === state.activeSheetId);
};

// Initial State Setup
const initialSheetId = 'sheet-1';
const initialRootId = 'root';

export const useMindmapStore = create<MindmapState>((set) => ({
  data: {
    version: '0.7.0',
    activeSheetId: initialSheetId,
    sheets: [
      {
        id: initialSheetId,
        title: 'Sheet 1',
        rootId: initialRootId,
        nodes: {
          [initialRootId]: {
            id: initialRootId,
            text: '中心主题',
            x: 0,
            y: 0,
            width: 100,
            height: 40,
            children: [],
            isRoot: true,
          },
        },
        theme: 'business',
        editorState: {
          zoom: 1,
          offset: { x: 0, y: 0 },
        },
      }
    ],
  },
  currentFilePath: null,
  viewCenterTrigger: 0,
  history: {
    past: [],
    future: [],
  },
  
  setMindmap: (data) => set(produce((state: MindmapState) => {
    // Migration Logic: If loading old format (no sheets), wrap it
    if (!data.sheets || data.sheets.length === 0) {
      const legacyData = data as any;
      const newSheetId = uuidv4();
      
      // Construct a sheet from legacy data
      const sheet: Sheet = {
        id: newSheetId,
        title: 'Sheet 1',
        rootId: legacyData.rootId || 'root',
        nodes: legacyData.nodes || {},
        theme: legacyData.theme || 'default',
        layout: legacyData.layout,
        themeConfig: legacyData.themeConfig,
        editorState: legacyData.editorState || { zoom: 1, offset: { x: 0, y: 0 } }
      };

      state.data = {
        version: '0.7.0',
        activeSheetId: newSheetId,
        sheets: [sheet],
        // Keep legacy fields if needed, or just overwrite
      };
    } else {
      state.data = data;
    }

    state.history = { past: [], future: [] };
    state.viewCenterTrigger += 1;
    
    // Apply layout for the active sheet
    const activeSheet = getActiveSheet(state.data);
    if (activeSheet) {
      if (!activeSheet.layout) activeSheet.layout = 'logic';
      applyLayout(activeSheet.rootId, activeSheet.nodes, activeSheet.layout);
    }
  })),

  setFilePath: (path) => set({ currentFilePath: path }),

  // --- Sheet Actions ---

  addSheet: () => set(produce((state: MindmapState) => {
    state.history.past.push(JSON.parse(JSON.stringify(state.data)));
    state.history.future = [];

    const newSheetId = uuidv4();
    const newRootId = uuidv4();
    const newSheet: Sheet = {
      id: newSheetId,
      title: `Sheet ${state.data.sheets.length + 1}`,
      rootId: newRootId,
      nodes: {
        [newRootId]: {
          id: newRootId,
          text: '中心主题',
          x: 0,
          y: 0,
          width: 100,
          height: 40,
          children: [],
          isRoot: true,
        }
      },
      theme: 'business',
      editorState: { zoom: 1, offset: { x: 0, y: 0 } }
    };
    
    state.data.sheets.push(newSheet);
    state.data.activeSheetId = newSheetId;
    state.viewCenterTrigger += 1;
  })),

  deleteSheet: (id) => set(produce((state: MindmapState) => {
    if (state.data.sheets.length <= 1) return; // Prevent deleting last sheet

    state.history.past.push(JSON.parse(JSON.stringify(state.data)));
    state.history.future = [];

    const index = state.data.sheets.findIndex(s => s.id === id);
    if (index !== -1) {
      state.data.sheets.splice(index, 1);
      
      // If we deleted the active sheet, switch to another one
      if (state.data.activeSheetId === id) {
        state.data.activeSheetId = state.data.sheets[Math.max(0, index - 1)].id;
        state.viewCenterTrigger += 1;
      }
    }
  })),

  renameSheet: (id, title) => set(produce((state: MindmapState) => {
    const sheet = state.data.sheets.find(s => s.id === id);
    if (sheet) {
      // Not pushing history for simple rename? Or maybe we should?
      // Let's push history for consistency
      state.history.past.push(JSON.parse(JSON.stringify(state.data)));
      state.history.future = [];
      sheet.title = title;
    }
  })),

  reorderSheets: (fromIndex, toIndex) => set(produce((state: MindmapState) => {
    if (fromIndex < 0 || fromIndex >= state.data.sheets.length || 
        toIndex < 0 || toIndex >= state.data.sheets.length || 
        fromIndex === toIndex) {
      return;
    }

    state.history.past.push(JSON.parse(JSON.stringify(state.data)));
    state.history.future = [];

    const [movedSheet] = state.data.sheets.splice(fromIndex, 1);
    state.data.sheets.splice(toIndex, 0, movedSheet);
  })),

  setActiveSheet: (id) => set(produce((state: MindmapState) => {
    const sheet = state.data.sheets.find(s => s.id === id);
    if (sheet) {
      state.data.activeSheetId = id;
      // Ensure layout is applied when switching sheets, especially for imported files
      // where background sheets might not have been laid out yet.
      if (!sheet.layout) sheet.layout = 'logic';
      applyLayout(sheet.rootId, sheet.nodes, sheet.layout);
      state.viewCenterTrigger += 1;
    }
  })),

  // --- Node Actions ---
  
  undo: () => set(produce((state: MindmapState) => {
    const previous = state.history.past.pop();
    if (previous) {
      state.history.future.push(JSON.parse(JSON.stringify(state.data)));
      state.data = previous;
    }
  })),

  redo: () => set(produce((state: MindmapState) => {
    const next = state.history.future.pop();
    if (next) {
      state.history.past.push(JSON.parse(JSON.stringify(state.data)));
      state.data = next;
    }
  })),
  
  updateNodeText: (id, text) => set(produce((state: MindmapState) => {
    const sheet = getActiveSheet(state.data);
    if (sheet && sheet.nodes[id]) {
      state.history.past.push(JSON.parse(JSON.stringify(state.data)));
      if (state.history.past.length > 20) state.history.past.shift();
      state.history.future = [];

      const node = sheet.nodes[id];
      node.text = text;
      
      // Recalculate size
      const theme = THEME_PRESETS[sheet.theme] || THEME_PRESETS.business;
      // Simple logic to determine level style
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
      
      applyLayout(sheet.rootId, sheet.nodes, sheet.layout || 'logic');
    }
  })),

  updateNodeStyle: (id, style) => set(produce((state: MindmapState) => {
    const sheet = getActiveSheet(state.data);
    if (sheet && sheet.nodes[id]) {
      state.history.past.push(JSON.parse(JSON.stringify(state.data)));
      if (state.history.past.length > 20) state.history.past.shift();
      state.history.future = [];

      sheet.nodes[id].style = {
        ...sheet.nodes[id].style,
        ...style
      };
      
      // Recalculate size if style affects dimensions
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
        
        applyLayout(sheet.rootId, sheet.nodes, sheet.layout || 'logic');
      }
    }
  })),
  
  addChildNode: (parentId) => set(produce((state: MindmapState) => {
    const sheet = getActiveSheet(state.data);
    if (!sheet) return;

    const parent = sheet.nodes[parentId];
    if (parent) {
      state.history.past.push(JSON.parse(JSON.stringify(state.data)));
      if (state.history.past.length > 20) state.history.past.shift();
      state.history.future = [];

      // Determine style for new node based on theme and level
      const theme = THEME_PRESETS[sheet.theme] || THEME_PRESETS.business;
      let nodeStyle = theme.secondaryStyle; // Default for deeper levels
      
      // If parent is root, this is a primary node
      if (parent.isRoot) {
        nodeStyle = theme.primaryStyle;
      }
      
      const newNode = createNode(parentId, nodeStyle);
      sheet.nodes[newNode.id] = newNode;
      parent.children.push(newNode.id);
      
      sheet.editorState.selectedId = newNode.id;
      
      applyLayout(sheet.rootId, sheet.nodes, sheet.layout || 'logic');
    }
  })),
  
  addSiblingNode: (siblingId) => set(produce((state: MindmapState) => {
    const sheet = getActiveSheet(state.data);
    if (!sheet) return;

    const sibling = sheet.nodes[siblingId];
    if (sibling && sibling.parentId) {
      const parent = sheet.nodes[sibling.parentId];
      if (parent) {
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));
        if (state.history.past.length > 20) state.history.past.shift();
        state.history.future = [];

        // Determine style for new node based on theme and level
        const theme = THEME_PRESETS[sheet.theme] || THEME_PRESETS.business;
        let nodeStyle = theme.secondaryStyle;
        
        // If parent is root, this is a primary node
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
        
        applyLayout(sheet.rootId, sheet.nodes, sheet.layout || 'logic');
      }
    }
  })),
  
  deleteNode: (id) => set(produce((state: MindmapState) => {
    const sheet = getActiveSheet(state.data);
    if (!sheet) return;

    const node = sheet.nodes[id];
    if (node && !node.isRoot && node.parentId) {
      const parent = sheet.nodes[node.parentId];
      if (parent) {
        state.history.past.push(JSON.parse(JSON.stringify(state.data)));
        if (state.history.past.length > 20) state.history.past.shift();
        state.history.future = [];

        const index = parent.children.indexOf(id);
        if (index !== -1) {
          parent.children.splice(index, 1);
        }
        
        deleteNodeRecursively(sheet.nodes, id);
        
        sheet.editorState.selectedId = node.parentId;
        
        applyLayout(sheet.rootId, sheet.nodes, sheet.layout);
      }
    }
  })),
  
  selectNode: (id) => set(produce((state: MindmapState) => {
    const sheet = getActiveSheet(state.data);
    if (sheet) {
      sheet.editorState.selectedId = id || undefined;
    }
  })),
  
  updateEditorState: (editorState) => set(produce((state: MindmapState) => {
    const sheet = getActiveSheet(state.data);
    if (sheet) {
      Object.assign(sheet.editorState, editorState);
    }
  })),

  updateLayout: (layout) => set(produce((state: MindmapState) => {
    const sheet = getActiveSheet(state.data);
    if (sheet) {
      sheet.layout = layout;
      applyLayout(sheet.rootId, sheet.nodes, sheet.layout);
      state.viewCenterTrigger += 1;
    }
  })),

  updateTheme: (themeName) => set(produce((state: MindmapState) => {
    const sheet = getActiveSheet(state.data);
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
      
      // Recalculate size
      const { width, height } = measureText(node.text, node.style);
      node.width = width;
      node.height = height;

      node.children.forEach(childId => applyStyle(childId, false));
    };

    applyStyle(sheet.rootId, true);
    applyLayout(sheet.rootId, sheet.nodes, sheet.layout || 'logic');
  })),

  moveNode: (id, targetParentId) => set(produce((state: MindmapState) => {
    const sheet = getActiveSheet(state.data);
    if (!sheet) return;
    
    // Validation
    if (id === targetParentId) return; // Can't move to self
    const node = sheet.nodes[id];
    const targetParent = sheet.nodes[targetParentId];
    if (!node || !targetParent) return;
    if (node.parentId === targetParentId) return; // Already there
    if (node.isRoot) return; // Can't move root

    // Cycle detection: Check if targetParentId is a descendant of id
    let currentId = targetParentId;
    let isCycle = false;
    while (currentId && sheet.nodes[currentId]) {
        if (currentId === id) {
            isCycle = true;
            break;
        }
        // Move up
        if (sheet.nodes[currentId].isRoot) break;
        currentId = sheet.nodes[currentId].parentId || '';
    }
    if (isCycle) return;

    // Proceed with move
    state.history.past.push(JSON.parse(JSON.stringify(state.data)));
    if (state.history.past.length > 20) state.history.past.shift();
    state.history.future = [];

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

    // 3. Update Styles based on new level
    const theme = THEME_PRESETS[sheet.theme] || THEME_PRESETS.business;
    
    const updateStylesRecursively = (nId: string, isChildOfRoot: boolean) => {
        const n = sheet.nodes[nId];
        if (!n) return;
        
        let newStyleBase = isChildOfRoot ? theme.primaryStyle : theme.secondaryStyle;
        
        // Update structural styles from theme, keep others if needed
        n.style = { 
          ...n.style,
          fontSize: newStyleBase.fontSize,
          // Remove paddingX/Y as they are not in NodeStyle
        };
        
        const { width, height } = measureText(n.text, n.style);
        n.width = width;
        n.height = height;

        n.children.forEach(cId => updateStylesRecursively(cId, false));
    }

    updateStylesRecursively(id, !!targetParent.isRoot);

    // 4. Layout
    applyLayout(sheet.rootId, sheet.nodes, sheet.layout || 'logic');
  })),
}));
