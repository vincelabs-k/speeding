---
name: remove-generated-key-from-locales
overview: 移除 _locales messages.json 顶层的 _generated 字符串 key（会导致 Chrome/Edge 拒绝加载整个扩展），同步清理生成脚本、校验脚本与 wxt.config.ts 的 Edge workaround，并用已有 .gitattributes/源文件注释/校验脚本作为防手改保障，随后重建产物并通过 Linux 黑盒测试。
todos:
  - id: remove-generated-marker
    content: 移除 generate-locales.ts 与 check-locales.ts 中的 _generated 标记代码
    status: completed
  - id: cleanup-wxt-hooks
    content: 删除 wxt.config.ts 中 Edge-only _generated 剥离 hooks 及未使用的 import
    status: completed
  - id: regenerate-rebuild
    content: 运行 generate:i18n 重生成 16 个 locale 文件并重建 chrome-mv3 产物
    status: completed
    dependencies:
      - remove-generated-marker
      - cleanup-wxt-hooks
  - id: blackbox-gate
    content: 用 [skill:extension_launch_checklist] 跑 tests/linux-compat/check.sh 黑盒验证发版门禁 PASS
    status: completed
    dependencies:
      - regenerate-rebuild
---

## 需求概述
1. **`_generated` 的作用分析**：它是 `scripts/generate-locales.ts` 写入所有 `public/_locales/{locale}/messages.json` 顶层的一个「生成文件标记」字符串（`"Auto-generated from translations/messages.ts — DO NOT EDIT"`），意图是提醒开发者该文件为自动生成、勿手改。但 Chrome 对 messages.json 的 schema 校验严格要求每个顶层 key 的值必须是 `{ message: string, ... }` 对象，字符串值非法 → 整个扩展加载失败（黑盒测试稳定复现 `Not a valid tree for key _generated`）。现有 `wxt.config.ts` 的 hooks 仅在 Edge 构建时剥离该 key，Chrome 构建未处理，导致 Linux/Chrome 加载失败。

2. **删除/替代方案（影响最小）**：直接彻底删除 `_generated` 标记，而非寻找替代。理由：
   - JSON 不支持注释，「生成标记」业界标准做法是文件外标记 + 源码头注释 + CI 校验，本项目已具备四重防手改保障：① `translations/messages.ts` 头部注释（单一事实源声明）② `package.json` 的 `prebuild: bun run generate:i18n`（每次构建自动重生成）③ `scripts/check-locales.ts` 一致性校验（`check:i18n`，不一致退出码 1）④ `.gitattributes` 的 `linguist-generated=true`。`_generated` 完全冗余。
   - 删除面收敛在三处脚本代码 + 重新生成产物，不触碰任何运行时逻辑（popup/content-script/background 均不动），发版影响最小。

## 核心功能
- 从 `scripts/generate-locales.ts`、`scripts/check-locales.ts` 移除 `_generated` 相关代码
- 删除 `wxt.config.ts` 中 Edge-only 的 `_generated` 剥离 hooks（及因此不再使用的 import），消除 Chrome/Edge 行为不一致的隐患
- 重新生成 `public/_locales/**`（16 个 locale），重建产物
- 以 `tests/linux-compat/check.sh` 黑盒门禁验证（WSL + Chrome for Testing 注册证据），确保发版 PASS

## 技术方案
### 方案选择：彻底删除 `_generated`（不引入替代）
- **业界实践依据**：Chrome 官方 messages.json 规范要求每个条目必须是 message 对象；生成文件标记的通行做法是「文件头注释（支持注释的格式）/ 文件外标记 + `linguist-generated` + CI 一致性校验」，而非在数据 JSON 内部塞无效数据字段。本项目四重保障已覆盖该目的，`_generated` 是历史遗留的无效做法。
- **为什么不做替代标记**：JSON 无注释语法，任何「合法值包装」都会污染产物内容或增加解析复杂度；且现有保障（prebuild 重生成 + check:i18n 校验 + linguist-generated）已完整闭环，替代方案属于过度设计（YAGNI）。
- **影响最小化**：只改 3 个构建脚本文件 + 重生成产物；运行时（entrypoints/）零改动；manifest 字段不变。

### 修改点（已核实）
1. **`scripts/generate-locales.ts`**：
   - L11 删除 `GENERATED_TAG` 常量
   - L17-20 `ChromeMessages` 接口删除 `_generated: string;`
   - L24-26 初始化对象删除 `_generated: GENERATED_TAG`
2. **`scripts/check-locales.ts`**：
   - L31-33 `expected` 初始对象删除 `_generated` 键（保持与生成器一致，否则校验永远 MISMATCH）
3. **`wxt.config.ts`**：
   - L30-55 整体删除 `hooks['build:done']` 块（Edge-only 剥离逻辑，Chrome 侧从未生效，属历史 workaround）
   - L2-3 同步清理仅被 hooks 使用的 import：`readdirSync`、`readFileSync`、`writeFileSync`、`join`
4. **重新生成与验证**：
   - `bun run generate:i18n` 重写 `public/_locales/**`（16 个 locale，全部移除 `_generated` 键）
   - `bun run build` 重建 `.output/chrome-mv3`
   - `wsl -e bash -c "bash /mnt/d/code/speeding/tests/linux-compat/check.sh /mnt/d/code/speeding/.output/chrome-mv3"` 黑盒验证（PASS 即发版门禁通过）

### 风险与规避
- **check-locales.ts 不同步**：若只改生成器不改校验器，`check:i18n` 会因 `_generated` 缺失报 MISMATCH → 两文件必须同批修改（同一任务内完成）
- **TS 未使用 import 报错**：删除 hooks 后 wxt.config.ts 的 `join/readdirSync` 等 import 成 unused（strict TS）→ 同步清理
- **产物陈旧**：`.output/` 与商店 zip 均为含 bug 旧产物 → 必须重建并重跑黑盒门禁；zip 需 `bun run zip` 重新打包后才可发布
- **生成文件禁止手改**：`public/_locales/**` 一律通过脚本重新生成，不在仓库中手动编辑

## Agent Extensions
### Skill
- **extension_launch_checklist**
  - Purpose：执行 Step 3「发布前测试」门禁，运行 tests/linux-compat/check.sh 黑盒验证修复后产物在 Linux（Chrome for Testing）的注册证据
  - Expected outcome：确认 `_generated` 修复后扩展在 Chrome 正常加载注册（PASS），输出门禁结论，阻断/放行发布
