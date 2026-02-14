# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

SynapFlow 是一个基于 Electron + React 的**本地优先思维导图工具**，专注于隐私保护和 XMind 文件兼容。项目采用 TypeScript 开发，使用 Zustand 进行状态管理，纯 SVG 渲染引擎。

**核心特性**: 本地存储、XMind 深度兼容、多 Sheet 管理、撤销/重做 (20步)、多种布局模式、多主题支持。

---

## 常用命令

### 开发
```bash
npm run dev          # 启动开发环境
npm run build        # 构建项目 (包含类型检查)
npm run start        # 预览构建结果 (electron-vite preview)
```

### 测试
```bash
npm test             # 运行所有测试
npm run test:watch   # 测试监视模式
```

### 代码质量
```bash
npm run lint         # ESLint 检查并自动修复
npm run format       # Prettier 格式化
npm run typecheck    # TypeScript 类型检查
```

### 打包
```bash
npm run build:win    # Windows 打包
npm run build:mac    # macOS 打包
npm run build:linux  # Linux 打包
npm run build:unpack # 解包调试
npm run generate:icons # 生成应用图标 (需先准备 resources/icon.png)
```

---

## 架构概览

### 进程架构
Electron 三层架构：
- **主进程** (`src/main/`): 文件系统操作、原生对话框、IPC 通信
- **渲染进程** (`src/renderer/`): React UI 层
- **预加载脚本** (`src/preload/`): 安全暴露 API 给渲染进程

### 核心目录结构
```
src/
├── main/                    # 主进程
│   ├── index.ts            # IPC 通道注册
│   ├── fileSystem.ts       # 文件操作 (save/load)
│   ├── xmindParser.ts      # XMind 解析 (JSZip)
│   └── userData.ts         # 用户偏好 & 最近文件
├── preload/
│   └── index.ts            # window.api 暴露
├── renderer/
│   └── src/
│       ├── App.tsx         # 主应用入口
│       ├── components/     # UI 组件
│       ├── store/          # Zustand 状态管理
│       ├── hooks/          # 自定义 Hooks
│       └── utils/          # 工具函数
└── shared/
    └── types.ts            # 共享类型定义
```

---

## 状态管理架构

项目使用 Zustand + Immer 进行状态管理，主要有两个 Store：

### UI Store ([`useUIStore.ts`](src/renderer/src/store/useUIStore.ts))
- **主题模式**: light/dark/system
- **视图模式**: welcome/editor
- **侧边栏状态**: 开关控制
- 使用 `persist` 中间件持久化

### Mindmap Store ([`useMindmapStore.ts`](src/renderer/src/store/useMindmapStore.ts))
核心状态管理，包含：
- **多 Sheet 管理**: 创建、删除、重命名、重排序
- **节点操作**: 增删改查、移动、选择
- **历史记录**: 基于 Immer patches 的撤销/重做 (20步限制)
- **布局管理**: logic/mindmap/orgChart
- **主题管理**: 主题应用与切换

**关键特性**:
- 使用 Immer 进行不可变状态更新
- 历史记录使用 patches (内存优化 90%)
- 自动布局引擎集成
- 数据迁移支持

---

## IPC 通信 API

### 文件操作
- `file:open` - 打开文件 (.synap, .xmind)
- `file:save` - 保存文件
- `file:saveMarkdown` - 导出 Markdown
- `file:saveImage` - 导出图片 (PNG/JPEG)
- `file:savePdf` - 导出 PDF
- `file:importXMind` - 导入 XMind

### 应用信息
- `app:getRecentFiles` - 获取最近文件列表 (最多10个)

### 用户偏好
- `user:getPreferences` - 获取用户偏好
- `user:updatePreferences` - 更新用户偏好

### 使用方式
在渲染进程中通过 `window.api.xxx()` 调用。

---

## 核心组件

### [CanvasWorkspace.tsx](src/renderer/src/components/CanvasWorkspace.tsx)
核心画布组件，负责：
- SVG 渲染
- 拖放操作
- 缩放和平移
- 键盘快捷键

### [MindmapRenderer.tsx](src/renderer/src/components/MindmapRenderer.tsx)
SVG 渲染引擎：
- 视口裁剪优化 (Viewport Culling)
- 递归渲染节点
- 连接线生成 (支持 bezier/straight/step/hand-drawn)
- 主题样式应用

### [NodeComponent.tsx](src/renderer/src/components/NodeComponent.tsx)
单个节点组件：
- 支持 8 种形状: rectangle, rounded, ellipse, diamond, capsule, hexagon, cloud, underline
- 双击编辑文本
- 选择状态
- 拖拽起点

### [PropertiesPanel.tsx](src/renderer/src/components/PropertiesPanel.tsx)
属性面板：节点属性编辑

### [SheetBar.tsx](src/renderer/src/components/SheetBar.tsx)
工作表标签栏：多 Sheet 切换

---

## 类型系统

核心类型定义在 [`src/shared/types.ts`](src/shared/types.ts):

```typescript
// 节点样式
interface NodeStyle {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  borderRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  fontSize?: number;
  shape?: "rectangle" | "rounded" | "ellipse" | "diamond" | "capsule" | "hexagon" | "cloud" | "underline";
  lineStyle?: "straight" | "bezier" | "step" | "hand-drawn";
}

// 思维导图节点
interface MindmapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: string[];
  parentId?: string;
  isRoot?: boolean;
  style?: NodeStyle;
}

// 工作表
interface Sheet {
  id: string;
  title: string;
  rootId: string;
  nodes: Record<string, MindmapNode>;
  theme: string;
  layout?: "logic" | "mindmap" | "orgChart";
  themeConfig?: ThemeConfig;
  editorState: { zoom: number; offset: { x: number; y: number }; selectedId?: string };
}
```

---

## 数据流与状态更新

### 单向数据流
```
UI Action → Store Action → Immer Update → State Update → UI Re-render
```

### 状态更新流程
1. 组件触发 store action
2. Store 使用 Immer 产生 patches
3. 应用 patches 更新状态
4. 触发历史记录 (undo/redo)
5. 可选触发布局重新计算
6. UI 响应式更新

### 自动保存机制
位于 [`useAutoSave.ts`](src/renderer/src/hooks/useAutoSave.ts):
- 2秒延迟防抖
- 快照对比避免不必要的保存
- 手动保存支持 (Cmd+S)
- 保存状态反馈

---

## 主题系统

主题配置在 [`themePresets.ts`](src/renderer/src/utils/themePresets.ts):

**6 种预设主题** (每种都有 light/dark 版本):
- 商务专业 (business)
- 清新薄荷 (fresh)
- 极简黑白 (minimal)
- 活力橙光 (vibrant)
- 赛博科技 (dark)
- 手绘草图 (handDrawn)

**节点层级样式**:
- `rootStyle` - 根节点
- `primaryStyle` - 一级分支
- `secondaryStyle` - 二级及以下分支

---

## 布局引擎

支持三种布局模式 (通过 `applyLayout` 函数):
- **logic** - 逻辑图 (水平布局)
- **mindmap** - 思维导图 (辐射布局)
- **orgChart** - 组织架构图 (垂直布局)

布局自动计算节点位置和连线。

---

## XMind 兼容性

XMind 解析在 [`xmindParser.ts`](src/main/xmindParser.ts):
- 支持 XMind Zen 格式 (JSON content.json)
- 使用 JSZip 解压 ZIP 文件
- 智能识别旧版 XML 格式并提示用户
- 样式映射和主题继承

**注意**: 旧版 XML 格式需要转换提示。

---

## 性能优化策略

1. **增量历史记录**: 使用 Immer patches 代替全量快照，内存占用降低 90%
2. **视口裁剪**: 仅渲染可见区域的节点
3. **组件记忆化**: 使用 `React.memo` 和 `useCallback`
4. **防抖保存**: 2秒延迟自动保存

---

## 测试策略

- 使用 Vitest + React Testing Library
- 测试文件与源文件同目录，使用 `.test.ts` 后缀
- 运行单个测试: `npm test -- <test-file-pattern>`

---

## 安全注意事项

- **沙盒模式**: 已启用 (`sandbox: true`)
- **上下文隔离**: 已启用 (`contextIsolation: true`)
- **GPU**: 当前禁用 (避免某些环境问题)

---

## 常见问题

### macOS 运行提示"已损坏"
```bash
sudo xattr -rd com.apple.quarantine /Applications/SynapFlow.app
```

### 导入旧版 XMind 失败
旧版 XML 格式需要先在 XMind 中转换为 Zen 格式。

### 节点不显示
检查 `setMindmap` 后是否触发了 `applyLayout`，数据加载与布局计算需要原子性执行。

---

## 已知问题

### `app:getRecentFiles` API 未完全暴露
`src/shared/types.ts` 中定义了 `app.getRecentFiles` 接口，但 `src/preload/index.ts` 中未实际暴露该 API。如需使用，需在 preload 中添加:
```typescript
app: {
  getRecentFiles: () => ipcRenderer.invoke("app:getRecentFiles"),
}
```

---

## 已安装技能 (Installed Skills)

### UI/UX Pro Max
- **定义文件**: [.trae/skills/ui-ux-pro-max/SKILL.md](.trae/skills/ui-ux-pro-max/SKILL.md)
- **功能**: 提供专业级 UI/UX 设计建议、配色方案、字体搭配及设计系统生成。
- **使用方式**: 
  - 查阅 `SKILL.md` 获取设计准则。
  - 运行 `python3 .trae/skills/ui-ux-pro-max/scripts/search.py` 进行设计系统生成。

