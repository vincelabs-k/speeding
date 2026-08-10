---
name: i18n-chrome-locales
overview: 使用 Chrome 原生 `chrome.i18n` + `_locales/` 方案，为 Speeding 扩展添加 16 种语言支持。
todos:
  - id: create-locales
    content: 创建 public/_locales/ 下 16 个语言目录及 messages.json，含完整翻译（英文为默认，其他 15 种语言逐一翻译）
    status: completed
  - id: update-manifest
    content: "修改 wxt.config.ts：manifeset 新增 default_locale: 'en'，name/description 改为 __MSG_extName__ / __MSG_extDescription__"
    status: completed
    dependencies:
      - create-locales
  - id: update-html-main
    content: 修改 index.html（title → __MSG_extName__，去硬编码 lang）和 main.tsx（挂载前动态设置 document.documentElement.lang）
    status: completed
    dependencies:
      - create-locales
  - id: i18n-app
    content: 重构 App.tsx：13 处硬编码文本替换为 browser.i18n.getMessage()，含复数判断和占位符替换
    status: completed
    dependencies:
      - create-locales
  - id: i18n-rating
    content: 修改 RatingButton.tsx：Rate on Store 替换为 browser.i18n.getMessage('rateOnStore')
    status: completed
    dependencies:
      - create-locales
---

## 产品概述
为 Speeding 浏览器扩展接入 Chrome 原生 `chrome.i18n` 国际化，支持 16 种语言。扩展自动匹配浏览器首选语言，无匹配时回退英文。

## 核心功能
- **16 语言覆盖**：英文(en)、法文(fr)、西班牙文(es)、日文(ja)、简体中文(zh_CN)、阿拉伯文(ar)、韩文(ko)、德文(de)、挪威文(no)、瑞典文(sv)、丹麦文(da)、荷兰文(nl)、意大利文(it)、葡萄牙文(pt_PT)、印地文(hi)、繁体中文(zh_TW)
- **语言匹配**：Chrome 原生机制自动按浏览器"首选语言"优先级查找 `_locales/` 中匹配的目录，无匹配时回退到 `default_locale: 'en'` — **零额外代码**，完全符合"优先浏览器语言，否则英文"的最佳实践
- **Manifest 国际化**：扩展名称 Speeding（品牌名跨语言一致）和描述均支持多语言，通过 `__MSG_key__` 占位符引用
- **Popup UI 全面翻译**：16 条消息键覆盖所有用户可见文本，含占位符替换（速度值、视频数量、范围参数）
- **复数处理**：`video detected` 因 Chrome i18n 不支持 ICU 复数，拆分为单数/复数两条消息，JS 侧按 count 判断
- **HTML lang 动态设置**：`main.tsx` 挂载前通过 `browser.i18n.getUILanguage()` 设置 `document.documentElement.lang`


## 技术栈
- **国际化方案**：Chrome Extension `chrome.i18n` API（WXT 中 `browser.i18n` polyfill）
- **翻译文件格式**：`_locales/{locale}/messages.json`
- **占位符语法**：`$PLACEHOLDER_NAME$`（Chrome i18n 原生）
- **Manifest 引用**：`__MSG_key__` 语法
- **框架**：WXT v0.20 + React 19 + TypeScript + Tailwind CSS v4（与现有项目一致）

## 实现方案

### 语言匹配机制（Chrome 原生最佳实践）
Chrome 在扩展启动时按以下优先级匹配 locale：
1. 遍历浏览器 `chrome://settings/languages` 中的"首选语言"列表（从上到下）
2. 尝试在 `_locales/` 目录中找到完全匹配的 locale 目录名
3. 若完全匹配失败，尝试语言前缀匹配（如 `zh_TW` → `zh`）
4. 全部失败则回退到 manifest 中声明的 `default_locale: 'en'`

**无需任何自定义匹配代码**，这是 Chrome 原生行为。`browser.i18n.getUILanguage()` 返回最终选中的 locale。

### 关键设计决策

1. **品牌名不翻译**：`extName` 在所有 16 个 `messages.json` 中 value 均为 `"Speeding"`
2. **复数处理**：拆为 `videoDetected`（单数，`$COUNT$`）和 `videosDetected`（复数，`$COUNT$`），JS 侧 `videoCount === 1 ? 'videoDetected' : 'videosDetected'`。日文/中文/韩文无复数变化，两条消息翻译一致即可
3. **HTML lang 运行时注入**：`index.html` 去掉硬编码 `lang`，`main.tsx` 挂载前执行 `document.documentElement.lang = browser.i18n.getUILanguage()`
4. **Manifest 字段占位符**：`name: '__MSG_extName__'`、`description: '__MSG_extDescription__'`

### 目录结构
```
speeding/
├── public/
│   ├── icon/                              # 现有图标（不变）
│   └── _locales/                          # [NEW] 16 个语言目录
│       ├── en/messages.json               # 英文（默认语言）
│       ├── fr/messages.json               # 法文
│       ├── es/messages.json               # 西班牙文
│       ├── ja/messages.json               # 日文
│       ├── zh_CN/messages.json            # 简体中文
│       ├── ar/messages.json               # 阿拉伯文
│       ├── ko/messages.json               # 韩文
│       ├── de/messages.json               # 德文
│       ├── no/messages.json               # 挪威文
│       ├── sv/messages.json               # 瑞典文
│       ├── da/messages.json               # 丹麦文
│       ├── nl/messages.json               # 荷兰文
│       ├── it/messages.json               # 意大利文
│       ├── pt_PT/messages.json            # 葡萄牙文
│       ├── hi/messages.json               # 印地文
│       └── zh_TW/messages.json            # 繁体中文
├── entrypoints/popup/
│   ├── index.html                         # [MODIFY] title → __MSG_extName__，去硬编码 lang
│   ├── main.tsx                           # [MODIFY] 挂载前设置 document.documentElement.lang
│   ├── App.tsx                            # [MODIFY] 所有硬编码文本 → browser.i18n.getMessage()
│   └── RatingButton.tsx                   # [MODIFY] "Rate on Store" → getMessage
└── wxt.config.ts                          # [MODIFY] default_locale: 'en'，name/description → __MSG__
```

### 16 个消息键及翻译

| Key | en (默认) | 占位符 |
|-----|-----------|--------|
| `extName` | Speeding | — |
| `extDescription` | Auto-speed for every site — set once, never touch again. Works on YouTube, Udemy, Bilibili, Netflix & podcast players. | — |
| `noVideo` | No video detected | — |
| `noVideoHint` | Open a page with video to get started | — |
| `videoDetected` | $COUNT$ video detected | `$COUNT$` |
| `videosDetected` | $COUNT$ videos detected | `$COUNT$` |
| `speedLabel` | speed | — |
| `thisSite` | This site | — |
| `allSites` | All sites | — |
| `dragToAdjust` | Drag to adjust · $SPEED$× | `$SPEED$` |
| `presets` | Presets | — |
| `custom` | Custom | — |
| `speedPlaceholder` | 0.5 – 16 | — |
| `apply` | Apply | — |
| `rangeStep` | Range: $MIN$× – $MAX$× · Step: $STEP$× | `$MIN$` `$MAX$` `$STEP$` |
| `rateOnStore` | Rate on Store | — |

