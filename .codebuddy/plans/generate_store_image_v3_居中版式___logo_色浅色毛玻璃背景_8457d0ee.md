---
name: generate_store_image v3 居中版式 + logo 色浅色毛玻璃背景
overview: "商店展示图 v3：内容块（品牌行+tagline）整体水平+垂直居中（光学中心 0.45H），字号按业内 hero 规范微调（标题 0.09H / tagline 0.035H / logo 0.10H）；删除 light 模式的复杂数学渐变（对角线性+径向光晕），改为基于 logo 主色 #0071C5 HSL 派生的浅色毛玻璃背景（基底浅色渐变 + feGaussianBlur 柔和光斑 + 半透明白玻璃面），dark 5 套保持原简单线性渐变；毛玻璃首选纯 SVG filter（不动 render 脚本），实测 librsvg 渲染，异常则降级 sharp 原生 blur 分层合成。"
todos:
  - id: update-store-spec
    content: 更新 store-spec.md：§2 logo HSL 派生毛玻璃规格（删数学渐变小节）、§3 居中系数表+字宽估算、§5 毛玻璃模板、§6 示例，并用 [skill:skill-creator] 校准格式
    status: completed
  - id: update-skill-md
    content: 更新 SKILL.md：description、删 --align 参数、居中+毛玻璃四层布局、执行流程步骤 3/5/6、AI 提示词模板
    status: completed
    dependencies:
      - update-store-spec
  - id: update-style-anchor
    content: 更新 entrypoints/popup/style.css 锚点注释：light 背景改由 logo 主色 HSL 派生，不再直取 brand-50/100/200
    status: completed
    dependencies:
      - update-skill-md
  - id: verify-single
    content: 用 [skill:generate_store_image] 生成 1280×800 单档，验证 feGaussianBlur 毛玻璃渲染与耗时；异常则改造 render_store_image.ts 走 sharp 分层合成兜底
    status: completed
    dependencies:
      - update-style-anchor
  - id: verify-all
    content: 全档生成（--size all）并目检：内容块居中、字号规范、毛玻璃质感与深色文字对比度，汇报效果
    status: completed
    dependencies:
      - verify-single
---


## 用户需求
继续优化 `generate_store_image` skill，共两点：
1. **版式居中**：品牌行内部相对位置（logo 与标题同排、tagline 下行）保持不变，但整体从"中上偏左"改为**在整张图中居中**；字号对齐业内 hero 规范值。
2. **背景替换**：删除现有复杂的数学渐变逻辑（135° 对角 3-stop 线性基底 + 偏移径向光晕含半径公式），改为**基于 logo 现有颜色派生的浅色毛玻璃背景**。

## 产品概述
- 展示图 = 居中内容块（logo + 产品名同排，其下极简介绍一行）+ 浅色毛玻璃背景。
- 背景浅色调由 logo 主色（#0071C5）HSL 派生，不再写死 token 色值；毛玻璃含真实模糊质感（非纯透明度模拟）。
- 默认 brand 方案为浅色毛玻璃 + 深色文字；其余 5 套 dark 配色保持原单层对角渐变 + 白字。

## 核心特性
- **居中版式**：内容块组合中心锚定画布光学中心 (0.50W, 0.45H)，垂直方向略偏上以平衡留白；`--align` 参数删除，统一居中。
- **业内规范字号**（相对画布高 H）：标题 0.09H / weight 800，tagline 0.035H / weight 400，logo 高 0.10H，logo↔标题间距 0.35×logo_h，品牌行底→tagline 行距 0.045H。
- **水平居中计算**：SVG 无 measureText，采用字宽系数表估算标题像素宽（小写 0.52 / 大写 0.68 / 数字 0.55 / 空格 0.30 / 中文 1.0 × 字号），误差 <1%W 可接受。
- **logo 派生浅色毛玻璃**：保持 logo 主色 H=207°，降 S 提 L 生成 2-3 个浅色阶（近白 → 浅蓝），做单一线性渐变基底 + 半透明装饰色块 + feGaussianBlur 柔和光斑 + 白色玻璃面叠加，形成 frosted glass 质感。



## 技术栈
- 渲染链路不变：bun + sharp（内置 librsvg）→ PNG；优先纯 SVG 实现，`render_store_image.ts` 保持零改动。
- 毛玻璃含真实模糊，采用**双路径策略**：
  - **路径 A（首选）**：纯 SVG `feGaussianBlur`（`stdDeviation ≈ 0.03H`）。librsvg 对 filter 支持存在不确定性、大模糊半径有渲染耗时风险 → 执行第一步先以 1280×800 单档实测验证渲染正确性与耗时。
  - **路径 B（兜底）**：若路径 A 渲染异常/过慢，改 `render_store_image.ts` 为分层合成——SVG 目录产出 `<W>x<H>.bg.svg`（基底+装饰色块，需模糊）与 `<W>x<H>.fg.svg`（玻璃面+logo+文字，透明背景），脚本用 `sharp().blur()`（libvips 优化卷积）处理 bg 层后再 `composite` fg 层；SKILL.md 步骤 6/7 同步改为双 SVG 拼装。仅在路径 A 失败时启用。

## 实现方案
### 居中版式（v3 系数）
- 内容块总高 ≈ 0.10H（logo）+ 0.045H（行距）+ 0.035H（tagline）= 0.18H → 块顶 0.36H、块底 0.54H，四档宽高比（16:10 / 11:7 / 23:17 / 5:2）下左右上下留白均安全。
- 垂直：品牌行中心线 `y_brand = 0.45H`；tagline 中心线 `y_tag = y_brand + 0.05H + 0.045H + 0.0175H = 0.5625H`。
- 水平：标题 `text-anchor="middle"` 锚 `(0.50W, 0.45H)`；logo 左上 x = `0.50W − title_w/2 − gap/2`，y = `0.40H`；tagline `text-anchor="middle"` 锚 `(0.50W, 0.5625H)`。
- 标题宽度估算：`title_w = Σ(字宽系数 × 0.09H)`，按文案内容加权（Helvetica/Arial 默认）。

### 毛玻璃背景（light/brand 模式）
- **L1a 基底**：由 logo 主色 #0071C5（HSL 207°,100%,39%）派生浅色——保持 H=207°，stop1 `HSL(207°,45%,97%)`、stop2 `HSL(207°,55%,92%)`、stop3 `HSL(207°,60%,86%)`，135° 对角单层线性渐变（简单、无数学公式）。
- **L1b 装饰光斑**：2-3 个大色块（圆形/圆角矩形，`HSL(207°,70%,80%)`，opacity 0.25–0.4，错落分布），应用 `feGaussianBlur(stdDeviation=0.03H)` 形成柔和光斑。
- **L1c 玻璃面**：全画布 `#FFFFFF` opacity 0.35 矩形，营造 frosted glass 通透质感。
- 绘制顺序：L1a → L1b → L1c → L2 品牌行 → L3 tagline。
- 文字色：light → 标题 `#0F172A`、tagline `#334155`；dark → 均 `#FFFFFF`。

### 性能与可靠性
- 模糊复杂度 O(W×H×k²)：1280×800 + stdDeviation≈24px 可接受；路径 B 的 libvips 卷积优化优于 librsvg filter，作为降级保障。
- 文本转义、logo base64 内嵌、禁止远程字体/脚本等既有约束全部保留。

## 架构设计
- 数据流：SKILL.md（流程与 AI 提示词）→ store-spec.md §2/§3/§5（配色派生规则、居中系数、模板数据源）→ style.css @theme（仅注释锚点更新）。
- 渲染脚本仅在路径 B 时改动（分层合成），路径 A 下保持"SVG → PNG + 尺寸校验"单一职责。
- SVG 能力边界更新：`feGaussianBlur` 由"一律禁用"改为"毛玻璃专用；渲染异常时走 sharp 分层合成兜底"。

## 目录结构
```
.codebuddy/skills/generate_store_image/
├── SKILL.md                    # [MODIFY] description、删 --align、居中+毛玻璃四层布局、执行流程步骤 3/5/6、AI 提示词模板
├── references/store-spec.md    # [MODIFY] §2 brand 改 logo HSL 派生+毛玻璃规格（删数学渐变小节）、§3 居中系数表+字宽估算、§5 毛玻璃模板、§6 示例
└── scripts/render_store_image.ts  # [MODIFY 仅路径 B] 分层合成（bg blur + fg composite）；路径 A 成功则零改动
entrypoints/popup/style.css     # [MODIFY] @theme 锚点注释改为"light 背景由 logo 主色 HSL 派生"
```

## 关键代码结构
毛玻璃背景 SVG 模板（L1a+L1b+L1c，核心且必须精确）：
```svg
<defs>
  <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="hsl(207,45%,97%)"/>
    <stop offset="50%" stop-color="hsl(207,55%,92%)"/>
    <stop offset="100%" stop-color="hsl(207,60%,86%)"/>
  </linearGradient>
  <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="{{0.03*H}}"/>
  </filter>
</defs>
<rect width="W" height="H" fill="url(#base)"/>
<g filter="url(#blur)" opacity="0.35">
  <!-- 2-3 个装饰色块：<circle cx cy r fill="hsl(207,70%,80%)"/> 等 -->
</g>
<rect width="W" height="H" fill="#FFFFFF" opacity="0.35"/>
<!-- L2/L3 文字与 logo 绘制在玻璃面之上 -->
```
（路径 B 时：bg.svg 含 base+装饰块，fg.svg 含玻璃面+文字+logo，脚本 blur 后 composite。）


## Agent Extensions
### Skill
- **skill-creator**
  - Purpose：校准 SKILL.md 与 store-spec.md 的规范结构（参数表、四层布局规格、执行流程、AI 提示词模板的写作约定），确保更新后的 skill 文档符合 CodeBuddy skill 标准、可被 AI 稳定执行
  - Expected outcome：文档章节结构规范、参数与流程无遗漏，格式与既有 skill 一致
- **generate_store_image**
  - Purpose：规划落地后调用该 skill 实测生成展示图，验证居中版式系数、logo 派生浅色毛玻璃与 feGaussianBlur 渲染链路
  - Expected outcome：1280×800 单档渲染 PASS（路径 A 验证）→ 全档生成 → 目检居中与毛玻璃效果达标，确认 skill 优化闭环
