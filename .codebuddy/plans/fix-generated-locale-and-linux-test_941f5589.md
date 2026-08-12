---
name: fix-generated-locale-and-linux-test
overview: 修复 Chrome 产物 _locales/messages.json 中非法 _generated 字符串键导致扩展无法加载的问题，并补强 linux-compat 测试套件以捕获 locale schema 与 manifest 加载错误。
todos:
  - id: fix-locale-generation
    content: 移除 generate-locales.ts 与 check-locales.ts 中的 _generated 字段并重新生成 public/_locales
    status: completed
  - id: simplify-build-hook
    content: 简化 wxt.config.ts build:done 钩子为全浏览器防御清理
    status: completed
    dependencies:
      - fix-locale-generation
  - id: add-locale-schema-check
    content: 在 check.sh 阶段 1 增加 _locales/messages.json schema 校验
    status: completed
  - id: expand-load-error-patterns
    content: 扩展 check.sh 阶段 2 错误日志匹配模式
    status: completed
    dependencies:
      - add-locale-schema-check
  - id: add-smoke-marker-and-config
    content: 在 content.ts 添加注入标记并填写 linux-compat.json smoke 配置
    status: completed
    dependencies:
      - expand-load-error-patterns
  - id: verify-build-and-test
    content: 运行 bun run build 与 tests/linux-compat/check.sh 验证修复
    status: completed
    dependencies:
      - simplify-build-hook
      - add-smoke-marker-and-config
---

## Product Overview
修复 Chrome MV3 扩展在 WSL Chrome 中手动加载时因 `_locales/*/messages.json` 含非法 `_generated` 字符串键而报 `Not a valid tree for key _generated. Could not load manifest.` 的问题；同时补强 `tests/linux-compat/check.sh`，使其能捕获 manifest / locale schema 加载错误。

## Core Features
- 移除翻译生成文件中的非法 `_generated` 顶层键，确保 Chrome i18n schema 合规
- 更新 `check-locales.ts` 校验逻辑，保持源文件与生成文件一致
- 清理/统一 `wxt.config.ts` 中的构建后钩子
- 在 `check.sh` 阶段 1 增加 `_locales/messages.json` schema 校验（每个 key 必须是含 `message` 的对象）
- 在 `check.sh` 阶段 2 扩展 Chromium 启动错误日志的匹配模式，覆盖 `Not a valid tree` / `Could not load manifest`
- 补充 content script 注入标记并填写 `linux-compat.json`，使功能 smoke 测试真正运行

## Tech Stack Selection
- 构建工具：Bun + WXT（保持项目既有栈）
- 语言：TypeScript
- 目标浏览器：Chrome MV3

## Implementation Approach
采用“源头清理 + 测试加固”双管齐下的策略：

1. **源头清理**：`scripts/generate-locales.ts` 当前把 `_generated` 作为字符串写入 `messages.json` 顶层，违反 Chrome 的 i18n schema（每个顶层 key 必须是 `{ message: string, ... }` 对象）。直接移除该字段，使 `public/_locales/` 与 `.output/` 中的产物天然合法，不再依赖构建后钩子做浏览器差异化清理。
2. **校验同步**：`scripts/check-locales.ts` 中期望的 `_generated` 一并移除，避免 `bun run check:i18n` 与新的生成结果冲突。
3. **钩子简化**：`wxt.config.ts` 的 `build:done` 钩子原本只在 Edge 构建时删除 `_generated`。由于源文件已不含该字段，钩子改为所有浏览器下的防御性清理（或移除），避免再次引入类似字段时复发。
4. **测试加固**：
   - `tests/linux-compat/check.sh` 阶段 1 增加对 `_locales/*/messages.json` 的 schema 检查：验证文件存在、JSON 合法、每个顶层键均为对象且含 `message` 字符串。
   - 阶段 2 的 `grep -E` 错误模式追加 `Not a valid tree|Could not load manifest|not valid`，确保真实报错被捕获。
5. **功能 smoke 落地**：`entrypoints/content.ts` 注入一个无侵入的 DOM 标记（如 `document.documentElement.dataset.speedingExt = '1'`），并在 `tests/linux-compat/linux-compat.json` 配置 `smoke.url` 与 `smoke.injectFlag`，让阶段 3 真正验证 content script 注入。

## Implementation Notes
- 严格遵守 i18n 规则：`public/_locales/` 禁止手改，所有翻译变更通过 `translations/messages.ts` + `bun run generate:i18n` 完成。
- 本次改动会触发 `public/_locales/*/messages.json` 全部重新生成，属于预期变更。
- `check.sh` 的 locale schema 校验使用纯 bash/grep/sed，保持“零依赖”约定。
- 注入标记仅用于测试断言，不影响业务逻辑与性能。

## Architecture Design
无需新增模块。改动集中在：
- 翻译生成/校验脚本（`scripts/`）
- WXT 配置钩子（`wxt.config.ts`）
- 兼容性测试脚本与配置（`tests/linux-compat/`）
- Content script 入口（`entrypoints/content.ts`）

## Directory Structure
```
d:/code/speeding/
├── scripts/
│   ├── generate-locales.ts      # [MODIFY] 移除 _generated 字段
│   └── check-locales.ts         # [MODIFY] 移除 expected _generated 字段
├── wxt.config.ts                # [MODIFY] 简化 build:done 钩子为全浏览器防御清理
├── entrypoints/
│   └── content.ts               # [MODIFY] 注入无侵入 DOM 标记供 smoke 断言
├── tests/linux-compat/
│   ├── check.sh                 # [MODIFY] 增加 locale schema 校验与错误日志匹配模式
│   └── linux-compat.json        # [MODIFY] 填写 smoke.url / injectFlag
└── public/_locales/*/messages.json  # [MODIFY] 重新生成（_generated 移除）
```
