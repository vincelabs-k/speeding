---
name: i18n-single-source-refactor
overview: 将 16 个 `_locales/*/messages.json` 手写文件重构为「单源文件 + 构建生成」模式，`translations/messages.ts` 是唯一翻译源，`public/_locales/` 由脚本自动生成。
todos:
  - id: create-translations-source
    content: 创建 `translations/messages.ts`，将 16 个语言、20 个 message key 按 key-first 结构聚合为单源文件
    status: completed
  - id: create-generate-script
    content: 创建 `scripts/generate-locales.ts`，读取源文件并输出带 `_generated` 标识的 `_locales/` JSON 文件
    status: completed
    dependencies:
      - create-translations-source
  - id: create-check-script
    content: 创建 `scripts/check-locales.ts`，校验生成文件未被手动编辑
    status: completed
    dependencies:
      - create-generate-script
  - id: add-gitattributes-and-scripts
    content: 创建 `.gitattributes` 标记生成文件，更新 `package.json` 添加 `generate:i18n`、`check:i18n`、`prebuild` 脚本
    status: completed
  - id: regenerate-locales
    content: 运行生成脚本，重新生成全部 16 个 `public/_locales/*/messages.json`
    status: completed
    dependencies:
      - create-generate-script
      - add-gitattributes-and-scripts
---

## 需求概述
将项目 i18n 从 16 个手写 `_locales/{locale}/messages.json` 模式重构为单源文件 + 脚本自动生成模式。

## 核心功能
- **单源翻译文件**：`translations/messages.ts` 按 key 聚合所有 16 种语言的翻译，一个 key 的翻译排列在一起，方便对比编辑
- **占位符集中管理**：带占位符的 message（如 `$SPEED$`、`$COUNT$`）的 placeholder 定义集中声明，所有语言共享同一份结构
- **自动生成**：运行 `bun run generate:i18n` 将源文件编译为 Chrome 扩展标准的 `public/_locales/{locale}/messages.json`
- **手动编辑防护**：生成文件头部注入 `_generated` 标识字段；`check:i18n` 脚本可检测生成文件是否被手动修改；`.gitattributes` 将生成文件标记为 `linguist-generated`
- **预构建集成**：`prebuild` 钩子确保每次构建前自动重新生成翻译文件


## 技术方案

### 源文件结构设计

`translations/messages.ts` 采用 **key-first** 布局：

```typescript
// 简单消息：locale → text
extName: {
  en: 'Speeding',
  zh_CN: 'Speeding',
  // ... 16 locales
},

// 带占位符消息：locale → text，placeholders 在外部集中定义
dragToAdjust: {
  en: 'Drag to adjust · $SPEED$×',
  zh_CN: '拖拽调整 · $SPEED$×',
  // ... 16 locales
},
```

**类型系统**：
- `Locale`：联合类型，从 `LOCALES` const 数组派生
- `SimpleMessages`：`Record<string, Partial<Record<Locale, string>>>`，所有简单消息
- `PlaceholderMessages`：同结构，但对应的 key 在 `placeholders` 中有定义
- `PlaceholderDef`：`Record<string, { content: string; example: string }>`

### 生成脚本设计

`scripts/generate-locales.ts` 流程：
1. 从 `translations/messages.ts` 导入 `LOCALES`、`messages`、`placeholders`
2. 对每个 locale，构建对应的 Chrome i18n JSON 对象
3. 每个 entry 判断：若 key 在 `placeholders` 中存在，输出 `{ message, placeholders }` 格式；否则输出 `{ message }` 格式
4. 每个 JSON 文件顶部插入 `"_generated"` 字段作为标识
5. 使用 `Bun.write()` 写入 `public/_locales/{locale}/messages.json`

### 校验脚本设计

`scripts/check-locales.ts` 流程：
1. 运行生成逻辑到临时目录（不覆盖实际文件）
2. 逐文件对比临时目录与 `public/_locales/` 的内容
3. 不一致时输出差异的文件列表并退出码 1

### 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `translations/messages.ts` | NEW | 唯一翻译源，20 个 key × 16 个 locale |
| `scripts/generate-locales.ts` | NEW | 读取源文件，生成 `_locales/` 树 |
| `scripts/check-locales.ts` | NEW | CI/预提交校验，防止手动编辑生成文件 |
| `.gitattributes` | NEW | `public/_locales/** linguist-generated=true` |
| `package.json` | MODIFY | 新增 `generate:i18n`、`check:i18n`、`prebuild` 脚本 |
| `public/_locales/*/messages.json` | MODIFY | 16 个文件重新生成，注入 `_generated` 标识 |

### 实现注意事项
- 所有 20 个 key 的 16 种语言翻译必须原样保留，不做任何修改
- `scripts/` 目录下的 `.ts` 文件使用 Bun 原生 API（`Bun.file`、`Bun.write`、`import`），无需额外依赖
- `prebuild` 在 `bun run build` 之前自动执行生成
- 生成文件的 `_generated` 字段不影响 Chrome 运行（Chrome 会忽略 `messages.json` 中不认识的顶层 key）

