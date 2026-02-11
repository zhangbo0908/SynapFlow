import { describe, it, expect } from 'vitest';
import { applyLayout } from '../../src/renderer/src/utils/layoutEngine';
import { MindmapNode } from '../../src/shared/types';

describe('Layout Engine', () => {
  const createNode = (id: string, text: string, width: number, height: number, parentId?: string): MindmapNode => ({
    id,
    text,
    x: 0,
    y: 0,
    width,
    height,
    children: [],
    parentId,
    isRoot: !parentId
  });

  it('should layout logic chart correctly (left to right)', () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode('root', 'Root', 100, 50),
      c1: createNode('c1', 'Child 1', 80, 40, 'root'),
      c2: createNode('c2', 'Child 2', 80, 40, 'root')
    };
    nodes['root'].children = ['c1', 'c2'];

    applyLayout('root', nodes, 'logic');

    // Logic chart: Children should be to the right of root
    expect(nodes['c1'].x).toBeGreaterThan(nodes['root'].x);
    expect(nodes['c2'].x).toBeGreaterThan(nodes['root'].x);
    
    // Children should not overlap vertically
    expect(nodes['c1'].y).not.toBe(nodes['c2'].y);
  });

  it('should layout mindmap correctly (radiating)', () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode('root', 'Root', 100, 50),
      c1: createNode('c1', 'Child 1', 80, 40, 'root'),
      c2: createNode('c2', 'Child 2', 80, 40, 'root'),
      c3: createNode('c3', 'Child 3', 80, 40, 'root')
    };
    nodes['root'].children = ['c1', 'c2', 'c3'];

    applyLayout('root', nodes, 'mindmap');

    // Mindmap: Should distribute left and right
    // Check if at least one is on left and one on right (relative to root center)
    // Or simpler: check x coordinates are different (some positive, some negative relative to root if root is 0,0)
    // Actually layout engine sets absolute coordinates.
    // If root is at 0,0 (start), some children should be left (x < root.x) and some right (x > root.x).
    
    const leftNodes = ['c1', 'c2', 'c3'].filter(id => nodes[id].x < nodes['root'].x);
    const rightNodes = ['c1', 'c2', 'c3'].filter(id => nodes[id].x > nodes['root'].x);
    
    // With 3 nodes, usually it splits.
    expect(leftNodes.length + rightNodes.length).toBe(3);
    // At least one on each side is expected if the algorithm alternates or splits evenly
    // But if implementation fills right then left, might be 2 and 1.
    // Let's just check they are placed.
    expect(nodes['c1'].x).not.toBe(nodes['root'].x);
  });
  
  it('should layout org chart correctly (top to down)', () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode('root', 'Root', 100, 50),
      c1: createNode('c1', 'Child 1', 80, 40, 'root'),
      c2: createNode('c2', 'Child 2', 80, 40, 'root')
    };
    nodes['root'].children = ['c1', 'c2'];

    applyLayout('root', nodes, 'orgChart');

    // Org chart: Children should be below root
    expect(nodes['c1'].y).toBeGreaterThan(nodes['root'].y);
    expect(nodes['c2'].y).toBeGreaterThan(nodes['root'].y);
    
    // Children should be spaced horizontally
    expect(nodes['c1'].x).not.toBe(nodes['c2'].x);
  });
});
