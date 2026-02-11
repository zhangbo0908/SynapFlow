import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMarkdown, exportToPng, exportToJpeg, generatePdf } from '../../../src/renderer/src/utils/exportEngine';
import { MindmapNode as Node } from '../../../src/shared/types';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import React from 'react';

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
  toJpeg: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
}));

// Mock jspdf
vi.mock('jspdf', () => {
  const mockJsPDF = {
    addImage: vi.fn(),
    output: vi.fn().mockReturnValue(new ArrayBuffer(8)),
  };
  return {
    jsPDF: vi.fn(() => mockJsPDF),
  };
});

// Mock react-dom/client
const mockRender = vi.fn();
const mockUnmount = vi.fn();
const mockCreateRoot = vi.fn((_container: any) => ({
  render: mockRender,
  unmount: mockUnmount
}));

vi.mock('react-dom/client', () => ({
  createRoot: (container: any) => mockCreateRoot(container)
}));

// Mock MindmapRenderer
vi.mock('../../../src/renderer/src/components/MindmapRenderer', () => ({
  default: () => <div data-testid="mock-mindmap-renderer" />
}));

describe('exportEngine', () => {
  const mockNodes: Record<string, Node> = {
    'root': {
      id: 'root',
      text: 'Root Node',
      x: 0,
      y: 0,
      width: 100,
      height: 40,
      children: ['child1', 'child2'],
      isRoot: true
    },
    'child1': {
      id: 'child1',
      text: 'Child 1',
      x: 0,
      y: 50,
      width: 100,
      height: 40,
      children: ['subchild1'],
      parentId: 'root'
    },
    'child2': {
      id: 'child2',
      text: 'Child 2',
      x: 150,
      y: 50,
      width: 100,
      height: 40,
      children: [],
      parentId: 'root'
    },
    'subchild1': {
      id: 'subchild1',
      text: 'Sub Child 1',
      x: 0,
      y: 100,
      width: 100,
      height: 40,
      children: [],
      parentId: 'child1'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateRoot.mockClear();
    mockRender.mockClear();
    mockUnmount.mockClear();
    
    // Setup computed style mock
    window.getComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: (prop: string) => {
        if (prop === '--color-border-node') return '#333333';
        if (prop === '--color-bg-node') return '#ffffff';
        if (prop === '--color-text-node') return '#000000';
        return '';
      },
      trim: function() { return this.getPropertyValue(''); }
    } as any);
  });

  describe('generateMarkdown', () => {
    it('should generate correct markdown for a simple tree', () => {
      const markdown = generateMarkdown('root', mockNodes);
      const expected = `# Root Node\n## Child 1\n  - Sub Child 1\n## Child 2\n`;
      expect(markdown).toBe(expected);
    });
  });

  describe('exportToPng', () => {
    it('should create a temporary container and render MindmapRenderer', async () => {
      await exportToPng('root', mockNodes);
      
      expect(mockCreateRoot).toHaveBeenCalled();
      expect(mockRender).toHaveBeenCalled();
      
      // We expect htmlToImage to be called with a container
      expect(htmlToImage.toPng).toHaveBeenCalled();
      
      // Should clean up
      expect(mockUnmount).toHaveBeenCalled();
    });

    it('should call toPng with correct config', async () => {
      await exportToPng('root', mockNodes);
      
      expect(htmlToImage.toPng).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          // We can't easily assert width/height here because renderOffscreen logic 
          // depends on bounding box calculation which uses DOM methods not fully mocked in jsdom 
          // (like getBoundingClientRect returning zeros).
          // But we can check style config
          style: expect.objectContaining({
            margin: '20px',
            transform: 'none',
            position: 'static'
          }),
          pixelRatio: 2
        })
      );
    });
  });

  describe('exportToJpeg', () => {
    it('should call toJpeg with correct config', async () => {
      await exportToJpeg('root', mockNodes);
      
      expect(htmlToImage.toJpeg).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          backgroundColor: '#ffffff',
          quality: 0.95,
          pixelRatio: 2
        })
      );
    });
  });

  describe('generatePdf', () => {
    it('should generate PDF using jsPDF', async () => {
      const result = await generatePdf(mockNodes);
      
      expect(htmlToImage.toPng).toHaveBeenCalled();
      // Since bounding box might be 0 in jsdom, format might be default or small.
      // We just verify it calls jsPDF and addImage.
      expect(jsPDF).toHaveBeenCalled();
      
      const mockDoc = new jsPDF();
      expect(mockDoc.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,mock',
        'PNG',
        expect.any(Number), expect.any(Number), expect.any(Number), expect.any(Number)
      );
      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });
});
