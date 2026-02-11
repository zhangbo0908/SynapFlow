import React, { useState, useRef, useEffect } from 'react';
import { useMindmapStore } from '../store/useMindmapStore';
import { MindmapNode } from '../../../shared/types';
import clsx from 'clsx';

import { RenderStyleConfig } from './MindmapRenderer';

interface NodeComponentProps {
  nodeId: string;
  node?: MindmapNode;
  styleConfig?: RenderStyleConfig;
  onNodeDragStart?: (e: React.MouseEvent, nodeId: string) => void;
  isDropTarget?: boolean;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ 
  nodeId, 
  node: propNode, 
  styleConfig,
  onNodeDragStart,
  isDropTarget 
}) => {
  const storeNode = useMindmapStore(state => {
    // If we have a propNode, we might skip subscription, but hooks rules say we shouldn't conditionalize hooks.
    // However, we can just return undefined if we don't care, or just always subscribe.
    // Since this is a lightweight selector, always subscribing is fine.
    const sheet = state.data.sheets?.find(s => s.id === state.data.activeSheetId);
    return sheet?.nodes[nodeId];
  });
  
  const node = propNode || storeNode;
  const isSelected = useMindmapStore(state => {
    const sheet = state.data.sheets?.find(s => s.id === state.data.activeSheetId);
    return sheet?.editorState.selectedId === nodeId;
  });
  const selectNode = useMindmapStore(state => state.selectNode);
  const updateNodeText = useMindmapStore(state => state.updateNodeText);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!node) return null;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(node.text);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(nodeId);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== node.text) {
      updateNodeText(nodeId, editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click triggers drag
    if (e.button !== 0) return;
    
    if (onNodeDragStart && !isEditing) {
       onNodeDragStart(e, nodeId);
    }
  };

  // Helper to resolve color
  const resolveColor = (color: string | undefined, cssVar: string, fallback: string) => {
    if (color) return color;
    if (styleConfig) {
       // Map known css vars to styleConfig props
       if (cssVar === '--color-bg-node') return styleConfig.nodeBg || fallback;
       if (cssVar === '--color-text-node') return styleConfig.nodeText || fallback;
    }
    return `var(${cssVar})`;
  };

  const shape = node.style?.shape || 'rounded';
  const commonProps = {
    fill: resolveColor(node.style?.backgroundColor, '--color-bg-node', '#ffffff'),
    stroke: isDropTarget ? '#3B82F6' : resolveColor(node.style?.borderColor, '--color-border-node', (node.isRoot ? '#FF5D5D' : '#3498DB')),
    strokeWidth: isDropTarget ? 3 : (node.style?.borderWidth !== undefined ? node.style.borderWidth : (isSelected ? 3 : 2)),
    strokeDasharray: node.style?.borderStyle === 'dashed' ? '5,5' : (node.style?.borderStyle === 'dotted' ? '2,2' : undefined),
    className: clsx("shadow-sm transition-all duration-200", isSelected && "filter drop-shadow-md"),
    style: node.style?.shadowColor ? { filter: `drop-shadow(0 0 ${node.style.shadowBlur || 5}px ${node.style.shadowColor})` } : undefined
  };

  const renderShape = () => {
    switch (shape) {
      case 'ellipse':
        return (
          <ellipse
            cx={node.width / 2}
            cy={node.height / 2}
            rx={node.width / 2}
            ry={node.height / 2}
            {...commonProps}
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${node.width / 2},0 ${node.width},${node.height / 2} ${node.width / 2},${node.height} 0,${node.height / 2}`}
            {...commonProps}
          />
        );
      case 'hexagon':
        return (
          <polygon
            points={`0,${node.height/2} ${node.width/4},0 ${3*node.width/4},0 ${node.width},${node.height/2} ${3*node.width/4},${node.height} ${node.width/4},${node.height}`}
            {...commonProps}
          />
        );
      case 'capsule':
        return (
          <rect
            width={node.width}
            height={node.height}
            rx={Math.min(node.width, node.height) / 2}
            ry={Math.min(node.width, node.height) / 2}
            {...commonProps}
          />
        );
      case 'cloud':
        const w = node.width;
        const h = node.height;
        // Optimized cloud path that fills more of the bounding box
        return (
          <path
            d={`
              M${w * 0.1},${h * 0.55} 
              Q${w * 0.0},${h * 0.3} ${w * 0.2},${h * 0.15} 
              Q${w * 0.25},${h * 0.0} ${w * 0.5},${h * 0.1} 
              Q${w * 0.75},${h * 0.0} ${w * 0.85},${h * 0.2} 
              Q${w * 1.0},${h * 0.35} ${w * 0.9},${h * 0.6} 
              Q${w * 1.0},${h * 0.85} ${w * 0.75},${h * 0.95} 
              Q${w * 0.5},${h * 1.0} ${w * 0.25},${h * 0.9} 
              Q${w * 0.0},${h * 0.8} ${w * 0.1},${h * 0.55} 
              Z
            `}
            {...commonProps}
          />
        );
      case 'underline':
        return (
          <g>
             <rect 
               width={node.width} 
               height={node.height} 
               fill={commonProps.fill} 
               stroke="none" 
             />
             <line 
               x1={0} 
               y1={node.height} 
               x2={node.width} 
               y2={node.height} 
               stroke={commonProps.stroke} 
               strokeWidth={commonProps.strokeWidth}
               strokeDasharray={commonProps.strokeDasharray}
             />
          </g>
        );
      case 'rectangle':
        return (
          <rect
            width={node.width}
            height={node.height}
            rx={node.style?.borderRadius || 0}
            ry={node.style?.borderRadius || 0}
            {...commonProps}
          />
        );
      case 'rounded':
      default:
        return (
          <rect
            width={node.width}
            height={node.height}
            rx={node.style?.borderRadius || 8}
            ry={node.style?.borderRadius || 8}
            {...commonProps}
          />
        );
    }
  };

  return (
    <g 
      transform={`translate(${node.x}, ${node.y})`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      className={clsx(
        !node.isRoot && "cursor-grab active:cursor-grabbing",
        node.isRoot && "cursor-default"
      )}
    >
      {renderShape()}
      
      {isEditing ? (
        <foreignObject x={0} y={0} width={node.width} height={node.height}>
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full text-center text-sm border-none outline-none bg-transparent"
            style={{ color: node.style?.color || 'var(--color-text-node)', fontSize: node.style?.fontSize }}
          />
        </foreignObject>
      ) : (
        <text
          x={node.width / 2}
          y={node.height / 2}
          dy=".3em"
          textAnchor="middle"
          className="text-sm font-medium select-none pointer-events-none transition-colors duration-200"
          fill={resolveColor(node.style?.color, '--color-text-node', '#1e293b')}
          style={{ fontSize: node.style?.fontSize }}
        >
          {node.text}
        </text>
      )}
    </g>
  );
};

export default NodeComponent;
