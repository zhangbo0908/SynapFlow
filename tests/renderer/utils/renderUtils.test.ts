import { describe, it, expect } from "vitest";
import { getLinkPath, getBranchColor } from "../../../src/renderer/src/utils/renderUtils";
import { MindmapNode, ThemeConfig } from "../../../src/shared/types";

// Mock types if needed, or use actual types
const mockNode = (id: string, x: number, y: number, width: number, height: number, parentId?: string): MindmapNode => ({
  id,
  text: "Node",
  x,
  y,
  width,
  height,
  children: [],
  parentId,
  isRoot: !parentId,
});

describe("renderUtils", () => {
  describe("getLinkPath", () => {
    const node = mockNode("1", 0, 0, 100, 50);
    const child = mockNode("2", 200, 0, 100, 50, "1");

    it("generates straight path", () => {
      const path = getLinkPath(node, child, "straight", "logic");
      expect(path).toContain("L");
      expect(path).not.toContain("C");
    });

    it("generates bezier path", () => {
      const path = getLinkPath(node, child, "bezier", "logic");
      expect(path).toContain("C");
    });

    it("generates step path", () => {
      const path = getLinkPath(node, child, "step", "logic");
      expect(path).toContain("L");
    });
    
    it("generates hand-drawn path", () => {
       const path = getLinkPath(node, child, "hand-drawn", "logic");
       expect(path).toBeDefined();
       expect(typeof path).toBe("string");
       // It should be a curve (using Q or C)
       expect(path).toMatch(/[QC]/);
    });
  });

  describe("getBranchColor", () => {
    const theme: ThemeConfig = {
      name: "Test",
      backgroundColor: "#fff",
      lineStyle: "straight",
      palette: ["#f00", "#0f0", "#00f"], // Red, Green, Blue
      rootStyle: { color: "#000" },
      primaryStyle: { color: "#000" },
      secondaryStyle: { color: "#000" },
    };

    const child1 = mockNode("c1", 0, 0, 100, 50, "root"); // Index 0
    const child2 = mockNode("c2", 0, 0, 100, 50, "root"); // Index 1
    const child3 = mockNode("c3", 0, 0, 100, 50, "root"); // Index 2
    
    it("returns palette color for first level children based on index", () => {
      expect(getBranchColor(child1, 0, theme)).toBe("#f00");
      expect(getBranchColor(child2, 1, theme)).toBe("#0f0");
      expect(getBranchColor(child3, 2, theme)).toBe("#00f");
    });

    it("cycles palette colors", () => {
      const child4 = mockNode("c4", 0, 0, 100, 50, "root");
      expect(getBranchColor(child4, 3, theme)).toBe("#f00");
    });
  });
});
