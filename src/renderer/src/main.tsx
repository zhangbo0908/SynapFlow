import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Mock API for browser preview
if (!window.api) {
  console.warn("Running in browser mode, mocking Electron API");
  // @ts-ignore
  window.api = {
    file: {
      open: async () => {
        alert("Open File clicked (Mock)");
        return { canceled: true };
      },
      save: async () => {
        alert("Save File clicked (Mock)");
        return { success: true };
      },
      importXMind: async () => {
        alert("Import XMind clicked (Mock)");
        return { canceled: true };
      },
      saveMarkdown: async () => {
        alert("Save Markdown clicked (Mock)");
        return { success: true };
      },
      saveImage: async () => {
        alert("Save Image clicked (Mock)");
        return { success: true };
      },
      savePdf: async () => {
        alert("Save PDF clicked (Mock)");
        return { success: true };
      },
    },
    app: {
      getRecentFiles: async () => [],
    },
  };
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
