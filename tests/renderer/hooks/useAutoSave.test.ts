// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../../../src/renderer/src/hooks/useAutoSave';
import { useMindmapStore } from '../../../src/renderer/src/store/useMindmapStore';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { produce } from 'immer';

// Mock window.api
const mockSave = vi.fn().mockResolvedValue({ success: true, filePath: 'test.synap' });
window.api = {
  file: {
    open: vi.fn(),
    save: mockSave,
    importXMind: vi.fn(),
    saveMarkdown: vi.fn(),
    saveImage: vi.fn(),
    savePdf: vi.fn()
  },
  app: {
    getRecentFiles: vi.fn().mockResolvedValue([])
  },
  user: {
    getPreferences: vi.fn().mockResolvedValue({ recentFiles: [], hasCompletedOnboarding: true }),
    updatePreferences: vi.fn().mockResolvedValue(undefined)
  }
} as any;

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSave.mockClear();
    
    // Reset store
    useMindmapStore.setState({
      data: {
        version: '0.7.0',
        sheets: [{
            id: 'sheet-1',
            title: 'Sheet 1',
            rootId: 'root',
            nodes: { root: { id: 'root', text: 'Initial', x:0, y:0, width:100, height:40, children:[], isRoot:true } },
            theme: 'default',
            editorState: { zoom: 1, offset: { x: 0, y: 0 } }
        }],
        activeSheetId: 'sheet-1',
        // Legacy fields
        rootId: 'root', nodes: {}, editorState: { zoom: 1, offset: { x: 0, y: 0 } }
      },
      currentFilePath: null
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not auto-save if no file path is set', () => {
    renderHook(() => useAutoSave());
    
    // Change data
    act(() => {
      useMindmapStore.setState(produce((state) => {
        const sheet = state.data.sheets.find(s => s.id === state.data.activeSheetId);
        if (sheet && sheet.nodes.root) {
            sheet.nodes.root.text = 'Changed';
        }
      }));
    });

    // Advance timer
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockSave).not.toHaveBeenCalled();
    // expect(result.current.isSaving).toBe(false);
  });

  it('should auto-save when file path is set and data changes', async () => {
    // Set file path
    useMindmapStore.setState({ currentFilePath: '/path/to/file.synap' });
    
    const { result } = renderHook(() => useAutoSave());

    // Change data
    act(() => {
      useMindmapStore.setState(produce((state) => {
        const sheet = state.data.sheets.find(s => s.id === state.data.activeSheetId);
        if (sheet && sheet.nodes.root) {
            sheet.nodes.root.text = 'Changed';
        }
      }));
    });

    expect(result.current.isSaving).toBe(true);

    // Advance timer
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockSave).toHaveBeenCalled();
    expect(result.current.isSaving).toBe(false);
  });

  it('should debounce save requests', async () => {
    useMindmapStore.setState({ currentFilePath: '/path/to/file.synap' });
    
    renderHook(() => useAutoSave());

    // Change 1
    act(() => {
      useMindmapStore.setState(produce((state) => {
        const sheet = state.data.sheets.find(s => s.id === state.data.activeSheetId);
        if (sheet) sheet.theme = 'dark';
      }));
    });

    // Advance 1s (less than 2s debounce)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockSave).not.toHaveBeenCalled();

    // Change 2
    act(() => {
      useMindmapStore.setState(produce((state) => {
        const sheet = state.data.sheets.find(s => s.id === state.data.activeSheetId);
        if (sheet) sheet.theme = 'classic';
      }));
    });

    // Advance 2s more
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});
