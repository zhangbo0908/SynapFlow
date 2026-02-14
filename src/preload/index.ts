import { contextBridge, ipcRenderer } from "electron";
import { LocalMindmap, UserPreferences } from "../shared/types";

if (!process.contextIsolated) {
  throw new Error("Context Isolation must be enabled in the BrowserWindow");
}

try {
  contextBridge.exposeInMainWorld("api", {
    file: {
      open: () => ipcRenderer.invoke("file:open"),
      save: (data: LocalMindmap, filePath?: string) =>
        ipcRenderer.invoke("file:save", data, filePath),
      saveMarkdown: (content: string) =>
        ipcRenderer.invoke("file:saveMarkdown", content),
      saveImage: (dataUrl: string, format: "png" | "jpeg") =>
        ipcRenderer.invoke("file:saveImage", dataUrl, format),
      savePdf: (data: ArrayBuffer) => ipcRenderer.invoke("file:savePdf", data),
      importXMind: () => ipcRenderer.invoke("file:importXMind"),
    },
    user: {
      getPreferences: () => ipcRenderer.invoke("user:getPreferences"),
      updatePreferences: (prefs: Partial<UserPreferences>) =>
        ipcRenderer.invoke("user:updatePreferences", prefs),
    },
  });

  contextBridge.exposeInMainWorld("electronAPI", {
    checkForUpdate: () => ipcRenderer.invoke("update:check"),
    downloadUpdate: () => ipcRenderer.invoke("update:download"),
    installUpdate: () => ipcRenderer.invoke("update:install"),
    onUpdateEvent: (callback: (event: string, data?: any) => void) => {
      const handlers: Record<string, (...args: any[]) => void> = {
        "update:checking": () => callback("checking"),
        "update:available": (_, data) => callback("available", data),
        "update:progress": (_, data) => callback("downloading", data),
        "update:downloaded": () => callback("downloaded"),
        "update:error": (_, data) => callback("error", data),
      };

      Object.entries(handlers).forEach(([channel, handler]) => {
        ipcRenderer.on(channel, handler);
      });

      return () => {
        Object.entries(handlers).forEach(([channel, handler]) => {
          ipcRenderer.removeListener(channel, handler);
        });
      };
    },
  });
} catch (error) {
  console.error(error);
}
