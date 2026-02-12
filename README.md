# SynapFlow

[![GitHub release](https://img.shields.io/github/v/release/zhangbo0908/SynapFlow?include_prereleases)](https://github.com/zhangbo0908/SynapFlow/releases)
[![Download macOS](https://img.shields.io/badge/download-macOS-blue?logo=apple)](https://github.com/zhangbo0908/SynapFlow/releases/latest)
[![Download Windows](https://img.shields.io/badge/download-Windows-blue?logo=windows)](https://github.com/zhangbo0908/SynapFlow/releases/latest)

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

- **macOS (Apple Silicon)**: [SynapFlow-1.3.0-mac-arm64.zip](https://github.com/zhangbo0908/SynapFlow/releases/download/v1.3.0/SynapFlow-1.3.0-mac-arm64.zip)
- **Windows (x64)**: [SynapFlow-1.3.0-win-x64.exe](https://github.com/zhangbo0908/SynapFlow/releases/download/v1.3.0/SynapFlow-1.3.0-win-x64.exe)

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

**当前版本**：v1.3.0（Visual Enhancement Update）

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
- [x] **视觉增强 (v1.3.0)**：
  - [x] **XMind 视觉还原**：特殊形状支持、1:1 连线样式复刻、分支颜色继承
  - [x] **暗黑模式优化**：全主题深色适配、动态主题切换修复
  - [x] **手绘风格优化**：基于三次贝塞尔曲线的自然手绘连线
- [ ] **v1.4.0 规划**：
  - [ ] **体验增强**：全局搜索、节点图标/标签支持、自动更新机制

## ⚠️ 免责声明

1. **学习用途**：本项目主要用于探索与学习 **AI 辅助编程（AI-Assisted Programming）** 及多智能体协作流，非商业化产品。
2. **格式兼容性**：项目对 `.xmind` 格式的支持仅出于技术研究与兼容性测试目的。SynapFlow 与 XMind Ltd. 无任何官方关联，亦不保证在所有场景下与 XMind 软件的完全一致性。
3. **数据安全**：虽然本项目致力于隐私保护，但作为学习实验项目，请勿将其用于存储极其重要的生产数据。

## 📄 许可证

[MIT License](LICENSE)
