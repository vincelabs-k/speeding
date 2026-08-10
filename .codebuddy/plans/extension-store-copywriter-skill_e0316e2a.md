---
name: extension-store-copywriter-skill
overview: 创建一个浏览器扩展商店文案 skill（用户级），包含修改后的通用提示词、SKILL.md 主文件、以及商店政策参考文档。
todos:
  - id: init-skill-dir
    content: 使用 [skill:skill-creator] 的 init_skill.py 在 ~/.codebuddy/skills/ 下初始化 store-listing-copywriter 模板目录
    status: completed
  - id: write-skill-md
    content: 编写 SKILL.md：将初版提示词中 Chrome 专属表述改为通用浏览器扩展表述，补充 Edge Add-ons 审核差异说明、输出模板和工作流指引
    status: completed
    dependencies:
      - init-skill-dir
  - id: add-reference
    content: 创建 references/store-listing-example.md，从 docs/STORE_LISTING.md 提取典型商店文案作为参考样例
    status: completed
    dependencies:
      - init-skill-dir
  - id: cleanup-validate
    content: 清理模板生成的示例文件，使用 package_skill.py 验证 skill 完整性
    status: completed
    dependencies:
      - write-skill-md
      - add-reference
---

## 用户需求
创建一个用户级 skill，专门用于撰写浏览器扩展（适用于 Chrome Web Store 和 Edge Add-ons）的产品商店介绍文案。

## 核心功能
- 基于用户提供的初版提示词，将"Chrome 专属"表述改造为"通用浏览器扩展"表述
- 按 skill-creator 规范创建 `~/.codebuddy/skills/store-listing-copywriter/` 目录结构
- 编写 SKILL.md，包含角色定义、语气规范、产出格式要求和工作流程
- 可选：将现有项目 `docs/STORE_LISTING.md` 作为参考示例整合进 skill

## 技术方案

### 实现方式
本任务为纯 skill 文件创建，不涉及代码开发。使用 skill-creator 规范组织目录结构，使用 `init_skill.py` 脚本初始化模板目录，再根据需求定制 SKILL.md 和参考资源。

### 关键决策
- **Skill 存放位置**：用户级 `~/.codebuddy/skills/store-listing-copywriter/`，跨项目复用
- **核心提示词改造方向**：
  - "Chrome 扩展产品文案师" → "浏览器扩展产品文案师"
  - "Chrome Web Store 审核政策" → "Chrome Web Store 与 Edge Add-ons 审核政策"
  - 补充 Edge Add-ons 的审核差异说明（更严格的内容政策、隐私声明要求等）
- **参考资源**：复用项目已有的 `docs/STORE_LISTING.md` 作为成功案例，放入 `references/` 目录供加载学习

### 目录结构
```
~/.codebuddy/skills/store-listing-copywriter/
├── SKILL.md              # [NEW] 技能主文件，包含 YAML frontmatter + 角色/语气/产出规范 + 工作流指引
└── references/
    └── store-listing-example.md  # [NEW] 参考示例，基于 docs/STORE_LISTING.md 整理的典型商店文案样例
```

### SKILL.md 核心内容规划
1. **YAML frontmatter**：name 为 `store-listing-copywriter`，description 描述触发场景
2. **角色定义**：浏览器扩展产品文案师，熟悉双商店审核政策
3. **语气规范**：专业不冷硬、通俗不口语、禁用浮词和人称代词
4. **产出要求**：短句、每条特性 = 用户场景 + 能力 + 结果、不写实现细节
5. **输出模板**：Short Description（≤132 字符）+ Detailed Description + Permission Justification + Privacy Disclosure
6. **工作流指引**：先读取项目文件理解功能 → 按模板输出 → 逐条自检规范合规性

## 使用的 Agent Extensions
### Skill
- **skill-creator**
  - 用途：指导 skill 创建流程，提供 `init_skill.py` 初始化模板和 `package_skill.py` 打包验证
  - 预期结果：按规范完成 skill 目录初始化、SKILL.md 编写、参考资源整理
