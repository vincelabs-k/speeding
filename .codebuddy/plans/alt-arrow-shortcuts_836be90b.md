---
name: alt-arrow-shortcuts
overview: 在 content.ts 中添加 Alt+↑/↓ 全局键盘快捷键来调节视频速度，并在 popup 中以极淡脚注展示快捷键提示（不抢眼），同步更新所有 16 个语言的 i18n 文案。
todos:
  - id: keyboard-listener
    content: 在 content.ts 中添加 Alt+↑/↓ 键盘监听，含输入控件跳过、preventDefault、防抖持久化
    status: completed
  - id: shortcut-hint-ui
    content: 在 App.tsx 的 RatingButton 下添加极淡灰字的快捷键提示行
    status: completed
  - id: i18n-all-locales
    content: 为 16 个 locale 文件添加 shortcutHint 翻译文案
    status: completed
---

## 用户需求
为视频调速扩展 Speeding 添加键盘快捷键：**Alt+↑ 加速 0.25×，Alt+↓ 减速 0.25×**。同时，在 popup 弹窗中自然不抢眼地展示快捷键提示。

## 核心功能
- 页面视频播放时，用户按 Alt+↑ 将播放速度 +0.25（上限 16×），Alt+↓ 将播放速度 -0.25（下限 0.5×）
- 仅在用户未聚焦输入框（INPUT/TEXTAREA/SELECT）时响应，避免干扰正常输入
- 阻止浏览器默认行为（preventDefault），防止 Alt+↑/↓ 触发页面滚动等操作
- 速度变更后带 300ms 防抖持久化到 storage，遵循当前 speedMode（this/all）
- Popup 底部以极淡灰字展示快捷键提示，视觉权重低，不打扰用户


## 技术方案

### 为什么用 content script 直监而非 commands API
Chrome MV3 `commands` API 不支持箭头键作为主键，`Ctrl+Left/Right` 等组合均不可声明。因此采用 content script 中 `addEventListener('keydown', ..., { capture: true })` 直接监听键盘事件，在事件冒泡前捕获。

### 实现要点

**content.ts 键盘监听**
- 监听条件：`e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey`，仅 Alt 修饰
- 响应键：`ArrowUp` 加速、`ArrowDown` 减速
- 跳过控件：tagName 为 INPUT/TEXTAREA/SELECT 时不处理
- 防抖持久化：setTimeout 300ms，连续按键时重置计时器，最后一次操作后统一写 storage
- 复用现有持久化逻辑：检查 `currentMode`，分别调用 `setGlobalSpeed` 或 `setSiteSpeed`
- 使用 `SpeedController.clamp()` 约束速度范围

**popup/App.tsx 快捷键提示**
- 在 RatingButton 下方添加一行极淡灰字提示
- 复用现有 `text-[10px] text-slate-300 text-center font-medium` 样式（与 rangeStep 行一致）
- 文案由 `browser.i18n.getMessage('shortcutHint')` 读取

**i18n 文案**
- 所有 16 个 locale 文件的 messages.json 中添加 `shortcutHint` 字段
- en: `Alt+↑/↓ to adjust speed`
- zh_CN: `Alt+↑/↓ 调节播放速度`
- 其余 14 条采用一一对应的简单翻译

### 目录结构
```
d:/code/speeding/
├── entrypoints/
│   ├── content.ts                    # [MODIFY] 添加 Alt+↑/↓ keydown 监听器
│   └── popup/
│       └── App.tsx                   # [MODIFY] 在 RatingButton 下添加快捷键提示行
├── public/
│   └── _locales/
│       ├── ar/messages.json          # [MODIFY] 添加 shortcutHint
│       ├── da/messages.json          # [MODIFY] 同上
│       ├── de/messages.json          # [MODIFY] 同上
│       ├── en/messages.json          # [MODIFY] 同上
│       ├── es/messages.json          # [MODIFY] 同上
│       ├── fr/messages.json          # [MODIFY] 同上
│       ├── hi/messages.json          # [MODIFY] 同上
│       ├── it/messages.json          # [MODIFY] 同上
│       ├── ja/messages.json          # [MODIFY] 同上
│       ├── ko/messages.json          # [MODIFY] 同上
│       ├── nl/messages.json          # [MODIFY] 同上
│       ├── no/messages.json          # [MODIFY] 同上
│       ├── pt_PT/messages.json       # [MODIFY] 同上
│       ├── sv/messages.json          # [MODIFY] 同上
│       ├── zh_CN/messages.json       # [MODIFY] 同上
│       └── zh_TW/messages.json       # [MODIFY] 同上
```

### 关键代码结构

**content.ts 键盘处理核心逻辑**：

```typescript
const STEP = 0.25;

const handleKeydown = (e: KeyboardEvent) => {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

  e.preventDefault();
  const delta = e.key === 'ArrowUp' ? STEP : -STEP;
  const newSpeed = SpeedController.clamp(controller.getSpeed() + delta);
  controller.setSpeed(newSpeed);
  maybeRecord();

  // 防抖持久化
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    if (currentMode === 'all') {
      setGlobalSpeed(newSpeed);
    } else {
      setSiteSpeed(hostname, newSpeed);
    }
  }, 300);
};

document.addEventListener('keydown', handleKeydown, true);
```

