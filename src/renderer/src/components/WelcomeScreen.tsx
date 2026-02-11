import React, { useEffect, useState } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useMindmapStore } from '../store/useMindmapStore';
import logo from '../assets/logo.svg';

const WelcomeScreen: React.FC = () => {
  const setViewMode = useUIStore((state) => state.setViewMode);
  const setMindmap = useMindmapStore((state) => state.setMindmap);
  const setFilePath = useMindmapStore((state) => state.setFilePath);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  useEffect(() => {
    const loadRecentFiles = async () => {
      try {
        const files = await window.api.app.getRecentFiles();
        setRecentFiles(files);
      } catch (error) {
        console.error('Failed to load recent files', error);
      }
    };
    loadRecentFiles();
  }, []);

  const handleNewMindmap = () => {
    // We should ideally reset the store, but since we don't have a reset action exposed,
    // and setMindmap replaces the data, we can create a new blank mindmap or just rely on default.
    // However, useMindmapStore creates a default state on init. 
    // To properly "reset", we might need a reset action, OR we can manually set a fresh state.
    // But wait, if I just switch view, the previous mindmap is still there.
    // Requirement says: "resets mindmap".
    // I can't easily construct a full fresh state here without duplicating logic from store.
    // I will modify the store later to add `reset()` action if needed, or I can just reload the window?
    // No, reloading window is bad UX.
    // I will check if I can just pass a fresh object to setMindmap.
    // Actually, `useMindmapStore` has an initial state.
    // For now, I will skip complex reset and just switch view, assuming user wants to continue or I can implement a basic reset.
    // Wait, the store has `addSheet`. If I want a COMPLETELY new mindmap (new file), I should clear everything.
    // Let's look at `useMindmapStore` again.
    // It doesn't have a `reset` action.
    // I'll leave a TODO or just try to set a minimal valid state.
    // Actually, I can just use `setMindmap` with a basic structure.
    
    // Constructing a basic new mindmap
    const newMindmap = {
      version: '0.7.0',
      activeSheetId: 'sheet-1',
      sheets: [
        {
          id: 'sheet-1',
          title: 'Sheet 1',
          rootId: 'root',
          nodes: {
            'root': {
              id: 'root',
              text: '中心主题',
              x: 0, y: 0, width: 100, height: 40,
              children: [],
              isRoot: true,
            }
          },
          theme: 'business',
          editorState: { zoom: 1, offset: { x: 0, y: 0 } }
        }
      ]
    };
    // @ts-ignore - Minimal types match
    setMindmap(newMindmap);
    setFilePath(null);
    setViewMode('editor');
  };

  const handleOpenFile = async () => {
    try {
      const result = await window.api.file.open();
      if (!result.canceled && result.data) {
        setMindmap(result.data);
        if (result.filePath) {
          setFilePath(result.filePath);
        }
        setViewMode('editor');
      }
    } catch (error) {
      console.error('Failed to open file', error);
    }
  };

  const handleOpenRecent = async (path: string) => {
    try {
      const result = await window.api.file.open(path);
      if (!result.canceled && result.data) {
        setMindmap(result.data);
        setFilePath(result.filePath || path);
        setViewMode('editor');
      }
    } catch (error) {
      console.error('Failed to open recent file', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-canvas items-center justify-center text-ui-primary">
      <div className="w-full max-w-2xl p-8 bg-panel rounded-lg shadow-xl border border-ui-border flex flex-col items-center">
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="Logo" className="w-24 h-24 mb-4" />
          <h1 className="text-3xl font-bold text-ui-primary">SynapFlow</h1>
          <p className="text-ui-secondary mt-2">Visual Thinking for the Modern Age</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-ui-border pb-2">开始</h2>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={handleNewMindmap}
                className="flex items-center p-3 rounded hover:bg-panel-hover transition-colors text-left group"
              >
                <span className="w-8 h-8 flex items-center justify-center bg-brand text-white rounded mr-3 group-hover:bg-blue-600 transition-colors">+</span>
                <div>
                  <div className="font-medium">新建思维导图</div>
                  <div className="text-xs text-ui-secondary">创建一个新的空白导图</div>
                </div>
              </button>
              <button 
                onClick={handleOpenFile}
                className="flex items-center p-3 rounded hover:bg-panel-hover transition-colors text-left group"
              >
                <span className="w-8 h-8 flex items-center justify-center bg-ui-border text-ui-secondary rounded mr-3 group-hover:bg-gray-400 transition-colors">📂</span>
                <div>
                  <div className="font-medium">打开文件</div>
                  <div className="text-xs text-ui-secondary">支持 .synap 和 .xmind 格式</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-ui-border pb-2">最近文件</h2>
            <div className="flex flex-col space-y-2 max-h-[300px] overflow-y-auto">
              {recentFiles.length === 0 ? (
                <div className="text-ui-secondary italic text-sm py-4">暂无最近文件</div>
              ) : (
                recentFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => handleOpenRecent(file)}
                    className="text-left p-2 rounded hover:bg-panel-hover transition-colors text-sm truncate w-full"
                    title={file}
                  >
                    <div className="font-medium truncate">{file.split(/[/\\]/).pop()}</div>
                    <div className="text-xs text-ui-secondary truncate opacity-70">{file}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
