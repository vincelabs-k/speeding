---
name: growth-marketing-skill
overview: 为 Speeding 项目（可跨项目拷贝复用）新建一个「全链路增长/社区营销」skill，面向欧美英文社区高 ARPU 人群，人设为增长负责人（非代码助手），覆盖定位分析→渠道策略→多类型英文内容生成（60/30/10 配比）→发布执行→数据复盘全链路，以长期盈利为目标。
todos:
  - id: init-skill-structure
    content: 用 [skill:skill-creator] 初始化 growth-marketing 骨架，[subagent:code-explorer] 审查现有 skill 风格基准
    status: pending
  - id: write-skill-main
    content: 编写 SKILL.md：增长负责人人设、能力边界声明、四模式工作流、模式 C 60/30/10 配比表、统一自检清单，全部通用化
    status: pending
    dependencies:
      - init-skill-structure
  - id: write-channels-templates
    content: 编写 channels-handbook.md（欧美渠道手册+各渠道配比）与 copywriting-templates.md（英文模板库，标注载体配比）
    status: pending
    dependencies:
      - write-skill-main
  - id: write-positioning-pitfalls-metrics
    content: 编写 positioning-framework.md、launch-pitfalls.md、metrics-review.md 三份知识文档
    status: pending
    dependencies:
      - write-skill-main
  - id: write-creative-scripts
    content: 编写 creative-scripts.md：视频脚本/图文帖/视觉创意框架，明确产出物边界联动 [skill:多模态内容生成]
    status: pending
    dependencies:
      - write-skill-main
  - id: validate-link-skill
    content: 用 [skill:store-listing-copywriter] 校准禁用词调性，[skill:skill-creator] 校验结构，确认联动 utm-sources.md
    status: pending
    dependencies:
      - write-channels-templates
      - write-positioning-pitfalls-metrics
      - write-creative-scripts
---

## 产品概述
规划并创建一个通用的「全链路社区增长营销」skill（`growth-marketing`），用于解答"如何通过论坛/互联网社区推广引流产品"类问题（含软文、帖子、视频脚本等推广材料的撰写）。人设为增长负责人（Growth Lead），区别于代码助手；输出以英文为主，面向欧美英文社区的高 ARPU 用户；以长期盈利为目标，覆盖从定位到复盘的完整增长链路。skill 存于项目级 `.codebuddy/skills/`，内容设计为通用化，用户新建项目时从 git 仓库整体拷贝复用。

## 核心功能
- **全链路增长工作流**：用户画像与定位分析 → 渠道策略 → 多类型内容生成 → 发布执行 → 数据复盘与迭代
- **60/30/10 内容配比模型（用户核心观点，已纳入并修正）**：用户理解"引流内容 = 60% 泛商务推广 + 30% 技术 + 10% 艺术创作"，本 skill 将其修正为**随载体漂移的配比模型**：
  - Reddit / Indie Hackers 帖子：商务叙事 60%（软性价值+信任）+ 技术 20% + 创作 20%
  - Show HN / Dev.to 技术文：商务 30% + 技术 50% + 创作 20%
  - 视频（录屏演示/短视频）：商务 40% + 技术 20% + 创作 40%
  - X 线程 / 图文帖：商务 50% + 技术 20% + 创作 30%
  - 关键原则：英文社区那 60% 必须是软性"价值叙事 + 信任建立"，硬广告会被 Reddit 10% 规则与 HN 零容忍惩罚
- **AI 能力边界声明（回应用户质疑"是否不擅长商务推广、艺术创作"）**：
  - 技术内容：AI 强项，直接产出
  - 商务推广：AI 能写但天然缺社区人味、内部梗与文化浸润，需 skill 内置文化校准规则与真实案例参考
  - 艺术创作：AI 能产出脚本、创意与分镜框架，成片/成图需联动项目已有的「多模态内容生成」skill
- **欧美渠道手册**：Reddit / HN / Indie Hackers / Product Hunt / X / Dev.to / Newsletter 矩阵，含调性、推广规则、发布时机
- **英文软文模板库**：Show HN、Reddit 帖子、IH 帖子、X 线程、万能软文结构模板，含 `{PRODUCT}` `{LINK}` `{CHANNEL}` 占位符
- **盈利导向**：高 ARPU 用户获取与变现路径设计（免费工具 → 社区信任 → 口碑/捐赠/Pro 化），复盘围绕 ARPU 与转化漏斗
- **通用化设计**：不硬编码 Speeding 产品名/链接；运行时联动项目 `docs/utm-sources.md`（渠道登记）与 `docs/STORE_LISTING.md`（调性禁用词），缺失时引导创建
- **避坑与合规**：社区自我推广规则、禁用绝对化用语（与 store-listing-copywriter 一致）、截图真实性、utm 先登记后发布、禁止群发同一篇


## Tech Stack
- 纯文档型 skill 包（无代码/脚本依赖）：`SKILL.md`（YAML frontmatter + Markdown 正文）+ `references/` 分层资源
- 遵循 skill-creator 渐进式披露原则：frontmatter（触发条件，约 100 词）→ SKILL.md 正文（<5k 词）→ references（按需加载）
- 存放于 `.codebuddy/skills/growth-marketing/`，与现有 4 个项目级 skill 同级，风格沿用 store-listing-copywriter 的 SKILL.md 结构（frontmatter → 角色/背景 → 语气规范 → 产出规范 → 工作流 → 参考资源）

## 实现方案
采用「单一工作流 + 多模式入口 + 分层知识库」架构：
- **SKILL.md**：定义增长负责人人设（含**能力边界声明**：技术直接产出 / 商务需文化校准 / 艺术联动多模态）、四模式工作流（A 全链路增长方案 / B 渠道策略 / C 多类型内容生成 / D 数据复盘）、统一自检清单；全部使用「当前项目产品」抽象表述，不硬编码产品名
- **模式 C 内置内容类型维度**：按载体（帖子/技术文/视频/图文）套用 60/30/10 配比调整表，输出前按比例自检各组成部分
- **references/ 六份知识文档**：承载深度领域知识，SKILL.md 保持精简
- **通用化机制**：英文模板使用占位符；运行时读取项目 `docs/utm-sources.md` 与 `docs/STORE_LISTING.md`，缺失时引导创建

## 架构设计
分层结构（无需改动现有代码，纯新增 skill 包）：
- 触发层：frontmatter description 定义触发条件（推广/引流/软文/launch/growth/marketing/promotion 等意图）
- 执行层：SKILL.md 四模式工作流 + 统一自检清单 + 能力边界声明
- 知识层：references/ 6 份文档按需加载（含新增的 creative-scripts.md）
- 联动层：运行时引用项目 `docs/utm-sources.md`（新增渠道先登记）、`docs/STORE_LISTING.md`（禁用词/调性），与 `store-listing-copywriter` 共用规则；艺术创作维度联动「多模态内容生成」skill

数据流：用户提问（推广/引流类）→ 触发 growth-marketing → 按模式执行并读取项目 docs 获取产品信息 → 按内容类型套用 60/30/10 配比输出英文推广方案/软文/脚本 → 发布后按 utm 数据复盘迭代。

## 实现要点
- SKILL.md 正文控制在 5k 词内，深度内容全部下沉 references/
- 每个英文模板内嵌该渠道的规则提示（Reddit 10% 规则、HN Show HN 规范），防止发布翻车
- 模板链接统一指向 `{LINK}` 占位符，注明发布前须到 `docs/utm-sources.md` 登记新渠道取值
- creative-scripts.md 明确"产出物边界"：脚本/创意/分镜由本 skill 直接产出，成片成图交付给「多模态内容生成」skill 执行
- 复盘框架以 utm_source 维度驱动（安装→留存→变现漏斗），聚焦高 ARPU 渠道加权

## 目录结构
```
.codebuddy/skills/growth-marketing/
├── SKILL.md                     # [NEW] 技能主文件。frontmatter 触发条件（推广/引流/软文/launch/growth/marketing 类提问）；正文定义增长负责人人设（含能力边界声明）、四模式工作流、模式 C 内容类型 60/30/10 配比调整表、统一自检清单（utm 登记、禁用词、社区规则、截图真实性、配比自检）。全部通用化，不硬编码产品名。
└── references/
    ├── channels-handbook.md     # [NEW] 欧美社区渠道手册。Reddit（r/chromeextensions、r/productivity、r/udemy、r/languagelearning 等）、HN Show HN、Indie Hackers、Product Hunt、X、Medium/Dev.to、Newsletter；每渠道含调性、推广规则、最佳实践、发布时机、60/30/10 推荐配比。
    ├── copywriting-templates.md # [NEW] 英文软文模板库。Show HN / Reddit 帖子 / IH 帖子 / X 帖子与线程 / 万能软文结构（痛点开头→转折→三点价值→诚实对比→邀请讨论）；占位符 {PRODUCT}/{LINK}/{CHANNEL}；每模板标注该载体 60/30/10 配比并内嵌渠道规则提示。
    ├── positioning-framework.md # [NEW] 定位与画像框架。高 ARPU 用户画像提炼、差异化卖点挖掘、价值主张句式、诚实对比框架、变现路径设计（免费→信任→口碑/捐赠/Pro）。
    ├── creative-scripts.md      # [NEW] 艺术创作维度脚本库（第二轮新增）。视频脚本（15s/60s 演示、对比测评）、图文帖文案与视觉创意框架、分镜大纲；明确产出物边界：脚本/创意由本 skill 直接产出，成片成图交付「多模态内容生成」skill 执行。
    ├── launch-pitfalls.md       # [NEW] 发布避坑清单。社区自我推广规则、禁用绝对化用语（与 store-listing-copywriter 一致）、截图真实性、utm 先登记后发布、禁止群发同一篇、发布节奏（先集中 1-2 渠道跑通）。
    └── metrics-review.md        # [NEW] 数据复盘框架。utm_source 渠道 ROI 分析、安装→留存→变现漏斗、高 ARPU 渠道加权决策、迭代建议输出格式。
```


## Agent Extensions
### Skill
- **skill-creator**
  - Purpose: 指导 skill 创建全流程——初始化骨架、frontmatter 与 references 结构规范、最终结构校验
  - Expected outcome: growth-marketing skill 符合 CodeBuddy skill 规范（命名、frontmatter、渐进式披露、目录结构），可直接投入使用
- **store-listing-copywriter**
  - Purpose: 提供商店文案禁用词与调性规则（强大/极致/最/唯一等），作为新 skill 英文模板与 launch-pitfalls.md 的一致性校准基准
  - Expected outcome: 新 skill 的模板无绝对化用语，与商店页面调性统一，避免发布冲突
- **多模态内容生成**
  - Purpose: 承接 creative-scripts.md 产出物中"成片/成图"环节——按脚本生成演示视频、宣传图、对比视觉素材
  - Expected outcome: 艺术创作维度形成闭环：本 skill 产出脚本/分镜 → 多模态 skill 产出成片成图，两者边界清晰
### SubAgent
- **code-explorer**
  - Purpose: 批量审查现有 4 个 skill（architecture-inspection、extension_launch_checklist、generate_brand_icon、store-listing-copywriter）的 SKILL.md 结构与 frontmatter 风格，确立风格基准
  - Expected outcome: 新 skill 结构与现有体系完全一致，可直接 git 拷贝复用
