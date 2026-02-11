import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MindmapRenderer from '../../../src/renderer/src/components/MindmapRenderer';
import { MindmapNode } from '../../../src/shared/types';

// Mock NodeComponent to simplify testing
vi.mock('../../../src/renderer/src/components/NodeComponent', () => ({
  default: ({ nodeId }: { nodeId: string }) => <div data-testid={`node-${nodeId}`}>Node {nodeId}</div>
}));

describe('MindmapRenderer', () => {
  const getMockNodes = (): Record<string, MindmapNode> => ({
    'root': {
      id: 'root',
      text: 'Root',
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      children: ['child1'],
      isRoot: true
    },
    'child1': {
      id: 'child1',
      text: 'Child 1',
      x: 200,
      y: 0,
      width: 100,
      height: 50,
      children: []
    }
  });

  const defaultProps = {
    rootId: 'root',
    nodes: getMockNodes(),
    layout: 'mindmap' as const,
    culling: true,
    viewport: {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      zoom: 1
    }
  };

  it('renders all visible nodes', () => {
    render(
      <svg>
        <MindmapRenderer {...defaultProps} nodes={getMockNodes()} />
      </svg>
    );
    
    expect(screen.getByTestId('node-root')).toBeInTheDocument();
    expect(screen.getByTestId('node-child1')).toBeInTheDocument();
  });

  it('renders connections between nodes', () => {
    const { container } = render(
      <svg>
        <MindmapRenderer {...defaultProps} nodes={getMockNodes()} />
      </svg>
    );
    
    // Check for path elements
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('culls nodes outside the viewport when culling is enabled', () => {
    const nodes = getMockNodes();
    nodes['farChild'] = {
      id: 'farChild',
      text: 'Far Child',
      x: 2000, // Way outside viewport
      y: 2000,
      width: 100,
      height: 50,
      children: []
    };
    nodes['root'].children.push('farChild');

    render(
      <svg>
        <MindmapRenderer {...defaultProps} nodes={nodes} />
      </svg>
    );
    
    expect(screen.getByTestId('node-root')).toBeInTheDocument();
    expect(screen.queryByTestId('node-farChild')).not.toBeInTheDocument();
  });

  it('renders all nodes when culling is disabled', () => {
    const nodes = getMockNodes();
    nodes['farChild'] = {
      id: 'farChild',
      text: 'Far Child',
      x: 2000, // Way outside viewport
      y: 2000,
      width: 100,
      height: 50,
      children: []
    };
    nodes['root'].children.push('farChild');

    render(
      <svg>
        <MindmapRenderer {...defaultProps} nodes={nodes} culling={false} />
      </svg>
    );
    
    expect(screen.getByTestId('node-root')).toBeInTheDocument();
    expect(screen.getByTestId('node-farChild')).toBeInTheDocument();
  });
});
