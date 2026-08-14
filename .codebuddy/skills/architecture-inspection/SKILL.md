---
description: >-
  架构巡检（Architecture Inspection）：手动触发的代码库健康体检。当用户说
  “架构巡检”“架构体检”“体检一下”“architecture check”“architecture review”
  时触发。对项目执行三维度静态巡检——项目规则偏离（WXT 结构 / 分发政策 / i18n /
  测试门禁契约）、通用代码质量（strict TS、死代码、依赖健康、硬编码文案）、架构形态
  （入口膨胀、background 最小化、模块边界），对照 .codebuddy/rules/ 基线输出带
  P0/P1/P2 严重度分级的报告与修复清单，并汇总为 0-100 健康分，与 baseline.json
  增量对比。双层门禁：P0 硬否决 + 健康分软门槛（score >= 60），联动
  extension_launch_checklist 发布门禁。
allowed-tools: Read, Grep, Glob, Bash
---

你是代码库架构健康巡检专家。对当前工作区执行三维度静态巡检，发现与项目规则、代码质量、架构形态的偏离，输出带严重度分级的报告与修复清单。

## 定位与边界

- **巡检只负责「发现」，不负责「集中改造」**：报告输出后，修复清单每项独立小步提交并过 `tests/` 门禁，禁止一次性大规模重构。
- 纯静态扫描（Read/Grep/Glob），零构建、零测试运行、零环境依赖，秒级完成。
- 判定依据 `.codebuddy/rules/` 下规则基线 + 通用工程实践。静态可确证项标【事实】，推断项标【推测】。
- 巡检不替代 `extension_launch_checklist`（发布门禁）；P0 偏离是发布必查输入。
- 健康分反映整体质量与趋势，不替代 P0 硬否决：P0 存在时分数强制归 0，不允许用高分抵销致命项。

## 执行总览

1. **Step 1: 规则维度巡检**（对照五份 .mdc 规则基线）
2. **Step 2: 质量维度巡检**（strict TS、死代码、依赖健康）
3. **Step 3: 架构形态维度巡检**（膨胀度、职责划分、模块边界）
4. **Step 4: 严重度分级 + 与 baseline.json 增量对比**
5. **Step 5: 输出报告 + 修复清单**
6. **Step 6: 更新 baseline.json**

## Step 1: 规则维度巡检（对照 .codebuddy/rules/）

逐项输出 ✅ 通过 / ❌ 偏离 / ⚠️ 警告。偏离项记入 finding。

### 1.1 WXT 结构与包管理（rules/wxt-project.mdc）

1. **包管理**：`bun.lock` 存在于项目根；`package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` 不得存在 → 混入为 P1。
2. **目录结构**：必须使用 `entrypoints/`，不得存在 `src/` → 存在为 P1。
3. **Manifest**：`wxt.config.ts` 中 manifest 为 MV3；无 MV2 遗留（`background.page` / `background.scripts`）→ 遗留为 P0。
4. **Background 为 service worker**：`background.ts` 不得使用 `window` / `document` / DOM API → 违者为 P0。
5. **API 命名空间**：grep `chrome\.\w+\.`（排除注释、`docs/` 与 `*.md` 文档），应为 0 命中；必须使用 `browser.*`（WXT polyfill）→ 命中为 P1（违反规则基线，Firefox 兼容风险）。已知样本：`entrypoints/utils/storage.ts`（L9/13/19/21）、`entrypoints/utils/stats.ts`（L45/46/73/75）直用 `chrome.storage.*`。
6. **UI 栈**：React 19 + TS strict + Tailwind CSS v4（`@tailwindcss/vite` 已配置）；仅一个 entrypoint CSS 作为 Tailwind 入口。
7. **反模式扫描**：`eval(` / `new Function(` / `setTimeout("string")` 应为 0 命中 → 命中为 P0。

### 1.2 分发政策（rules/distribution-policy.mdc）

1. **外部 JS**：无 CDN / 远程脚本引用（`<script src="http`、动态 `import` 远程 URL）→ 违者为 P0。
2. **远程代码执行**：无 `fetch(...)` 后紧跟 `eval` / `new Function` / 动态 import 的调用链 → 违者为 P0。
3. **host_permissions**：`wxt.config.ts` 中若声明 `host_permissions`，不得含 `<all_urls>` / `*://*/*`，路径尽量收敛 → 过宽为 P0。
4. **CSP**：manifest 或 HTML 中未放宽 `script-src` → 放宽为 P0。

### 1.3 i18n（rules/i18n.mdc）

1. **翻译源**：`translations/messages.ts` 存在且为唯一修改入口；`public/_locales/**` 为自动生成物。
2. **messages.json 合法性**：抽查 `public/_locales/en/messages.json`，每个顶层 key 必须是含 `message` 字段的对象；禁止 `_generated` 等注释性 key → 非法 key 为 P0（Chrome/Edge 拒绝加载）。
3. **一致性验证**：若环境有 bun，运行 `bun run check:i18n` 验证源与生成物一致；无 bun 则跳过并注明。

### 1.4 测试门禁契约（rules/test-cases.mdc）

1. **套件存在**：`tests/` 下存在含 `check.sh` 的套件目录。
2. **契约抽查**：`check.sh` 含 `PASS`/`FAIL` 输出前缀与「结果汇总」，退出码语义 0/1/2。
3. **黑盒优先**：门禁判定依据运行时证据（如浏览器注册记录），不解析产物文件内容 → 白盒判据作为门禁 PASS 为 P1。

## Step 2: 质量维度巡检

1. **strict TS**：grep `\bany\b`（排除注释与字符串）→ 类型标注为 `any` 的命中为 P1。
2. **僵尸文件**：`public/`、`assets/` 等资源目录下，无任何代码引用的文件（对每个资源文件名 grep 引用，引用数为 0 即僵尸；manifest `icons` 声明计入引用）→ P1。已知样本：`public/icon/icon.svg`（未被 `wxt.config.ts` icons 声明且全工作区无引用）。
3. **硬编码文案**：`entrypoints/popup/*.tsx` 等 UI 文件中**用户可见的自然语言字面量** → 应走 i18n，违者为 P1。排除项：日志、占位符、数字刻度标签（如 `SLIDER_LABELS` 的 `'0.5'/'1'`）、符号（`×`/`&times;`）、CSS 类名、aria 动态拼接值。已知样本：`App.tsx:177` 品牌名 `Speeding` 硬编码在 JSX 文本【推测，品牌名常为可接受例外】。
4. **依赖健康**：`package.json` 中无多余重复依赖、无 `npm`/`yarn` 痕迹；`scripts` 使用 `bun run`。

## Step 3: 架构形态维度巡检

1. **入口膨胀**：`entrypoints/*/` 下组件/入口文件行数 >500 → P2（拆分建议）。当前基线：`App.tsx` 约 400 行，接近阈值可提示 review。
2. **background 最小化**：`background.ts` 行数 >50 且含消息路由逻辑（per-message routing）→ P2 review；background 应保持极简（当前为 `defineBackground(() => {})` 空壳，合格）。
3. **模块边界**：`entrypoints/` 之间互相导入（`content` ↔ `popup`）→ P2；共享逻辑只允许放 `utils/`，且 `utils/` 不得反向导入 entrypoint。
4. **共享模块职责**：`entrypoints/utils/` 每文件专注单一关注点（如 constants / speed-controller / stats / storage），职责混杂 → P2。
5. **重复代码**：跨文件重复逻辑块（如两处相同 storage 读写封装）→ P2，建议下沉共享。

## Step 4: 严重度分级与基线对比

### 严重度映射

| 级别 | 含义 | 典型项 |
|---|---|---|
| **P0** | 发布阻断：商店拒审 / 加载失败 / 安全违规 | 远程代码执行、MV2 残留、CDN/外部 JS、非法 i18n key、host_permissions 过宽、CSP 放宽、background 使用 DOM |
| **P1** | 应尽快修：破坏规则基线 / 兼容风险 / 资产腐败 | `chrome.*` 命名空间、strict `any`、僵尸文件、lock 混入、`src/` 目录、硬编码文案、白盒门禁 |
| **P2** | 建议改进：架构形态 / 可维护性 | 入口膨胀、模块边界违规、background 非最小、职责混杂、重复代码 |

### 健康分计算（0-100）

- 计数口径：finding 先按「问题类型 × 文件」合并，再基于合并后数量计分（如 `storage.ts` 内 4 处 `chrome.*` 只计 1 个 P1；同一文件同一检查项的多次命中不重复计），避免同质化刷分。
- 公式：`score = 100 - P1×10 - P2×3`；下限截断 0。
- **P0 硬否决**：`P0 count > 0` 时 score 强制为 0（不与任何正分抵消），模拟商店「发现任何违规即拒审」。
- 分档：`≥90 健康 / 70-89 注意 / <70 红灯`（红灯为警示；发布软门槛为 60，见「门禁联动」）。
- 示例：`P0 0 / P1 1 / P2 2` → `score = 100 - 10 - 6 = 84`，分档「注意」。

### baseline.json 增量对比

- 读取 `.codebuddy/skills/architecture-inspection/baseline.json`（受版本库管理）。
- finding 以 **id** 为准对比（id = `维度-检查项-位置`，见 schema）。
- 当前扫描含且 baseline 已有 → **已知**：不刷屏，仅汇总计数。
- 当前有 baseline 无 → **新增**：报告高亮 `NEW`，写入 baseline。
- baseline 有当前无 → **已修复**：`status` 置 `closed`、写入 `resolvedAt`。
- baseline 文件缺失 → 首次巡检：全量记为新增并生成 baseline。
- baseline 中 `status: acknowledged`（开发者确认接受）的项：仍展示但标注「已确认」，不再催促修复。

### baseline.json schema（读写契约，version 2）

```json
{
  "version": 2,
  "lastRunAt": "ISO8601 | null",
  "score": 0,
  "scoreHistory": [
    { "runAt": "ISO8601", "score": 86, "p0": 0, "p1": 1, "p2": 2 }
  ],
  "findings": [
    {
      "id": "rule-wxt-chrome-ns-storage-ts",
      "dimension": "rule | quality | architecture",
      "severity": "P0 | P1 | P2",
      "location": "entrypoints/utils/storage.ts:9",
      "description": "直接使用 chrome.storage.* 而非 browser.*",
      "status": "open | fixed | acknowledged",
      "firstSeenAt": "ISO8601",
      "resolvedAt": null
    }
  ]
}
```

**schema 契约（本文件唯一定义，checklist 只引用不重述）**：

- `score`：本次巡检健康分（0-100，规则见「健康分计算」）；P0 > 0 时为 0；未巡检过为 `null`。
- `scoreHistory`：每次巡检追加 `{ runAt, score, p0, p1, p2 }`，仅保留最近 10 次供趋势对比（超出丢弃最旧）。
- **版本迁移**：读取到 `version < 2` 的旧 baseline 时自动升级——`version` 置 2、补 `score: null`、`scoreHistory: []`、原 `findings` 与 `lastRunAt` 原样保留；升级后 score 为 null，需运行一次完整巡检才能获得首个分数。

## Step 5: 输出报告

按以下 Markdown 格式输出（遵循项目 command 约定：结论明确、不啰嗦）：

### 🏗 架构巡检报告

**巡检时间**：[自动获取]
**结论**：健康分 86/100（P0 0 / P1 1 / P2 2）｜分档：注意 ｜ ⚠️ 存在 N 项偏离（P0 x / P1 y / P2 z）

#### 1. 规则维度
- [检查项] ✅/❌/⚠️ 结果（严重度 + 【事实】/【推测】）

#### 2. 质量维度
（同上格式）

#### 3. 架构形态维度
（同上格式）

#### 4. 偏离汇总

| id | 维度 | 严重度 | 位置 | 状态 |
|---|---|---|---|---|
| rule-wxt-chrome-ns-... | rule | P1 | storage.ts:9 | NEW |

（状态：NEW / 已知 / 已关闭 / 已确认）

#### 5. 修复清单（按严重度排序）

- **[P1] 替换 chrome.* → browser.***（storage.ts、stats.ts）**：小步重构——逐文件替换命名空间，`bun run compile` 通过，独立提交，跑 `tests/linux-compat/check.sh`。
- 每项注明：改什么、验证方式、独立提交、过 `tests/` 门禁。

#### 6. 门禁提示

按双层公式判定并显著提示（供 `extension_launch_checklist` 引用）：

- `P0 count > 0`（硬否决）→ **「禁止发布，直至 P0 清零」**。
- `score < 60`（软门槛）→ **「健康分不足，禁止发布」**。
- `P0 == 0` 且 `score >= 60` → 巡检侧放行，进入发布流程后续步骤。

## Step 6: 更新 baseline

- 将本次扫描结果写回 `baseline.json`：新增项追加、已修复项标记 `closed` + `resolvedAt`、更新 `lastRunAt`、写入本次 `score` 并向 `scoreHistory` 追加记录（超出 10 条丢弃最旧）。
- 旧版（`version < 2`）baseline 按 schema 迁移规则自动升级后再写回。
- baseline.json 变更随代码入库，保证跨设备一致。

## 门禁联动

发布门禁为双层结构（`extension_launch_checklist` Step 1 第 9 项引用）：

```text
可发布 = (P0 count == 0)   // 硬否决，模拟商店拒审
      && (tests 全部 PASS) // 硬否决，Step 3 发布前测试
      && (健康分 >= 60)    // 软门槛，约束 P1/P2 堆积
```

- 本 skill 产出 **P0 偏离清单 + 健康分 score** 两项必查输入：P0 必须为 0（硬否决）；score 低于 60 同样阻断发布。
- P1/P2 不单独阻断，但会通过健康分累计作用于软门槛；建议纳入迭代 backlog 小步消化。
- 首次巡检或旧版 baseline（score 缺失）时 score 为 `null`，checklist 按「健康分未知」处理，不直接放行也不直接阻断（详见 checklist Step 1 第 9 项）。
