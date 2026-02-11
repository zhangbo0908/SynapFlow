# SynapFlow 版本发布规划 (Release Roadmap)

基于 [PRD_SynapFlow.md](PRD_SynapFlow.md) 的产品愿景及 [Frontend_Architecture.md](Frontend_Architecture.md)、[Backend_Architecture.md](Backend_Architecture.md) 的技术架构，制定以下详细版本迭代计划。

---

## 阶段一：地基搭建与核心闭环 (Foundation & Core Loop)
**目标**：验证 Electron 本地架构可行性，实现最基础的“打开-编辑-保存”闭环。

### v0.1.0 - 架构原型 (Skeleton)
- [x] [Tech] Electron + React + Vite + Tailwind 项目初始化。
- [x] [Tech] 配置 TypeScript 共享类型库 (Shared Types)。
- [x] [Tech] 实现 IPC 通信桥接 (Preload script)，打通 `file:open/save`。
- [x] [UI] 基础画布实现，支持节点的简单渲染（仅矩形）。

### v0.3.0 - 编辑器核心 (Editor Core)
- [x] [Feature] 核心快捷键支持：`Enter` (同级节点)、`Tab` (子节点)、`Delete` (删除)。
- [x] [Feature] 基础思维导图布局算法 (Reingold-Tilford 变种)。
- [x] [Feature] 混合渲染引擎初步集成：节点用 DOM，连线用 SVG。
- [x] [Data] 定义 `.synap` JSON 数据结构，支持本地文件读写。

### v0.5.0 - 状态与历史 (State & History)
- [x] [Feature] 撤销/重做 (Undo/Redo) 系统，支持 20+ 步历史栈。
- [x] [Feature] 节点文本编辑 (ContentEditable)。
- [x] [Feature] 自动保存 (Auto-save) 机制，防意外丢失。
- [x] [UI] 基础属性面板：修改文字颜色、背景色。

---

## 阶段二：兼容性与视觉升级 (Compatibility & Visuals)
**目标**：对标 XMind 体验，完成核心差异化功能（导入/美观度）。

### v0.7.0 - XMind 兼容 (The Bridge)
- [x] [Feature] **XMind 导入引擎**：解析 `.xmind` (Zip) 文件，还原节点结构。
- [x] [Feature] 基础样式映射：保留原文件的线条粗细、基础颜色。
- [x] [Feature] **多画布 (Multi-sheet) 架构**：支持单文件多 Sheet 管理，底部状态栏切换，完美还原 XMind 多画布结构。
- [x] [Tech] 引入 Worker 线程处理大文件解析，防止 UI 卡顿。

### v0.8.0 - 视觉系统 (Visual System)
- [x] [Feature] 连线样式支持：直线、贝塞尔曲线、折线。
- [x] [Feature] 节点形状扩展：圆角矩形、椭圆、菱形。
- [x] [Feature] **3 套核心模板**：商务专业、手绘创意、极简黑白。
- [x] [Feature] 主题布局结构支持：思维导图布局（围绕中心节点周边展开）、逻辑图布局、组织结构图布局。
- [x] [Tech] 视口裁剪 (Viewport Culling) 优化，提升大图渲染性能。
- [x] [Tech] **动态文本测量 (Dynamic Text Measurement)**：基于 Canvas 的高精度文本测量，实现节点尺寸自适应与形状优化。

### v0.9.0 - 导出与交付 (Export)
- [x] [Feature] 导出为 PNG/JPEG 图片（支持透明背景）。
- [x] [Feature] 导出为 PDF（矢量高清）。
- [x] [Feature] 导出为 Markdown（大纲模式）。
- [x] [UI] **深色模式 (Dark Mode)**：全界面暗黑风格适配，支持“暗夜霓虹”等深色主题。
- [x] [UI] 双平台 UI 细节适配（macOS 交通灯、Windows 标题栏）。

---

## 阶段三：正式发布 (MVP Launch)
**目标**：交付稳定、可用、美观的 v1.0 版本。

### v1.0.0 - 里程碑 (Milestone)
- [x] [Feature] **XMind 导出**：支持回写为 `.xmind` 格式 (已提前完成)。
- [x] [Feature] **默认中文支持**：界面默认中文，优化中文字体渲染。
- [x] [UX] **启动页 (Welcome Screen)**：
  - 集成“新建”与“打开”双入口。
  - **关键特性**：“打开文件”需直接支持读取 `.synap` 及 `.xmind` 文件，实现无感导入。
  - 显示最近打开的文件列表 (Recent Files)。
- [x] [UX] **侧边栏体验优化**：支持折叠/展开右侧属性面板，提供沉浸式画布空间。
- [x] [UX] 首次引导 (Onboarding)：快捷键提示浮层。
- [x] [Release] macOS (.dmg/.zip) 与 Windows (.exe) 安装包构建与签名。
- [ ] [Release] 自动更新模块 (Auto-updater) 集成 (已推迟)。

---

## 阶段四：未来展望 (Future)
**目标**：从工具向平台延伸，增强个性化与效率。

### v1.1.0+
- [ ] [Feature] **高级样式自定义**：用户自定义主题生成器。
- [ ] [Feature] **富文本支持**：节点内支持 Markdown 语法、插入图片附件。
- [ ] [Feature] **Zen 模式**：全屏沉浸式编辑。
- [ ] [Tech] 插件系统预研：支持第三方主题包。
