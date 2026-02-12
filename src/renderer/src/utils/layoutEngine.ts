import { MindmapNode, LayoutType } from "../../../shared/types";

const H_GAP = 50;
const V_GAP = 20;

const getHGap = (depth: number): number => {
  if (depth === 0) return 64; // Root -> L1
  if (depth === 1) return 40; // L1 -> L2
  return 32; // L2+
};

type HeightCache = Map<string, number>;
type WidthCache = Map<string, number>;

// --- Helper Functions ---

const calculateSubtreeHeight = (
  nodeId: string,
  nodes: Record<string, MindmapNode>,
  heightCache: HeightCache,
): number => {
  const node = nodes[nodeId];
  if (!node) return 0;

  if (node.children.length === 0) {
    const h = node.height;
    heightCache.set(nodeId, h);
    return h;
  }

  let childrenHeight = 0;
  node.children.forEach((childId, index) => {
    childrenHeight += calculateSubtreeHeight(childId, nodes, heightCache);
    if (index < node.children.length - 1) {
      childrenHeight += V_GAP;
    }
  });

  const h = Math.max(node.height, childrenHeight);
  heightCache.set(nodeId, h);
  return h;
};

const calculateSubtreeWidth = (
  nodeId: string,
  nodes: Record<string, MindmapNode>,
  widthCache: WidthCache,
): number => {
  const node = nodes[nodeId];
  if (!node) return 0;

  if (node.children.length === 0) {
    const w = node.width;
    widthCache.set(nodeId, w);
    return w;
  }

  let childrenWidth = 0;
  node.children.forEach((childId, index) => {
    childrenWidth += calculateSubtreeWidth(childId, nodes, widthCache);
    if (index < node.children.length - 1) {
      childrenWidth += H_GAP;
    }
  });

  const w = Math.max(node.width, childrenWidth);
  widthCache.set(nodeId, w);
  return w;
};

// --- Logic Layout (Right-Only) ---

const layoutLogicNode = (
  nodeId: string,
  nodes: Record<string, MindmapNode>,
  x: number,
  y: number,
  heightCache: HeightCache,
  depth: number = 0,
) => {
  const node = nodes[nodeId];
  if (!node) return;

  node.x = x;
  node.y = y;

  if (node.children.length === 0) return;

  const childrenTotalHeight = heightCache.get(nodeId)!;
  let currentY = y + node.height / 2 - childrenTotalHeight / 2;
  const childX = x + node.width + getHGap(depth);

  node.children.forEach((childId) => {
    const childHeight = heightCache.get(childId)!;
    const childNode = nodes[childId];
    const childY = currentY + (childHeight - childNode.height) / 2;
    layoutLogicNode(childId, nodes, childX, childY, heightCache, depth + 1);
    currentY += childHeight + V_GAP;
  });
};

// --- Mindmap Layout (Centered) ---

const layoutMindmapNode = (
  nodeId: string,
  nodes: Record<string, MindmapNode>,
  x: number,
  y: number,
  heightCache: HeightCache,
  direction: "left" | "right",
  depth: number,
) => {
  const node = nodes[nodeId];
  if (!node) return;

  node.x = x;
  node.y = y;

  if (node.children.length === 0) return;

  const childrenTotalHeight = heightCache.get(nodeId)!;
  let currentY = y + node.height / 2 - childrenTotalHeight / 2;

  node.children.forEach((childId) => {
    const childHeight = heightCache.get(childId)!;
    const childNode = nodes[childId];
    const childY = currentY + (childHeight - childNode.height) / 2;

    let childX;
    if (direction === "right") {
      childX = x + node.width + getHGap(depth);
    } else {
      childX = x - getHGap(depth) - childNode.width;
    }

    // Recursively layout children in the SAME direction
    layoutMindmapNode(
      childId,
      nodes,
      childX,
      childY,
      heightCache,
      direction,
      depth + 1,
    );
    currentY += childHeight + V_GAP;
  });
};

const layoutMindmapRoot = (
  rootId: string,
  nodes: Record<string, MindmapNode>,
  heightCache: HeightCache,
) => {
  const root = nodes[rootId];
  if (!root) return;

  // Position root at 0,0
  root.x = 0;
  root.y = 0;

  if (root.children.length === 0) return;

  // Split children into left and right groups
  const rightChildren: string[] = [];
  const leftChildren: string[] = [];

  root.children.forEach((childId, index) => {
    if (index % 2 === 0) {
      rightChildren.push(childId);
    } else {
      leftChildren.push(childId);
    }
  });

  // Calculate total heights for both sides
  // We need to temporarily treat these groups as virtual subtrees to use our helper
  // But our helper works on node IDs.
  // Let's manually sum up heights.

  const getGroupHeight = (childIds: string[]) => {
    if (childIds.length === 0) return 0;
    let h = 0;
    childIds.forEach((id, idx) => {
      h += heightCache.get(id)!;
      if (idx < childIds.length - 1) h += V_GAP;
    });
    return h;
  };

  const rightHeight = getGroupHeight(rightChildren);
  const leftHeight = getGroupHeight(leftChildren);

  // Layout Right Side
  let currentY = root.y + root.height / 2 - rightHeight / 2;
  const rightX = root.x + root.width + getHGap(0);

  rightChildren.forEach((childId) => {
    const childHeight = heightCache.get(childId)!;
    const childNode = nodes[childId];
    const childY = currentY + (childHeight - childNode.height) / 2;
    layoutMindmapNode(childId, nodes, rightX, childY, heightCache, "right", 1);
    currentY += childHeight + V_GAP;
  });

  // Layout Left Side
  currentY = root.y + root.height / 2 - leftHeight / 2;
  // For left side, childX depends on child width, handled in layoutMindmapNode,
  // but for the first level, we calculate here.

  leftChildren.forEach((childId) => {
    const childHeight = heightCache.get(childId)!;
    const childNode = nodes[childId];
    const childY = currentY + (childHeight - childNode.height) / 2;
    const leftX = root.x - getHGap(0) - childNode.width;
    layoutMindmapNode(childId, nodes, leftX, childY, heightCache, "left", 1);
    currentY += childHeight + V_GAP;
  });
};

// --- Org Chart Layout (Top-Down) ---

const layoutOrgChartNode = (
  nodeId: string,
  nodes: Record<string, MindmapNode>,
  x: number,
  y: number,
  widthCache: WidthCache,
) => {
  const node = nodes[nodeId];
  if (!node) return;

  node.x = x;
  node.y = y;

  if (node.children.length === 0) return;

  const childrenTotalWidth = widthCache.get(nodeId)!;

  // Center children horizontally below parent
  // Parent center X = x + node.width / 2
  // Children group start X = (x + node.width / 2) - (childrenTotalWidth / 2)

  let currentX = x + node.width / 2 - childrenTotalWidth / 2;
  const childY = y + node.height + H_GAP; // Use H_GAP as vertical gap for org chart? Or define new V_GAP_ORG?
  // Let's swap: V_GAP becomes horizontal gap between siblings, H_GAP becomes vertical gap between levels.
  // Actually, standard:
  // H_GAP: Horizontal gap between nodes
  // V_GAP: Vertical gap between nodes
  // In Org Chart:
  // Gap between levels = H_GAP (50)
  // Gap between siblings = V_GAP (20) - this naming is confusing now.
  // Let's just use constants:
  // const LEVEL_GAP = 50;
  const SIBLING_GAP = 20;

  node.children.forEach((childId) => {
    const childWidth = widthCache.get(childId)!;
    const childNode = nodes[childId];

    // We want to center the child's subtree at currentX + childWidth / 2
    // So child's x = (currentX + childWidth / 2) - childNode.width / 2
    const childX = currentX + (childWidth - childNode.width) / 2;

    layoutOrgChartNode(childId, nodes, childX, childY, widthCache);

    currentX += childWidth + SIBLING_GAP;
  });
};

// We need a separate width calculator for Org Chart because it flows differently
const calculateOrgChartSubtreeWidth = (
  nodeId: string,
  nodes: Record<string, MindmapNode>,
  widthCache: WidthCache,
): number => {
  const node = nodes[nodeId];
  if (!node) return 0;

  if (node.children.length === 0) {
    const w = node.width;
    widthCache.set(nodeId, w);
    return w;
  }

  let childrenWidth = 0;
  const SIBLING_GAP = 20;

  node.children.forEach((childId, index) => {
    childrenWidth += calculateOrgChartSubtreeWidth(childId, nodes, widthCache);
    if (index < node.children.length - 1) {
      childrenWidth += SIBLING_GAP;
    }
  });

  const w = Math.max(node.width, childrenWidth);
  widthCache.set(nodeId, w);
  return w;
};

// --- Main Entry ---

export const applyLayout = (
  rootId: string,
  nodes: Record<string, MindmapNode>,
  type: LayoutType = "logic",
) => {
  const heightCache = new Map<string, number>();
  const widthCache = new Map<string, number>();

  if (type === "logic") {
    calculateSubtreeHeight(rootId, nodes, heightCache);
    layoutLogicNode(rootId, nodes, 0, 0, heightCache, 0);
  } else if (type === "mindmap") {
    calculateSubtreeHeight(rootId, nodes, heightCache);
    layoutMindmapRoot(rootId, nodes, heightCache);
  } else if (type === "orgChart") {
    calculateOrgChartSubtreeWidth(rootId, nodes, widthCache);
    // Position root centered at 0,0? Or top-left at 0,0?
    // Let's put root at 0,0 for simplicity, centering happens relative to it.
    layoutOrgChartNode(rootId, nodes, 0, 0, widthCache);
  }
};
