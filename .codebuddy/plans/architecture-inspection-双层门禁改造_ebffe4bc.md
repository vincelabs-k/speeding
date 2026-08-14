---
name: architecture-inspection-双层门禁改造
overview: 将 architecture-inspection skill 从「P0 一票否决」升级为「健康分 + P0 硬否决」双层门禁：引入健康分计算与分档、baseline schema v2（score/scoreHistory）、checklist 联动改为三分支判定（含 score 缺失时的未知态处理），同步改造 3 个文件约 8 处。
todos:
  - id: update-inspection-score
    content: 更新 architecture-inspection/SKILL.md：健康分计算规则、报告格式、门禁联动与 baseline schema v2 迁移规则，用 [skill:skill-creator] 校准格式
    status: completed
  - id: update-baseline-v2
    content: 升级 baseline.json 至 version 2：新增 score 与 scoreHistory 字段
    status: completed
    dependencies:
      - update-inspection-score
  - id: update-checklist-gate
    content: 更新 extension_launch_checklist 第 9 项为三分支判定，处理 score 缺失隐患
    status: completed
    dependencies:
      - update-inspection-score
---


## 需求概述
将架构巡检 skill 的巡检结果从「P0/P1/P2 严重度分级 + P0 一票否决」升级为「健康分 + P0 硬否决」双层结构：每次巡检输出 0-100 健康分，低于分数线禁止发布；P0 存在时分数强制归 0 并一票否决发布（模拟商店「发现任何违规即拒审」的审核逻辑，防止致命项被高分稀释）。

## 核心功能
- 健康分计算：`score = 100 - P1×10 - P2×3`，P0 存在时强制归 0（不与任何正分抵消），下限截断 0
- 分档：≥90 健康 / 70-89 注意 / <70 红灯（红灯为警示，发布软门槛为 60）
- finding 粒度：同一文件内多处同类命中合并为一个 finding（按「问题类型 × 文件」计），避免同质化刷分
- baseline schema 升级 version 2：新增 `score` 与 `scoreHistory`（趋势追踪），旧版自动迁移
- 门禁公式：`可发布 = P0 count == 0 && tests 全部 PASS && 健康分 >= 60`
- 修复 checklist 第 9 项隐患：baseline 缺失或 score 缺失时输出「健康分未知」三分支判定，不直接放行也不直接阻断



## 技术栈
- 纯文档契约变更：2 个 SKILL.md + 1 个 baseline.json，不涉及扩展代码
- 沿用既有 skill 格式（frontmatter `description` + `allowed-tools` + 分步指令式 Markdown）与 baseline JSON 读写契约

## 实现方案
### 1. 健康分计算规则（architecture-inspection/SKILL.md）
- Step 4 严重度映射表后追加「健康分计算」小节：
  - 公式：`score = 100 - P1×10 - P2×3`，下限截断 0；`P0 > 0` 时 score 强制为 0（不与任何正分抵消）
  - 分档：≥90 健康 / 70-89 注意 / <70 红灯（红灯警示，不直接阻断；发布软门槛 60）
  - 计数口径：finding 按「问题类型 × 文件」合并（如 `storage.ts` 4 处 `chrome.*` 只计 1 个 P1），分数基于合并后数量
- Step 5 报告结论行改为：`健康分 86/100（P0 0 / P1 1 / P2 2）｜分档：注意`
- Step 5 门禁提示与末尾「门禁联动」改为双层公式
- Step 6 更新 baseline 时追加写入 `score` 与 `scoreHistory`

### 2. baseline schema v2 与迁移
- `version` 1 → 2，新增顶层 `score: number | null` 与 `scoreHistory: array`
- 读取到 `version < 2` 时自动升级：version 置 2、补 `score: null`、`scoreHistory: []`、原 findings 保留、`lastRunAt` 保留
- 升级后 score 为 null，需运行一次完整巡检才能获得首个分数；scoreHistory 每次巡检追加 `{ runAt, score, p0, p1, p2 }`，保留最近 10 次供趋势对比

### 3. 三分支判定（extension_launch_checklist Step 1 第 9 项，含隐患处理）
- 分支 A：baseline 缺失（首次巡检）→ ⚠️ 健康分未知，先运行 architecture-inspection 生成报告再继续（维持既有语义）
- 分支 B：baseline 存在但 `score: null`（旧版迁移或未写入）→ ⚠️ 健康分未知，提示重跑巡检刷新 score 后重试，**不直接放行也不直接阻断**
- 分支 C：score 有效 → 按双层公式判定：P0 open > 0 → 阻断；score < 60 → 阻断（软门槛）；均通过 → 进入 Step 3 发布前测试

## 执行细节
- 3 个文件同步修改，schema 契约（v2 字段与迁移规则）在 architecture-inspection/SKILL.md 中唯一定义，checklist 只引用不重述，避免契约漂移
- 阈值 60 的依据：当前项目实测 3 个 P1（chrome.* ×2 文件、僵尸文件 icon.svg、硬编码文案）约 70 分；60 给基线留空间，P2 堆积约 13 个才跌破，防烂账且不刻意压线
- 本改动为 skill 文档契约变更，不触碰扩展代码、不涉及 i18n / 测试套件

## 目录结构
```
.codebuddy/skills/
├── architecture-inspection/
│   ├── SKILL.md          # [MODIFY] 健康分计算规则、报告格式、门禁联动、baseline schema v2 与迁移规则
│   └── baseline.json     # [MODIFY] version 1 → 2，新增 score: null 与 scoreHistory: []
└── extension_launch_checklist/
    └── SKILL.md          # [MODIFY] Step 1 第 9 项改为三分支判定（含 score 缺失隐患处理）
```

## 关键数据结构（baseline schema v2）
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
      "description": "direct chrome.storage.* instead of browser.*",
      "status": "open | fixed | acknowledged",
      "firstSeenAt": "ISO8601",
      "resolvedAt": null
    }
  ]
}
```


## Agent Extensions
### Skill
- **skill-creator**
  - Purpose: 校准两个 SKILL.md 修改后的格式合规性（frontmatter description/allowed-tools、分步指令式结构）
  - Expected outcome: 修改后的 architecture-inspection 与 extension_launch_checklist 保持既有 skill 编写规范，无格式回退
