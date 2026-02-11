export interface NodeStyle {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  fontSize?: number;
  shape?: 'rectangle' | 'rounded' | 'ellipse' | 'diamond' | 'capsule' | 'hexagon' | 'cloud' | 'underline';
  lineStyle?: 'straight' | 'bezier' | 'step';
}

export interface MindmapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: string[]; // IDs of children
  parentId?: string;
  isRoot?: boolean;
  style?: NodeStyle;
}

export interface ThemeConfig {
  name: string;
  rootStyle: Partial<NodeStyle>;
  primaryStyle: Partial<NodeStyle>;
  secondaryStyle: Partial<NodeStyle>;
  lineStyle: 'straight' | 'bezier' | 'step';
  backgroundColor: string;
  palette?: string[];
}

export type LayoutType = 'logic' | 'mindmap' | 'orgChart';

export interface Sheet {
  id: string;
  title: string;
  rootId: string;
  nodes: Record<string, MindmapNode>;
  theme: string;
  layout?: LayoutType;
  themeConfig?: ThemeConfig;
  editorState: {
    zoom: number;
    offset: { x: number; y: number };
    selectedId?: string;
  };
}

export interface LocalMindmap {
  version: string;
  sheets: Sheet[];
  activeSheetId: string;
  // Legacy fields kept for backward compatibility during migration
  rootId?: string;
  nodes?: Record<string, MindmapNode>;
  theme?: string;
  layout?: LayoutType;
  themeConfig?: ThemeConfig;
  editorState?: {
    zoom: number;
    offset: { x: number; y: number };
    selectedId?: string;
  };
}

export interface FileAPI {
  open: (filePath?: string) => Promise<{ canceled: boolean; data?: LocalMindmap; filePath?: string }>;
  save: (data: LocalMindmap, filePath?: string) => Promise<{ success: boolean; filePath?: string }>;
  saveMarkdown: (content: string) => Promise<{ success: boolean; filePath?: string }>;
  saveImage: (dataUrl: string, format: 'png' | 'jpeg') => Promise<{ success: boolean; filePath?: string }>;
  savePdf: (data: ArrayBuffer) => Promise<{ success: boolean; filePath?: string }>;
  importXMind: () => Promise<{ canceled: boolean; data?: LocalMindmap; filePath?: string; error?: string }>;
}

export interface UserPreferences {
  recentFiles: string[];
  hasCompletedOnboarding: boolean;
  theme?: string; // Optional: persist last used theme
}

export interface AppAPI {
  file: FileAPI;
  app: {
    getRecentFiles: () => Promise<string[]>;
  };
  user: {
    getPreferences: () => Promise<UserPreferences>;
    updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  };
}

declare global {
  interface Window {
    api: AppAPI;
  }
}
