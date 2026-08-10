---
name: edge-strip-generated-tag
overview: 在 wxt.config.ts 添加 build:done hook，仅在 Edge 构建打包时自动移除 _locales 输出中的 _generated 字段，不影响 Chrome 构建和源文件。
todos:
  - id: add-edge-hook
    content: 在 wxt.config.ts 中添加 `build:done` hook，Edge 构建时自动清除 _locales 中 `_generated` 字段
    status: completed
  - id: verify-edge-build
    content: 运行 `bun run zip:edge` 验证 Edge 打包成功，确认 _locales JSON 不含 _generated
    status: completed
    dependencies:
      - add-edge-hook
  - id: verify-chrome-build
    content: 运行 `bun run zip` 验证 Chrome 打包不受影响，确认 _locales JSON 仍包含 _generated
    status: completed
    dependencies:
      - add-edge-hook
---

## 问题
Edge Add-ons 商店上传时报错：
```
File _locales/ar/messages.json: Value of localizable string __generated__ is not a valid JSON. Line: 0 Column: 0
```

根因：`scripts/generate-locales.ts` 在每个 locale 的 `messages.json` 顶部写入纯字符串 `"_generated": "Auto-generated from translations/messages.ts — DO NOT EDIT"`。Edge 校验器要求所有顶层值必须是 `{ "message": "..." }` 对象结构，不接受纯字符串值。

## 约束
- **不修改** `scripts/generate-locales.ts` 生成脚本
- Chrome 构建产物保持 `_generated` 字段不变
- 仅 Edge 构建/打包时移除 `_generated` 字段

## 方案
在 `wxt.config.ts` 中添加 `'build:done'` hook，检测构建目标为 Edge 时，遍历输出目录中的 `_locales/*/messages.json`，删除 `_generated` key 后写回。


## 技术方案

### 实现方式
在 `wxt.config.ts` 的 `defineConfig` 中添加 `hooks` 配置项，注册 WXT 内置的 `'build:done'` hook。

**Hook 签名**（来自 `node_modules/wxt/dist/types.d.mts` 第 1199 行）:
```ts
'build:done': (wxt: Wxt, output: Readonly<BuildOutput>) => HookResult;
```

**关键判断**：
- `wxt.config.browser` 类型为 `TargetBrowser`（即 `string`），Edge 构建时值为 `'edge'`
- `wxt.config.outDir` 为输出目录绝对路径，如 `.output/edge-mv3/`

**处理逻辑**：
1. 检查 `wxt.config.browser !== 'edge'` → 直接返回，不做任何处理
2. 使用 `glob` 或 `readdirSync` 扫描 `outDir/_locales/*/messages.json`
3. 对每个文件：`readFileSync` → `JSON.parse` → `delete obj._generated` → `JSON.stringify` → `writeFileSync`
4. 打印日志提示已清理的文件数

### 修改文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `wxt.config.ts` | MODIFY | 添加 `hooks` 配置，注册 `'build:done'` 回调 |

### 注意事项
- `'build:done'` hook 在 WXT 0.20.27 中已支持（`InlineConfig.hooks` 类型定义于 `types.d.mts` 第 446 行）
- Hook 在构建完成、文件全部写入输出目录后触发，此时 `_locales/*/messages.json` 已从 `public/` 复制到 `outDir`
- `outDir` 与 `outBaseDir` 不同：`outDir` 指向具体目标目录（如 `.output/edge-mv3/`），`outBaseDir` 指向 `.output/`
- 无需额外安装依赖，`node:fs` 和 `node:path` 为 Node 内置模块

### 目录结构
```
d:/code/speeding/
├── wxt.config.ts          # [MODIFY] 添加 hooks.build:done
├── scripts/
│   └── generate-locales.ts  # 不修改
```

