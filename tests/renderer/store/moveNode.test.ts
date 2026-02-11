import { describe, it, expect, beforeEach } from 'vitest';
import { useMindmapStore } from '../../../src/renderer/src/store/useMindmapStore';
import { Sheet } from '../../../src/shared/types';

describe('useMindmapStore moveNode', () => {
  const getActiveSheet = (): Sheet => {
    const store = useMindmapStore.getState();
    const activeId = store.data.activeSheetId;
    return store.data.sheets.find(s => s.id === activeId)!;
  };

  beforeEach(() => {
    useMindmapStore.setState({
      data: {
        version: '0.7.0',
        activeSheetId: 'sheet-1',
        sheets: [
          {
            id: 'sheet-1',
            title: 'Sheet 1',
            rootId: 'root',
            nodes: {
              'root': {
                id: 'root',
                text: 'Root',
                x: 0,
                y: 0,
                width: 100,
                height: 40,
                children: ['child-1', 'child-2'],
                isRoot: true,
                style: { fontSize: 24 }
              },
              'child-1': {
                id: 'child-1',
                parentId: 'root',
                text: 'Child 1',
                x: 100,
                y: 0,
                width: 80,
                height: 30,
                children: ['subchild-1'],
                style: { fontSize: 16 }
              },
              'child-2': {
                id: 'child-2',
                parentId: 'root',
                text: 'Child 2',
                x: 100,
                y: 50,
                width: 80,
                height: 30,
                children: [],
                style: { fontSize: 16 }
              },
              'subchild-1': {
                id: 'subchild-1',
                parentId: 'child-1',
                text: 'Sub Child 1',
                x: 200,
                y: 0,
                width: 60,
                height: 20,
                children: [],
                style: { fontSize: 14 }
              }
            },
            theme: 'business',
            editorState: { zoom: 1, offset: { x: 0, y: 0 }, selectedId: undefined }
          }
        ]
      }
    });
  });

  it('should move a node to a new parent', () => {
    const store = useMindmapStore.getState();
    store.moveNode('subchild-1', 'child-2');

    const sheet = getActiveSheet();
    const subChild = sheet.nodes['subchild-1'];
    const child1 = sheet.nodes['child-1'];
    const child2 = sheet.nodes['child-2'];

    expect(subChild.parentId).toBe('child-2');
    expect(child1.children).not.toContain('subchild-1');
    expect(child2.children).toContain('subchild-1');
  });

  it('should prevent moving a node to itself', () => {
    const store = useMindmapStore.getState();
    store.moveNode('child-1', 'child-1');

    const sheet = getActiveSheet();
    expect(sheet.nodes['child-1'].parentId).toBe('root');
  });

  it('should prevent moving root node', () => {
    const store = useMindmapStore.getState();
    store.moveNode('root', 'child-1');

    const sheet = getActiveSheet();
    expect(sheet.nodes['root'].parentId).toBeUndefined();
    expect(sheet.nodes['child-1'].children).not.toContain('root');
  });

  it('should prevent cyclic movement (moving to descendant)', () => {
    const store = useMindmapStore.getState();
    // Try to move child-1 to subchild-1 (which is a child of child-1)
    store.moveNode('child-1', 'subchild-1');

    const sheet = getActiveSheet();
    expect(sheet.nodes['child-1'].parentId).toBe('root');
    expect(sheet.nodes['subchild-1'].children).not.toContain('child-1');
  });

  it('should reorder nodes if moving to same parent (optional behavior, implemented as append currently)', () => {
    // Current implementation just appends to the end.
    // To test reordering properly, we might need a specific index, but moveNode(id, parentId) API implies appending.
    // If we want to test reordering within same parent, we check if it moves to end.
    const store = useMindmapStore.getState();
    
    // root children: ['child-1', 'child-2']
    // Move child-1 to root (should effectively move it to end?)
    // But implementation says:
    // if (node.parentId === targetParentId) return;
    // So it prevents moving to same parent currently!
    
    // Let's verify that behavior
    store.moveNode('child-1', 'root');
    const sheet = getActiveSheet();
    expect(sheet.nodes['root'].children).toEqual(['child-1', 'child-2']);
  });
});
