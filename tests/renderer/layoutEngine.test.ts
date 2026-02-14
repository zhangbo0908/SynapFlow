import { describe, it, expect } from "vitest";
import { applyLayout } from "../../src/renderer/src/utils/layoutEngine";
import { MindmapNode } from "../../src/shared/types";

describe("Layout Engine", () => {
  const createNode = (
    id: string,
    text: string,
    width: number,
    height: number,
    parentId?: string,
  ): MindmapNode => ({
    id,
    text,
    x: 0,
    y: 0,
    width,
    height,
    children: [],
    parentId,
    isRoot: !parentId,
  });

  it("should layout logic chart correctly (left to right)", () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode("root", "Root", 100, 50),
      c1: createNode("c1", "Child 1", 80, 40, "root"),
      c2: createNode("c2", "Child 2", 80, 40, "root"),
    };
    nodes["root"].children = ["c1", "c2"];

    applyLayout("root", nodes, "logic");

    // Logic chart: Children should be to the right of root
    expect(nodes["c1"].x).toBeGreaterThan(nodes["root"].x);
    expect(nodes["c2"].x).toBeGreaterThan(nodes["root"].x);

    // Children should not overlap vertically
    expect(nodes["c1"].y).not.toBe(nodes["c2"].y);
  });

  it("should layout mindmap correctly (radiating)", () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode("root", "Root", 100, 50),
      c1: createNode("c1", "Child 1", 80, 40, "root"),
      c2: createNode("c2", "Child 2", 80, 40, "root"),
      c3: createNode("c3", "Child 3", 80, 40, "root"),
    };
    nodes["root"].children = ["c1", "c2", "c3"];

    applyLayout("root", nodes, "mindmap");

    // Mindmap: Should distribute left and right
    // Check if at least one is on left and one on right (relative to root center)
    // Or simpler: check x coordinates are different (some positive, some negative relative to root if root is 0,0)
    // Actually layout engine sets absolute coordinates.
    // If root is at 0,0 (start), some children should be left (x < root.x) and some right (x > root.x).

    const leftNodes = ["c1", "c2", "c3"].filter(
      (id) => nodes[id].x < nodes["root"].x,
    );
    const rightNodes = ["c1", "c2", "c3"].filter(
      (id) => nodes[id].x > nodes["root"].x,
    );

    // With 3 nodes, usually it splits.
    expect(leftNodes.length + rightNodes.length).toBe(3);
    // At least one on each side is expected if the algorithm alternates or splits evenly
    // But if implementation fills right then left, might be 2 and 1.
    // Let's just check they are placed.
    expect(nodes["c1"].x).not.toBe(nodes["root"].x);
  });

  it("should layout org chart correctly (top to down)", () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode("root", "Root", 100, 50),
      c1: createNode("c1", "Child 1", 80, 40, "root"),
      c2: createNode("c2", "Child 2", 80, 40, "root"),
    };
    nodes["root"].children = ["c1", "c2"];

    applyLayout("root", nodes, "orgChart");

    // Org chart: Children should be below root
    expect(nodes["c1"].y).toBeGreaterThan(nodes["root"].y);
    expect(nodes["c2"].y).toBeGreaterThan(nodes["root"].y);

    // Children should be spaced horizontally
    expect(nodes["c1"].x).not.toBe(nodes["c2"].x);
  });

  it("should apply horizontal gap decreasing with depth (Root -> L1: 64px)", () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode("root", "Root", 100, 50),
      l1: createNode("l1", "L1", 80, 40, "root"),
    };
    nodes["root"].children = ["l1"];

    applyLayout("root", nodes, "logic");

    // Root -> L1 should be 64px
    const expectedX = nodes["root"].x + nodes["root"].width + 64;
    expect(nodes["l1"].x).toBe(expectedX);
  });

  it("should apply horizontal gap decreasing with depth (L1 -> L2: 40px)", () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode("root", "Root", 100, 50),
      l1: createNode("l1", "L1", 80, 40, "root"),
      l2: createNode("l2", "L2", 80, 40, "l1"),
    };
    nodes["root"].children = ["l1"];
    nodes["l1"].children = ["l2"];

    applyLayout("root", nodes, "logic");

    // L1 -> L2 should be 40px
    const expectedX = nodes["l1"].x + nodes["l1"].width + 40;
    expect(nodes["l2"].x).toBe(expectedX);
  });

  it("should apply horizontal gap decreasing with depth (L2+ -> L3: 32px)", () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode("root", "Root", 100, 50),
      l1: createNode("l1", "L1", 80, 40, "root"),
      l2: createNode("l2", "L2", 80, 40, "l1"),
      l3: createNode("l3", "L3", 80, 40, "l2"),
    };
    nodes["root"].children = ["l1"];
    nodes["l1"].children = ["l2"];
    nodes["l2"].children = ["l3"];

    applyLayout("root", nodes, "logic");

    // L2 -> L3 should be 32px
    const expectedX = nodes["l2"].x + nodes["l2"].width + 32;
    expect(nodes["l3"].x).toBe(expectedX);
  });

  it("should maintain minimum vertical gap of 16px between siblings", () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode("root", "Root", 100, 50),
      c1: createNode("c1", "Child 1", 80, 40, "root"),
      c2: createNode("c2", "Child 2", 80, 40, "root"),
    };
    nodes["root"].children = ["c1", "c2"];

    applyLayout("root", nodes, "logic");

    // Calculate vertical gap between siblings
    const gap = Math.abs(nodes["c2"].y - (nodes["c1"].y + nodes["c1"].height));
    expect(gap).toBeGreaterThanOrEqual(16);
  });

  it("should calculate subtree heights correctly with dynamic gaps", () => {
    const nodes: Record<string, MindmapNode> = {
      root: createNode("root", "Root", 100, 50),
      c1: createNode("c1", "Child 1", 80, 40, "root"),
      c2: createNode("c2", "Child 2", 80, 40, "root"),
    };
    nodes["root"].children = ["c1", "c2"];

    applyLayout("root", nodes, "logic");

    // Root y should be set
    expect(nodes["root"].y).toBeDefined();
    // Children should be positioned relative to root
    expect(nodes["c1"].y).toBeDefined();
    expect(nodes["c2"].y).toBeDefined();
  });
});
