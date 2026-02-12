// @vitest-environment node
import { describe, it, expect } from "vitest";
import { generateXMindBuffer } from "../../src/main/xmindParser";
import { LocalMindmap, MindmapNode } from "../../src/shared/types";
import JSZip from "jszip";

describe("XMind Exporter", () => {
  const mockNode: MindmapNode = {
    id: "root",
    text: "Central Topic",
    x: 0,
    y: 0,
    width: 100,
    height: 40,
    isRoot: true,
    children: ["child-1"],
    style: {
      backgroundColor: "#ff0000",
      fontSize: 14,
    },
  };

  const mockChild: MindmapNode = {
    id: "child-1",
    text: "Child Topic",
    x: 100,
    y: 0,
    width: 100,
    height: 40,
    isRoot: false,
    children: [],
    parentId: "root",
  };

  const mockData: LocalMindmap = {
    rootId: "root",
    nodes: {
      root: mockNode,
      "child-1": mockChild,
    },
    version: "0.1.0",
    theme: "default",
  };

  it("should generate a valid XMind file buffer", async () => {
    const buffer = await generateXMindBuffer(mockData);
    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);

    const zip = await JSZip.loadAsync(buffer);

    // Check required files
    expect(zip.file("content.json")).not.toBeNull();
    expect(zip.file("manifest.json")).not.toBeNull();
    expect(zip.file("metadata.json")).not.toBeNull();

    // Verify content.json
    const contentStr = await zip.file("content.json")!.async("string");
    const sheets = JSON.parse(contentStr);
    expect(sheets).toHaveLength(1);

    const sheet = sheets[0];
    expect(sheet.rootTopic.id).toBe("root");
    expect(sheet.rootTopic.title).toBe("Central Topic");
    expect(sheet.rootTopic.style.properties["svg:fill"]).toBe("#ff0000");
    expect(sheet.rootTopic.style.properties["fo:font-size"]).toBe("14");

    expect(sheet.rootTopic.children.attached).toHaveLength(1);
    expect(sheet.rootTopic.children.attached[0].id).toBe("child-1");
    expect(sheet.rootTopic.children.attached[0].title).toBe("Child Topic");
  });

  it("should update existing XMind file structure", async () => {
    // Create an initial zip
    const initialZip = new JSZip();
    initialZip.file(
      "content.json",
      JSON.stringify([
        {
          id: "existing-sheet",
          title: "Old Sheet",
          rootTopic: { id: "old-root", title: "Old Root" },
        },
      ]),
    );
    initialZip.file("other.txt", "keep me");
    const initialBuffer = await initialZip.generateAsync({
      type: "nodebuffer",
    });

    // Update it
    const updatedBuffer = await generateXMindBuffer(mockData, initialBuffer);
    const zip = await JSZip.loadAsync(updatedBuffer);

    // Check if other files are preserved
    expect(zip.file("other.txt")).not.toBeNull();
    expect(await zip.file("other.txt")!.async("string")).toBe("keep me");

    // Check if content is updated but sheet ID preserved
    const contentStr = await zip.file("content.json")!.async("string");
    const sheets = JSON.parse(contentStr);

    expect(sheets[0].id).toBe("existing-sheet"); // Should preserve ID
    // But title might be updated if we updated logic, currently we default to 'Sheet 1' if not explicitly mapped from data
    // In current implementation:
    // let sheetTitle = 'Sheet 1'
    // if (existing) sheetTitle = oldSheets[0].title
    // So it should preserve title too
    expect(sheets[0].title).toBe("Old Sheet");

    // Root topic should be replaced
    expect(sheets[0].rootTopic.id).toBe("root");
    expect(sheets[0].rootTopic.title).toBe("Central Topic");
  });

  it("should generate multi-sheet XMind file", async () => {
    const multiSheetData: LocalMindmap = {
      version: "0.7.0",
      sheets: [
        {
          id: "sheet-1",
          title: "Sheet 1",
          rootId: "root-1",
          nodes: {
            "root-1": {
              id: "root-1",
              text: "Root 1",
              x: 0,
              y: 0,
              width: 100,
              height: 40,
              children: [],
              isRoot: true,
            },
          },
          theme: "default",
          editorState: { zoom: 1, offset: { x: 0, y: 0 } },
        },
        {
          id: "sheet-2",
          title: "Sheet 2",
          rootId: "root-2",
          nodes: {
            "root-2": {
              id: "root-2",
              text: "Root 2",
              x: 0,
              y: 0,
              width: 100,
              height: 40,
              children: [],
              isRoot: true,
            },
          },
          theme: "default",
          editorState: { zoom: 1, offset: { x: 0, y: 0 } },
        },
      ],
      activeSheetId: "sheet-1",
      // Legacy required fields mock
      rootId: "root-1",
      nodes: {},
      theme: "default",
    };

    const buffer = await generateXMindBuffer(multiSheetData);
    const zip = await JSZip.loadAsync(buffer);
    const contentStr = await zip.file("content.json")!.async("string");
    const sheets = JSON.parse(contentStr);

    expect(sheets).toHaveLength(2);
    expect(sheets[0].id).toBe("sheet-1");
    expect(sheets[0].title).toBe("Sheet 1");
    expect(sheets[0].rootTopic.title).toBe("Root 1");

    expect(sheets[1].id).toBe("sheet-2");
    expect(sheets[1].title).toBe("Sheet 2");
    expect(sheets[1].rootTopic.title).toBe("Root 2");
  });
});
