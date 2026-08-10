---
name: a11y-enhancement
overview: 为 popup 页面的所有交互控件添加 aria-label、aria-pressed、role 等 ARIA 属性，并在 16 个语言文件中新增对应的 i18n keys，实现屏幕阅读器兼容和键盘导航支持。
todos:
  - id: add-i18n-keys-en
    content: 为 en/messages.json 新增 7 个 A11y 专用 i18n key
    status: completed
  - id: add-i18n-keys-all
    content: 为其余 15 个语言文件各新增 7 个 A11y 专用 i18n key（含中文翻译）
    status: completed
    dependencies:
      - add-i18n-keys-en
  - id: update-app-tsx
    content: 修改 App.tsx：为 Loading/No-video/Mode Toggle/Slider/Presets/Custom 区域的交互元素添加 ARIA 属性
    status: completed
  - id: update-rating-button
    content: 修改 RatingButton.tsx：为按钮添加 aria-label，SVG 添加 aria-hidden
    status: completed
---

## 用户需求
为 Speeding 浏览器扩展的 popup 界面进行无障碍（A11y）增强，使所有交互控件支持屏幕阅读器及键盘 Tab 导航。

## 核心功能
- 为所有交互式控件添加 `aria-label`、`aria-pressed`、`aria-valuetext` 等 ARIA 属性
- 为纯装饰性 SVG 图标添加 `aria-hidden="true"`，避免屏幕阅读器读取冗余信息
- 为加载状态和无视频状态添加 `role="status"` / `aria-busy`，让屏幕阅读器感知状态变化
- 扩展现有 16 语言 i18n 文件，每个新增 7 个 A11y 专用 key


## 技术方案

### 实现策略
纯增量式修改，不改变任何现有逻辑、状态管理或样式。仅向 JSX 元素添加 ARIA 属性，所有文本通过 `browser.i18n.getMessage()` 获取以支持多语言。

### 改动范围

**涉及文件（共 18 个）：**

| 文件 | 改动类型 |
|---|---|
| `entrypoints/popup/App.tsx` | MODIFY — 6 处 ARIA 属性添加 |
| `entrypoints/popup/RatingButton.tsx` | MODIFY — 1 处 ARIA 属性添加 |
| `public/_locales/*/messages.json` (16 个) | MODIFY — 各新增 7 个 key |

### 新增 i18n Keys（7 个）

| Key | 说明 | Placeholder |
|---|---|---|
| `ariaLoading` | 加载态提示 | 无 |
| `ariaSlider` | 滑块标签 | 无 |
| `ariaSpeedDisplay` | 速度徽章读法 | `$SPEED$` |
| `ariaPresetSpeed` | 预设按钮读法 | `$SPEED$` |
| `ariaCustomSpeed` | 自定义输入框标签 | 无 |
| `ariaApplyCustom` | Apply 按钮标签 | 无 |
| `ariaRateOnStore` | 评分按钮标签 | 无 |

> Mode Toggle 按钮直接复用现有 `thisSite` / `allSites` key，减少 i18n 冗余。`ariaNoVideo` 不新增——no-video 状态的 `role="status"` 屏幕阅读器会自动读取已有子元素文本。

### App.tsx 改动明细

**① Loading 状态（约 line 138）**
```tsx
<div
  role="status"
  aria-label={browser.i18n.getMessage('ariaLoading')}
  aria-busy="true"
  className="..."
>
```

**② No-video 状态（约 line 153）**
```tsx
<svg aria-hidden="true" className="..." ...>
```

**③ Mode Toggle 按钮 x2（约 line 192 / 210）**
```tsx
<button aria-pressed={speedMode === 'this'} ...>
  <svg aria-hidden="true" ...>...</svg>
  {browser.i18n.getMessage('thisSite')}
</button>
```

**④ Slider range input（约 line 271）**
```tsx
<input
  type="range"
  aria-label={browser.i18n.getMessage('ariaSlider')}
  aria-valuetext={`${formatSpeed(speed)}×`}
  ...
/>
```
> `aria-valuetext` 关键：屏幕阅读器默认读 0-100 的百分比值，这里覆盖为实际速度值。

**⑤ Preset 按钮 x8（约 line 332）**
```tsx
<button
  aria-pressed={isActive}
  aria-label={browser.i18n.getMessage('ariaPresetSpeed', formatSpeed(p))}
  ...
>
  {formatSpeed(p)}&times;
  {isActive && <span aria-hidden="true" className="..." />}
</button>
```

**⑥ Custom 区域（约 line 361 / 370 / 374）**
```tsx
<input aria-label={browser.i18n.getMessage('ariaCustomSpeed')} ... />
<span aria-hidden="true">&times;</span>
<button aria-label={browser.i18n.getMessage('ariaApplyCustom')}>...</button>
```

### RatingButton.tsx 改动明细
```tsx
<button aria-label={browser.i18n.getMessage('ariaRateOnStore')} ...>
  <svg aria-hidden="true" ...>...</svg>
  <span>{browser.i18n.getMessage('rateOnStore')}</span>
</button>
```

### 不做改动的部分
- `content.ts` — 键盘快捷键（Alt+↑/↓）已实现，不在 popup 范围内
- `main.tsx` / `index.html` — `lang` 属性已动态设置
- 现有 `focus-visible:ring` 样式 — 键盘 Tab 焦点反馈已经工作正常
- 业务逻辑、状态管理、样式系统 — 零触碰

