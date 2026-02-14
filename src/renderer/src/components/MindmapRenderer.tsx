import React from "react";
import { MindmapNode, LayoutType, ThemeConfig } from "../../../shared/types";
import NodeComponent from "./NodeComponent";
import { getLinkPath, getBranchColor } from "../utils/renderUtils";

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
  borderColor?: string;
  // Add more as needed
}

interface MindmapRendererProps {
  rootId: string;
  nodes: Record<string, MindmapNode>;
  layout?: LayoutType;
  culling?: boolean;
  viewport?: ViewportState;
  styleConfig?: RenderStyleConfig;
  theme?: ThemeConfig;
  onNodeDragStart?: (e: React.MouseEvent, nodeId: string) => void;
  dropTargetId?: string | null;
}

const MindmapRenderer: React.FC<MindmapRendererProps> = ({
  rootId,
  nodes,
  layout = "logic",
  culling = true,
  viewport,
  styleConfig,
  theme,
  onNodeDragStart,
  dropTargetId,
}) => {
  const isNodeVisible = (node: MindmapNode) => {
    // If culling is disabled, everything is visible
    if (!culling) return true;

    // If viewport is not provided but culling is enabled, we can't cull effectively
    // so we default to visible or maybe hidden? Default to visible to be safe.
    if (!viewport || viewport.width === 0 || viewport.height === 0) return true;

    const {
      x: offsetX,
      y: offsetY,
      zoom,
      width: viewportWidth,
      height: viewportHeight,
    } = viewport;

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

  const renderNodesRecursive = (
    nodeId: string,
    indexInParent: number = 0,
    inheritedColor?: string,
  ): JSX.Element[] => {
    const node = nodes[nodeId];
    if (!node) return [];

    // Calculate Branch Color
    let myColor = inheritedColor;
    if (theme && !node.isRoot) {
      if (node.parentId === rootId) {
        // First level child -> Start of a branch
        myColor = getBranchColor(node, indexInParent, theme);
      }
      // Else inherit
    }



      // Determine theme default style for this node level
    let themeDefaultStyle: Partial<MindmapNode["style"]> | undefined;
    if (theme) {
      if (nodeId === rootId) {
        themeDefaultStyle = theme.rootStyle;
      } else if (node.parentId === rootId) {
        themeDefaultStyle = theme.primaryStyle;
      } else {
        themeDefaultStyle = theme.secondaryStyle;
      }
    }

    // Prepare effective node with style merging
    // Order: Theme Default < Node Specific Overrides
    // We create a new style object to avoid mutating the original node
    const effectiveStyle = {
      ...themeDefaultStyle,
      ...node.style,
    };

    // Apply branch color to border if it exists and node doesn't have specific border override
    if (myColor && !node.style?.borderColor) {
      effectiveStyle.borderColor = myColor;
    }
    
    // Construct the effective node to pass to NodeComponent
    const effectiveNode = {
      ...node,
      style: effectiveStyle,
    };

    // Merge styleConfig with branch color
    // We still keep this for backward compatibility or if NodeComponent uses styleConfig for something else
    const mergedStyleConfig: RenderStyleConfig = {
      ...styleConfig,
      borderColor: myColor || styleConfig?.borderColor,
      lineColor: myColor || styleConfig?.lineColor,
    };

    const childElements = node.children.flatMap((childId, idx) =>
      renderNodesRecursive(childId, idx, myColor),
    );

    const visible = isNodeVisible(node);

    if (visible) {
      return [
        <NodeComponent
          key={nodeId}
          nodeId={nodeId}
          node={effectiveNode}
          styleConfig={mergedStyleConfig}
          onNodeDragStart={onNodeDragStart}
          isDropTarget={dropTargetId === nodeId}
        />,
        ...childElements,
      ];
    } else {
      return childElements;
    }
  };

  const renderConnections = (
    nodeId: string,
    inheritedColor?: string,
  ): React.ReactNode => {
    const node = nodes[nodeId];
    if (!node) return null;

    const parentVisible = isNodeVisible(node);

    return (
      <React.Fragment key={`conn-${nodeId}`}>
        {node.children.map((childId, index) => {
          const child = nodes[childId];
          if (!child) return null;

          const childVisible = isNodeVisible(child);

          // Optimization: Cull connection if both start and end nodes are not visible
          if (!parentVisible && !childVisible) {
            // Even if culled, we must recurse to render grandchildren connections
            // But we need to know the color.
            let childColor = inheritedColor;
            if (theme) {
              if (node.isRoot) {
                childColor = getBranchColor(child, index, theme);
              }
            }
            return renderConnections(childId, childColor);
          }

          // Calculate color for this link
          let linkColor = inheritedColor;
          if (theme) {
            if (node.isRoot) {
              linkColor = getBranchColor(child, index, theme);
            }
          }
          // If no theme/rainbow, use default or styleConfig
          const finalColor =
            linkColor ||
            styleConfig?.lineColor ||
            node.style?.borderColor || // Fallback to node border
            (theme ? theme.primaryStyle.borderColor : "#ccc");

          const d = getLinkPath(
            node,
            child,
            node.style?.lineStyle || theme?.lineStyle || "bezier",
            layout,
          );

          return (
            <React.Fragment key={`${node.id}-${child.id}`}>
              <path
                d={d}
                className={`mindmap-link transition-colors ${
                  !finalColor ? "stroke-gray-300 dark:stroke-zinc-600" : ""
                }`}
                style={
                  finalColor
                    ? { stroke: finalColor }
                    : undefined
                }
                strokeWidth="2"
                fill="none"
              />
              {renderConnections(childId, linkColor)}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  };

  return (
    <g>
      {/* Connections Layer */}
      {renderConnections(rootId)}
      {/* Nodes Layer */}
      {renderNodesRecursive(rootId)}
    </g>
  );
};

export default MindmapRenderer;
