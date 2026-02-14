# SynapFlow UI 设计规范 (Design Specification)

本规范由 **UI/UX Pro Max** 智能设计系统驱动，结合 SynapFlow PRD 愿景深度定制。核心设计哲学：**秩序 (Order)、流动 (Flow)、克制 (Restraint)**。

---

## 1. 设计令牌 (Design Tokens)

### 1.1 色彩系统 (Color Palette)
采用 **Teal (青色)** 作为主色调，象征高效与冷静；**Action Orange (活力橙)** 作为强调色，引导关键操作。

#### 1.1.1 应用界面 (App UI)
| 令牌名称 | 浅色模式 (Light) | 深色模式 (Dark) | 用途 |
| :--- | :--- | :--- | :--- |
| `ui-bg-app` | `#F0FDFA` (极浅青) | `#0F172A` (深蓝黑) | 应用整体背景 |
| `ui-bg-panel` | `#FFFFFF` | `#1E293B` | 侧边栏/工具栏背景 |
| `ui-brand` | `#0D9488` | `#2DD4BF` | 品牌主色 |
| `ui-accent` | `#F97316` | `#FB923C` | 强调色/CTA |
| `ui-text-primary` | `#134E4A` | `#F1F5F9` | 主要文本 |
| `ui-text-secondary`| `#5E7E7B` | `#94A3B8` | 次要文本 |
| `ui-border-base` | `#CCF2ED` | `#334155` | UI 分割线/边框 |

#### 1.1.2 导图内容 (Map Content)
分支颜色遵循“彩虹色系”，但针对新配色方案进行了饱和度调整，以确保视觉舒适度。

| 令牌名称 | 默认值 (HEX) | 用途 |
| :--- | :--- | :--- |
| `color-branch-1` | `#0D9488` | 分支 1 (品牌青) |
| `color-branch-2` | `#F59E0B` | 分支 2 (琥珀) |
| `color-branch-3` | `#8B5CF6` | 分支 3 (紫罗兰) |
| `color-branch-4` | `#EC4899` | 分支 4 (粉红) |
| `color-focus-ring` | `#F97316` | 选中状态高亮色 |

### 1.2 字体排印 (Typography)
- **字体族**：优先使用 `Plus Jakarta Sans` (Productivity 风格)，后备 `Inter`, `PingFang SC`。
- **层级定义**：
  - **中心主题**：24px, SemiBold, Line Height 1.4, 字间距 -0.02em。
  - **分支主题**：18px, Medium, Line Height 1.4。
  - **子主题**：14px, Regular, Line Height 1.5。

### 1.3 阴影与深度 (Shadows & Depth)
- `shadow-node`：`0 1px 3px rgba(13, 148, 136, 0.1)` (极轻微青色投影)。
- `shadow-node-selected`：`0 4px 12px rgba(249, 115, 22, 0.2)` (橙色呼吸感投影)。
- `shadow-panel`：`0 10px 15px -3px rgba(0, 0, 0, 0.1)`。

---

## 2. 布局逻辑 (Layout Logic)

### 2.1 动态间距策略 (Dynamic Spacing)
[F18] 采用递减间距以体现逻辑层级感：
- **水平间距 (Horizontal Gap)**：
  - Root → L1: `64px`
  - L1 → L2: `40px`
  - L2+: `32px`
- **垂直间距 (Vertical Gap)**：
  - 同级节点最小间距：`16px`。

### 2.2 贝塞尔连线 (Smart Connectors)
[F06] 采用三阶贝塞尔曲线：
- **粗细**：Root 侧 `3px`，末梢 `1.5px`。
- **颜色**：继承父节点颜色，饱和度降低 20%，透明度 60%（避免视觉过载）。

---

## 3. 交互与组件重构 (Interaction & Components)

### 3.1 节点 (Node Component)
- **外观**：
  - 圆角：Root `12px`, L1 `8px`, L2+ `4px`。
  - 边框：默认 `1.5px solid ui-border-base`。
- **状态交互**：
  - **Hover**：背景色微调至 `ui-bg-app` (10% 透明度)，边框变为 `ui-brand`。
  - **Selected**：边框加粗至 `2px`，颜色变为 `ui-accent`。

### 3.2 拖拽重组 (Drag & Drop) [F16]
- **替身 (Ghost)**：拖拽时显示 50% 透明度的节点快照，应用 `blur(2px)` 效果。
- **吸附反馈**：目标节点显示 `dashed` 橙色边框，并伴随微小的 `scale(1.05)` 扩张动效。

### 3.3 全键盘心流 (Flow Mode) [F17]
- **导航视觉反馈**：通过键盘切换焦点时，目标节点应有一个轻微的“脉冲”效果（缩放 1.02 倍后还原）。
- **编辑模式切换**：`Space` 进入编辑，`Enter` 提交并保存。

### 3.4 底部标签栏 (Sheet Bar) [F12]
- **高度**：`36px` (增加 4px 以提升点击舒适度)。
- **选中态**：不再使用简单的上边框，改为底部 `3px` 胶囊形高亮条，文字加粗。
- **添加按钮**：采用圆角矩形按钮，Hover 时显示 `ui-accent` 背景。

---

## 4. 视觉微动效 (Micro-animations)

| 场景 | 动画参数 | 效果描述 |
| :--- | :--- | :--- |
| **布局平滑过渡** | `0.35s cubic-bezier(0.34, 1.56, 0.64, 1)` | 带有轻微回弹感的物理位移，体现活力。 |
| **折叠/展开** | `0.2s ease-out` | 结合 `scaleY` 和 `opacity` 的扇形展开感。 |
| **面板切换** | `0.3s cubic-bezier(0.4, 0, 0.2, 1)` | 抽屉式平滑滑动。 |

---

## 5. 无障碍与国际化 (A11y & i18n)

- **对比度**：所有文本颜色相对于背景的对比度均 > 4.5:1。
- **全中文支持 [F11]**：
  - 界面文本：100% 简体中文，术语统一（如“分支”、“联系”、“外框”）。
  - 输入优化：确保输入法候选框不遮挡节点路径线。
