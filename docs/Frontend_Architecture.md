# SynapFlow 前端架构设计文档 (本地客户端版)

## 1. 技术栈选型 (Technology Stack)

针对 macOS 和 Windows 双平台本地应用开发，前端架构进行了原生化升级。

| 维度 | 选型 | 理由 |
| :--- | :--- | :--- |
| **基础框架** | React 18 | 强大的组件化能力，支持复杂的思维导图 UI。 |
| **运行时** | Electron (Renderer) | 跨平台兼容性最强，支持直接调用 Node.js 原生模块。 |
| **状态管理** | Zustand + Immer | 轻量、高性能，支持带容量限制（如 50 步）的 Undo/Redo 历史栈，防止内存泄漏。 |
| **绘图引擎** | SVG + Canvas (Hybrid) | 节点使用 SVG/HTML 保证交互细节，连线使用 Canvas 提升大规模渲染性能。 |
| **双平台适配** | Tailwind CSS | 轻松处理 macOS (Titlebar 透明) 与 Windows (原生标题栏) 的样式差异。 |
| **构建工具** | Vite + Electron Forge | 极速开发体验，简化多平台打包流程。 |

---

## 2. 核心架构分层 (Layered Architecture)

### 2.1 渲染层 (Renderer Layer)
- **Native Bridge (Preload)**：通过 `contextBridge` 暴露 `window.api`，实现安全的跨进程调用。
- **Hybrid Workspace**：
    - **Canvas Layer**: 负责绘制高性能连线 (Edges)。
    - **DOM/SVG Layer**: 负责绘制交互节点 (Nodes) 和 UI 控件。
- **UI Components**：采用双平台风格适配逻辑，如在 macOS 使用 SF Pro 字体，Windows 使用 Segoe UI。

### 2.2 数据持久化层 (Local Persistence)
- **File System API**：前端通过 IPC 向主进程发送保存指令，实现 `.synap` 或 `.xmind` 的实时写入。
- **Auto-save Loop**：在渲染进程维护定时器，定期向本地临时目录同步当前状态快照。

### 2.3 桥接适配器 (IPC Adapter)
- **类型安全契约 (Type-Safe Contracts)**：通过 TypeScript 共享类型库（Shared Types）定义 IPC 接口，确保前端调用与主进程处理函数的参数严格匹配。
- 封装通用的 `ipcRenderer.invoke` 调用，支持以下核心指令：
    - `file:open` / `file:save` / `file:export`
    - `shell:show-item-in-folder`
    - `window:set-title`

---

## 3. 双平台适配策略 (Cross-platform Strategy)

### 3.1 视觉与交互适配
- **标题栏 (Title Bar)**：
    - **macOS**：使用透明标题栏 (`titleBarStyle: 'hiddenInset'`)，前端模拟交通灯按钮位置。
    - **Windows**：保留或模拟原生标题栏，支持最大化/最小化动效。
- **字体系统**：
    - `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;`

### 3.2 快捷键矩阵 (Hotkeys)
针对双平台习惯进行差异化映射：
- **保存**：macOS (`Cmd + S`) / Windows (`Ctrl + S`)
- **缩放**：macOS (`Cmd + +/-`) / Windows (`Ctrl + +/-`)
- **上下文菜单**：在 Windows 上支持 `Shift + F10` 触发。

---

## 4. 性能优化 (Performance)

- **混合渲染引擎 (Hybrid Rendering)**：
    - **节点 (Nodes)**：继续使用 HTML/SVG 以确保文本可访问性和交互细节。
    - **连线 (Edges)**：采用 Canvas 绘制复杂的贝塞尔曲线连接线，大幅降低 DOM 节点数量，提升大规模重绘性能。
- **视口裁剪 (Viewport Culling)**：
    - 仅渲染当前视口可见区域内的节点（及少量缓冲区），对于视口外的节点仅保留数据结构而不生成 DOM。
- **Worker 离屏计算**：复杂的思维导图布局算法（DFS）运行在 Web Worker 中，避免阻塞主 UI 线程。
- **增量更新**：仅当节点内容或样式发生变化时，才通过 IPC 发送 Patch 数据进行持久化，而非全量保存。
- **资源本地化**：所有静态资产（图标、字体、模板）均内置于安装包中，确保离线秒开。

---

## 5. 本地文件模型 (Data Model)

```typescript
// 前端数据模型，与本地 .synap JSON 结构保持一致
interface LocalMindmap {
  version: string;
  root: MindmapNode;
  theme: string;
  editorState: {
    zoom: number;
    offset: { x: number; y: number };
    selectedId?: string;
  };
}
```

---

## 6. 安全架构
- **Context Isolation**：严格开启上下文隔离，防止第三方脚本攻击本地系统。
- **Sandbox**：Renderer 进程运行在沙盒环境中，仅能通过预定义的 IPC 接口与 Main 进程通信。
