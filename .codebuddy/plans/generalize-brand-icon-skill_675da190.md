---
name: generalize-brand-icon-skill
overview: 将 generate_brand_icon skill 从单一项目专用改造为通用用户级 skill，核心变化：引入多底托类型系统、多套配色方案、去个性化路径、跨平台兼容。
todos:
  - id: add-badge-types
    content: 新增徽章底托类型章节，定义 5 种底托（圆角矩形/圆形/六边形/盾形/方圆角），每种含 SVG 要素、尺寸约束、适用场景和选型规则
    status: completed
  - id: add-color-schemes
    content: 新增配色方案章节，定义 5 套预设（Ocean/Sunset/Forest/Midnight/Slate），含主色、辅色、渐变终点、描边色，以及自动匹配规则
    status: completed
  - id: expand-params
    content: 扩展参数定义，新增可选 `--badge` 和 `--color` 参数，明确参数优先级和默认行为
    status: completed
    dependencies:
      - add-badge-types
      - add-color-schemes
  - id: rewrite-constraints
    content: 重写全局约束和 Layer 1 规格，移除硬编码配色和单一形状，改为引用徽章类型表和配色表
    status: completed
    dependencies:
      - add-badge-types
      - add-color-schemes
  - id: expand-icon-table
    content: 扩展图标选型表从 12 项到 20+ 项，新增二维码、AI/智能、麦克风、音量、同步、上传、排序、代码、监控等场景
    status: completed
  - id: update-golden-rules
    content: 更新黄金法则第 3 条圆角策略，覆盖圆形/六边形/盾形/方圆角的圆角/拐角处理规则
    status: completed
    dependencies:
      - add-badge-types
  - id: depersonalize-execution
    content: 去个性化执行流程：路径 `.output/vince/icongen/` 改为 `.output/icongen/`，Manifest 校验去除 wxt 硬编码，预览命令改为跨平台说明
    status: completed
  - id: parameterize-prompt-template
    content: 参数化 AI 提示词模板，将 shape/color 硬编码替换为 `{{badge_shape_spec}}`、`{{color_primary}}` 等占位符
    status: completed
    dependencies:
      - add-badge-types
      - add-color-schemes
  - id: final-review
    content: 使用 [skill:skill-creator] 校验完整 SKILL.md，确保结构合法、参数闭环、所有引用一致
    status: completed
    dependencies:
      - expand-params
      - rewrite-constraints
      - expand-icon-table
      - update-golden-rules
      - depersonalize-execution
      - parameterize-prompt-template
---

## 改造目标
将 `generate_brand_icon` 用户级 Skill 从当前单一场景（蓝底圆角矩形+12 种图标）改造为通用、可跨项目复用的版本。

## 核心改造点

### 1. 多类型徽章底托体系
当前仅硬编码一种圆角矩形底托。需新增 5 种徽章底托形状，每种附带：
- SVG 实现要素（形状、关键属性）
- 尺寸约束（保持 76~84px 占画布 60-66%）
- 适用场景（什么类型的插件选哪种底托）
- 自动选型规则（根据 `--function` 智能匹配）

### 2. 多套配色方案
当前硬编码蓝色系 #0071C5/#00C7FD。需提供 5 套预设配色方案，支持：
- `--color` 参数显式选择
- 不提供时根据 `--badge` 或 `--function` 自动匹配默认方案
- 每套方案定义主色、辅色、渐变终点、描边色

### 3. 参数扩展
- 新增 `--badge`：徽章底托类型（可选，不提供时自动匹配）
- 新增 `--color`：配色方案（可选，不提供时自动匹配）
- 保留 `--function` 作为唯一必填参数

### 4. 图标映射表扩展
从 12 项扩展到 20+ 项，覆盖更多常见插件场景。

### 5. 去个性化与跨平台
- 执行路径 `.output/vince/icongen/` → `.output/icongen/`
- Manifest 校验从硬编码 `wxt.config.ts` 改为通用描述
- 环境声明移除 Windows + Git Bash 限制
- 预览命令改为跨平台说明


## 改造策略

### 文件变更
仅修改一个文件：`c:\Users\Mrzha\.codebuddy\skills\generate_brand_icon\SKILL.md`，无新增文件。

### 改造顺序
按文档自上而下的自然阅读顺序逐段修改，确保各段引用一致：
1. 参数定义 → 新增 `--badge` / `--color`
2. 全局约束 → 移除硬编码配色，引用配色方案表
3. 新增徽章底托类型表 → 替代单一圆角矩形描述
4. 新增配色方案表 → 替代单一蓝色系
5. 图标选型表 → 扩展条目
6. Layer 1 规格 → 重构为按底托类型分述
7. 黄金法则 → 更新第 3 条覆盖所有形状
8. 执行流程 → 去个性化路径
9. AI 提示词模板 → 参数化 shape + color
10. 后置动作 → 跨平台预览

### 关键设计决策

**底托类型选型**：选择 5 种几何形状，每种在 SVG 中有明确实现方式：
- 圆角矩形（`<rect rx="...">`）：最通用
- 圆形（`<circle>`）：简洁友好
- 六边形（`<polygon>` 或 `<path>`）：技术感
- 盾形（`<path>` 自定义曲线）：安全/防护
- 方圆角（squircle，`<path>` 贝塞尔）：现代感

**配色方案选型**：5 套高对比度、适合 16px 缩放的配色：
- Ocean（蓝）、Sunset（橙红）、Forest（绿）、Midnight（紫）、Slate（灰）

**参数优先级**：用户显式传参 > 自动匹配 > 默认值（圆角矩形 + Ocean 蓝）

**向后兼容**：不传 `--badge` 和 `--color` 时行为与原版一致（圆角矩形 + 蓝色系）。

### AI 提示词模板参数化策略
将原模板中硬编码的值替换为占位符 `{{badge_shape_spec}}`、`{{color_primary}}`、`{{color_accent}}`、`{{color_gradient_end}}`、`{{color_stroke}}`，由前置参数确定步骤填充。


## Agent Extensions

### Skill
- **skill-creator**
  - 用途：最终校验修改后的 SKILL.md 是否符合 skill 规范（frontmatter、触发条件、执行流程完整性）
  - 预期结果：确认 skill 结构合法、可被系统正确识别并触发
