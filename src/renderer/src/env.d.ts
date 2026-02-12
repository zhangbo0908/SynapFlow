/// <reference types="vite/client" />
import { LocalMindmap } from "../../shared/types";

declare global {
  interface Window {
    api: {
      file: {
        open: () => Promise<{
          canceled: boolean;
          data?: LocalMindmap;
          filePath?: string;
        }>;
        save: (
          data: LocalMindmap,
          filePath?: string,
        ) => Promise<{ success: boolean; filePath?: string }>;
        saveMarkdown: (
          content: string,
        ) => Promise<{ success: boolean; filePath?: string }>;
        saveImage: (
          dataUrl: string,
          format: "png" | "jpeg",
        ) => Promise<{ success: boolean; filePath?: string }>;
        savePdf: (
          data: ArrayBuffer,
        ) => Promise<{ success: boolean; filePath?: string }>;
        importXMind: () => Promise<{
          canceled: boolean;
          data?: LocalMindmap;
          filePath?: string;
          error?: string;
        }>;
      };
    };
  }
}
