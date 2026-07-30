---
name: improve-icon-skill-design
overview: 优化 generate_brand_icon SKILL.md 的设计约束提升图标设计感，并固定临时脚本到 .icon-tmp/ 目录加入 gitignore。
todos:
  - id: optimize-skill-md
    content: 使用 [skill:skill-creator] 优化 SKILL.md：放宽圆角/网格/渐变/阴影约束，增加比例系统、正负形、剪影可读性等设计指导，并更新切图步骤使用 .icon-tmp/ 临时目录
    status: pending
  - id: add-gitignore-temp
    content: 在 .gitignore 末尾追加 .icon-tmp/ 忽略规则
    status: pending
---

## 用户需求

### 优化图标设计提示词
当前 SKILL.md 的全局约束过于僵硬（0px 圆角、4px 网格强制对齐、禁止渐变和阴影），导致生成的图标扁平、缺少层次感和设计品质。需要在保留品牌色（#0071C5 主色、#00C7FD 辅色）和基础画布约束（128x128、16px 边距、Badge 区）的前提下：
- 放开圆角限制，允许适度圆角提升现代感
- 将 4px 网格从"强制"降级为"建议"，避免过度制约构图
- 允许使用微渐变和微阴影以增加图标层次与立体感
- 增加构图设计指导：比例系统、正负形运用、剪影可读性（适配 16px 小尺寸）、视觉重心平衡

### 临时脚本目录规范化
图标生成过程中会产生临时脚本（如 `_resize.ts`），当前直接放在项目根目录，容易残留污染工作区。需要：
- 创建专用临时目录（如 `.icon-tmp/`），名称足够临时且不与现有目录冲突
- 将该目录加入 `.gitignore`
- SKILL.md 执行流程中的切图步骤引用该目录

## 技术方案

### 涉及文件
| 文件 | 操作 | 说明 |
|------|------|------|
| `C:\Users\Mrzha\.codebuddy\skills\generate_brand_icon\SKILL.md` | 修改 | 优化设计约束与 AI 提示词模板 |
| `d:/code/speeding/.gitignore` | 修改 | 追加 `.icon-tmp/` |

### SKILL.md 优化策略

**约束等级调整**：

| 约束 | 当前 | 优化后 |
|------|------|--------|
| 圆角 | 硬直角 0px | 允许 2-6px 微圆角，优先 3px |
| 网格对齐 | 强制 4px | 建议 4px，关键坐标对齐即可 |
| 渐变 | 禁止 | 允许双色微渐变（主色→辅色，不超过 30% 过渡） |
| 阴影 | 禁止 | 允许 `drop-shadow`（2px 偏移，4px 模糊，10% 不透明度） |

**新增设计指导**：
- 比例系统：优先使用 3:5 或 1:1.618 比例分布元素
- 正负形：要求图标在 16px 缩放下剪影仍可辨识
- 视觉重心：主元素占比 ≥ 50% 可用面积，辅元素 ≤ 25%
- Badge 区：严格保持右下 24x24 空白

**切图流程改造**：
- 临时脚本写入 `.icon-tmp/resize.ts`
- 执行 `bun run .icon-tmp/resize.ts`
- 执行后清理临时脚本

### .gitignore 修改
在文件末尾追加一行 `.icon-tmp/`。

## 使用技能

### Skill
- **skill-creator**
  - 用途：按照 skill 创建规范，优化 `generate_brand_icon` 的 SKILL.md 提示词，确保放宽约束的同时保持品牌一致性，并增加专业设计指导
  - 预期产出：更新后的 SKILL.md，包含分级约束体系、构图指导原则、改进的 AI 提示词模板
