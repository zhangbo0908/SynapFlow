# SynapFlow

[![GitHub release](https://img.shields.io/github/v/release/zhangbo0908/SynapFlow?include_prereleases)](https://github.com/zhangbo0908/SynapFlow/releases)
[![Download macOS](https://img.shields.io/badge/download-macOS-blue?logo=apple)](https://github.com/zhangbo0908/SynapFlow/releases/download/v1.4.0/SynapFlow-1.4.0-arm64-mac.zip)
[![Download Windows](https://img.shields.io/badge/download-Windows-blue?logo=windows)](https://github.com/zhangbo0908/SynapFlow/releases/download/v1.4.0/SynapFlow-Setup-1.4.0.exe)

SynapFlow 是一个专注于隐私、高性能的本地思维导图应用。它采用现代 Web 技术构建，旨在提供流畅的思维梳理体验，完全兼容 XMind 文件格式。

## ✨ 核心特性

- **🔒 隐私优先**：纯本地运行，数据不上传云端，完全掌控您的数据安全。
- **🚀 视觉系统 (v0.8.0)**：
  - **主题预设**：内置 5 套精美主题（商务专业、清新薄荷、极简黑白、活力橙光、暗夜霓虹）。
  - **节点自定义**：支持 8 种节点形状（矩形、胶囊、椭圆、菱形、六边形、云朵、下划线等）。
  - **连线样式**：支持贝塞尔曲线、直线、折线（Step Line）等多种渲染模式。
- **📐 智能布局引擎**：
  - 支持 **逻辑图**（Logic Chart）、**思维导图**（Mindmap）、**组织结构图**（Org Chart）等多种布局模式。
  - 基于 Reingold-Tilford 算法，自动优化节点分布。
- **🔄 XMind 深度兼容**：
  - 支持导入 `.xmind` 文件（完美兼容 Zen 及新版 JSON 格式）。
  - 支持直接回写保存为 `.xmind` 格式。
  - 智能识别旧版 XML 格式并提供转换建议。
- **⚡️ 高效交互与管理**：
  - **多 Sheet 支持**：如同 Excel 般管理多个思维导图页面。
  - **撤销/重做**：基于 Immer 的不可变数据流，支持 20 步深度历史记录。
  - **自动保存**：实时防丢失机制，支持 Cmd+S 快速同步到本地文件。
- **📤 多格式导出 (v0.9.0)**：支持一键导出为 **Markdown**、**PDF** 以及 **高保真图片** (PNG/JPEG)，方便分享与二次编辑。
- **🖱️ 交互升级 (v1.1.0)**：
  - **节点拖拽重组**：直观地拖动节点改变层级与父子关系，支持防环检测与吸附反馈。
- **⌨️ 全键盘导航 (v1.4.0)**：
  - 支持方向键在节点间自由切换焦点（上/下/左/右导航）。
  - 支持 Enter 编辑节点、Tab 创建子节点等键盘操作。
  - 全局快捷键 Cmd/Ctrl+F 快速聚焦搜索框。
- **📐 动态布局优化 (v1.4.0)**：
  - 智能间距递减：水平间距随层级动态减小（64px → 40px → 32px）。
  - 同级节点动态避让：确保节点之间有足够间距，避免重叠。
- **🔍 全局搜索 (v1.4.0)**：
  - 实时搜索节点内容，支持 Enter 键在结果间导航。
  - 搜索结果高亮显示，附带节点路径信息。
- **🔄 自动更新 (v1.4.0)**：
  - 基于 GitHub Releases 的自动检测和下载更新。
  - 友好的更新提示界面，显示下载进度。

## 🤖 智能协作开发

SynapFlow 是一个 **人机协同开发** 的实战范式项目。我们采用了 Trae 的多智能体集群架构：
- **指挥官**：人类通过 `@` 指令精准调度专家。
- **专家集群**：由产品洞察师、UI 设计师、前后端架构师及全栈开发工程师组成的智能体团队协同作战。
- **方法论**：严格遵循 TDD（测试驱动开发）与“先文后武”的架构先行策略。

> 详情请参阅：[Trae 最佳实践文档](./docs/Trae_Best_Practice_SynapFlow.md)

## 🛠 技术栈

- **Runtime**: Electron, Node.js
- **Frontend**: React 18, TypeScript, TailwindCSS
- **State**: Zustand, Immer
- **Parsing**: JSZip, uuid
- **Testing**: Vitest, React Testing Library
- **Build**: Electron-Vite

### 📦 下载与安装

您可以在 [GitHub Releases](https://github.com/zhangbo0908/SynapFlow/releases) 页面下载最新版本的 macOS 和 Windows 制品。

- **macOS (Apple Silicon)**: [SynapFlow-1.4.0-arm64-mac.zip](https://github.com/zhangbo0908/SynapFlow/releases/download/v1.4.0/SynapFlow-1.4.0-arm64-mac.zip)
- **Windows (x64)**: [SynapFlow-Setup-1.4.0.exe](https://github.com/zhangbo0908/SynapFlow/releases/download/v1.4.0/SynapFlow-Setup-1.4.0.exe)

> **注意**：Windows 版本目前仅完成了打包编译，尚未经过深度测试。建议感兴趣的爱好者可以自行下载或通过源码编译调试。

## 🛠 开发调试

### 前置要求
- Node.js (v18+)
- npm

### 快速开始

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 运行测试
npm test

# 构建应用
npm run build
```

### 🍎 macOS 运行说明

由于本项目未进行开发者签名，在 macOS 上运行构建后的应用时，可能会提示“应用已损坏”或“无法验证开发者”。请在终端执行以下命令以解除限制：

```bash
# 请将路径替换为实际应用路径
sudo xattr -rd com.apple.quarantine /Applications/SynapFlow.app
```

## 🗓 开发进度

**当前版本**：v1.4.0（Experience & Stability Update）

### 🚀 v1.4.0 更新说明

**发布日期**：2026-02-14

**核心更新**：

1. **体验增强**：
   - ✅ **全局搜索**：实时节点搜索，支持 Enter 键导航结果
   - ✅ **全键盘导航**：方向键在节点间自由切换，Tab 创建子节点
   - ✅ **动态布局优化**：智能间距递减，同级节点动态避让

2. **稳定性提升**：
   - ✅ **自动更新机制**：GitHub Releases 自动检测下载，友好更新界面
   - ✅ **TDD 深度对齐**：155 项测试 100% 通过，确保逻辑稳健

3. **技术改进**：
   - ✅ **构建流程优化**：修复构建失败问题，确保功能完整打包
   - ✅ **类型安全增强**：逐步修复 TypeScript 类型错误

### 开发历程

- [x] **基础架构**：Electron + React + TypeScript 环境搭建
- [x] **核心编辑**：节点增删改、快捷键系统、Undo/Redo (20步)
- [x] **文件兼容**：XMind 导入导出引擎（兼容 Zen/JSON 格式）
- [x] **智能布局**：逻辑图、思维导图、组织结构图
- [x] **视觉系统**：5 套内置主题、8 种节点形状、3 种连线样式
- [x] **多页签管理**：多 Sheet 切换与独立状态存储
- [x] **多格式导出**：Markdown、PDF 及高保真图片导出支持
- [x] **交互升级**：节点拖拽重组、防环检测与视觉反馈 (v1.1.0)
- [x] **性能飞跃 (v1.2.0)**：
  - [x] **增量历史记录**：引入 Immer Patches，内存占用降低 90%
  - [x] **渲染优化**：智能视口剔除 (Viewport Culling) 与组件级记忆化 (React.memo)
- [x] **视觉增强与稳定性 (v1.3.1)**：
  - [x] **UI 交互重构**：Teal+Orange 专业配色，Flat Design 2.0 风格。
  - [x] **画布遮挡修复**：解决标题栏遮挡画布交互的布局冲突。
  - [x] **TDD 深度对齐**：123 项测试 100% 通过，确保逻辑稳健。
  - [x] **窗口拖拽优化**：修复原生标题栏拖拽区域失效问题。
- [x] **体验增强与自动更新 (v1.4.0)**：
  - [x] **全局搜索**：实时节点搜索，支持 Enter 键导航结果。
  - [x] **全键盘导航**：方向键在节点间自由切换，Tab 创建子节点。
  - [x] **动态布局优化**：智能间距递减，同级节点动态避让。
  - [x] **自动更新机制**：GitHub Releases 自动检测下载，友好更新界面。
  - [x] **TDD 深度对齐**：155 项测试 100% 通过，确保逻辑稳健。

## ⚠️ 免责声明

1. **学习用途**：本项目主要用于探索与学习 **AI 辅助编程（AI-Assisted Programming）** 及多智能体协作流，非商业化产品。
2. **格式兼容性**：项目对 `.xmind` 格式的支持仅出于技术研究与兼容性测试目的。SynapFlow 与 XMind Ltd. 无任何官方关联，亦不保证在所有场景下与 XMind 软件的完全一致性。
3. **数据安全**：虽然本项目致力于隐私保护，但作为学习实验项目，请勿将其用于存储极其重要的生产数据。

## 📄 许可证

[MIT License](LICENSE)
