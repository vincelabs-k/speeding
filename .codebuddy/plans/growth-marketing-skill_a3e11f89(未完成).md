---
name: growth-marketing-skill
overview: 为 Speeding 项目（可跨项目拷贝复用）新建一个「全链路增长/社区营销」skill，面向欧美英文社区高 ARPU 人群，人设为增长负责人（非代码助手），覆盖定位分析→渠道策略→英文软文→发布执行→数据复盘全链路，以长期盈利为目标。
todos:
  - id: init-skill-structure
    content: 用 [skill:skill-creator] 初始化 growth-marketing 骨架，[subagent:code-explorer] 审查现有 skill 风格基准
    status: pending
  - id: write-skill-main
    content: 编写 SKILL.md：增长负责人人设、四模式工作流、统一自检清单，全部通用化不硬编码产品
    status: pending
    dependencies:
      - init-skill-structure
  - id: write-channels-templates
    content: 编写 references/channels-handbook.md（欧美渠道手册）与 copywriting-templates.md（英文模板库）
    status: pending
    dependencies:
      - write-skill-main
  - id: write-positioning-pitfalls-metrics
    content: 编写 positioning-framework.md（定位画像+变现路径）、launch-pitfalls.md、metrics-review.md
    status: pending
    dependencies:
      - write-skill-main
  - id: validate-link-skill
    content: 用 [skill:store-listing-copywriter] 校准禁用词调性，[skill:skill-creator] 校验结构，确认联动 utm-sources.md
    status: pending
    dependencies:
      - write-channels-templates
      - write-positioning-pitfalls-metrics
---

## 产品概述
规划并创建一个通用的「社区增长营销」skill，用于解答"如何通过论坛/互联网社区推广引流产品"类问题（含软文/推广材料撰写）。人设为增长负责人（Growth Lead），区别于代码助手；输出以英文为主，面向欧美英文社区的高 ARPU 用户；以长期盈利为目标，覆盖从定位到复盘的完整增长链路。

## 核心功能
- **全链路增长工作流**：用户画像与定位分析 → 渠道策略 → 英文内容生成 → 发布执行 → 数据复盘与迭代
- **英文软文生成**：Reddit / Hacker News / Indie Hackers / X 等欧美社区的原生风格模板，地道真诚、非营销腔
- **欧美渠道手册**：主流英文社区矩阵，含各渠道调性、推广规则、最佳实践与发布时机
- **盈利导向**：高 ARPU 用户获取与变现路径设计（免费工具 → 社区信任 → 口碑/捐赠/Pro 化），复盘指标围绕 ARPU 与转化漏斗
- **通用化设计**：不硬编码 Speeding 产品名/链接，跨项目 git 拷贝即用；产品特定信息通过联动项目 `docs/utm-sources.md` 等既有文件获取
- **避坑与合规**：社区自我推广规则（如 Reddit 10% 规则）、禁用绝对化用语、截图真实性、链接必须带 utm_source 并先登记


## Tech Stack
- 纯文档型 skill 包（无代码/脚本依赖）：`SKILL.md`（YAML frontmatter + Markdown 正文）+ `references/` 分层资源
- 遵循 skill-creator 渐进式披露原则：frontmatter（触发条件，约 100 词）→ SKILL.md 正文（<5k 词）→ references（按需加载）
- 存放于 `.codebuddy/skills/growth-marketing/`，与现有 4 个项目级 skill 同级，风格保持一致

## 实现方案
采用「单一工作流 + 多模式入口 + 分层知识库」架构：
- **SKILL.md**：定义增长负责人人设、四模式工作流（A 全链路增长方案 / B 渠道策略 / C 英文内容生成 / D 数据复盘）、统一自检清单；全部使用「当前项目产品」抽象表述，不硬编码产品名
- **references/ 五份知识文档**：承载深度领域知识，SKILL.md 保持精简
- **通用化机制**：英文模板使用 `{PRODUCT}` `{LINK}` `{CHANNEL}` 占位符；运行时读取项目 `docs/utm-sources.md`（渠道登记）与 `docs/STORE_LISTING.md`（调性），缺失时引导创建，使 skill 可跨项目复用

## 架构设计
分层结构（无需改动现有代码，纯新增 skill 包）：
- 触发层：frontmatter description 定义触发条件（推广/引流/软文/launch/growth/marketing/promotion 等意图）
- 执行层：SKILL.md 四模式工作流 + 统一自检清单
- 知识层：references/ 5 份文档按需加载
- 联动层：运行时引用项目 `docs/utm-sources.md`（新增渠道先登记）、`docs/STORE_LISTING.md`，与 `store-listing-copywriter` 共用禁用词与调性规则

数据流：用户提问（推广/引流类）→ 触发 growth-marketing → 按模式执行并读取项目 docs 获取产品信息 → 输出英文推广方案/软文 → 发布后按 utm 数据复盘迭代。

## 实现要点
- SKILL.md 正文控制在 5k 词内，深度内容全部下沉 references/
- 每个英文模板内嵌该渠道的规则提示（如 Reddit 10% 规则、HN Show HN 规范），防止发布翻车
- 模板链接统一指向 `{LINK}` 占位符，并在文档中注明：发布前须到 `docs/utm-sources.md` 登记新渠道取值
- 复盘框架以 utm_source 维度驱动（安装→留存→变现漏斗），聚焦高 ARPU 渠道加权

## 目录结构
```
.codebuddy/skills/growth-marketing/
├── SKILL.md                     # [NEW] 技能主文件。frontmatter 定义触发条件（推广/引流/软文/launch/growth/marketing 类提问）；正文定义增长负责人人设（懂欧美英文社区文化、地道真诚非营销腔）、四模式工作流（A 全链路方案 / B 渠道策略 / C 英文内容生成 / D 数据复盘）、统一自检清单（utm 登记、禁用词、社区规则、截图真实性）。全部通用化，不硬编码产品名。
└── references/
    ├── channels-handbook.md     # [NEW] 欧美社区渠道手册。Reddit（r/chromeextensions、r/productivity、r/udemy、r/languagelearning 等）、HN Show HN、Indie Hackers、Product Hunt、X、Medium/Dev.to、Newsletter；每渠道含调性、推广规则、最佳实践、发布时机。
    ├── copywriting-templates.md # [NEW] 英文软文模板库。Show HN / Reddit 帖子 / IH 帖子 / X 帖子与线程 / 万能软文结构（痛点开头→转折→三点价值→诚实对比→邀请讨论）；占位符 {PRODUCT}/{LINK}/{CHANNEL}；每模板内嵌渠道规则提示。
    ├── positioning-framework.md # [NEW] 定位与画像框架。高 ARPU 用户画像提炼、差异化卖点挖掘、价值主张句式、诚实对比框架、变现路径设计（免费→信任→口碑/捐赠/Pro）。
    ├── launch-pitfalls.md       # [NEW] 发布避坑清单。社区自我推广规则、禁用绝对化用语（与 store-listing-copywriter 一致）、截图真实性、utm 先登记后发布、禁止群发同一篇、发布节奏（先集中 1-2 渠道跑通）。
    └── metrics-review.md        # [NEW] 数据复盘框架。utm_source 渠道 ROI 分析、安装→留存→变现漏斗、渠道加权决策、迭代建议输出格式。
```


## Agent Extensions
### Skill
- **skill-creator**
  - Purpose: 指导 skill 创建全流程——初始化骨架、frontmatter 与 references 结构规范、最终结构校验
  - Expected outcome: growth-marketing skill 符合 CodeBuddy skill 规范（命名、frontmatter、渐进式披露、目录结构），可直接投入使用
- **store-listing-copywriter**
  - Purpose: 提供商店文案禁用词与调性规则，作为新 skill 英文模板的一致性校准基准
  - Expected outcome: 新 skill 的模板无「最/唯一/第一」等绝对化用语，与商店页面调性统一，避免发布冲突
### SubAgent
- **code-explorer**
  - Purpose: 批量审查现有 4 个 skill（architecture-inspection、extension_launch_checklist、generate_brand_icon、store-listing-copywriter）的 SKILL.md 结构与 frontmatter 风格，确立风格基准
  - Expected outcome: 新 skill 结构与现有体系完全一致，可直接 git 拷贝复用
