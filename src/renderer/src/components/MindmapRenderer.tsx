import React from 'react';
import { MindmapNode, LayoutType } from '../../../shared/types';
import NodeComponent from './NodeComponent';

interface ViewportState {
  width: number;
  height: number;
  x: number;
  y: number;
  zoom: number;
}

export interface RenderStyleConfig {
  lineColor?: string;
  nodeBg?: string;
  nodeText?: string;
  // Add more as needed
}

interface MindmapRendererProps {
  rootId: string;
  nodes: Record<string, MindmapNode>;
  layout?: LayoutType;
  culling?: boolean;
  viewport?: ViewportState;
  styleConfig?: RenderStyleConfig;
  onNodeDragStart?: (e: React.MouseEvent, nodeId: string) => void;
  dropTargetId?: string | null;
}

const MindmapRenderer: React.FC<MindmapRendererProps> = ({
  rootId,
  nodes,
  layout = 'logic',
  culling = true,
  viewport,
  styleConfig,
  onNodeDragStart,
  dropTargetId
}) => {
  const isNodeVisible = (node: MindmapNode) => {
    // If culling is disabled, everything is visible
    if (!culling) return true;
    
    // If viewport is not provided but culling is enabled, we can't cull effectively
    // so we default to visible or maybe hidden? Default to visible to be safe.
    if (!viewport || viewport.width === 0 || viewport.height === 0) return true;

    const { x: offsetX, y: offsetY, zoom, width: viewportWidth, height: viewportHeight } = viewport;

    const screenX = node.x * zoom + offsetX;
    const screenY = node.y * zoom + offsetY;
    const screenWidth = node.width * zoom;
    const screenHeight = node.height * zoom;

    // Add a buffer to prevent popping artifacts at edges
    const buffer = 50;

    return (
      screenX + screenWidth + buffer > 0 &&
      screenX - buffer < viewportWidth &&
      screenY + screenHeight + buffer > 0 &&
      screenY - buffer < viewportHeight
    );
  };

  const renderNodesRecursive = (nodeId: string): JSX.Element[] => {
    const node = nodes[nodeId];
    if (!node) return [];

    const childElements = node.children.flatMap(childId => renderNodesRecursive(childId));
    
    const visible = isNodeVisible(node);

    if (visible) {
      return [
        <NodeComponent 
          key={nodeId} 
          nodeId={nodeId} 
          node={node} 
          styleConfig={styleConfig} 
          onNodeDragStart={onNodeDragStart}
          isDropTarget={dropTargetId === nodeId}
        />,
        ...childElements
      ];
    } else {
      return childElements;
    }
  };

  const renderConnections = (nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return null;

    const parentVisible = isNodeVisible(node);

    return (
      <React.Fragment key={`conn-${nodeId}`}>
        {node.children.map(childId => {
          const child = nodes[childId];
          if (!child) return null;
          
          const childVisible = isNodeVisible(child);

          // Optimization: Cull connection if both start and end nodes are not visible
          if (!parentVisible && !childVisible) return null;
          
          let startX, startY, endX, endY;
          let cp1X, cp1Y, cp2X, cp2Y;

          if (layout === 'orgChart') {
            // Top to Bottom
            startX = node.x + node.width / 2;
            startY = node.y + node.height;
            endX = child.x + child.width / 2;
            endY = child.y;
            
            const midY = (startY + endY) / 2;
            cp1X = startX;
            cp1Y = midY;
            cp2X = endX;
            cp2Y = midY;
          } else if (layout === 'mindmap' && child.x < node.x) {
            // Left side of Mindmap
            startX = node.x;
            startY = node.y + node.height / 2;
            endX = child.x + child.width;
            endY = child.y + child.height / 2;
            
            const midX = (startX + endX) / 2;
            cp1X = midX;
            cp1Y = startY;
            cp2X = midX;
            cp2Y = endY;
          } else {
            // Logic Chart & Right side of Mindmap (Left to Right)
            startX = node.x + node.width;
            startY = node.y + node.height / 2;
            endX = child.x;
            endY = child.y + child.height / 2;

            const midX = (startX + endX) / 2;
            cp1X = midX;
            cp1Y = startY;
            cp2X = midX;
            cp2Y = endY;
          }

          let d = '';
          const lineStyle = node.style?.lineStyle || 'bezier';

          switch (lineStyle) {
            case 'straight':
              d = `M ${startX} ${startY} L ${endX} ${endY}`;
              break
            case 'step':
              if (layout === 'orgChart') {
                 d = `M ${startX} ${startY} L ${startX} ${(startY + endY) / 2} L ${endX} ${(startY + endY) / 2} L ${endX} ${endY}`;
              } else {
                 d = `M ${startX} ${startY} L ${(startX + endX) / 2} ${startY} L ${(startX + endX) / 2} ${endY} L ${endX} ${endY}`;
              }
              break
            case 'bezier':
            default:
              d = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
              break
          }

          return (
            <path
              key={`${node.id}-${child.id}`}
              d={d}
              className={!styleConfig?.lineColor ? "stroke-gray-300 dark:stroke-zinc-600 transition-colors" : undefined}
              style={styleConfig?.lineColor ? { stroke: styleConfig.lineColor } : undefined}
              strokeWidth="2"
              fill="none"
            />
          );
        })}
        {node.children.map(childId => renderConnections(childId))}
      </React.Fragment>
    );
  };

  return (
    <>
      {renderConnections(rootId)}
      {renderNodesRecursive(rootId)}
    </>
  );
};

export default MindmapRenderer;
