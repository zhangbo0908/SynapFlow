// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseXMindFile } from "../../src/main/xmindParser";
import JSZip from "jszip";

vi.mock("jszip", () => {
  return {
    default: {
      loadAsync: vi.fn(),
    },
  };
});

describe("xmindParser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw XMIND_XML_NOT_SUPPORTED when content.xml exists but content.json does not", async () => {
    const mockZip = {
      file: vi.fn((filename) => {
        if (filename === "content.xml") return {};
        return null;
      }),
    };

    // @ts-ignore
    JSZip.loadAsync.mockResolvedValue(mockZip);

    await expect(parseXMindFile(Buffer.from(""))).rejects.toThrow(
      "XMIND_XML_NOT_SUPPORTED",
    );
  });

  it("should throw INVALID_XMIND_FILE when neither exists", async () => {
    const mockZip = {
      file: vi.fn(() => null),
    };

    // @ts-ignore
    JSZip.loadAsync.mockResolvedValue(mockZip);

    await expect(parseXMindFile(Buffer.from(""))).rejects.toThrow(
      "INVALID_XMIND_FILE",
    );
  });

  it("should parse multi-sheet XMind file correctly", async () => {
    const mockContentJson = JSON.stringify([
      {
        id: "sheet-1",
        title: "Sheet 1",
        rootTopic: { id: "root-1", title: "Root 1" },
      },
      {
        id: "sheet-2",
        title: "Sheet 2",
        rootTopic: { id: "root-2", title: "Root 2" },
      },
    ]);

    const mockZip = {
      file: vi.fn((filename) => {
        if (filename === "content.json") {
          return {
            async: vi.fn().mockResolvedValue(mockContentJson),
          };
        }
        return null;
      }),
    };

    // @ts-ignore
    JSZip.loadAsync.mockResolvedValue(mockZip);

    const result = await parseXMindFile(Buffer.from(""));

    expect(result).not.toBeNull();
    expect(result!.version).toBe("0.7.0");
    expect(result!.sheets).toHaveLength(2);

    expect(result!.sheets[0].id).toBe("sheet-1");
    expect(result!.sheets[0].title).toBe("Sheet 1");
    expect(result!.sheets[0].nodes["root-1"].text).toBe("Root 1");

    expect(result!.sheets[1].id).toBe("sheet-2");
    expect(result!.sheets[1].title).toBe("Sheet 2");
    expect(result!.sheets[1].nodes["root-2"].text).toBe("Root 2");

    // Check legacy fields (should match first sheet)
    expect(result!.activeSheetId).toBe("sheet-1");
    expect(result!.rootId).toBe("root-1");
  });
});
