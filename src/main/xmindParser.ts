import JSZip from "jszip";
import { LocalMindmap, MindmapNode, Sheet, NodeStyle } from "../shared/types";
import { v4 as uuidv4 } from "uuid";

// XMind Shape to SynapFlow Shape mapping
const XMIND_SHAPE_MAP: Record<string, NodeStyle["shape"]> = {
  "rounded-rectangle": "rounded",
  "rectangle": "rectangle",
  "ellipse": "ellipse",
  "oval": "ellipse",
  "diamond": "diamond",
  "rhombus": "diamond",
  "cloud": "cloud",
  "hexagon": "hexagon",
  "capsule": "capsule",
  "underline": "underline",
};

// XMind Line Style to SynapFlow Line Style mapping
const XMIND_LINE_STYLE_MAP: Record<string, NodeStyle["lineStyle"]> = {
  "straight": "straight",
  "curve": "bezier",
  "bezier": "bezier",
  "polyline": "step",
  "step": "step",
};

interface XMindNode {
  id: string;
  title: string;
  children?: {
    attached?: XMindNode[];
  };
  style?: {
    properties?: {
      "svg:fill"?: string;
      "border-line-color"?: string;
      "fo:color"?: string;
      "fo:font-size"?: string;
      "border-line-width"?: string;
      "border-line-style"?: string;
      "border-radius"?: string;
      "shape"?: string;
      "line-style"?: string;
    };
  };
}

interface XMindJsonSheet {
  id: string;
  title: string;
  rootTopic: XMindNode;
}

// Helper to convert XMind node to our MindmapNode
const convertNode = (
  xNode: XMindNode,
  parentId: string | undefined,
  nodes: Record<string, MindmapNode>,
  isRoot: boolean = false,
): string => {
  const nodeId = xNode.id || uuidv4();

  // Map XMind shape to SynapFlow shape
  const xmindShape = xNode.style?.properties?.["shape"];
  const shape = xmindShape ? XMIND_SHAPE_MAP[xmindShape] : undefined;

  // Map XMind line style to SynapFlow line style
  const xmindLineStyle = xNode.style?.properties?.["line-style"];
  const lineStyle = xmindLineStyle ? XMIND_LINE_STYLE_MAP[xmindLineStyle] : undefined;

  // Map border style
  const xmindBorderStyle = xNode.style?.properties?.["border-line-style"];
  let borderStyle: NodeStyle["borderStyle"];
  if (xmindBorderStyle === "dashed") {
    borderStyle = "dashed";
  } else if (xmindBorderStyle === "dotted") {
    borderStyle = "dotted";
  } else if (xmindBorderStyle === "none") {
    borderStyle = "none";
  } else {
    borderStyle = "solid";
  }

  // Extract style if available
  // XMind 8 (XML) and Zen (JSON) store styles differently.
  // This is a simplified extraction for JSON format mainly.
  const style: NodeStyle = {
    backgroundColor: xNode.style?.properties?.["svg:fill"],
    borderColor: xNode.style?.properties?.["border-line-color"],
    color: xNode.style?.properties?.["fo:color"],
    fontSize: xNode.style?.properties?.["fo:font-size"]
      ? parseInt(String(xNode.style.properties["fo:font-size"]))
      : undefined,
    borderWidth: xNode.style?.properties?.["border-line-width"]
      ? parseFloat(String(xNode.style.properties["border-line-width"]))
      : undefined,
    borderRadius: xNode.style?.properties?.["border-radius"]
      ? parseFloat(String(xNode.style.properties["border-radius"]))
      : undefined,
    shape,
    lineStyle,
    borderStyle,
  };

  const newNode: MindmapNode = {
    id: nodeId,
    text: xNode.title || "Untitled",
    x: 0, // Layout engine will recalculate
    y: 0,
    width: 100, // Default width
    height: 40, // Default height
    children: [],
    parentId,
    isRoot,
    style,
  };

  nodes[nodeId] = newNode;

  if (xNode.children && xNode.children.attached) {
    // attached is an array of nodes
    // Sometimes it's wrapped in a "topics" object in older formats,
    // but in newer JSON it's often children: { attached: [...] }
    const childrenList = Array.isArray(xNode.children.attached)
      ? xNode.children.attached
      : [xNode.children.attached];

    childrenList.forEach((child: any) => {
      const childId = convertNode(child, nodeId, nodes);
      newNode.children.push(childId);
    });
  }

  return nodeId;
};

export async function parseXMindFile(
  fileBuffer: Buffer,
): Promise<LocalMindmap | null> {
  const zip = await JSZip.loadAsync(fileBuffer);

  // Check for content.json (XMind Zen / 2020+)
  const contentJsonFile = zip.file("content.json");
  if (contentJsonFile) {
    const content = await contentJsonFile.async("string");
    const xmindSheets = JSON.parse(content) as XMindJsonSheet[];

    if (xmindSheets.length > 0) {
      const sheets: Sheet[] = xmindSheets.map((xSheet) => {
        const nodes: Record<string, MindmapNode> = {};
        const rootId = convertNode(xSheet.rootTopic, undefined, nodes, true);

        return {
          id: xSheet.id || uuidv4(),
          title: xSheet.title || "Untitled Sheet",
          rootId,
          nodes,
          theme: "default",
          editorState: {
            zoom: 1,
            offset: { x: 0, y: 0 },
            selectedId: rootId,
          },
        };
      });

      // Use the first sheet for legacy compatibility
      const firstSheet = sheets[0];

      return {
        version: "0.7.0",
        sheets,
        activeSheetId: firstSheet.id,
        // Legacy fields for backward compatibility
        rootId: firstSheet.rootId,
        nodes: firstSheet.nodes,
        theme: firstSheet.theme,
        editorState: firstSheet.editorState,
      };
    }
    return null;
  }

  // Check for legacy XML format
  if (zip.file("content.xml")) {
    throw new Error("XMIND_XML_NOT_SUPPORTED");
  }

  throw new Error("INVALID_XMIND_FILE");
}

// --- Export Logic ---

// SynapFlow Shape to XMind Shape mapping
const SYNAPFLOW_SHAPE_MAP: Record<string, string> = {
  "rounded": "rounded-rectangle",
  "rectangle": "rectangle",
  "ellipse": "ellipse",
  "diamond": "diamond",
  "cloud": "cloud",
  "hexagon": "hexagon",
  "capsule": "capsule",
  "underline": "underline",
};

// SynapFlow Line Style to XMind Line Style mapping
const SYNAPFLOW_LINE_STYLE_MAP: Record<string, string> = {
  "straight": "straight",
  "bezier": "curve",
  "step": "polyline",
};

const buildXMindTree = (
  nodeId: string,
  nodes: Record<string, MindmapNode>,
): XMindNode => {
  const node = nodes[nodeId];
  if (!node) {
    // Fallback for missing nodes to avoid crash
    return {
      id: nodeId,
      title: "Error: Node Missing",
      children: { attached: [] },
    };
  }

  const xNode: XMindNode = {
    id: node.id,
    title: node.text,
    style: {
      properties: {},
    },
  };

  // Map styles
  if (node.style) {
    const props: any = {};
    if (node.style.backgroundColor)
      props["svg:fill"] = node.style.backgroundColor;
    if (node.style.borderColor)
      props["border-line-color"] = node.style.borderColor;
    if (node.style.color) props["fo:color"] = node.style.color;
    if (node.style.fontSize)
      props["fo:font-size"] = String(node.style.fontSize); // pt or px? XMind usually uses just number or pt
    if (node.style.borderWidth)
      props["border-line-width"] = String(node.style.borderWidth);
    if (node.style.borderRadius)
      props["border-radius"] = String(node.style.borderRadius);
    if (node.style.borderStyle && node.style.borderStyle !== "solid")
      props["border-line-style"] = node.style.borderStyle;
    if (node.style.shape)
      props["shape"] = SYNAPFLOW_SHAPE_MAP[node.style.shape] || node.style.shape;
    if (node.style.lineStyle)
      props["line-style"] = SYNAPFLOW_LINE_STYLE_MAP[node.style.lineStyle] || node.style.lineStyle;

    xNode.style!.properties = props;
  }

  // Map children
  if (node.children && node.children.length > 0) {
    xNode.children = {
      attached: node.children.map((childId) => buildXMindTree(childId, nodes)),
    };
  }

  return xNode;
};

export async function generateXMindBuffer(
  data: LocalMindmap,
  existingBuffer?: Buffer,
): Promise<Buffer> {
  let zip: JSZip;

  if (existingBuffer) {
    zip = await JSZip.loadAsync(existingBuffer);
  } else {
    zip = new JSZip();
    // Add minimal required files for a valid XMind file
    zip.file(
      "manifest.json",
      JSON.stringify({
        "file-entries": {
          "content.json": {},
          "metadata.json": {},
        },
      }),
    );
    zip.file(
      "metadata.json",
      JSON.stringify({
        creator: { name: "SynapFlow", version: "0.1.0" },
      }),
    );
  }

  // Construct content.json structure
  let xmindSheets: XMindJsonSheet[] = [];

  // If we have multi-sheet data
  if (data.sheets && data.sheets.length > 0) {
    xmindSheets = data.sheets.map((sheet) => ({
      id: sheet.id,
      title: sheet.title,
      rootTopic: buildXMindTree(sheet.rootId, sheet.nodes),
    }));
  } else if (data.rootId && data.nodes) {
    // Legacy single sheet data
    // Try to recover ID from existing file if possible, otherwise generate
    let sheetId = "sheet-1";
    let sheetTitle = "Sheet 1";

    if (existingBuffer && zip.file("content.json")) {
      try {
        const oldContent = await zip.file("content.json")!.async("string");
        const oldSheets = JSON.parse(oldContent) as XMindJsonSheet[];
        if (oldSheets.length > 0) {
          sheetId = oldSheets[0].id;
          sheetTitle = oldSheets[0].title;
        }
      } catch (e) {
        // Ignore error
      }
    }

    xmindSheets = [
      {
        id: sheetId,
        title: sheetTitle,
        rootTopic: buildXMindTree(data.rootId, data.nodes),
      },
    ];
  }

  zip.file("content.json", JSON.stringify(xmindSheets));

  return await zip.generateAsync({ type: "nodebuffer" });
}
