import React, { useRef, useEffect, useState } from 'react'
import { useMindmapStore } from '../store/useMindmapStore'
import MindmapRenderer from './MindmapRenderer'

const CanvasWorkspace: React.FC = () => {
  const activeSheet = useMindmapStore(state => state.data.sheets?.find(s => s.id === state.data.activeSheetId));
  const viewCenterTrigger = useMindmapStore(state => state.viewCenterTrigger)
  const updateEditorState = useMindmapStore(state => state.updateEditorState)
  const addChildNode = useMindmapStore(state => state.addChildNode)
  const addSiblingNode = useMindmapStore(state => state.addSiblingNode)
  const deleteNode = useMindmapStore(state => state.deleteNode)
  const undo = useMindmapStore(state => state.undo)
  const redo = useMindmapStore(state => state.redo)
  const moveNode = useMindmapStore(state => state.moveNode)
  
  const [isPanning, setIsPanning] = useState(false)
  const [dragState, setDragState] = useState<{
    isDraggingNode: boolean;
    dragNodeId: string | null;
    ghostPos: { x: number; y: number };
    dropTargetId: string | null;
  }>({
    isDraggingNode: false,
    dragNodeId: null,
    ghostPos: { x: 0, y: 0 },
    dropTargetId: null
  });

  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const updateSize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  // Calculate center offset on mount or when file changes (triggered by viewCenterTrigger)
  useEffect(() => {
    if (activeSheet && activeSheet.nodes[activeSheet.rootId] && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current
      const rootNode = activeSheet.nodes[activeSheet.rootId]
      
      // Reset zoom to 1 when opening new file (optional but good for UX)
      // For now we just center the root node.
      // If we want to keep current zoom, use activeSheet.editorState.zoom
      // But typically "Open File" -> "Fit to Screen" or "Center at 100%"
      const zoom = 1;

      updateEditorState({
        zoom,
        offset: {
          x: clientWidth / 2 - (rootNode.width * zoom) / 2 - (rootNode.x * zoom),
          y: clientHeight / 2 - (rootNode.height * zoom) / 2 - (rootNode.y * zoom)
        }
      })
    }
  }, [viewCenterTrigger])

  if (!activeSheet) return <div className="flex h-screen items-center justify-center text-ui-secondary">No Document Opened</div>

  const { zoom, offset, selectedId } = activeSheet.editorState

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          redo()
        } else {
          e.preventDefault()
          undo()
        }
        return
      }
      
      // Ignore if input is focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      if (!selectedId) return

      switch (e.key) {
        case 'Tab':
          e.preventDefault() // Prevent focus change
          addChildNode(selectedId)
          break
        case 'Enter':
          e.preventDefault()
          addSiblingNode(selectedId)
          break
        case 'Backspace':
        case 'Delete':
          deleteNode(selectedId)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, addChildNode, addSiblingNode, deleteNode, undo, redo])

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = 0.1
      const delta = e.deltaY < 0 ? zoomFactor : -zoomFactor
      const newZoom = Math.max(0.1, Math.min(5, zoom + delta))
      updateEditorState({ zoom: newZoom })
    } else {
       // Pan with wheel (touchpad)
       updateEditorState({ 
         offset: { 
           x: offset.x - e.deltaX, 
           y: offset.y - e.deltaY 
         } 
       })
    }
  }

  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = activeSheet.nodes[nodeId];
    if (node.isRoot) return; 

    setDragState({
      isDraggingNode: true,
      dragNodeId: nodeId,
      ghostPos: { x: e.clientX, y: e.clientY },
      dropTargetId: null
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if target is SVG (background) to allow panning
    // For now simple implementation
    const tagName = (e.target as Element).tagName.toLowerCase();
    if (tagName === 'svg') {
      setIsPanning(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x
      const dy = e.clientY - lastMousePos.y
      
      updateEditorState({
        offset: {
          x: offset.x + dx,
          y: offset.y + dy
        }
      })
      
      setLastMousePos({ x: e.clientX, y: e.clientY })
    } else if (dragState.isDraggingNode) {
       // Dragging Node Logic
       const rect = containerRef.current?.getBoundingClientRect();
       if (rect) {
           const mouseX = e.clientX - rect.left;
           const mouseY = e.clientY - rect.top;
           const logicX = (mouseX - offset.x) / zoom;
           const logicY = (mouseY - offset.y) / zoom;
           
           let targetId: string | null = null;
           
           // Simple hit testing
           for (const nId in activeSheet.nodes) {
               if (nId === dragState.dragNodeId) continue;
               const n = activeSheet.nodes[nId];
               
               // Cycle Check
               let isDescendant = false;
               let curr = nId;
               while(curr && activeSheet.nodes[curr]) {
                   if (curr === dragState.dragNodeId) {
                       isDescendant = true;
                       break;
                   }
                   if (activeSheet.nodes[curr].isRoot) break;
                   curr = activeSheet.nodes[curr].parentId || '';
               }
               if (isDescendant) continue;

               // AABB Check
               if (
                   logicX >= n.x && logicX <= n.x + n.width &&
                   logicY >= n.y && logicY <= n.y + n.height
               ) {
                   targetId = nId;
                   break; 
               }
           }
           
           setDragState(prev => ({
               ...prev,
               ghostPos: { x: e.clientX, y: e.clientY },
               dropTargetId: targetId
           }));
       }
    }
  }

  const handleMouseUp = () => {
    if (isPanning) {
        setIsPanning(false)
    }
    
    if (dragState.isDraggingNode) {
        if (dragState.dropTargetId && dragState.dragNodeId) {
            moveNode(dragState.dragNodeId, dragState.dropTargetId);
        }
        setDragState({
            isDraggingNode: false,
            dragNodeId: null,
            ghostPos: { x: 0, y: 0 },
            dropTargetId: null
        });
    }
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-canvas overflow-hidden relative transition-colors duration-200">
      <svg 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g 
          id="mindmap-content"
          transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}
        >
          <MindmapRenderer
            rootId={activeSheet.rootId}
            nodes={activeSheet.nodes}
            layout={activeSheet.layout}
            viewport={{
              width: viewportSize.width,
              height: viewportSize.height,
              x: offset.x,
              y: offset.y,
              zoom: zoom
            }}
            onNodeDragStart={handleNodeDragStart}
            dropTargetId={dragState.dropTargetId}
          />
        </g>
      </svg>
      
      {/* Ghost Node for Dragging */}
      {dragState.isDraggingNode && dragState.dragNodeId && activeSheet.nodes[dragState.dragNodeId] && (
        <div 
          className="fixed pointer-events-none opacity-60 bg-white dark:bg-zinc-800 border border-ui-border rounded px-3 py-1 shadow-xl z-50 whitespace-nowrap text-sm text-ui-primary"
          style={{
            left: dragState.ghostPos.x + 15,
            top: dragState.ghostPos.y + 15,
          }}
        >
          {activeSheet.nodes[dragState.dragNodeId].text}
        </div>
      )}
    </div>
  )
}

export default CanvasWorkspace
