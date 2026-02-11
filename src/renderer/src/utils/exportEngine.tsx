import React from 'react';
import { createRoot } from 'react-dom/client';
import { MindmapNode as Node } from '../../../shared/types';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import MindmapRenderer from '../components/MindmapRenderer';

export const generateMarkdown = (rootId: string, nodes: Record<string, Node>): string => {
  let markdown = '';

  const traverse = (nodeId: string, depth: number) => {
    const node = nodes[nodeId];
    if (!node) return;

    // Generate indentation based on depth
    const indent = '  '.repeat(depth > 1 ? depth - 1 : 0);
    
    // Format text
    let line = '';
    if (depth === 0) {
      line = `# ${node.text}\n`;
    } else if (depth === 1) {
      line = `## ${node.text}\n`;
    } else {
      line = `${indent}- ${node.text}\n`;
    }
    
    markdown += line;

    // Traverse children
    node.children.forEach(childId => traverse(childId, depth + 1));
  };

  traverse(rootId, 0);
  return markdown;
};

interface ExportOptions {
  padding?: number;
  backgroundColor?: string;
  quality?: number; // 0 to 1, for JPEG
}

const renderOffscreen = async (
  rootId: string,
  nodes: Record<string, Node>,
  callback: (container: HTMLElement, width: number, height: number, minX: number, minY: number) => Promise<any>
) => {
  // Calculate bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  Object.values(nodes).forEach(node => {
    if (node.x < minX) minX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.x + node.width > maxX) maxX = node.x + node.width;
    if (node.y + node.height > maxY) maxY = node.y + node.height;
  });

  // Handle case with no nodes
  if (minX === Infinity) {
    minX = 0; minY = 0; maxX = 100; maxY = 100;
  }

  const width = maxX - minX;
  const height = maxY - minY;

  // Create container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  // Ensure container has no background so we can control it
  container.style.background = 'transparent';
  document.body.appendChild(container);

  // We need an SVG wrapper because MindmapRenderer returns SVG elements (paths) and NodeComponents (divs/foreignObjects usually inside SVG?)
  // Wait, MindmapRenderer returns <path> and <NodeComponent>.
  // NodeComponent returns <g> with shapes.
  // So MindmapRenderer MUST be inside an <svg>.
  // CanvasWorkspace wraps it in <svg>.
  
  const root = createRoot(container);
  
  // Resolve current styles
  const computedStyle = getComputedStyle(document.documentElement);
  const styleConfig = {
    lineColor: computedStyle.getPropertyValue('--color-border-node').trim() || (document.documentElement.classList.contains('dark') ? '#52525b' : '#d1d5db'),
    nodeBg: computedStyle.getPropertyValue('--color-bg-node').trim(),
    nodeText: computedStyle.getPropertyValue('--color-text-node').trim(),
  };

  root.render(
    <svg 
      width={width} 
      height={height} 
      viewBox={`${minX} ${minY} ${width} ${height}`}
      style={{ overflow: 'visible' }}
    >
      <MindmapRenderer 
        rootId={rootId}
        nodes={nodes}
        layout={Object.values(nodes).find(n => n.isRoot)?.style?.lineStyle === 'step' ? 'orgChart' : 'mindmap'} // Approximate layout or pass it?
        // Layout is property of Sheet, but we only have nodes here. 
        // We might need to pass layout to export functions too.
        // For now, let's assume default 'mindmap' or try to infer, or just pass 'mindmap' as default.
        // Better: Update signature to accept layout.
        culling={false}
        styleConfig={styleConfig}
      />
    </svg>
  );

  // Wait for render
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    return await callback(container, width, height, minX, minY);
  } finally {
    root.unmount();
    container.remove();
  }
};

export const exportToPng = async (rootId: string, nodes: Record<string, Node>) => {
  return renderOffscreen(rootId, nodes, async (container, width, height, _minX, _minY) => {
    // ... config
    // Actually we need to calculate content dimensions for pixelRatio logic if needed
    // But renderOffscreen handles sizing.
    
    // We need to use minX/minY if we want to set viewBox exactly?
    // In renderOffscreen, we already set viewBox using minX/minY.
    // So here we just need to capture the container.
    
    const scale = 2; // High DPI
    // Calculate final image size
    const padding = 20;
    const contentWidth = width;
    const contentHeight = height;
    
    const config = {
      width: contentWidth,
      height: contentHeight,
      style: {
        transform: 'none',
        position: 'static',
        top: 'auto',
        left: 'auto',
        margin: `${padding}px`,
      },
      backgroundColor: '#ffffff',
      pixelRatio: scale,
    };

    return await toPng(container, config);
  });
};

export const exportToJpeg = async (rootId: string, nodes: Record<string, Node>) => {
  return renderOffscreen(rootId, nodes, async (container, width, height, _minX, _minY) => {
    const scale = 2;
    const padding = 20;
    const contentWidth = width;
    const contentHeight = height;
    
    const config = {
      width: contentWidth,
      height: contentHeight,
      style: {
        transform: 'none',
        position: 'static',
        top: 'auto',
        left: 'auto',
        margin: `${padding}px`,
      },
      backgroundColor: '#ffffff',
      quality: 0.95,
      pixelRatio: scale,
    };

    return await toJpeg(container, config);
  });
};

export const generatePdf = async (
  nodes: Record<string, Node>,
  options: ExportOptions = {}
): Promise<ArrayBuffer> => {
  const rootId = Object.values(nodes).find(n => n.isRoot)?.id;
  if (!rootId) throw new Error('Root node not found');

  return renderOffscreen(rootId, nodes, async (container, width, height, _minX, _minY) => {
    const padding = options.padding || 50;
    const contentWidth = width + padding * 2;
    const contentHeight = height + padding * 2;
    
    // Use scale 2 for better quality
    const scale = 2;

    const config = {
      width: contentWidth,
      height: contentHeight,
      style: {
        transform: 'none',
        position: 'static',
        top: 'auto',
        left: 'auto',
        margin: `${padding}px`,
      },
      backgroundColor: options.backgroundColor || '#ffffff',
      pixelRatio: scale,
    };

    const dataUrl = await toPng(container, config);

    // Calculate orientation based on aspect ratio
    const orientation = contentWidth > contentHeight ? 'l' : 'p';
    
    // Initialize jsPDF with custom size matching the image
    const doc = new jsPDF({
      orientation,
      unit: 'px',
      format: [contentWidth, contentHeight],
      hotfixes: ['px_scaling'] 
    });

    doc.addImage(dataUrl, 'PNG', 0, 0, contentWidth, contentHeight);
    
    return doc.output('arraybuffer');
  });
};
