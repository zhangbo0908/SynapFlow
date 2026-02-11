# SynapFlow 本地客户端后端架构设计文档

## 1. 架构模式 (Architecture Pattern)

SynapFlow 采用 **Electron** 驱动的本地运行时架构。与传统的 Web 后端不同，这里的“后端”指的是 Electron 的 **Main Process (主进程)**，它拥有直接访问操作系统（文件系统、原生菜单、对话框）的权限。

| 维度 | 选型 | 理由 |
| :--- | :--- | :--- |
| **运行时** | Electron | 跨平台支持，利用 Node.js 强大的文件处理能力。 |
| **进程通信** | IPC (Context Bridge) | 确保渲染进程（前端）安全地调用主进程的原生 API。 |
| **数据持久化** | 本地文件系统 (fs) | 纯文件驱动，不依赖外部数据库，符合用户对“工具软件”的心理预期。 |
| **本地缓存** | SQLite (Better-SQLite3) | 用于存储用户偏好、最近打开的文件记录以及编辑过程中的临时快照。 |

---

## 2. 核心模块设计 (Core Modules)

### 2.1 文件管理系统 (File System Bridge)
- **Native File I/O**：负责 `.synap` 和 `.xmind` 文件的读取、写入、重命名及删除。
- **路径标准化 (Path Normalization)**：强制使用 Node.js 的 `path.normalize()` 处理所有文件路径，消除 Windows (`\`) 与 macOS (`/`) 的分隔符差异，防止跨平台路径解析错误。
- **Auto-save Manager**：在本地 `AppData` 或 `Application Support` 目录下创建隐形缓存文件，防止因意外关机导致的数据丢失。
- **XMind Parser (Local)**：利用 Node.js 的 `adm-zip` 或 `jszip` 在本地解压并解析 XMind 文件。

### 2.2 进程通信协议 (IPC Protocol)
- **Secure Bridge**：通过 `preload.js` 暴露受限的 API，严禁前端直接调用 `fs` 模块。
- **类型安全契约 (Type-Safe Contracts)**：后端作为 IPC Handler，必须实现与前端共享的 TypeScript 接口定义，确保 `invoke` 和 `handle` 的参数/返回值类型严格匹配。
- **Event Bus**：
    - `file:open`：调起原生打开文件对话框。
    - `file:save`：将内存中的 JSON 数据持久化到硬盘。
    - `app:theme-change`：响应系统级主题切换。

### 2.3 导出引擎 (Native Exporter)
- **Image Exporter**：利用 Electron 的 `webContents.capturePage` 或前端 Canvas 数据生成本地 PNG/JPEG。
- **PDF Generator**：利用 Chromium 原生的 `printToPDF` 功能，生成高质量矢量 PDF 文档。

---

## 3. 数据模型与存储策略 (Data Strategy)

### 3.1 文件格式规范
- **.synap 文件**：本质是一个加密或压缩后的 JSON 文件，包含：
    - `nodes`: 树形结构数据。
    - `styles`: 导图视觉样式。
    - `metadata`: 创建时间、最后修改时间等。
- **资源包管理**：如果导图中包含图片附件，则将 `.synap` 升级为 ZIP 包结构，类似 XMind。

### 3.2 本地配置数据库 (Local Config DB)
使用 SQLite 存储轻量级非文档数据：
- **Recently Opened**：记录最近打开的文件路径及预览图。
- **User Settings**：存储自定义快捷键、默认模板偏好。

---

## 4. 系统集成 (System Integration)

### 4.1 原生功能支持
- **OS Menu Bar**：自定义系统的文件、编辑、查看菜单，支持原生快捷键分发。
- **Drag and Drop**：支持从桌面直接拖入 `.xmind` 文件进行导入。
- **Protocol Registry**：注册 `synapflow://` 协议，支持通过链接直接唤起应用。

### 4.2 性能优化
- **Stream I/O**：对于超大型导图文件，采用流式读写，避免一次性加载导致的内存溢出。
- **Worker Threads**：将复杂的 XMind 解析和布局计算任务放入 Node.js 的 Worker 线程，防止主进程 UI 阻塞。

---

## 5. 安全与隐私 (Security & Privacy)

- **Sandbox 模式**：开启 Electron 沙盒，确保前端代码无法越权访问敏感路径。
- **数据隐私**：所有操作均在本地完成，无任何用户数据上传。
- **文件校验**：写入文件时计算哈希值，确保保存过程中的数据完整性。
