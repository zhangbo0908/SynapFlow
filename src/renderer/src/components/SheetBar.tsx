import React, { useState, useEffect, useRef } from 'react';
import { useMindmapStore } from '../store/useMindmapStore';
import clsx from 'clsx';

const SheetBar: React.FC = () => {
  const sheets = useMindmapStore(state => state.data.sheets);
  const activeSheetId = useMindmapStore(state => state.data.activeSheetId);
  const setActiveSheet = useMindmapStore(state => state.setActiveSheet);
  const addSheet = useMindmapStore(state => state.addSheet);
  const deleteSheet = useMindmapStore(state => state.deleteSheet);
  const renameSheet = useMindmapStore(state => state.renameSheet);
  
  const activeSheet = sheets?.find(s => s.id === activeSheetId);
  const nodeCount = activeSheet ? Object.keys(activeSheet.nodes).length : 0;
  const zoomLevel = activeSheet ? Math.round(activeSheet.editorState.zoom * 100) : 100;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sheetId: string } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
    setContextMenu(null); // Close context menu if open
  };

  const handleFinishEdit = () => {
    if (editingId && editValue.trim()) {
      renameSheet(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };
  
  const handleContextMenu = (e: React.MouseEvent, sheetId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, sheetId });
  };
  
  const handleDeleteSheet = (id: string, title: string) => {
     if (sheets.length <= 1) return;
     if (confirm(`Are you sure you want to delete "${title}"?`)) {
        deleteSheet(id);
     }
     setContextMenu(null);
  };

  if (!sheets) return null;

  return (
    <div className="h-8 bg-canvas border-t border-ui-border flex items-center px-2 select-none justify-between shrink-0 relative transition-colors duration-200">
      <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar flex-1 mr-4">
        {sheets.map(sheet => (
          <div
            key={sheet.id}
            className={clsx(
              "group relative flex items-center px-3 py-1 rounded-t text-xs cursor-pointer border-b-2 transition-colors min-w-[80px] justify-center",
              sheet.id === activeSheetId
                ? "bg-panel border-brand text-brand font-medium shadow-sm"
                : "bg-panel-hover border-transparent text-ui-secondary hover:bg-panel"
            )}
            onClick={() => setActiveSheet(sheet.id)}
            onDoubleClick={() => handleStartEdit(sheet.id, sheet.title)}
            onContextMenu={(e) => handleContextMenu(e, sheet.id)}
          >
            {editingId === sheet.id ? (
              <input
                autoFocus
                className="w-16 px-1 py-0 text-xs bg-panel text-ui-primary border border-ui-border rounded outline-none focus:ring-1 focus:ring-brand"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={handleFinishEdit}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span>{sheet.title}</span>
            )}
          </div>
        ))}
        
        <button 
          onClick={addSheet}
          className="p-1 hover:bg-panel-hover rounded text-ui-secondary hover:text-ui-primary w-6 h-6 flex items-center justify-center transition-colors"
          title="New Sheet"
        >
          +
        </button>
      </div>

      <div className="flex items-center space-x-4 text-xs text-ui-secondary whitespace-nowrap">
        <div>Nodes: {nodeCount}</div>
        <div>Zoom: {zoomLevel}%</div>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <div 
            ref={contextMenuRef}
            className="absolute bg-panel border border-ui-border rounded shadow-lg py-1 z-50 min-w-[120px]"
            style={{ left: contextMenu.x, top: contextMenu.y - 40 }} // Adjust position to be visible
        >
            <button 
                className="w-full text-left px-4 py-1 hover:bg-panel-hover text-ui-primary text-xs transition-colors"
                onClick={() => {
                    const sheet = sheets.find(s => s.id === contextMenu.sheetId);
                    if (sheet) handleStartEdit(sheet.id, sheet.title);
                }}
            >
                Rename
            </button>
            <button 
                className={clsx(
                    "w-full text-left px-4 py-1 hover:bg-panel-hover text-xs transition-colors",
                    sheets.length <= 1 ? "text-ui-secondary opacity-50 cursor-not-allowed" : "text-red-600"
                )}
                onClick={() => {
                    const sheet = sheets.find(s => s.id === contextMenu.sheetId);
                    if (sheet) handleDeleteSheet(sheet.id, sheet.title);
                }}
                disabled={sheets.length <= 1}
            >
                Delete
            </button>
        </div>
      )}
    </div>
  );
};

export default SheetBar;
