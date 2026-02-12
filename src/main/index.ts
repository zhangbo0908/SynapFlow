import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import {
  saveMindmap,
  openMindmap,
  saveMarkdown,
  saveImage,
  savePdf,
} from "./fileSystem";
import { parseXMindFile } from "./xmindParser";
import { readFile } from "fs/promises";
import { LocalMindmap, UserPreferences } from "../shared/types";
import { UserDataManager } from "./userData";

// Disable GPU to avoid issues in some environments
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-software-rasterizer");

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux"
      ? { icon: join(__dirname, "../../build/icon.png") }
      : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: true,
      contextIsolation: true,
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.synapflow.app");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC Handlers
  const userDataManager = new UserDataManager();

  ipcMain.handle("app:getRecentFiles", () => {
    return userDataManager.getRecentFiles();
  });

  ipcMain.handle("user:getPreferences", () => {
    return userDataManager.getPreferences();
  });

  ipcMain.handle(
    "user:updatePreferences",
    (_, prefs: Partial<UserPreferences>) => {
      userDataManager.updatePreferences(prefs);
    },
  );

  ipcMain.handle("file:open", async (_, filePath?: string) => {
    const result = await openMindmap(filePath);
    if (!result.canceled && result.filePath) {
      userDataManager.addRecentFile(result.filePath);
    }
    return result;
  });

  ipcMain.handle(
    "file:save",
    async (_, data: LocalMindmap, filePath?: string) => {
      const result = await saveMindmap(data, filePath);
      if (result.success && result.filePath) {
        userDataManager.addRecentFile(result.filePath);
      }
      return result;
    },
  );

  ipcMain.handle("file:saveMarkdown", async (_, content: string) => {
    return await saveMarkdown(content);
  });

  ipcMain.handle(
    "file:saveImage",
    async (_, dataUrl: string, format: "png" | "jpeg") => {
      return await saveImage(dataUrl, format);
    },
  );

  ipcMain.handle("file:savePdf", async (_, data: ArrayBuffer) => {
    return await savePdf(data);
  });

  ipcMain.handle("file:importXMind", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: "Import XMind File",
      properties: ["openFile"],
      filters: [{ name: "XMind Files", extensions: ["xmind"] }],
    });

    if (canceled || filePaths.length === 0) {
      return { canceled: true };
    }

    try {
      const buffer = await readFile(filePaths[0]);
      const data = await parseXMindFile(buffer);
      return { canceled: false, data, filePath: filePaths[0] };
    } catch (error) {
      console.error("Import failed:", error);

      if (
        error instanceof Error &&
        error.message === "XMIND_XML_NOT_SUPPORTED"
      ) {
        dialog.showMessageBox({
          type: "error",
          title: "格式不支持 / Format Not Supported",
          message: "检测到旧版 XMind (XML) 格式。",
          detail:
            "SynapFlow 仅支持新版 XMind (JSON) 格式。请使用 XMind Zen 或 XMind 2020+ 另存文件后再试。",
        });
      }

      return { canceled: false, error: "Failed to parse XMind file" };
    }
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
