// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SheetBar from '../../../src/renderer/src/components/SheetBar';
import { useMindmapStore } from '../../../src/renderer/src/store/useMindmapStore';
import '@testing-library/jest-dom';

describe('SheetBar', () => {
  beforeEach(() => {
    // Reset store
    useMindmapStore.setState({
      data: {
        version: '0.7.0',
        sheets: [
          {
            id: 'sheet-1',
            title: 'Sheet 1',
            rootId: 'root-1',
            nodes: { 'root-1': { id: 'root-1', text: 'Root 1', x: 0, y: 0, width: 100, height: 40, children: [], isRoot: true } },
            theme: 'default',
            editorState: { zoom: 1, offset: { x: 0, y: 0 } }
          },
          {
            id: 'sheet-2',
            title: 'Sheet 2',
            rootId: 'root-2',
            nodes: { 'root-2': { id: 'root-2', text: 'Root 2', x: 0, y: 0, width: 100, height: 40, children: [], isRoot: true } },
            theme: 'default',
            editorState: { zoom: 1, offset: { x: 0, y: 0 } }
          }
        ],
        activeSheetId: 'sheet-1',
        rootId: 'root-1', nodes: {}, editorState: { zoom: 1, offset: { x: 0, y: 0 } }
      }
    });
  });

  it('renders all sheets', () => {
    render(<SheetBar />);
    expect(screen.getByText('Sheet 1')).toBeInTheDocument();
    expect(screen.getByText('Sheet 2')).toBeInTheDocument();
  });

  it('switches active sheet on click', () => {
    render(<SheetBar />);
    
    fireEvent.click(screen.getByText('Sheet 2'));
    
    const state = useMindmapStore.getState().data;
    expect(state.activeSheetId).toBe('sheet-2');
  });

  it('adds a new sheet', () => {
    render(<SheetBar />);
    
    fireEvent.click(screen.getByTitle('New Sheet'));
    
    const state = useMindmapStore.getState().data;
    expect(state.sheets.length).toBe(3);
    expect(state.activeSheetId).toBe(state.sheets[2].id);
  });

  it('shows context menu on right click', () => {
    render(<SheetBar />);
    
    const sheet1 = screen.getByText('Sheet 1');
    fireEvent.contextMenu(sheet1);
    
    expect(screen.getByText('Rename')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renames sheet via context menu', () => {
    render(<SheetBar />);
    
    // Right click Sheet 1
    fireEvent.contextMenu(screen.getByText('Sheet 1'));
    
    // Click Rename
    fireEvent.click(screen.getByText('Rename'));
    
    // Input should appear with current value
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Sheet 1');
    
    // Change value
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(screen.getByText('New Name')).toBeInTheDocument();
    const state = useMindmapStore.getState().data;
    expect(state.sheets[0].title).toBe('New Name');
  });

  it('deletes sheet via context menu', () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);
    
    render(<SheetBar />);
    
    // Right click Sheet 2
    fireEvent.contextMenu(screen.getByText('Sheet 2'));
    
    // Click Delete
    fireEvent.click(screen.getByText('Delete'));
    
    expect(confirmSpy).toHaveBeenCalled();
    const state = useMindmapStore.getState().data;
    expect(state.sheets.length).toBe(1);
    expect(state.sheets[0].id).toBe('sheet-1');
    
    confirmSpy.mockRestore();
  });
  
  it('does not delete if only one sheet remains', () => {
    useMindmapStore.setState(state => ({
        data: {
            ...state.data,
            sheets: [state.data.sheets[0]],
            activeSheetId: 'sheet-1'
        }
    }));
    
    render(<SheetBar />);
    
    fireEvent.contextMenu(screen.getByText('Sheet 1'));
    
    // Delete option should be disabled or handled gracefully
    // In this implementation, let's assume we check if it actually deleted
    const deleteBtn = screen.queryByText('Delete');
    
    if (deleteBtn) {
        fireEvent.click(deleteBtn);
    }
    
    const state = useMindmapStore.getState().data;
    expect(state.sheets.length).toBe(1);
  });
});
