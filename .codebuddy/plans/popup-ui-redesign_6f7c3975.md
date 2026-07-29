---
name: popup-ui-redesign
overview: 修复 popup 中 slider 进度条和 preset 激活指示器未生效的 bug，同时重构视觉样式，使整体更现代、统一、易用。
design:
  architecture:
    framework: react
  styleKeywords:
    - Modern Minimalism
    - Soft Tech
    - Glassmorphism Lite
    - Vibrant Gradient
    - Clean Hierarchy
  fontSystem:
    fontFamily: Inter
    heading:
      size: 18px
      weight: 600
    subheading:
      size: 13px
      weight: 500
    body:
      size: 12px
      weight: 400
  colorSystem:
    primary:
      - "#4F46E5"
      - "#6366F1"
      - "#818CF8"
    background:
      - "#F8FAFC"
      - "#FFFFFF"
      - "#EEF2FF"
    text:
      - "#1E293B"
      - "#475569"
      - "#94A3B8"
    functional:
      - "#10B981"
      - "#F43F5E"
      - "#F59E0B"
todos:
  - id: fix-slider-progress
    content: 修复 slider 进度条蓝色填充未生效问题，使用独立进度轨道实现
    status: completed
  - id: fix-preset-indicator
    content: 修复 preset 激活绿点定位，为按钮添加 relative 定位
    status: completed
  - id: polish-popup-ui
    content: 重构 App.tsx 视觉样式：配色、间距、按钮、badge、刻度与动效
    status: completed
    dependencies:
      - fix-slider-progress
      - fix-preset-indicator
  - id: verify-build
    content: 运行 bun run build 与 bun run compile，确认无 TS/构建错误并检查产物样式
    status: completed
    dependencies:
      - polish-popup-ui
---

## 产品概述
Speeding 是一款浏览器扩展，用于控制网页视频的播放速度。本次需求聚焦于 popup 面板的 UI 改造，需先排查当前截图中暴露的问题，再完成视觉与交互优化。

## 核心问题
1. **UI 特性未生效**
   - Slider 进度条蓝色填充未渲染：代码将渐变背景直接赋给 `input[type=range]`，但 Chrome 对 range input 的 shadow DOM 背景处理存在限制，导致截图中轨道全灰。
   - Preset 激活状态小绿点位置异常：父级 `button` 缺少 `relative`，absolute 定位会相对于外层容器，绿点可能跑到错误位置或不可见。

2. **视觉设计粗糙**
   - Preset 按钮文字格式不统一（`0.50x` / `1x` / `1.50x`），导致按钮内容宽度不均、排版凌乱。
   - 白底灰边过多，视觉层次弱，整体像未加修饰的默认组件。
   - 配色偏默认微软蓝（`#0078D4`），缺乏品牌感。
   - Slider 刻度在线性分布下，常用速度值（0.5–2x）挤在左侧，难以精细调节。
   - Badge 文案 `x SPEED` 生硬。

## 改造目标
- 修复上述两个未生效的 UI 特性。
- 对 popup 进行视觉翻新：更现代的配色、更清晰的层级、更一致的排版、更细腻的动效。
- 保持现有功能不变：速度获取/设置、预设按钮、自定义输入、与 content script 的通信逻辑。

## 技术栈
- 框架：React 19 + TypeScript
- 样式：Tailwind CSS v4
- 构建：WXT
- 通信：`browser.tabs.sendMessage`（保持不变）

## 实现策略
- **Slider 进度条修复**：不依赖 `input[type=range]` 的内联背景，改为在 input 下方叠加一层独立 `div` 作为进度轨道，通过宽度百分比动态反映当前速度；input 本身设为透明背景，仅保留 thumb。这样可绕过 Chrome shadow DOM 的限制，同时兼容 Firefox。
- **Preset 激活指示器修复**：给 preset 按钮添加 `relative`，使绿点绝对定位相对于自身。
- **视觉翻新**：重新设计配色、圆角、间距、阴影；统一 preset 文本格式；优化 slider 刻度分布（保留线性但调整刻度点，使常用区间更直观）；优化 badge 文案。

## 关键文件
```
d:/code/speeding/
├── entrypoints/popup/App.tsx      # [MODIFY] 重构 popup 组件结构与样式
├── entrypoints/popup/style.css    # [MODIFY] 微调全局字体、滚动条等基础样式
```

## 实现注意事项
- 保持 `sendMessage` 和速度状态逻辑不变，避免影响 content script 通信。
- Slider 变更时仍使用 `onChange` 实时更新显示 + `onMouseUp`/`onTouchEnd` 提交速度，避免频繁发消息。
- 所有颜色使用 Tailwind 类或内联 hex，不引入外部资源。
- 不使用 `.css` 文件写组件样式（除全局 style.css 外），遵循项目规则。
- 不新增运行时依赖。

## 设计风格
采用现代极简 + 柔和科技感的混合风格，整体清爽、专业且不失精致。通过降低边框数量、提升色彩饱和度与对比度，让 popup 在浏览器工具栏中一眼可辨。

## 页面结构
popup 面板宽度保持约 320px，垂直结构分为 5 个区块：

1. **Header 区**
   - 左侧：品牌名 `Speeding` + 检测到视频数量
   - 右侧：当前速度大字号 badge，圆角卡片，带渐变微光

2. **Slider 区**
   - 顶部刻度：0.5 / 1 / 2 / 4 / 8 / 16，减少刻度数并强调常用区间
   - 双层轨道：底层灰色背景 + 上层渐变进度条
   - 大圆点 thumb，hover 放大并带阴影

3. **Hint 区**
   - 当前速度提示：`Current speed · 1.25x`，居中浅灰小字

4. **Presets 区**
   - 标题 `Presets` 改为更柔和的小写/正常大小写
   - 4 列网格按钮，统一格式为 `0.5x / 1x / 1.5x / 2x ...`
   - 激活态使用主色填充 + 白色文字，角落绿色小点指示当前命中预设

5. **Custom 区**
   - 输入框 + Apply 按钮在同一行
   - 输入框右侧固定 `×` 单位后缀
   - 底部提示 `Range: 0.5x – 16x · Step: 0.25x`

## 交互细节
- 所有按钮加入 `hover:scale-[1.02]` 与 `active:scale-[0.98]` 微缩放
- Slider thumb hover 放大 1.15 倍
- 激活 preset 按钮带轻微阴影
- 输入框聚焦时主色 ring
- 整体弹出/切换有极短过渡动画
