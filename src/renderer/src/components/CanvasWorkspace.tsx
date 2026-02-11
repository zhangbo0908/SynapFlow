import React, { useRef, useState, useEffect } from 'react'
import { useMindmapStore } from '../store/useMindmapStore'
import { MindmapNode } from '../../../shared/types'
import NodeComponent from './NodeComponent'

const CanvasWorkspace: React.FC = () => {
  const activeSheet = useMindmapStore(state => state.data.sheets?.find(s => s.id === state.data.activeSheetId));
  const viewCenterTrigger = useMindmapStore(state => state.viewCenterTrigger)
  const updateEditorState = useMindmapStore(state => state.updateEditorState)
  const addChildNode = useMindmapStore(state => state.addChildNode)
  const addSiblingNode = useMindmapStore(state => state.addSiblingNode)
  const deleteNode = useMindmapStore(state => state.deleteNode)
  const undo = useMindmapStore(state => state.undo)
  const redo = useMindmapStore(state => state.redo)
  
  const [isDragging, setIsDragging] = useState(false)
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

  const isNodeVisible = (node: MindmapNode) => {
    // If viewport size is not yet determined, render everything to be safe
    if (viewportSize.width === 0 || viewportSize.height === 0) return true

    const screenX = node.x * zoom + offset.x
    const screenY = node.y * zoom + offset.y
    const screenWidth = node.width * zoom
    const screenHeight = node.height * zoom

    // Add a buffer to prevent popping artifacts at edges
    const buffer = 50

    return (
      screenX + screenWidth + buffer > 0 &&
      screenX - buffer < viewportSize.width &&
      screenY + screenHeight + buffer > 0 &&
      screenY - buffer < viewportSize.height
    )
  }

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

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if target is SVG (background) to allow panning
    // For now simple implementation
    const tagName = (e.target as Element).tagName.toLowerCase();
    if (tagName === 'svg') {
      setIsDragging(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMousePos.x
      const dy = e.clientY - lastMousePos.y
      
      updateEditorState({
        offset: {
          x: offset.x + dx,
          y: offset.y + dy
        }
      })
      
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const renderNodesRecursive = (nodeId: string): JSX.Element[] => {
    const node = activeSheet.nodes[nodeId]
    if (!node) return []

    const childElements = node.children.flatMap(childId => renderNodesRecursive(childId))
    
    const visible = isNodeVisible(node)

    if (visible) {
      return [
        <NodeComponent key={nodeId} nodeId={nodeId} />,
        ...childElements
      ]
    } else {
      return childElements
    }
  }

  const renderConnections = (nodeId: string) => {
    const node = activeSheet.nodes[nodeId]
    if (!node) return null

    const parentVisible = isNodeVisible(node)
    const layout = activeSheet.layout || 'logic'

    return (
      <React.Fragment key={`conn-${nodeId}`}>
        {node.children.map(childId => {
          const child = activeSheet.nodes[childId]
          if (!child) return null
          
          const childVisible = isNodeVisible(child)

          // Optimization: Cull connection if both start and end nodes are not visible
          if (!parentVisible && !childVisible) return null
          
          let startX, startY, endX, endY
          let cp1X, cp1Y, cp2X, cp2Y

          if (layout === 'orgChart') {
            // Top to Bottom
            startX = node.x + node.width / 2
            startY = node.y + node.height
            endX = child.x + child.width / 2
            endY = child.y
            
            const midY = (startY + endY) / 2
            cp1X = startX
            cp1Y = midY
            cp2X = endX
            cp2Y = midY
          } else if (layout === 'mindmap' && child.x < node.x) {
            // Left side of Mindmap
            startX = node.x
            startY = node.y + node.height / 2
            endX = child.x + child.width
            endY = child.y + child.height / 2
            
            const midX = (startX + endX) / 2
            cp1X = midX
            cp1Y = startY
            cp2X = midX
            cp2Y = endY
          } else {
            // Logic Chart & Right side of Mindmap (Left to Right)
            startX = node.x + node.width
            startY = node.y + node.height / 2
            endX = child.x
            endY = child.y + child.height / 2

            const midX = (startX + endX) / 2
            cp1X = midX
            cp1Y = startY
            cp2X = midX
            cp2Y = endY
          }

          let d = ''
          const lineStyle = node.style?.lineStyle || 'bezier'

          switch (lineStyle) {
            case 'straight':
              d = `M ${startX} ${startY} L ${endX} ${endY}`
              break
            case 'step':
              if (layout === 'orgChart') {
                 d = `M ${startX} ${startY} L ${startX} ${(startY + endY) / 2} L ${endX} ${(startY + endY) / 2} L ${endX} ${endY}`
              } else {
                 d = `M ${startX} ${startY} L ${(startX + endX) / 2} ${startY} L ${(startX + endX) / 2} ${endY} L ${endX} ${endY}`
              }
              break
            case 'bezier':
            default:
              d = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`
              break
          }

          return (
            <path
              key={`${node.id}-${child.id}`}
              d={d}
              className="stroke-gray-300 dark:stroke-zinc-600 transition-colors"
              strokeWidth="2"
              fill="none"
            />
          )
        })}
        {node.children.map(childId => renderConnections(childId))}
      </React.Fragment>
    )
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
          {renderConnections(activeSheet.rootId)}
          {renderNodesRecursive(activeSheet.rootId)}
        </g>
      </svg>
    </div>
  )
}

export default CanvasWorkspace
