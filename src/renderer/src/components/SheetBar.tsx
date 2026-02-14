import React, { useState, useEffect, useRef } from "react";
import { useMindmapStore } from "../store/useMindmapStore";
import clsx from "clsx";

const SheetBar: React.FC = () => {
  const sheets = useMindmapStore((state) => state.data.sheets);
  const activeSheetId = useMindmapStore((state) => state.data.activeSheetId);
  const setActiveSheet = useMindmapStore((state) => state.setActiveSheet);
  const addSheet = useMindmapStore((state) => state.addSheet);
  const deleteSheet = useMindmapStore((state) => state.deleteSheet);
  const renameSheet = useMindmapStore((state) => state.renameSheet);
  const reorderSheets = useMindmapStore((state) => state.reorderSheets);

  const activeSheet = sheets?.find((s) => s.id === activeSheetId);
  const nodeCount = activeSheet ? Object.keys(activeSheet.nodes).length : 0;
  const zoomLevel = activeSheet
    ? Math.round(activeSheet.editorState.zoom * 100)
    : 100;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    sheetId: string;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    if (e.key === "Enter") {
      handleFinishEdit();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, sheetId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, sheetId });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("sheetIndex", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("sheetIndex"), 10);
    if (!isNaN(fromIndex) && fromIndex !== targetIndex) {
      reorderSheets(fromIndex, targetIndex);
    }
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
    <div className="flex items-center h-10 px-2 border-t bg-panel border-ui-border select-none shrink-0 relative transition-colors duration-200 justify-between">
      <div className="flex items-center flex-1 space-x-1 overflow-x-auto no-scrollbar mr-4">
        {sheets.map((sheet, index) => (
          <div
            key={sheet.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => setActiveSheet(sheet.id)}
            onDoubleClick={() => handleStartEdit(sheet.id, sheet.title)}
            onContextMenu={(e) => handleContextMenu(e, sheet.id)}
            className={clsx(
              "group relative flex items-center px-4 py-1 space-x-2 text-sm transition-all duration-200 cursor-pointer rounded-t-md border-b-2 min-w-[80px] justify-center",
              sheet.id === activeSheetId
                ? "bg-app text-brand border-brand font-medium shadow-sm"
                : "text-ui-secondary border-transparent hover:bg-panel-hover hover:text-ui-primary"
            )}
          >
            {editingId === sheet.id ? (
              <input
                autoFocus
                className="w-16 px-1 py-0 text-xs bg-panel text-ui-primary border border-ui-border rounded outline-none focus:ring-1 focus:ring-brand"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleFinishEdit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate max-w-[120px]">{sheet.title}</span>
            )}
          </div>
        ))}
        <button
          onClick={addSheet}
          className="p-1.5 transition-colors rounded-md text-ui-secondary hover:bg-panel-hover hover:text-brand flex items-center justify-center"
          title="新建工作表"
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
              const sheet = sheets.find((s) => s.id === contextMenu.sheetId);
              if (sheet) handleStartEdit(sheet.id, sheet.title);
            }}
          >
            Rename
          </button>
          <button
            className={clsx(
              "w-full text-left px-4 py-1 hover:bg-panel-hover text-xs transition-colors",
              sheets.length <= 1
                ? "text-ui-secondary opacity-50 cursor-not-allowed"
                : "text-red-600",
            )}
            onClick={() => {
              const sheet = sheets.find((s) => s.id === contextMenu.sheetId);
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
