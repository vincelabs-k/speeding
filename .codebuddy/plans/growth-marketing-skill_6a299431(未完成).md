---
name: growth-marketing-skill
overview: 为 Speeding 项目（可跨项目拷贝复用）新建「全链路增长/社区营销」skill，面向欧美英文社区高 ARPU 人群，人设为增长负责人（非代码助手）。覆盖定位→渠道→多类型英文内容生成（60/30/10 配比）→发布→数据复盘全链路。遵循业界「免费导向、价值叙事、付费信息静默后置」原则：正文不主动提付费，付费信息放落地页，被问才答，避免定价话题成为引流减分项。
todos:
  - id: init-skill-structure
    content: 用 [skill:skill-creator] 初始化 growth-marketing 骨架，[subagent:code-explorer] 审查现有 skill 风格基准
    status: pending
  - id: write-skill-main
    content: 编写 SKILL.md：增长负责人人设、能力边界声明、四模式工作流、60/30/10 配比表、零付费自检项，全部通用化
    status: pending
    dependencies:
      - init-skill-structure
  - id: write-channels-templates
    content: 编写 channels-handbook.md（欧美渠道+配比+发布时机）与 copywriting-templates.md（英文模板库，正文零付费、免费导向内嵌）
    status: pending
    dependencies:
      - write-skill-main
  - id: write-positioning-pitfalls-metrics
    content: 编写 positioning-framework.md（变现路径内敛）、launch-pitfalls.md（含定价纪律与社区规则）、metrics-review.md（长期可持续指标）
    status: pending
    dependencies:
      - write-skill-main
  - id: write-creative-scripts
    content: 编写 creative-scripts.md：视频脚本/图文帖/视觉创意框架，联动 [skill:多模态内容生成] 界定产出边界
    status: pending
    dependencies:
      - write-skill-main
  - id: validate-link-skill
    content: 用 [skill:store-listing-copywriter] 校准禁用词与零付费调性，[skill:skill-creator] 校验结构，确认联动 utm-sources.md
    status: pending
    dependencies:
      - write-channels-templates
      - write-positioning-pitfalls-metrics
      - write-creative-scripts
---

## 产品概述
创建一个通用的「社区增长营销」skill（`growth-marketing`），用于解答"如何通过论坛/互联网社区推广引流产品"类问题（含软文、帖子、视频脚本等推广材料的撰写）。人设为增长负责人（Growth Lead），区别于代码助手；输出以英文为主，面向欧美英文社区的高 ARPU 用户；覆盖从定位到复盘的完整增长链路。skill 存于项目级 `.codebuddy/skills/`，内容通用化，新建项目时从 git 仓库整体拷贝复用。

## 核心功能
- **全链路增长工作流**：用户画像与定位分析 → 渠道策略 → 多类型内容生成 → 发布执行 → 数据复盘与迭代
- **60/30/10 内容配比模型（随载体漂移）**：
  - Reddit / Indie Hackers 帖子：商务叙事 60%（软性价值+信任）+ 技术 20% + 创作 20%
  - Show HN / Dev.to 技术文：商务 30% + 技术 50% + 创作 20%
  - 视频（录屏演示/短视频）：商务 40% + 技术 20% + 创作 40%
  - X 线程 / 图文帖：商务 50% + 技术 20% + 创作 30%
  - 关键原则：英文社区那 60% 必须是软性"价值叙事 + 信任建立"，硬广告会被 Reddit 10% 规则与 HN 零容忍惩罚
- **AI 能力边界声明**：技术内容直接产出；商务推广能写但缺社区人味与文化浸润，需 skill 内置文化校准与真实案例；艺术创作产出脚本/创意/分镜框架，成片成图联动「多模态内容生成」skill
- **付费纪律（业界实践校准版）**：核心目标不是"如何提付费"而是"让付费话题永不成为引流减分项"——正文强调免费（free / no credit card，正向信号）；定价与商业模式默认静默在落地页，不进推广正文；被社区问到时才正面回答；Indie Hackers 特例可按社区文化作收入事实陈述；禁止伪装付费提及（astroturfing）；规避定价争议话题；内部策略仍以长期可持续为用户价值锚，但表述内敛
- **欧美渠道手册**：Reddit / HN / Indie Hackers / Product Hunt / X / Dev.to / Newsletter 矩阵，含调性、推广规则、发布时机、推荐配比
- **英文软文模板库**：Show HN、Reddit 帖子、IH 帖子、X 线程、万能软文结构模板，含 `{PRODUCT}` `{LINK}` `{CHANNEL}` 占位符
- **通用化设计**：不硬编码产品名/链接；运行时联动项目 `docs/utm-sources.md`（渠道登记）与 `docs/STORE_LISTING.md`（调性禁用词），缺失时引导创建
- **避坑与合规**：社区自我推广规则、禁用绝对化用语、截图真实性、utm 先登记后发布、禁止群发同一篇、发布前 4-8 周真实参与社区


## Tech Stack
- 纯文档型 skill 包（无代码/脚本依赖）：`SKILL.md`（YAML frontmatter + Markdown 正文）+ `references/` 分层资源
- 遵循 skill-creator 渐进式披露原则：frontmatter（触发条件，约 100 词）→ SKILL.md 正文（<5k 词）→ references（按需加载）
- 存放于 `.codebuddy/skills/growth-marketing/`，与现有 4 个项目级 skill 同级，风格沿用 store-listing-copywriter 的 SKILL.md 结构（frontmatter → 角色/背景 → 语气规范 → 产出规范 → 工作流 → 参考资源）

## 实现方案
采用「单一工作流 + 多模式入口 + 分层知识库」架构：
- **SKILL.md**：定义增长负责人人设（含能力边界声明）、四模式工作流（A 全链路增长方案 / B 渠道策略 / C 多类型内容生成 / D 数据复盘）、统一自检清单；全部使用「当前项目产品」抽象表述，不硬编码产品名
- **模式 C 内置内容类型维度**：按载体（帖子/技术文/视频/图文）套用 60/30/10 配比调整表，输出前按比例自检各组成部分
- **付费纪律内嵌（业界实践校准版）**：自检清单新增「正文无付费/定价信息；免费价值作为正向信号；被问才答定价；禁 astroturfing」；模板库不设"文末支持区"结构，避免付费感外露
- **references/ 六份知识文档**：承载深度领域知识，SKILL.md 保持精简
- **通用化机制**：英文模板使用占位符；运行时读取项目 `docs/utm-sources.md` 与 `docs/STORE_LISTING.md`，缺失时引导创建

## 架构设计
分层结构（无需改动现有代码，纯新增 skill 包）：
- 触发层：frontmatter description 定义触发条件（推广/引流/软文/launch/growth/marketing/promotion 等意图）
- 执行层：SKILL.md 四模式工作流 + 统一自检清单 + 能力边界声明 + 付费纪律
- 知识层：references/ 6 份文档按需加载
- 联动层：运行时引用项目 `docs/utm-sources.md`（新增渠道先登记）、`docs/STORE_LISTING.md`（禁用词/调性），与 `store-listing-copywriter` 共用规则；艺术创作维度联动「多模态内容生成」skill

数据流：用户提问（推广/引流类）→ 触发 growth-marketing → 按模式执行并读取项目 docs 获取产品信息 → 按内容类型套用 60/30/10 配比输出英文推广方案/软文/脚本（免费导向、正文零付费提及）→ 发布后按 utm 数据复盘迭代。

## 实现要点
- SKILL.md 正文控制在 5k 词内，深度内容全部下沉 references/
- 每个英文模板内嵌该渠道的规则提示（Reddit 10% 规则、HN Show HN 规范），防止发布翻车
- 模板链接统一指向 `{LINK}` 占位符，注明发布前须到 `docs/utm-sources.md` 登记新渠道取值；模板正文默认不含定价/付费字样，链接落地页承载商业模式
- creative-scripts.md 明确"产出物边界"：脚本/创意/分镜由本 skill 直接产出，成片成图交付「多模态内容生成」skill 执行
- 复盘框架以 utm_source 维度驱动（安装→留存→转化漏斗），聚焦高价值渠道加权，指标表述以"长期可持续/用户价值"为锚，不高频强调盈利

## 目录结构
```
.codebuddy/skills/growth-marketing/
├── SKILL.md                     # [NEW] 技能主文件。frontmatter 触发条件（推广/引流/软文/launch/growth/marketing 类提问）；正文定义增长负责人人设（含能力边界声明）、四模式工作流、模式 C 内容类型 60/30/10 配比调整表、统一自检清单（utm 登记、禁用词、社区规则、截图真实性、配比自检、正文零付费提及/被问才答定价/禁 astroturfing）。全部通用化，不硬编码产品名。
└── references/
    ├── channels-handbook.md     # [NEW] 欧美社区渠道手册。Reddit（r/chromeextensions、r/productivity、r/udemy、r/languagelearning 等）、HN Show HN、Indie Hackers、Product Hunt、X、Medium/Dev.to、Newsletter；每渠道含调性、推广规则、最佳实践、发布时机（周二至周四、避重大科技新闻日）、60/30/10 推荐配比、账号 Karma/年龄门槛。
    ├── copywriting-templates.md # [NEW] 英文软文模板库。Show HN / Reddit 帖子 / IH 帖子 / X 帖子与线程 / 万能软文结构（痛点开头→转折→三点价值→诚实对比→"让我意外的事"→具体反馈请求→链接注明免费）；占位符 {PRODUCT}/{LINK}/{CHANNEL}；每模板标注该载体 60/30/10 配比、内嵌渠道规则提示、正文零付费提及（IH 特例收入事实陈述除外）。
    ├── positioning-framework.md # [NEW] 定位与画像框架。高 ARPU 用户画像提炼、差异化卖点挖掘、价值主张句式、诚实对比框架、变现路径设计（免费→信任→自然转化/捐赠/Pro，表述内敛，以"长期可持续"为价值锚）。
    ├── creative-scripts.md      # [NEW] 艺术创作维度脚本库。视频脚本（15s/60s 演示、对比测评）、图文帖文案与视觉创意框架、分镜大纲；明确产出物边界：脚本/创意由本 skill 直接产出，成片成图交付「多模态内容生成」skill 执行。
    ├── launch-pitfalls.md       # [NEW] 发布避坑清单。社区自我推广规则（Reddit <10% 占比、Karma 门槛、禁止求 upvote/多账号自顶）、禁用绝对化用语（与 store-listing-copywriter 一致）、截图真实性、utm 先登记后发布、禁止群发同一篇、发布节奏（先集中 1-2 渠道跑通）、定价纪律（正文零付费、被问才答、禁 astroturfing、规避定价争议）、发布前 4-8 周社区真实参与。
    └── metrics-review.md        # [NEW] 数据复盘框架。utm_source 渠道 ROI 分析、安装→留存→转化漏斗、高价值渠道加权决策、迭代建议输出格式——指标表述以"长期可持续/用户价值"为锚，避免高频强调盈利。
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
