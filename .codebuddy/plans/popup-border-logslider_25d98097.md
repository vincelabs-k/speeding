---
name: popup-border-logslider
overview: 为 popup 四边添加窄色带作为视觉边框，并将 slider 从线性刻度改为对数刻度（0.5-1 和 8-16 间距相同）。
todos:
  - id: log-math-constants
    content: 添加对数 slider 常量：LOG_MIN / LOG_MAX / LOG_RANGE，替换 speedToPercent 为 speedToLogPct 和 logPctToSpeed
    status: completed
  - id: slider-drag-state
    content: 新增 sliderDragPct 状态，重写 handleSlider / handleSliderCommit 实现跟手拖拽 + 松手 snap
    status: completed
    dependencies:
      - log-math-constants
  - id: slider-input-range
    content: 修改 range input 的 min/max/value 为对数位置值，同步标签定位逻辑
    status: completed
    dependencies:
      - slider-drag-state
  - id: border-strip
    content: 将三种状态外层容器从 p-1.5 改为 p-[3px] bg-slate-100
    status: completed
  - id: verify
    content: 运行 bun run compile 与 bun run build 验证无错误
    status: completed
    dependencies:
      - slider-input-range
      - border-strip
---

## 用户需求
1. 在 popup 上下左右加宽度较窄、有格挡作用的空白元素——用 3px 浅灰背景充当可见边框色带
2. 拖拽进度条改为对数数轴，使得 0.5→1 的间距与 8→16 相同（都是 2x 倍速差）

## 核心改动
- **边框**：外层容器从 `p-1.5`（透明内边距）改为 `p-[3px] bg-slate-100`（可见灰色边框带），覆盖三种 UI 状态
- **对数 slider**：将 range input 从线性速度值映射改为对数位置百分比映射，保证拖拽时拇指跟手、松手后 snap
- **标签定位**：利用对数空间天然均匀分布特性，直接计算位置

## 技术栈
- React 19 + TypeScript + Tailwind CSS v4 + WXT
- 仅修改 `entrypoints/popup/App.tsx`，不动 style.css

## 实现方案

### 1. 边框色带
三种状态（loading / no-video / main）的外层容器统一替换：
```
w-80 p-1.5              →  w-80 p-[3px] bg-slate-100
```
3px 的 `bg-slate-100` 内边距在白色弹窗背景下形成可见的浅灰色边框。

### 2. 对数 slider 数学原理
```
logMin  = Math.log(0.5)  ≈ -0.693
logMax  = Math.log(16)   ≈  2.773
logRange = 2.773 - (-0.693) ≈ 3.466

speedToLogPct(s): ((Math.log(s) - logMin) / logRange) * 100
logPctToSpeed(p): Math.exp(logMin + (p / 100) * logRange)
```
标签值 [0.5, 1, 2, 4, 8, 16] 在对数空间自然均匀分布：
- logPct(0.5) = 0%, logPct(1) = 20%, logPct(2) = 40%, logPct(4) = 60%, logPct(8) = 80%, logPct(16) = 100%

### 3. 拖拽跟手方案
- 新增 `sliderDragPct` 状态（number，0–100），拖拽中即时更新，保证 thumb 跟随鼠标
- Range input: `min={0}` `max={100}` `step={1}`，`value={sliderDragPct}`
- `onChange`：更新 `sliderDragPct`，计算速度并更新 `speed` 和 `customInput`（实时预览）
- `onMouseUp / onTouchEnd`：从 `sliderDragPct` 计算原始速度 → `Math.round(raw / STEP) * STEP` → clamp → `applySpeed`
- 初始化时：`setSliderDragPct(speedToLogPct(info.speed))`
- 外部速度变更（如点击 preset）时同步更新 `sliderDragPct`

### 4. 性能与兼容性
- 对数计算 O(1)，无性能影响
- 保持 `sendMessage` 节流策略：拖拽中只更新本地 state，松手才发消息
- Firefox `::-moz-range-track` 保持 `background: transparent`
