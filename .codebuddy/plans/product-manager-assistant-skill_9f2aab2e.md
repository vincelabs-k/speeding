---
name: product-manager-assistant-skill
overview: 为 Speeding 项目新增「产品经理助理」project skill（.codebuddy/skills/product-advisor/SKILL.md）：纯对话式产品顾问，只讨论不执行、零文件产出、读取项目上下文。核心哲学为「恰当性优先」（fitness-first，非纯减法非极简）——功能在多与少之间取平衡点，每个功能须有不可替代的存在理由；内置产品设计常识框架兜底用户方法论短板；与现有执行型 skill 明确分流。
todos:
  - id: create-skill-skeleton
    content: 使用 [skill:skill-creator] 创建 .codebuddy/skills/product-advisor/ 目录与 SKILL.md 骨架（frontmatter + 角色定位 + 只讨论不执行硬边界 + 恰当性优先哲学声明）
    status: completed
  - id: verify-skill-separation
    content: 使用 [subagent:code-explorer] 核对现有 6 个 skill 触发词与边界，输出分流表供 SKILL.md 引用
    status: completed
    dependencies:
      - create-skill-skeleton
  - id: write-skill-body
    content: 编写 SKILL.md 主体：项目背景、能力维度、讨论工作流、功能取舍讨论模式（存在理由四问 + 双极端警示）、触发分流表、自检清单
    status: completed
    dependencies:
      - verify-skill-separation
  - id: write-fitness-framework
    content: 编写 references/product-fitness-framework.md：存在理由四问、双极端警示、Speeding vs VSC 对照、核心主张判断法、行业共识依据
    status: completed
    dependencies:
      - write-skill-body
  - id: write-design-principles
    content: 编写 references/product-design-principles.md：用户场景/认知负荷/渐进披露/发现性/记忆负担/信任隐私/默认值/反馈容错八项常识
    status: completed
    dependencies:
      - write-skill-body
  - id: write-decision-framework
    content: 编写 references/product-decision-framework.md：优先级评估、竞品对照、版本规划与指标定义框架
    status: completed
    dependencies:
      - write-skill-body
  - id: validate-skill
    content: 按 [skill:skill-creator] 规范校验全部文件（frontmatter 合法性、祈使句、触发准确性、与现有 skill 无冲突）
    status: completed
    dependencies:
      - write-fitness-framework
      - write-design-principles
      - write-decision-framework
---

## 需求确认（回答用户提问：恰当性 vs 纯减法）
用户的理解**与专业人士看法一致**，即产品功能取舍的核心不是「极简/最少」，而是「**恰当性**——功能在多与少之间取平衡点」。行业共识依据：
- 张小龙的「克制」针对的是**打扰用户的功能**而非功能数量（微信功能不少，「该有的要有，不该有的坚决不要」）；「克制是产品经理的本能」反对的是贪婪与打扰。
- 乔布斯 "Simplicity is the ultimate sophistication"：iPhone 不是功能最少，而是每个功能被精心设计到可发现、可理解、恰到好处。
- 37signals：判断标准是「解决多少人的多少频率问题」，不为极简而极简。
- 行业结论：功能膨胀（featuritis）与空壳产品（核心任务完不成）是两个失败极端，「本质极简」= 去掉不必要、保留必要。**恰当是中间平衡点，不是纯减法。**

## 产品概述
为 CodeBuddy 新增「产品经理助理」skill（项目级 `.codebuddy/skills/product-advisor/`），纯对话式产品顾问，**只讨论不执行**。经核实现有 6 个 skill 全部为执行/产出型（架构巡检、发布合规、品牌视觉、运营增长、商店文案），产品经理维度空白，无功能重叠。

## 核心功能
- **只讨论不执行**：纯对话输出建议与权衡；禁止写文件、改代码、执行命令、产出文档。
- **读取项目上下文**：讨论前按需读取 README、package.json、entrypoints/ 等，建议贴合 Speeding 实际。
- **功能取舍（恰当性优先）**：核心问题从「能不能砍」改为「**是否有不可替代的存在理由**」——存在理由四问：① 解决谁的什么问题（真实场景）② 不做会怎样（损失评估）③ 是否服务核心价值主张（一致性）④ 复杂度与收益是否匹配。明确反对两个极端：功能膨胀与过度削减。落地 Speeding：核心主张 "set it once and forget it"——破坏主张的功能不恰当（砍），强化主张的功能应该加。
- **产品设计常识内置**（用户方法论偏弱）：写入 references 按需加载兜底——用户场景/旅程、认知负荷、MVP 与渐进披露、功能发现性、记忆负担与可学习性、信任/隐私设计、默认值设计、反馈与容错。
- **讨论姿态**：出框架和问题清单引导 + 用户给直觉与业务判断 → 共同决策，不替用户拍板。
- **触发分流**：讨论类触发走本 skill；需执行时转交——架构→architecture-inspection、运营/软文→growth-marketing、商店文案→store-listing-copywriter、发布合规→extension_launch_checklist。

## 技术说明
本任务为 skill 文档创建（非代码实现），无运行时代码，遵循 skill-creator 规范与现有 6 个 skill 惯例。

### 目录结构
```
.codebuddy/skills/product-advisor/              # [NEW] 产品经理助理 skill
├── SKILL.md                                    # [NEW] skill 主文件
└── references/
    ├── product-fitness-framework.md            # [NEW] 功能取舍「恰当性」框架（存在理由四问，替代纯减法）
    ├── product-design-principles.md            # [NEW] 产品设计常识（用户方法论兜底，八项速查）
    └── product-decision-framework.md           # [NEW] 产品决策框架（优先级/竞品/版本/指标）
```

### SKILL.md 内容规范
- **YAML frontmatter**：`name: product-advisor` + `description`（第三人称写明触发时机、边界与分流）。
- **正文用祈使句**（imperative/infinitive），客观指示性语言。
- **必含章节**：角色定位与硬边界（零文件产出）、项目背景（Speeding 产品事实 + VSC 竞品对照）、能力维度、讨论工作流（Step 1 读项目 → Step 2 澄清议题 → Step 3 框架引导共同决策 → Step 4 需执行时转交）、**功能取舍讨论模式**（新功能提案先走「存在理由四问」，并显式对照两个极端：功能膨胀与空壳风险）、触发分流表、自检清单。
- 渐进披露：SKILL.md 只写流程与指针，方法论细节放 references/（避免重复）。

### references 内容规划
- **product-fitness-framework.md**：恰当性哲学总纲（与行业共识对齐：张小龙/乔布斯/37signals）、存在理由四问（真实场景/损失评估/价值主张一致性/复杂度-收益匹配）、双极端警示（featuritis vs 空壳产品）、Speeding vs VSC 竞品对照表（VSC 有而 Speeding 无的功能逐项论证「是否有不可替代理由」而非一律不加）、「破坏 vs 强化核心主张」判断法。
- **product-design-principles.md**：产品设计常识速查——用户场景与旅程地图、认知负荷（选择过载）、MVP 与渐进披露、功能发现性（可发现 vs 可遗忘）、记忆负担与可学习性（一致性/可预测性）、信任与隐私设计、默认值设计、反馈与容错。
- **product-decision-framework.md**：需求价值/成本/风险优先级评估、竞品对照维度（功能边界/目标用户/差异化）、版本规划与成功指标定义。

## Agent Extensions
### Skill
- **skill-creator**
  - Purpose：遵循 skill 创建规范（frontmatter 必填字段、第三人称描述、祈使句正文、渐进披露原则），并完成创建后校验
  - Expected outcome：新建的 SKILL.md 与 references 文件符合规范，frontmatter 合法、描述可准确触发、正文为祈使句
### SubAgent
- **code-explorer**
  - Purpose：执行前核对现有 6 个 skill 的触发词与产出边界，确保新 skill 的触发分流表无冲突、无重叠
  - Expected outcome：输出分流依据（各 skill 触发词/形态），SKILL.md 中分流表准确引用现有 skill 名称
