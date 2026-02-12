# CLAUDE.md

> **本项目语言为中文**，与本项目相关的所有讨论、文档和注释请使用中文。

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

SynapFlow 是一款基于 Electron、React 和 TypeScript 构建的原生思维导图应用。它支持 XMind 文件兼容、多种布局引擎、主题预设和多工作表支持。

**当前版本**：v1.1.0（支持节点拖拽重组）

## 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器（支持热重载）
npm start                # 预览生产构建版本

# 构建
npm run build            # 完整构建（类型检查 + electron-vite 构建）
npm run build:unpack     # 构建未打包版本
npm run build:mac        # 构建 macOS 应用
npm run build:win        # 构建 Windows 应用
npm run build:linux      # 构建 Linux 应用

# 测试
npm test                 # 运行所有测试（单次）
npm run test:watch       # 以监听模式运行测试

# 代码质量
npm run lint             # 运行 ESLint 并自动修复
npm run typecheck        # 运行 TypeScript 类型检查（同时检查 node 和 web）
npm run format           # 对所有文件运行 Prettier 格式化
```

### 运行单个测试文件

项目使用 Vitest 进行测试。运行特定测试文件：

```bash
npx vitest run tests/renderer/layoutEngine.test.ts
npx vitest run tests/main/xmindParser.test.ts
```

或使用监听模式：

```bash
npx vitest tests/renderer/layoutEngine.test.ts
```

## 架构设计

### Electron 进程结构

应用遵循 Electron 标准的三进程架构：

1. **主进程**（`src/main/`）：Node.js 环境，负责文件 I/O、原生对话框和 XMind 解析
2. **预加载脚本**（`src/preload/`）：主进程与渲染进程之间的桥梁，具有上下文隔离
3. **渲染进程**（`src/renderer/`）：运行在 Chromium 中的 React 应用

IPC 通信在 `src/shared/types.ts` 中通过 `AppAPI` 接口进行类型定义，并通过 `window.api` 暴露。

### 数据模型

核心数据结构是 `LocalMindmap`（定义在 `src/shared/types.ts`）：

```typescript
interface LocalMindmap {
  version: string;
  sheets: Sheet[];           // 多工作表支持（类似 Excel）
  activeSheetId: string;
}

interface Sheet {
  id: string;
  title: string;
  rootId: string;
  nodes: Record<string, MindmapNode>;  // 扁平化结构，ID 作为键
  theme: string;
  layout: 'logic' | 'mindmap' | 'orgChart';
  editorState: { zoom, offset, selectedId };
}
```

关键设计决策：
- 节点以扁平化 Record 存储（非嵌套树结构），实现 O(1) 访问
- 子节点通过 `parentId` 引用父节点，父节点通过 `children: string[]` 追踪子节点
- 多工作表架构允许单个文件包含多个思维导图

### 状态管理

使用 Zustand 配合 Immer 实现不可变更新（`src/renderer/src/store/useMindmapStore.ts`）：

- **历史记录**：手动撤销/重做，使用 `history.past` 和 `history.future` 数组
- **限制**：最多 20 步（旧条目会被移出）
- **模式**：每次修改前将当前状态推入 `past`，然后应用更改
- **访问**：在异步处理程序中使用 `getState()` 获取最新状态

### 布局引擎

`src/renderer/src/utils/layoutEngine.ts` 实现了三种布局算法：

1. **logic**：向右扩展的树形结构（组织架构图样式）
2. **mindmap**：根节点居中，子节点左右交替分布
3. **orgChart**：自上而下的层级结构

所有布局采用两遍处理方式：
1. 递归计算子树高度/宽度（缓存在 Map 中）
2. 基于缓存的尺寸定位节点

任何结构变更（添加/删除/移动节点）后都会通过 `applyLayout()` 重新应用布局。

### 主题系统

主题定义在 `src/renderer/src/utils/themePresets.ts`：

- 5 个内置预设：`business`、`fresh`、`minimal`、`vibrant`、`dark`
- 每个主题包含 `rootStyle`（根节点样式）、`primaryStyle`（根节点的直接子节点）、`secondaryStyle`（更深层级）
- 节点样式级联：主题基础 → 节点特定覆盖
- Tailwind 使用 CSS 变量实现主题化（见 `tailwind.config.js`）

### 节点形状与连线样式（v0.8.0）

节点视觉系统支持高度自定义：

**节点形状**（`MindmapNode.shape`）：
- `rectangle`：矩形
- `capsule`：胶囊形
- `ellipse`：椭圆
- `diamond`：菱形
- `hexagon`：六边形
- `cloud`：云朵形
- `underline`：下划线样式
- `none`：无边框

**连线样式**（`MindmapNode.lineStyle`）：
- `curve`：贝塞尔曲线（默认）
- `straight`：直线
- `step`：折线（Step Line）

形状渲染通过 SVG 实现，每种形状对应独立的渲染函数，在组件中根据节点的 `shape` 属性动态选择。

### 多格式导出（v0.9.0）

导出引擎位于 `src/renderer/src/utils/exportEngine.tsx`：

- **PNG/JPEG**：使用 `html-to-image` 将画布区域转换为图片
- **PDF**：使用 `jsPDF` 生成 PDF 文档
- **Markdown**：递归遍历节点树，生成层级缩进的 Markdown 格式

### XMind 兼容性

XMind 支持位于 `src/main/xmindParser.ts`：

- **导入**：从 XMind Zen/2020+ 文件读取 `content.json`（基于 zip 格式）
- **导出**：生成有效的 XMind JSON 格式，保留现有元数据
- **限制**：不支持旧版 XML 格式（`content.xml`）——会抛出 `XMIND_XML_NOT_SUPPORTED` 错误
- **策略**：保存到现有 XMind 文件时，读取原始缓冲区以保留资源/manifest

### 文件格式

原生 `.synap` 文件为 JSON 格式，结构如下：

```json
{
  "version": "0.7.0",
  "sheets": [...],
  "activeSheetId": "..."
}
```

文件也可保存为 `.xmind`（原生 XMind 格式）以实现互操作性。

### 测试策略

- **框架**：Vitest 配合 jsdom 环境
- **设置**：`tests/setup.ts` 模拟了 Canvas API、ResizeObserver 和 localStorage
- **模式**：主进程测试使用 `// @vitest-environment node` 指令
- **模拟**：主进程测试中模拟了 JSZip 和 Electron API
- **测试覆盖**：
  - `tests/main/`：文件系统操作、XMind 解析/导出、用户数据管理
  - `tests/renderer/`：布局引擎算法

### 构建系统

使用 `electron-vite` 构建三个目标：

- `main`：主进程（Node.js）
- `preload`：预加载脚本
- `renderer`：React 应用，使用 `@vitejs/plugin-react`

别名：`@renderer` 映射到 `src/renderer/src`，便于清晰导入。

### TypeScript 配置

项目使用严格的 TypeScript 配置（`tsconfig.json`）：

- `strict: true`：启用所有严格类型检查
- `noUnusedLocals`：禁止未使用的局部变量
- `noUnusedParameters`：禁止未使用的参数
- `noImplicitReturns`：禁止隐式返回
- 项目根配置使用 `references` 引用 `tsconfig.node.json` 和 `tsconfig.web.json`，分别对应主进程和渲染进程的构建目标

### 自动保存系统

`src/renderer/src/hooks/useAutoSave.ts` 实现：
- 通过 Immer patches 追踪脏状态
- 在 2 秒无活动后自动保存到现有文件路径
- 手动 Cmd+S 触发立即保存
- 工具栏中的视觉指示器显示保存状态

### 拖放功能（v1.1.0）

通过拖放重组节点（store 中的 `moveNode` 操作）：
- 循环检测防止无效移动（不能将父节点移动到其自己的子节点中）
- 样式根据新层级自动更新
- 移动后重新计算布局

### 文本测量与节点尺寸

`src/renderer/src/utils/measureText.ts` 实现节点尺寸计算：
- 使用 Canvas 2D API 的 `measureText()` 方法测量文本宽度
- 不同形状（`shape`）有不同的填充配置（`SHAPE_CONFIG`）
- 菱形和椭圆形状需要 `minWidthRatio` 增加宽度以适应文本
- 默认高度估算为 `fontSize * 1.4`

### UI 状态管理

`src/renderer/src/store/useUIStore.ts` 管理界面状态：
- 使用 Zustand persist 中间件持久化到 `localStorage`
- 存储键名为 `synapflow-ui-storage`
- 主题模式：`light` | `dark` | `system`
- 视图模式：`welcome` | `editor`

### 用户数据管理

`src/main/userData.ts` 管理用户偏好设置：
- 存储路径：`${app.getPath('userData')}/preferences.json`
- 包含最近文件列表（`recentFiles`）
- 包含完成引导状态（`hasCompletedOnboarding`）

## 关键文件参考

| 用途 | 文件 |
|------|------|
| 类型定义 | `src/shared/types.ts` |
| 主进程 | `src/main/index.ts` |
| 预加载脚本 | `src/preload/index.ts` |
| 状态管理 | `src/renderer/src/store/useMindmapStore.ts` |
| 布局引擎 | `src/renderer/src/utils/layoutEngine.ts` |
| XMind 解析 | `src/main/xmindParser.ts` |
| 文件操作 | `src/main/fileSystem.ts` |
| 主题预设 | `src/renderer/src/utils/themePresets.ts` |
| 导出功能 | `src/renderer/src/utils/exportEngine.tsx` |
| 文本测量 | `src/renderer/src/utils/measureText.ts` |
| 用户数据管理 | `src/main/userData.ts` |
