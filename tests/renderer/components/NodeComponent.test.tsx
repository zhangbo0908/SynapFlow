// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import NodeComponent from '../../../src/renderer/src/components/NodeComponent';
import { useMindmapStore } from '../../../src/renderer/src/store/useMindmapStore';
import '@testing-library/jest-dom';
import { produce } from 'immer';

describe('NodeComponent', () => {
  
  beforeEach(() => {
    useMindmapStore.setState({
      data: {
        version: '0.7.0',
        sheets: [{
            id: 'sheet-1',
            title: 'Sheet 1',
            rootId: 'root',
            nodes: {
                root: { id: 'root', text: 'Root', x:0, y:0, width:100, height:40, children:['testNode'], isRoot:true },
                testNode: {
                    id: 'testNode',
                    text: 'Test Node',
                    x: 100, y: 100, width: 100, height: 40,
                    children: [],
                }
            },
            theme: 'default',
            editorState: { zoom: 1, offset: { x: 0, y: 0 }, selectedId: undefined }
        }],
        activeSheetId: 'sheet-1',
        // Legacy fields for compatibility if any
        rootId: 'root',
        nodes: {}, 
        editorState: { zoom: 1, offset: { x: 0, y: 0 } }
      },
      history: { past: [], future: [] }
    });
  });

  it('renders node text', () => {
    render(<svg><NodeComponent nodeId="testNode" /></svg>);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('selects node on click', () => {
    render(<svg><NodeComponent nodeId="testNode" /></svg>);
    
    fireEvent.click(screen.getByText('Test Node'));
    
    const state = useMindmapStore.getState().data;
    const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
    expect(activeSheet?.editorState.selectedId).toBe('testNode');
  });

  it('enters edit mode on double click', () => {
    render(<svg><NodeComponent nodeId="testNode" /></svg>);
    
    fireEvent.doubleClick(screen.getByText('Test Node'));
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Test Node');
  });

  it('updates text on blur', () => {
    render(<svg><NodeComponent nodeId="testNode" /></svg>);
    
    fireEvent.doubleClick(screen.getByText('Test Node'));
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Text' } });
    
    fireEvent.blur(input);
    
    const state = useMindmapStore.getState().data;
    const activeSheet = state.sheets.find(s => s.id === state.activeSheetId);
    expect(activeSheet?.nodes['testNode'].text).toBe('New Text');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders different shapes', () => {
    // Update state to change shape
    useMindmapStore.setState(produce(state => {
        const sheet = state.data.sheets.find(s => s.id === state.data.activeSheetId);
        if (sheet && sheet.nodes['testNode']) {
            sheet.nodes['testNode'].style = { ...sheet.nodes['testNode'].style, shape: 'ellipse' };
        }
    }));
    
    const { container: c1, unmount: u1 } = render(<svg><NodeComponent nodeId="testNode" /></svg>);
    expect(c1.querySelector('ellipse')).toBeInTheDocument();
    u1();
    
    // Test diamond (polygon)
    useMindmapStore.setState(produce(state => {
        const sheet = state.data.sheets.find(s => s.id === state.data.activeSheetId);
        if (sheet && sheet.nodes['testNode']) {
            sheet.nodes['testNode'].style = { ...sheet.nodes['testNode'].style, shape: 'diamond' };
        }
    }));
    
    const { container: c2, unmount: u2 } = render(<svg><NodeComponent nodeId="testNode" /></svg>);
    expect(c2.querySelector('polygon')).toBeInTheDocument();
    u2();
  });
});
