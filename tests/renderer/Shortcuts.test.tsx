// @vitest-environment jsdom
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import CanvasWorkspace from '../../src/renderer/src/components/CanvasWorkspace';
import { useMindmapStore } from '../../src/renderer/src/store/useMindmapStore';

describe('Shortcuts', () => {
  beforeEach(() => {
    useMindmapStore.setState({
      data: {
        version: '0.7.0',
        sheets: [{
          id: 'sheet-1',
          title: 'Sheet 1',
          rootId: 'root',
          nodes: {
            root: {
              id: 'root',
              text: 'Root',
              x: 0, y: 0, width: 100, height: 40,
              children: [],
              isRoot: true,
            }
          },
          theme: 'default',
          editorState: { zoom: 1, offset: { x: 0, y: 0 }, selectedId: 'root' }
        }],
        activeSheetId: 'sheet-1',
        // Legacy fields
        rootId: 'root', nodes: {}, editorState: { zoom: 1, offset: { x: 0, y: 0 } }
      }
    });
  });

  const getActiveSheet = () => {
    const state = useMindmapStore.getState().data;
    return state.sheets.find(s => s.id === state.activeSheetId)!;
  };

  it('adds child node on Tab', () => {
    render(<CanvasWorkspace />);
    
    act(() => {
      fireEvent.keyDown(document, { key: 'Tab' });
    });
    
    const root = getActiveSheet().nodes['root'];
    expect(root.children.length).toBe(1);
  });

  it('adds sibling node on Enter', () => {
    // Setup: Root -> Child
    useMindmapStore.getState().addChildNode('root');
    const childId = getActiveSheet().nodes['root'].children[0];
    useMindmapStore.getState().selectNode(childId);
    
    render(<CanvasWorkspace />);
    
    act(() => {
      fireEvent.keyDown(document, { key: 'Enter' });
    });
    
    const root = getActiveSheet().nodes['root'];
    expect(root.children.length).toBe(2);
  });

  it('deletes node on Delete', () => {
    // Setup: Root -> Child
    useMindmapStore.getState().addChildNode('root');
    const childId = getActiveSheet().nodes['root'].children[0];
    useMindmapStore.getState().selectNode(childId);
    
    render(<CanvasWorkspace />);
    
    act(() => {
      fireEvent.keyDown(document, { key: 'Delete' });
    });
    
    const root = getActiveSheet().nodes['root'];
    expect(root.children.length).toBe(0);
  });

  it('does not trigger shortcuts when editing text', () => {
    // This is hard to test purely with unit tests because "editing mode" is internal state of NodeComponent
    // or implies an active input element.
    // We can simulate having an input focused.
    
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    render(<CanvasWorkspace />);
    
    fireEvent.keyDown(input, { key: 'Delete' });
    
    // Should NOT delete
    expect(getActiveSheet().nodes['root']).toBeDefined(); // Root won't be deleted anyway, but let's check side effects
    
    // Let's test with a child node to be sure
    useMindmapStore.getState().addChildNode('root');
    const root = getActiveSheet().nodes['root'];
    const childId = root.children[0];
    useMindmapStore.getState().selectNode(childId);

    fireEvent.keyDown(input, { key: 'Delete' });
    expect(getActiveSheet().nodes[childId]).toBeDefined();
    
    document.body.removeChild(input);
  });
});
