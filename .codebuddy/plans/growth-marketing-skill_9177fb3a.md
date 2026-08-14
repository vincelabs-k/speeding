---
name: growth-marketing-skill
overview: 为 Speeding 项目（可跨项目拷贝复用）新建「全链路增长/社区营销」skill，面向欧美英文社区高 ARPU 人群，人设为增长负责人（非代码助手）。覆盖定位→渠道→多类型英文内容生成（60/30/10 配比）→发布执行（7+7+30 节奏）→数据复盘全链路。内置时效性管理机制：references 为基线快照，每次发布前强制联网校准当前玩法，杜绝用过时打法。遵循业界实践：demo/录屏最高优先级、数据透明、付费信息静默后置。
todos:
  - id: init-skill-structure
    content: 用 [skill:skill-creator] 初始化 growth-marketing 骨架，[subagent:code-explorer] 审查现有 skill 风格基准
    status: completed
  - id: write-skill-main
    content: 编写 SKILL.md：增长负责人人设、能力边界、四模式工作流、7+7+30 节奏、60/30/10 配比、恒定层/快变层判定表与联网校准自检
    status: completed
    dependencies:
      - init-skill-structure
  - id: write-channels-templates
    content: 编写 channels-handbook.md（2026 渠道排名+5 项打分法+快照标注）与 copywriting-templates.md（英文模板+X 新玩法+IH 长帖+复盘帖）
    status: completed
    dependencies:
      - write-skill-main
  - id: write-positioning-pitfalls-metrics
    content: 编写 positioning-framework.md、launch-pitfalls.md（2026 失效做法+硬性红线）、metrics-review.md（Day 30 复盘+分阶段透明度）
    status: completed
    dependencies:
      - write-skill-main
  - id: write-creative-scripts
    content: 编写 creative-scripts.md：15-90 秒录屏/短视频脚本优先，联动 [skill:多模态内容生成] 界定产出边界
    status: completed
    dependencies:
      - write-skill-main
  - id: validate-link-skill
    content: 用 [skill:store-listing-copywriter] 校准禁用词与零付费调性，[skill:skill-creator] 校验结构，确认 utm-sources.md 联动
    status: completed
    dependencies:
      - write-channels-templates
      - write-positioning-pitfalls-metrics
      - write-creative-scripts
---

## 产品概述
创建一个通用的「社区增长营销」skill（`growth-marketing`），用于解答"如何通过论坛/互联网社区推广引流产品"类问题（含软文、帖子、视频脚本等推广材料的撰写）。人设为增长负责人（Growth Lead），区别于代码助手；输出以英文为主，面向欧美英文社区的高 ARPU 用户；覆盖从定位到复盘的完整增长链路。skill 存于项目级 `.codebuddy/skills/`，内容通用化，新建项目时从 git 仓库整体拷贝复用。

## 核心功能
- **全链路增长工作流**：用户画像与定位分析 → 渠道策略 → 多类型内容生成 → 发布执行 → 数据复盘与迭代
- **时效性双层机制（核心新增，回应"内容会不会一两年过时"）**：验证结论——营销内容部分会过时，需区分恒定层与快变层：
  - 恒定层（不过时，无需每次联网）：价值叙事优先、免费导向、诚实对比、demo/录屏优先、数据透明、7+7+30 发布节奏、社区先参与后推广、数小时回复评论、拒绝绝对化用语
  - 快变层（会过时，发布前强制联网校准）：平台算法策略（2026 已确认变化：X 转向文章链接、"Follow for more" 被降权、Thread 唯一策略失效、30 分钟首波法则）、渠道排名（2026：SEO/短视频/BIP/社区/Newsletter/集成/客户循环，Product Hunt 降级）、内容形式潮流（30-90 秒战术短视频、IH Stripe 截图+失败复盘）、社区规则变更
- **60/30/10 内容配比模型（随载体漂移）**：Reddit/IH 帖子（商务叙事 60% 软性 + 技术 20% + 创作 20%）、Show HN/Dev.to 技术文（商务 30% + 技术 50% + 创作 20%）、视频（商务 40% + 技术 20% + 创作 40%）、X 线程/图文（商务 50% + 技术 20% + 创作 30%）；英文社区那 60% 必须是软性"价值叙事 + 信任建立"
- **AI 能力边界声明**：技术内容直接产出；商务推广能写但缺社区人味，需文化校准与真实案例；艺术创作产出脚本/分镜框架，成片成图联动「多模态内容生成」skill
- **付费纪律（业界校准版）**：免费导向（free/no credit card 正向信号）；定价静默在落地页不进正文；被问才答；IH 特例收入事实陈述；禁 astroturfing；规避定价争议
- **加分项内嵌**：demo/录屏最高优先级（Day 0 附 15 秒录屏、每周 30-60 秒演示）、数据透明（Day 30 公开复盘帖）、7 天预热 + 7 天发布窗口 + 30 天后续循环、渠道按杠杆率排序、周二/周三上午发布、提前 4-8 周真实参与社区、数小时回复评论、诚实对比建立信任、X 的 30 分钟首波法则、分阶段透明度策略（$0-$10K 完全透明 / $10K+ 选择性透明）
- **减分项约束（2026 已失效做法）**：秘密开发 + 大揭晓、大团队式全渠道轰炸、48 小时内同文发 5 渠道、只押 Product Hunt、无转化事件的 waitlist、把发布日当终点线、Thread 唯一策略、"Follow for more" CTA、泛 SEO 铺量、多渠道同时铺开；以及硬性红线（求 upvote/多账号自顶、营销腔词汇、防御性反驳、发布后消失、astroturfing、新账号零 karma 发帖、错误子版块发产品帖、绝对化用语、截图不真实）
- **通用化设计**：不硬编码产品名/链接；运行时联动项目 `docs/utm-sources.md`（渠道登记）与 `docs/STORE_LISTING.md`（调性禁用词），缺失时引导创建


## 技术方案
纯文档型 skill 包（无代码/脚本依赖）：`SKILL.md`（YAML frontmatter + Markdown 正文）+ `references/` 六份分层知识文档。遵循 skill-creator 渐进式披露原则：frontmatter（触发条件约 100 词）→ SKILL.md 正文（<5k 词）→ references（按需加载）。存放于 `.codebuddy/skills/growth-marketing/`，风格沿用 store-listing-copywriter 结构（frontmatter → 角色/背景 → 语气规范 → 产出规范 → 工作流 → 参考资源）。

## 架构设计
分层结构（纯新增 skill 包，不改动现有代码）：
- 触发层：frontmatter description 定义触发条件（推广/引流/软文/launch/growth/marketing/promotion 等意图）
- 执行层：SKILL.md 四模式工作流（A 全链路方案 / B 渠道策略 / C 多类型内容生成 / D 数据复盘）+ 统一自检清单 + 能力边界声明 + 付费纪律 + 加减分项约束 + 时效性恒定层/快变层判定表
- 知识层：references/ 6 份文档按需加载，每份标注「基线快照：2026-08」，快变层内容发布前须联网校准
- 联动层：运行时引用 `docs/utm-sources.md`（新增渠道先登记）、`docs/STORE_LISTING.md`（禁用词/调性），与 `store-listing-copywriter` 共用规则；艺术创作维度联动「多模态内容生成」skill

数据流：用户提问（推广/引流类）→ 触发 growth-marketing → 判定涉及恒定层还是快变层（快变层先联网校准）→ 按模式执行并读取项目 docs → 套用 60/30/10 配比与 7+7+30 节奏输出英文方案/软文/录屏脚本（免费导向、正文零付费）→ 发布后按 utm 数据复盘迭代。

## 时效性管理实现要点
- SKILL.md 内置「恒定层/快变层判定表」：恒定层内容直接使用；快变层（算法策略、渠道排名、社区规则、内容形式）在执行任何模式前强制联网搜索校准，防止产出过时玩法
- references 每份文档顶部标注「基线快照：2026-08」，文档内快变层章节显式标记「发布前需校准」
- 自检清单新增「发布前联网校准项」：检查本次输出涉及的平台规则/算法策略是否仍有 2026 时效性依据
- 2026 已确认的快变层事实写入 references 作为初始快照（X 文章链接策略、30 分钟首波法则、渠道 5 项打分法、PH 降级、分阶段透明度、IH Stripe 截图长帖），避免每次从零搜索

## 目录结构
```
.codebuddy/skills/growth-marketing/
├── SKILL.md                     # [NEW] 技能主文件。frontmatter 触发条件；正文定义增长负责人人设（含能力边界声明）、四模式工作流（模式 A 内置 7 天预热+7 天发布窗口+30 天后续循环节奏；模式 C 内置 60/30/10 配比调整表）、时效性恒定层/快变层判定表、统一自检清单（utm 登记、禁用词、社区规则、截图真实性、配比自检、零付费提及、demo 录屏必附、数据透明、持续参与、减分项扫描、发布前联网校准）。全部通用化，不硬编码产品名。
└── references/
    ├── channels-handbook.md     # [NEW] 欧美社区渠道手册（快照 2026-08，发布前校准）。2026 渠道优先级排名表（SEO+对比页 → 创始人短视频 30-90 秒 → X/LinkedIn BIP → 社区营销 → Newsletter 合作 → 集成/市场发现 → 客户增长循环）；每渠道含调性、推广规则、发布时机、60/30/10 推荐配比、Karma/年龄门槛；渠道 5 项打分法（受众接近度/执行匹配度/反馈速度/复利潜力/成本效率）选 2 渠道跑 6 周。
    ├── copywriting-templates.md # [NEW] 英文软文模板库（快照 2026-08，发布前校准）。Show HN（三件事结构+首条评论模板）/ Reddit 帖子 / IH 长帖（Stripe 截图+失败复盘）/ X 推文（文章链接+摘要推结构，无"Follow for more" CTA）/ 万能软文结构（痛点开头→转折→三点价值→诚实对比→"让我意外的事"→具体反馈请求→链接注明免费）；占位符 {PRODUCT}/{LINK}/{CHANNEL}；含 Day 30 公开复盘帖模板；每模板标注 60/30/10 配比、内嵌渠道规则提示、附 15 秒录屏占位。
    ├── positioning-framework.md # [NEW] 定位与画像框架。一句话定位公式（谁/什么痛点/什么结果）、高 ARPU 用户画像提炼、差异化卖点挖掘、价值主张句式、诚实对比框架、变现路径设计（免费→信任→自然转化/捐赠/Pro，表述内敛，以"长期可持续"为价值锚）。
    ├── creative-scripts.md      # [NEW] 艺术创作维度脚本库（快照 2026-08）。15 秒录屏（Day 0 最高优先级）/ 30-60 秒每周演示视频 / 30-90 秒战术短视频（2026 第二渠道）/ 对比测评视频 / 图文帖与视觉创意框架 / 分镜大纲；明确产出物边界：脚本/创意由本 skill 直接产出，成片成图交付「多模态内容生成」skill 执行。
    ├── launch-pitfalls.md       # [NEW] 发布避坑清单。减分项双层约束——2026 失效做法（秘密开发大揭晓、大团队式轰炸、48h 同文群发、只押 PH、无转化 waitlist、发布日当终点线、Thread 唯一策略、"Follow for more" CTA、泛 SEO、多渠道铺开）+ 硬性红线（求 upvote/多账号自顶封号、营销腔词汇、防御反驳、发布后消失、astroturfing 永久封禁、新账号 0 karma auto-kill、错误子版块产品帖、定价争议、绝对化用语、截图不真实）；含 r/freelanceUK 封 365 天 vs r/ContractorUK 故事先导成功对比案例。
    └── metrics-review.md        # [NEW] 数据复盘框架。utm_source 渠道 ROI 分析、安装→留存→转化漏斗、高价值渠道加权决策、Day 30 公开复盘帖结构（数据透明作为二次传播资产）、分阶段透明度策略（$0-$10K 完全透明 / $10K+ 选择性透明）、失败判定标准（<1K 展示/<5 试用 → 重写定位第 12 天发第二轮）；指标表述以"长期可持续/用户价值"为锚。
```

## 实现要点
- SKILL.md 正文 <5k 词，深度内容全部下沉 references/
- 每个英文模板内嵌该渠道规则提示，防止发布翻车；模板正文零付费提及（IH 收入事实陈述除外）
- 模板链接统一指向 `{LINK}` 占位符，注明发布前到 `docs/utm-sources.md` 登记新渠道取值
- creative-scripts.md 明确产出物边界：脚本/分镜由本 skill 直接产出，成片成图交付「多模态内容生成」skill
- 发布节奏以 7+7+30 为核心骨架：预热期产出定位与草稿、发布窗口按杠杆率顺序投放、后续循环坚持每周演示与 Day 30 复盘
- 所有 references 标注基线快照日期，快变层章节显式标记「发布前需联网校准」


## Agent Extensions
### Skill
- **skill-creator**
  - Purpose: 指导 skill 创建全流程——初始化骨架、frontmatter 与 references 结构规范、最终结构校验
  - Expected outcome: growth-marketing skill 符合 CodeBuddy skill 规范（命名、frontmatter、渐进式披露、目录结构），可直接投入使用
- **store-listing-copywriter**
  - Purpose: 提供商店文案禁用词与调性规则（强大/极致/最/唯一等），作为新 skill 英文模板与 launch-pitfalls.md 的一致性校准基准
  - Expected outcome: 新 skill 模板无绝对化用语，与商店页面调性统一，避免发布冲突
- **多模态内容生成**
  - Purpose: 承接 creative-scripts.md 产出物中"成片/成图"环节——按脚本生成 15-90 秒录屏成片、演示视频、宣传图、对比视觉素材
  - Expected outcome: 艺术创作维度形成闭环：本 skill 产出脚本/分镜 → 多模态 skill 产出成片成图，两者边界清晰
### SubAgent
- **code-explorer**
  - Purpose: 批量审查现有 4 个 skill（architecture-inspection、extension_launch_checklist、generate_brand_icon、store-listing-copywriter）的 SKILL.md 结构与 frontmatter 风格，确立风格基准
  - Expected outcome: 新 skill 结构与现有体系完全一致，可直接 git 拷贝复用
