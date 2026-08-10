---
name: i18n-chrome-locales
overview: 使用 Chrome 原生 `chrome.i18n` + `_locales/` 方案，为 Speeding 扩展添加英(en)、法(fr)、西(es)、日(ja)、中(zh_CN) 5 种语言支持。
todos:
  - id: create-locales
    content: 创建 public/_locales/ 目录及 5 个语言的 messages.json 翻译文件，包含全部 16 条消息键
    status: pending
  - id: update-manifest
    content: "修改 wxt.config.ts：添加 default_locale: 'en'，name/description 改为 __MSG_extName__ / __MSG_extDescription__"
    status: pending
    dependencies:
      - create-locales
  - id: update-html
    content: 修改 index.html：title 改为 __MSG_extName__，移除 html 硬编码 lang；修改 main.tsx 挂载前动态设置 document.documentElement.lang
    status: pending
    dependencies:
      - create-locales
  - id: i18n-app
    content: 重构 App.tsx：所有 13 处硬编码文本替换为 browser.i18n.getMessage()，含复数逻辑和占位符替换
    status: pending
    dependencies:
      - create-locales
  - id: i18n-rating
    content: 修改 RatingButton.tsx：Rate on Store 替换为 browser.i18n.getMessage('rateOnStore')
    status: pending
    dependencies:
      - create-locales
---


## 产品概述
为 Speeding 浏览器扩展接入 Chrome 原生 `chrome.i18n` 国际化，目前所有 UI 文本均为硬编码英文。需支持 5 种语言，扩展可根据浏览器 UI 语言自动匹配对应的翻译。

## 核心功能
- **5 语言覆盖**：英文(en)、法文(fr)、西班牙文(es)、日文(ja)、简体中文(zh_CN)，英文为默认回退语言
- **Manifest 国际化**：扩展名称 Speeding（品牌名保持一致）和描述均支持多语言
- **Popup UI 全面翻译**：15 条用户可见文本全部通过 `browser.i18n.getMessage()` 动态获取，含占位符替换（速度值、视频数量、范围参数）
- **复数处理**：`video detected` 拆分为单数/复数两条消息，JS 侧按 count 判断
- **HTML lang 动态设置**：popup 页面的 `<html lang>` 根据 `getUILanguage()` 运行时注入



## 技术栈
- **国际化方案**：Chrome Extension `chrome.i18n` API（WXT 中通过 `browser.i18n` polyfill 调用）
- **翻译文件格式**：`_locales/{locale}/messages.json`
- **占位符语法**：`$PLACEHOLDER_NAME$`（Chrome i18n 原生占位符）
- **Manifest 引用**：`__MSG_key__` 语法
- **框架**：WXT v0.20 + React 19 + TypeScript + Tailwind CSS v4（与现有项目一致）

## 实现方案

### 整体策略
使用 Chrome 原生 `_locales/` 目录 + `browser.i18n.getMessage()` 方案，零额外依赖。`_locales/` 放置于 `public/` 目录下，WXT 构建时自动复制到输出根目录。

### 关键设计决策

1. **品牌名 Speeding 不翻译**
   - manifest `name` 和 header 标题在所有 locale 中保持 `"Speeding"`，仅 description 多语言化
   - message key `extName` 的 value 在 5 个 messages.json 中均为 `"Speeding"`

2. **复数处理**
   - Chrome i18n 不支持 ICU MessageFormat 复数
   - 拆分为 `videoDetected`（单数）和 `videosDetected`（复数）两条消息，各含 `$COUNT$` 占位符
   - JS 侧 `videoCount === 1 ? 'videoDetected' : 'videosDetected'`

3. **HTML lang 运行时注入**
   - `index.html` 中保持 `<html>` 无硬编码 lang
   - `main.tsx` 在 React 挂载前执行 `document.documentElement.lang = browser.i18n.getUILanguage()`
   - `getUILanguage()` 返回 `"en" | "fr" | "es" | "ja" | "zh-CN"`，Chrome 会自动匹配最佳 locale

4. **Manifest name/description 使用占位符**
   - `wxt.config.ts` 中 `name: '__MSG_extName__'`、`description: '__MSG_extDescription__'`
   - 无需在 `default_locale` 的 messages.json 中引用自身——Chrome 会自动从 `_locales/en/messages.json` 读取

### 目录结构
```
speeding/
├── public/
│   ├── icon/                         # 现有图标（不变）
│   └── _locales/                     # [NEW] 国际化翻译文件
│       ├── en/
│       │   └── messages.json         # 英文（默认语言）
│       ├── fr/
│       │   └── messages.json         # 法文
│       ├── es/
│       │   └── messages.json         # 西班牙文
│       ├── ja/
│       │   └── messages.json         # 日文
│       └── zh_CN/
│           └── messages.json         # 简体中文
├── entrypoints/
│   └── popup/
│       ├── index.html                # [MODIFY] title 改为 __MSG_extName__，html 去硬编码 lang
│       ├── main.tsx                  # [MODIFY] 挂载前动态设置 document.documentElement.lang
│       ├── App.tsx                   # [MODIFY] 所有硬编码文本替换为 browser.i18n.getMessage()
│       └── RatingButton.tsx          # [MODIFY] "Rate on Store" 替换为 getMessage
├── wxt.config.ts                     # [MODIFY] 添加 default_locale，name/description 改为 __MSG__
```

### Message Keys 设计（共 15 个）

| Key | 占位符 | 用途 |
|-----|--------|------|
| `extName` | — | Manifest name + `<title>` + header 标题 |
| `extDescription` | — | Manifest description |
| `noVideo` | — | 无视频检测提示 |
| `noVideoHint` | — | 无视频时的引导文案 |
| `videoDetected` | `$COUNT$` | 单个视频检测计数 |
| `videosDetected` | `$COUNT$` | 多个视频检测计数 |
| `speedLabel` | — | 速度徽标下方 "speed" 标注 |
| `thisSite` | — | 模式切换 "This site" |
| `allSites` | — | 模式切换 "All sites" |
| `dragToAdjust` | `$SPEED$` | 滑块拖动提示 |
| `presets` | — | 预设速度区块标题 |
| `custom` | — | 自定义速度区块标题 |
| `apply` | — | 自定义速度 Apply 按钮 |
| `rangeStep` | `$MIN$` `$MAX$` `$STEP$` | 底部范围/步长说明 |
| `rateOnStore` | — | 评分按钮文案 |
| `speedPlaceholder` | — | 自定义输入框占位符 |

### 数据流
```
浏览器 UI 语言 (en/fr/es/ja/zh-CN)
    │
    ▼
Chrome 自动匹配 _locales/ 下最佳 locale
    │
    ▼
browser.i18n.getMessage('key', [substitutions])
    │
    ▼
React 组件渲染翻译后文本
```

