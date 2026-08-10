---
name: listing-keyword-optimization
overview: 修改扩展名称和英文短描述以优化商店 listing 关键词排名：标题改为 "Speeding - Video Speed Controller"，短描述前置 YouTube/HTML5/Shortcuts/Playback Rate 关键词并控制在 132 字符内。
todos:
  - id: update-extname
    content: 修改 extName：全部 16 个 locale 统一改为 "Speeding - Video Speed Controller"
    status: completed
  - id: update-extdesc
    content: 修改 extDescription：16 个 locale 改为关键词前置的紧凑版本（en 119 字符，其他语言精简翻译）
    status: completed
  - id: regenerate-locales
    content: 运行 `bun run generate:i18n` 重新生成 16 个 locale 文件
    status: completed
    dependencies:
      - update-extname
      - update-extdesc
---

## 需求
优化 Chrome Web Store 商店 Listing 的关键词以提升搜索排名和转化率。

## 核心改动
1. **标题**: `extName` 从 "Speeding" 改为 "Speeding - Video Speed Controller"，全部 16 种语言统一
2. **短描述**: `extDescription` 改为 132 字符以内的紧凑版本，前置关键词 YouTube、HTML5、Shortcuts、Playback Rate，全部 16 种语言同步翻译
3. 修改后重新生成 `public/_locales/*/messages.json`


## 技术方案

### 修改范围
仅修改 `translations/messages.ts`（SSOT），然后执行 `bun run generate:i18n` 生成 locale 文件。

### 具体改动

**extName** — 全部 16 个 locale 统一改为 `"Speeding - Video Speed Controller"`，品牌名不翻译。

**extDescription (en)** — 119 字符，关键词前置：
> "YouTube, HTML5 video speed controller with shortcuts. Set playback rate once per site: Netflix, Bilibili, Udemy &amp; more."

**extDescription (其他 15 语言)** — 保持相同结构（关键词前置 + 功能描述 + 平台列表），参考现有翻译风格。

### 生成流程
```
translations/messages.ts (编辑)
    → bun run generate:i18n
    → public/_locales/{ar,da,de,en,es,fr,hi,it,ja,ko,nl,no,pt_PT,sv,zh_CN,zh_TW}/messages.json (自动生成)
```

### 涉及文件
```
project-root/
├── translations/
│   └── messages.ts          # [MODIFY] 更新 extName 和 extDescription 两个 key 的全部 16 语言
└── public/_locales/
    └── */messages.json       # [REGENERATE] 运行 bun run generate:i18n 自动生成
```

