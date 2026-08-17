---
name: 优化 generate_store_image skill 布局与浅色背景
overview: 重做商店展示图版式：品牌行（logo 与产品名同行，置于中上偏左）+ 下一行极简介绍；背景改为取自 Design Tokens 的浅色数学渐变（对角线性 base + 单层偏移径向光晕，2–3 stops）；文字随浅色背景切换为深色；确认 SVG/librsvg 胜任性（禁用 feGaussianBlur，光晕用渐变透明度模拟），同步更新 SKILL.md 与 store-spec.md。
todos:
  - id: update-store-spec
    content: 更新 store-spec.md：§2 配色表（brand 改浅色三色+背景模式列+文字色规则）、§3 布局系数表（品牌行版式）、§5 SVG 模板（基底+光晕数学渐变）、§6 示例，并用 [skill:skill-creator] 校准规范格式
    status: completed
  - id: update-skill-md
    content: 更新 SKILL.md：description、--color/--align 参数语义、四层布局规格、执行流程步骤 3/6、AI 提示词模板（ambient 背景描述）
    status: completed
    dependencies:
      - update-store-spec
  - id: update-style-anchor
    content: 更新 entrypoints/popup/style.css 的 @theme 注释锚点，说明浅色展示图渐变取自 brand-50/100/200 与 surface，色值不变
    status: completed
    dependencies:
      - update-skill-md
  - id: verify-output
    content: 用 [skill:generate_store_image] 实测生成 1280×800 展示图，验证浅色版式、光晕渐变与渲染 PASS，目检并汇报效果
    status: completed
    dependencies:
      - update-style-anchor
---

## 用户需求
优化 `generate_store_image` skill 的展示图版式与背景设计，产出供用户审核的规划：
1. **布局重排**：logo 移到中上偏左，与产品名同一行（品牌行）；下一行为极简介绍（tagline）；具体位置比例采用业内最佳实践（Apple/Stripe 营销图风格）。
2. **浅色背景**：改为接近白色的 Design Token 色系渐变，渐变方式用数学规律生成，并评估是否超出 SVG 能力边界、是否需要更换生图方式。
3. 参考提示词约束：仅用项目 Design Tokens 颜色；对角线性渐变基底 + 单层偏移径向光晕；2–3 个 color stops；输出干净可缩放的矢量。

## 产品概述
- 新版式完全取代旧版式（不再有中央巨大标题 + 中央副标题、深色背景 + 白字的布局）。
- 默认 `brand` 方案改为浅色背景 + 深色文字；其余 5 套配色保留深色渐变 + 白字。
- 背景由两层数学渐变构成：L1a 对角线性渐变基底（2–3 个 token stops）+ L1b 单层偏移径向光晕（中心实色→边缘透明）。

## 核心特性
- **品牌行**：logo 与标题水平同排、垂直居中，整体位于画布中上偏左；tagline 紧随其下左对齐。
- **浅色 ambient 背景**：brand-50/100/200 线性渐变 + 右上偏移白色光晕，全部来自 Design Tokens。
- **数学规律生成渐变**：颜色 sRGB 线性插值、光晕圆心/半径/透明度插值公式固定，四档尺寸统一推导。
- **SVG 胜任性评估**：目标结构仅用 linearGradient / radialGradient / stop-opacity（librsvg 基础能力），明确禁用 feGaussianBlur，结论为无需更换生图方式；备选方案仅作文档边界记录。


## 技术栈
- 渲染链路不变：bun + sharp（内置 librsvg）→ PNG；`render_store_image.ts` 零改动。
- 生图方式结论：**SVG 完全胜任，不更换**。目标结构 = linearGradient（2–3 stops）+ radialGradient（stop-opacity 渐变），均为 librsvg 完整支持的基础能力。
- 唯一风险点：`feGaussianBlur` filter 在 librsvg 支持不完整 → 文档中明确禁用，光晕用 radialGradient 数学渐变模拟（中心实色 → 边缘透明）。
- 边界记录：若未来需要真实模糊/噪点/光斑质感，备选路径为 sharp 直接像素级渲染（不依赖 SVG）或 image_gen 生图；本次不启用，仅写入 store-spec.md 作为边界说明。

## 实现方案
### 新版式布局（业界最佳实践：Apple/Stripe 浅色营销图）
以画布 H 推导，内容块起点 `(0.08W, 0.18H)`（浅色大图需要更大留白与呼吸感）：
- logo 高度 = `0.10H`；标题字号 = `0.09H`，与 logo 垂直居中对齐（`dominant-baseline="central"`）
- logo 与标题水平间距 = `0.35 × logo_h`；品牌行左对齐 `text-anchor="start"`
- tagline 字号 = `0.032H`，位于品牌行下方，行间距 = `H × 0.045`，与品牌行左对齐
- `--align=center` 时品牌行与 tagline 整体水平居中，垂直位置不变

### 背景数学规律（ambient SVG）
- **L1a 对角线性基底**：`linearGradient x1=0 y1=0 x2=1 y2=1`（135°），3 个 token stops 等距插值：`brand-50 (#F0F9FF) → brand-100 (#E0F2FE) → brand-200 (#BAE6FD)`，亮度自左上向右下单调递减。
- **L1b 偏移径向光晕**：`radialGradient gradientUnits="userSpaceOnUse"`，圆心 `(0.72W, 0.16H)`（右上象限偏移），半径 `R = 0.75 × max(W,H)`（数学推导：最远角距离 `√((0.28W)² + (0.84H)²)` 对四档尺寸均 < R，保证光晕覆盖全画布且边缘自然淡出）；中心 `#FFFFFF stop-opacity 0.85` → 边缘 `stop-opacity 0`（透明度线性插值）。
- **文字色**（light 模式）：标题 `#0F172A`（slate-900）、tagline `#334155`（slate-700）；dark 模式保持 `#FFFFFF`。背景只用 brand token，文字用中性深色（store-spec §2 既有约定）。

### 关键决策与假设（供审核）
1. 新版式完全取代旧版式，不再保留中央巨大标题。
2. 仅默认 `brand` 方案改浅色；其余 5 套（ocean/sunset/forest/midnight/slate）保留深色 + 白字，§2 表新增"背景模式"列区分。
3. `--align` 默认值由 `center` 改为 `left`（浅色版式主流形态）。
4. 数字校验：半径公式对四档尺寸（1280×800 / 440×280 / 920×680 / 1400×560）逐一验证覆盖。

## 架构设计
- 图层结构由三层改为四层：L1a 线性基底 → L1b 径向光晕 → L2 品牌行（logo+标题）→ L3 tagline。
- 数据流：SKILL.md（流程与 AI 提示词）→ store-spec.md §2/§3/§5（配色/系数/模板数据源）→ style.css @theme（Design Token 唯一来源，仅更新注释锚点）。
- 渲染脚本不感知布局，继续按 `WxH.svg` → PNG 校验尺寸，改动面收敛在规范文档。

## 目录结构
```
.codebuddy/skills/generate_store_image/
├── SKILL.md                    # [MODIFY] description、参数表（--color/--align 语义）、四层布局规格、执行流程步骤 3/6、AI 提示词模板、示例
├── references/store-spec.md    # [MODIFY] §2 配色表（brand 浅色三色+背景模式列+文字色规则）、§3 布局系数表（新版式）、§5 SVG 模板（浅色渐变+glow）、§6 示例
└── scripts/render_store_image.ts  # 不改（仅负责 SVG→PNG 渲染与像素校验）
entrypoints/popup/style.css     # [MODIFY] @theme 注释锚点补充浅色渐变来源说明（brand-50/100/200/surface），色值不变
```

## 关键代码结构
SVG 背景模板（L1a+L1b，核心且必须精确）：
```svg
<defs>
  <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#F0F9FF"/>
    <stop offset="50%" stop-color="#E0F2FE"/>
    <stop offset="100%" stop-color="#BAE6FD"/>
  </linearGradient>
  <radialGradient id="glow" gradientUnits="userSpaceOnUse"
                  cx="0.72W" cy="0.16H" r="0.75×max(W,H)">
    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="W" height="H" fill="url(#base)"/>
<rect width="W" height="H" fill="url(#glow)"/>
```
（品牌行与 tagline 的坐标由 §3 系数按 W/H 计算，`dominant-baseline="central"` 实现同行垂直居中。）

## 实施要点
- store-spec.md 是唯一数据源，SKILL.md 只引用不抄录系数（沿用既有约定）。
- 修改前确认 style.css token 值未被改动（本轮仅动注释）。
- 实测验证输出需目检：浅色背景、光晕自然、深色文字对比度达标。


## Agent Extensions
### Skill
- **skill-creator**
  - Purpose：指导 SKILL.md 与 store-spec.md 的规范结构更新（参数表、流程、模板章节的写作约定），确保 skill 文档符合 CodeBuddy skill 标准
  - Expected outcome：skill 文档章节结构规范、参数与流程描述无遗漏，后续可被 AI 稳定执行
- **generate_store_image**
  - Purpose：规划落地后调用该 skill 实测生成 1280×800 浅色版式展示图，验证布局系数、数学渐变与渲染链路
  - Expected outcome：PNG 渲染 PASS，目检浅色背景 + 光晕 + 深色文字效果达标，确认 skill 优化闭环
