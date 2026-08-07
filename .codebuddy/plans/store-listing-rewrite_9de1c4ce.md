---
name: store-listing-rewrite
overview: 改写商店介绍文案（Short Description + Detailed Description）、README 和 manifest description，以「场景收窄」策略突出记忆功能、音高保持、隐私等差异化优势驱动用户增长。
todos:
  - id: update-store-listing
    content: 改写 docs/STORE_LISTING.md 的 Short Description、Detailed Description 首段和 Key Features
    status: completed
  - id: update-readme
    content: 改写 README.md 副标题、Features 段、新增 Why 段落、修正 Privacy 措辞
    status: completed
  - id: update-manifest-desc
    content: 更新 wxt.config.ts 的 manifest.description
    status: completed
---

## 产品概述
针对当前商店介绍词泛化（与 CWS 上几十个同类扩展无区别）的问题，基于已上线的 per-site 速度记忆功能，重新设计核心介绍文案，以差异化优势驱动用户增长。

## 核心改写方向

- **Short Description**：132 字以内，以站点记忆（竞品极少）打头阵，音高保持紧随其后，速度范围/平台收尾
- **Detailed Description**：场景先行——追剧党、网课党、技术视频党三组典型用户画像领衔，再展开功能列表
- **README**：副标题同步商店 Short Description，Features 段补充记忆功能和双模式，追加 "Why Speeding" 差异化对比段落
- **Manifest Description**：wxt.config.ts 中的 `description` 与 Short Description 保持一致

## 涉及文件

| 文件 | 改动 |
|------|------|
| `docs/STORE_LISTING.md` | 重写 Short Description + Key Features + Detailed Description 首段，Permission Justification 和隐私表格不动 |
| `README.md` | 更新副标题、Features 段（新增记忆/Mode 条目，重排优先级）、Privacy 段措辞修正 |
| `wxt.config.ts` | `manifest.description` 同步 Short Description |


## 技术说明
纯文案修改，无代码逻辑变更。三个文件中 description 文本需保持语义一致（非逐字完全相同）。

## 改动清单

### `docs/STORE_LISTING.md`

**Short Description（改为 126 chars）**：
```
Set speed once, remembered per site. Pitch-preserving audio at 0.5x–16x. Works on YouTube, Bilibili, Netflix & online courses.
```

**Detailed Description 首段（场景先行）**：
```markdown
**Speeding** remembers your preferred speed for every website — binge a 40-episode drama in half the time, breeze through online lectures, or slow down tricky tutorials, all without chipmunk voices. Set it once and it just works.

Unlike other speed controllers that forget your settings or distort audio, Speeding uses per-site memory and always-on pitch preservation so your content always plays the way you want.
```

**Key Features（重排优先级 + 新增记忆项）**：
```markdown
**Key Features:**
- Per-site speed memory — each website remembers its own speed automatically
- "This site" / "All sites" mode — choose per-domain or global speed
- Pitch-preserving audio — voices and music stay natural at any speed
- Ultra-wide range — from 0.5x slow-mo to 16x hyper-speed
- Works everywhere — Bilibili, YouTube, Netflix, Vimeo, Coursera, and any site with `<video>` elements
- Privacy-first — no tracking, no analytics, speed data stored locally only
- One-click popup — no signup, no configuration
```

### `README.md`

**副标题（第 3 行）**：
```
Set speed once, remembered per site — pitch-preserving audio at 0.5x–16x.
```

**Features 段（替换为完整列表 + 新增 Why 段落）**：
```markdown
## Features

- Per-site speed memory — set it once, never touch it again
- "This site" and "All sites" modes for flexible speed management
- Adjust playback speed from 0.5x to 16x on any `<video>` element
- Pitch-preserving audio — voices and music stay natural even at 8x
- Works on YouTube, Bilibili, Netflix, Vimeo, Coursera, and more
- Privacy-first — zero tracking, zero external servers

## Why Speeding

Most video speed controllers forget your settings when you switch tabs. Speeding remembers your speed per site and keeps audio pitch natural by default — no configuration, no signup, no tracking.
```

**Privacy 段（措辞修正，与当前 PRIVACY.md 对齐）**：
```markdown
## Privacy

Speeding stores only your speed preferences (domain + speed value) in Chrome's local storage. No analytics, no tracking, no external servers. See [docs/PRIVACY.md](./docs/PRIVACY.md) for details.
```

### `wxt.config.ts`

**`manifest.description`（第 15 行）**：
```ts
description: 'Set speed once, remembered per site. Pitch-preserving audio at 0.5x–16x. Works on YouTube, Bilibili, Netflix & online courses.',
```

