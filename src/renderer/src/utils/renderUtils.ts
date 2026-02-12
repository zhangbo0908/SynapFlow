import { MindmapNode, ThemeConfig, LayoutType } from "../../../shared/types";

// Helper to get link path
export const getLinkPath = (
  source: MindmapNode,
  target: MindmapNode,
  lineStyle: string = "bezier",
  layout: LayoutType = "logic",
): string => {
  let startX, startY, endX, endY;
  let cp1X, cp1Y, cp2X, cp2Y;

  // Calculate endpoints based on layout
  if (layout === "orgChart") {
    // Top to Bottom
    startX = source.x + source.width / 2;
    startY = source.y + source.height;
    endX = target.x + target.width / 2;
    endY = target.y;

    const midY = (startY + endY) / 2;
    cp1X = startX;
    cp1Y = midY;
    cp2X = endX;
    cp2Y = midY;
  } else if (layout === "mindmap" && target.x < source.x) {
    // Left side of Mindmap
    startX = source.x;
    startY = source.y + source.height / 2;
    endX = target.x + target.width;
    endY = target.y + target.height / 2;

    const midX = (startX + endX) / 2;
    cp1X = midX;
    cp1Y = startY;
    cp2X = midX;
    cp2Y = endY;
  } else {
    // Logic Chart & Right side of Mindmap (Left to Right)
    startX = source.x + source.width;
    startY = source.y + source.height / 2;
    endX = target.x;
    endY = target.y + target.height / 2;

    const midX = (startX + endX) / 2;
    cp1X = midX;
    cp1Y = startY;
    cp2X = midX;
    cp2Y = endY;
  }

  // Generate Path Command
  switch (lineStyle) {
    case "straight":
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    case "step":
      if (layout === "orgChart") {
        return `M ${startX} ${startY} L ${startX} ${(startY + endY) / 2} L ${endX} ${(startY + endY) / 2} L ${endX} ${endY}`;
      } else {
        return `M ${startX} ${startY} L ${(startX + endX) / 2} ${startY} L ${(startX + endX) / 2} ${endY} L ${endX} ${endY}`;
      }
    case "hand-drawn":
      // Improved hand-drawn style using Cubic Bezier with deterministic noise
      // This maintains the correct S-curve structure while adding natural irregularity
      const seed = source.id.charCodeAt(0) + target.id.charCodeAt(0);
      
      // Pseudo-random generator based on seed
      const rand = (offset: number) => {
        const x = Math.sin(seed + offset) * 10000;
        return (x - Math.floor(x)) * 10 - 5; // -5 to 5px variation
      };
      
      const n1x = rand(1);
      const n1y = rand(2);
      const n2x = rand(3);
      const n2y = rand(4);

      return `M ${startX} ${startY} C ${cp1X + n1x} ${cp1Y + n1y}, ${cp2X + n2x} ${cp2Y + n2y}, ${endX} ${endY}`;
      
    case "bezier":
    default:
      return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
  }
};

// Helper to get branch color
// This function assumes it is called for a direct child of the root or recursively passed down
export const getBranchColor = (
  _node: MindmapNode,
  index: number,
  theme: ThemeConfig,
): string => {
  if (theme.palette && theme.palette.length > 0) {
    return theme.palette[index % theme.palette.length];
  }
  return theme.primaryStyle.borderColor || "#000";
};
