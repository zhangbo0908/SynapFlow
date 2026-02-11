import { NodeStyle } from '../../../shared/types';

// Create a canvas for text measurement
// We use a singleton pattern to reuse the canvas context
let ctx: CanvasRenderingContext2D | null = null;

if (typeof document !== 'undefined') {
  const canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');
}

interface Size {
  width: number;
  height: number;
}

// Padding configuration for different shapes
// h: horizontal padding (one side)
// v: vertical padding (one side)
// minWidthRatio: ratio to increase width for shapes that are narrower at ends
const SHAPE_CONFIG: Record<string, { padding: { h: number, v: number }, minWidthRatio?: number }> = {
  rectangle: { padding: { h: 15, v: 10 } },
  rounded: { padding: { h: 20, v: 10 } },
  ellipse: { padding: { h: 25, v: 15 }, minWidthRatio: 1.5 }, // Ellipse needs more width to fit text in center
  diamond: { padding: { h: 30, v: 20 }, minWidthRatio: 2.0 }, // Diamond needs double width
  cloud: { padding: { h: 25, v: 15 }, minWidthRatio: 1.3 }, // Cloud is irregular
  hexagon: { padding: { h: 25, v: 10 }, minWidthRatio: 1.3 },
  capsule: { padding: { h: 25, v: 12 } },
  underline: { padding: { h: 5, v: 5 } },
};

export const measureText = (text: string, style: Partial<NodeStyle> = {}): Size => {
  // Default dimensions if canvas is not available (e.g., in node environment during tests)
  if (!ctx) {
    return { width: 100, height: 40 };
  }

  const fontSize = style.fontSize || 14;
  const fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  
  ctx.font = `${fontSize}px ${fontFamily}`;
  
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  // Approximation of height since measureText doesn't provide consistent height across browsers
  const textHeight = fontSize * 1.4; 

  const shape = style.shape || 'rounded';
  const config = SHAPE_CONFIG[shape] || SHAPE_CONFIG.rounded;
  
  let width = textWidth + (config.padding.h * 2);
  let height = textHeight + (config.padding.v * 2);

  if (config.minWidthRatio) {
    width *= config.minWidthRatio;
  }

  // Ensure minimum dimensions
  // Root node usually needs to be larger
  const minWidth = style.fontSize && style.fontSize > 20 ? 120 : 60;
  const minHeight = style.fontSize && style.fontSize > 20 ? 50 : 30;

  return {
    width: Math.max(width, minWidth),
    height: Math.max(height, minHeight)
  };
};
