---
name: popup-ui-abstraction
overview: 将 popup UI 抽象为三层：共享样式组合常量（ui.ts）+ 可复用组件（components/）+ speed 数学模型（speed-model.ts），纯搬代码不改视觉与功能，让 AI 后续每次 UI 改动成本下降。
todos:
  - id: extract-model-tokens
    content: 新建 speed-model.ts（领域常量/数学函数/SpeedMode）与 ui.ts（shell/card/btnBase/btnPrimary/btnGhost/sectionLabel/inputBase 类名常量）
    status: completed
  - id: migrate-slider-css
    content: 迁移 range slider 内联样式至 style.css 的 @layer components .speed-slider，移除 App.tsx 内联 style 标签
    status: completed
    dependencies:
      - extract-model-tokens
  - id: split-view-components
    content: 拆分 LoadingView/NoVideoView/SpeedBadge/SectionLabel 四个纯展示组件并接入 App.tsx
    status: completed
    dependencies:
      - migrate-slider-css
  - id: split-interactive-components
    content: 拆分 ModeToggle/SpeedSlider/PresetGrid/CustomInput 四个交互组件，props 单向数据流接回 App.tsx 状态
    status: completed
    dependencies:
      - split-view-components
  - id: refactor-app
    content: 收敛 App.tsx 为状态编排层：仅保留 useState/sendMessage/初始化/事件处理，删除常量与视图 JSX
    status: completed
    dependencies:
      - split-interactive-components
  - id: write-ui-baseline
    content: 编写 docs/ui-baseline.md 设计基线文档，记录实测色板/字号/圆角/间距/动效并标注与旧 indigo 基线差异
    status: completed
    dependencies:
      - extract-model-tokens
  - id: verify-no-regression
    content: 运行 bun run compile 与 bun run build，逐项对照三视图类名与 DOM 结构确认视觉零回归
    status: completed
    dependencies:
      - refactor-app
      - write-ui-baseline
---


## 产品概述
对 popup UI 进行纯代码层组件化与设计基线抽象，不改任何视觉、交互、i18n 与通信逻辑，目标是让后续每次 UI 改动只触及小文件、回归风险可控，降低 AI 整改成本。

## 核心功能
- 抽取领域常量与数学函数（速度范围、预设值、对数刻度映射）为独立模块 `speed-model.ts`
- 抽取重复 Tailwind 组合类名为共享常量（主按钮渐变、卡片容器、区块小标题、输入框、焦点环）
- 将 App.tsx（408 行）按职责拆分为独立展示/交互组件，App.tsx 收敛为状态编排层
- 将 JSX 内联的 range slider `<style>` 迁移至唯一 CSS 入口 `style.css`（Tailwind v4 `@layer components`）
- 沉淀 `docs/ui-baseline.md` 设计基线文档（色板、字号、圆角、间距、动效清单），作为后续 AI 改动的统一参考

## 边界
- 纯搬代码：渲染结果与现状逐像素一致，三视图（loading/no-video/main）外层容器统一为 `w-[360px] bg-white`
- 不新增运行时依赖、不改 `public/_locales`、保持 `browser.*` API、strict TS 无 any



## 技术栈
- React 19 + TypeScript strict（沿用现状）
- Tailwind CSS v4（`@tailwindcss/vite`，唯一 CSS 入口 `entrypoints/popup/style.css`）
- WXT（browser.* polyfill）

## 实现方案
纯结构重构（refactor without behavior change）。以当前代码实测值为准（sky/cyan 渐变体系，非旧 plan 的 indigo）。抽象分三层：领域模型层（speed-model.ts）、设计 token 层（ui.ts + style.css）、组件层（components/），App.tsx 仅保留状态与消息编排。

### 1. 领域模型 `entrypoints/popup/speed-model.ts` [NEW]
- 常量：`MIN_SPEED=0.5`、`MAX_SPEED=16`、`STEP=0.25`、`PRESETS`、`SLIDER_LABELS`、`LOG_MIN/LOG_MAX/LOG_RANGE`
- 纯函数：`clamp(v)`、`formatSpeed(v)`（四舍五入两位去尾零）、`speedToLogPct(s)`、`logPctToSpeed(p)`
- 类型：`export type SpeedMode = 'this' | 'all'`（供 ModeToggle/App 共享）

### 2. 设计 token `entrypoints/popup/ui.ts` [NEW]
组合类名常量（值逐字取自 App.tsx 现状，视觉零变化）：
- `shell`: `w-[360px] bg-white`（三视图外层统一）
- `card`: `rounded-xl border border-slate-200/60 bg-gradient-to-b from-slate-50 to-white`
- `btnBase`: `transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-1`
- `btnPrimary`: `btnBase + bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20`
- `btnGhost`: `btnBase + text-slate-500 hover:bg-sky-50/60 hover:text-sky-600`
- `sectionLabel`: `text-[10px] text-slate-400 uppercase tracking-wider mb-2 px-1 font-semibold`
- `inputBase`: 完整复制现有输入框类名（h-9 白底边框聚焦 ring）
- 交互缩放（active:scale-[0.96/0.97]）由各按钮按现状保留，不做强归一，避免视觉差异

### 3. CSS 迁移 `entrypoints/popup/style.css` [MODIFY]
- 将 App.tsx 内联 `<style>` 的 thumb/track 样式（webkit/moz 两套，#0EA5E9→#38BDF8 渐变、22px、白边、阴影）迁入 `@layer components`，类名 `.speed-slider`（输入框保留 `appearance-none bg-transparent`，thumb 样式经类选择器生效）
- 保持 `@import "tailwindcss"` 与 body 基础样式不变

### 4. 组件拆分 `entrypoints/popup/components/` [NEW ×8]
- `LoadingView.tsx` / `NoVideoView.tsx`：无状态纯展示，引用 shell/card 常量与现有 i18n key
- `SpeedBadge.tsx`：props `{ speed: number }`，渲染 68px 渐变徽章
- `SectionLabel.tsx`：props `{ children: ReactNode }`，渲染区块小标题
- `ModeToggle.tsx`：props `{ mode: SpeedMode; onModeChange: (m: SpeedMode) => void; domain: string }`，内部含两个近重复按钮（保留各自 icon path）
- `SpeedSlider.tsx`：props `{ speed: number; dragPct: number; onDrag: (pct: number) => void; onCommit: () => void }`，内含刻度标签渲染（首/尾防裁切定位逻辑原样迁移）
- `PresetGrid.tsx`：props `{ speed: number; onSelect: (v: number) => void }`，grid-cols-4 按钮 + 激活绿点
- `CustomInput.tsx`：props `{ value: string; onValueChange: (v: string) => void; onApply: () => void }`，blur/Enter 提交逻辑由 App 传入 `onApply`，组件内仅触发（现状 `handleCustomApply`/`handleCustomKeyDown` 留在 App 或下沉均可，以下沉 App 保持单向数据流为准）

### 5. App.tsx 收敛 [MODIFY]
- 保留：全部 useState/useRef、sendMessage、GET_SPEED 初始化、applySpeed/handleModeChange/handleSlider/handleSliderCommit/handleCustom*
- 删除：顶层常量与数学函数（改 import）、内联 `<style>`、三视图 JSX（改 import 组件）、重复类名
- 目标规模约 150-170 行；三视图 switch 结构与现状一致

### 6. 设计基线文档 `docs/ui-baseline.md` [NEW]
以实际代码为准记录：主色（sky-500/600 渐变、cyan-500 进度、emerald-400 指示）、中性色 slate 系、圆角规格（xl/lg/2xl/md/full）、字号阶梯（28/18/13/12/11/10px）、间距（px-5 区块、pb-3 间隙）、阴影与动效（duration-150、scale 微缩放）。注明与 `popup-ui-redesign` 旧 plan 的 indigo 基线差异，避免后续混淆。

### 性能与回归控制
- 纯常量抽取与组件拆分，无新增渲染开销；子组件均为受控组件，props 变化触发重渲染范围与现状等效
- 验证：`bun run compile`（tsc --noEmit）零错误、`bun run build` 通过、逐项对照三视图类名 diff 确认视觉等价

## 目录结构
```
entrypoints/popup/
├── App.tsx                  # [MODIFY] 收敛为状态编排层（~160 行）
├── style.css                # [MODIFY] 新增 .speed-slider 组件样式（@layer components）
├── speed-model.ts           # [NEW] 领域常量/数学函数/类型
├── ui.ts                    # [NEW] 共享 Tailwind 组合类名常量
├── components/
│   ├── LoadingView.tsx      # [NEW] loading 视图
│   ├── NoVideoView.tsx      # [NEW] no-video 视图
│   ├── SpeedBadge.tsx       # [NEW] 头部速度徽章
│   ├── SectionLabel.tsx     # [NEW] 区块小标题
│   ├── ModeToggle.tsx       # [NEW] 本页/全部站点切换
│   ├── SpeedSlider.tsx      # [NEW] 对数刻度滑杆
│   ├── PresetGrid.tsx       # [NEW] 预设按钮网格
│   └── CustomInput.tsx      # [NEW] 自定义速度输入
docs/
└── ui-baseline.md           # [NEW] 设计基线文档
```

