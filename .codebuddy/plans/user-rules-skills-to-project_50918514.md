---
name: user-rules-skills-to-project
overview: 将用户级 rules/skill 迁移为项目级（.codebuddy/）并统一英文文件名，将用户级原文件移动归档至 ~/codebuddy-archive-2026-08/，最后纳入 git 同步推送到远程仓库。
todos:
  - id: migrate-rules
    content: 迁移用户级 command.mdc、wxt-project.mdc 到 .codebuddy/rules/ 并更新 updatedAt，git mv 现有中文规则为英文名，核查内容互引
    status: completed
  - id: migrate-skills
    content: 复制 3 个用户级 skill 整目录（含 references/）到 .codebuddy/skills/，验证相对引用有效
    status: completed
    dependencies:
      - migrate-rules
  - id: archive-user-level
    content: move 用户级 rules/skills 原文件到 ~/codebuddy-archive-2026-08/，清理 utm-tracking 空目录，确认 ~/.codebuddy 已清空
    status: completed
    dependencies:
      - migrate-rules
      - migrate-skills
  - id: git-sync
    content: 验证迁移完整性后 git add/commit/push 同步至远程仓库
    status: completed
    dependencies:
      - archive-user-level
---

## 用户需求
将当前所有用户级（user）规则与技能（skill）迁移为项目级（project）rules/skill，随 git 同步到远程仓库；用户级原文件采用移动方式归档到独立目录，后续不再使用。

## 已确认决策
- 归档方式：移动（move）——迁移完成后 ~/.codebuddy/ 原位置清空，CodeBuddy 不再加载用户级规则/技能
- 归档位置：`~/codebuddy-archive-2026-08/`（与 ~/.codebuddy 平级，不入 git，纯本地备份）
- 命名风格：统一英文名——用户级规则保留英文原名，项目级现有中文名规则一并重命名为英文

## 核心范围
1. 迁移 2 条用户级规则：`command.mdc`（输出规范）、`wxt-project.mdc`（WXT 项目规范）→ `.codebuddy/rules/`
2. 迁移 3 个用户级技能：`extension_launch_checklist`、`generate_brand_icon`、`store-listing-copywriter`（含 references/）→ `.codebuddy/skills/`（新建目录）
3. 项目级现有 3 条中文规则重命名为英文：分发方式→distribution-policy、国际化→i18n、测试用例→test-cases（已跟踪的用 git mv 保留历史）
4. 归档用户级原文件至 `~/codebuddy-archive-2026-08/{rules,skills}`，清理遗留空目录 `utm-tracking`
5. git 提交并推送至远程（origin: gitee.com:vincezhang94/speeding.git）

## 边界
- 不触碰 ~/.codebuddy/ 下其他内容（memery、plugins、mcp.json、expert-history.json）
- 不改动 mdc/SKILL.md 正文内容与 frontmatter 结构（仅更新 updatedAt 时间戳）
- 不修改 .gitignore（.codebuddy 未被忽略，天然可同步）

## 操作方式
纯文件迁移 + git 版本控制任务，不涉及代码实现。采用 bash 文件操作（cp/mv/mkdir）与 git 命令完成。

## 关键决策与安全顺序
- **先复制后归档**：先将用户级内容复制到项目级并验证完整，再 move 归档，避免中途失败导致数据丢失
- **git mv 保留历史**：已跟踪的 分发方式.mdc / 国际化.mdc 用 `git mv` 重命名保留提交历史；untracked 的 测试用例.mdc 直接 `mv`
- **mdc frontmatter**：迁移时仅更新 `updatedAt` 为当前时间（2026-08-13），其余字段（description/alwaysApply/enabled/provider）原样保留，保证 CodeBuddy 加载兼容
- **相对路径兼容性**：skill 内引用均为相对路径（如 store-listing-copywriter/references/、generate_brand_icon 输出 public/icon/），迁移到 .codebuddy/skills/ 后语义不变，无需改内容
- **引用核查**：检查 .codebuddy 内文件是否引用旧规则文件名，如有则同步更新

## 验证
- `git status --short`：确认迁移文件全部纳入跟踪、无遗漏
- 文件清单比对：`.codebuddy/rules|skills` 与 `~/codebuddy-archive-2026-08/` 数量一致（归档 = 用户级全部迁移项）
- 归档目录确认：`~/codebuddy-archive-2026-08/rules|skills` 文件齐全，~/.codebuddy/rules|skills 已清空
- `git push` 成功且 `git status` 干净

## 目录结构（迁移后）
```
.codebuddy/
├── rules/
│   ├── command.mdc              # [MOVE] 用户级输出规范，原名保留，updatedAt 更新
│   ├── wxt-project.mdc          # [MOVE] 用户级 WXT 项目规范，原名保留，updatedAt 更新
│   ├── distribution-policy.mdc  # [RENAME] 原 分发方式.mdc（git mv）
│   ├── i18n.mdc                 # [RENAME] 原 国际化.mdc（git mv）
│   └── test-cases.mdc           # [RENAME] 原 测试用例.mdc（mv，untracked）
└── skills/
    ├── extension_launch_checklist/SKILL.md            # [MOVE]
    ├── generate_brand_icon/SKILL.md                   # [MOVE]
    └── store-listing-copywriter/
        ├── SKILL.md                                   # [MOVE]
        └── references/store-listing-example.md        # [MOVE]

~/codebuddy-archive-2026-08/     # [NEW] 归档目录（不入 git）
├── rules/{command,wxt-project}.mdc
└── skills/{extension_launch_checklist,generate_brand_icon,store-listing-copywriter}/
```
