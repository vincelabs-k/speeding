---
name: popup-border-padding-fix
overview: 为 popup 添加可见外边框与圆角，并修复 slider 刻度文字在左右边缘被裁切的问题。
todos:
  - id: wrap-popup-card
    content: 在 App.tsx 各状态根容器外加卡片式边距与边框
    status: completed
  - id: fix-slider-labels
    content: 修复 slider 刻度首尾文字被裁切
    status: completed
  - id: verify-build
    content: 运行 bun run compile 与 bun run build 验证
    status: completed
    dependencies:
      - wrap-popup-card
      - fix-slider-labels
---

## 用户反馈
上一轮 popup UI 重构后，用户反馈“边框边距好像还是零”，并附两张截图要求再检查。

## 确认问题
1. **Popup 外边框/间距视觉缺失**  
   当前 `App.tsx` 根容器使用 `w-80` 直接撑满扩展弹窗窗口，没有可见的外边框或圆角。在 Windows Chrome 的直角矩形 popup 窗口中，整体看起来像贴边、零边距。

2. **Slider 刻度文字被裁切**  
   截图中最左侧刻度 `0.5` 只显示为 `51`，原因是刻度标签使用 `left: ${pct}%; transform: translateX(-50%)` 绝对定位，当 `pct=0` 时文字左半部分溢出 popup 被裁切。

## 改造目标
- 在 popup 内部增加内边距与可见外边框，形成“有边距”的视觉效果（扩展弹窗本身无法拥有真正窗口外 margin）。
- 修复 slider 刻度在左右边缘被裁切的问题。
- 保持上一轮配色与交互风格不变。

## 技术栈
- React 19 + TypeScript
- Tailwind CSS v4
- WXT

## 实现策略
1. **外边框/间距**  
   在根容器 `div.w-80` 内部再包一层带 `p-1` 或 `p-1.5` 内边距的 `div`，内层容器使用 `rounded-xl` + `border border-slate-200` + `bg-white/80` 或 `bg-gradient-to-b from-slate-50 to-white`，制造卡片浮在 popup 内的视觉效果。  
   Loading / No-video 状态同样套用该卡片容器，保持三种状态外观一致。

2. **Slider 刻度防裁切**  
   将 slider 标签容器改为带水平内边距（如 `px-3`），并把轨道/输入整体内缩，使 0% 和 100% 位置不再贴到 popup 边缘；或者对首/尾标签单独处理：第一个标签 `left: 0; transform: none`，最后一个 `left: auto; right: 0; transform: none`，中间标签保持居中。  
   选择方案二更简洁，不需要改动轨道布局。

3. **保持兼容**  
   - 不改动速度状态、通信逻辑和事件处理。
   - 仍不使用 `.css` 文件写组件样式。
   - 颜色继续使用 Tailwind 类或内联 hex，不引入外部资源。

## 目录结构
```
d:/code/speeding/
├── entrypoints/popup/App.tsx      # [MODIFY] 为根容器加卡片式边距，修复 slider 刻度定位
└── entrypoints/popup/style.css    # [MODIFY] 若需 body 背景配合，微调
```
