---
name: store-image-layout-engine
overview: 重构商店展示图布局引擎：内容尺寸从「锚 H」改为「锚 S=√(W·H)」动态缩放，logo+标题组成整体行水平居中、tagline 与其共轴；弃用 dominant-baseline 改基线锚定消除垂直偏移；<image> 显式 width 修复 librsvg PNG 渲染右偏；全部布局数学固化为 gen_store_svg.ts 脚本，AI 不再手拼 SVG。
todos:
  - id: create-gen-script
    content: 新建 gen_store_svg.ts 参数化布局引擎：S 基准缩放、整体行共轴、基线锚定、动态间距、溢出保护、image width 修复
    status: completed
  - id: update-store-spec
    content: 更新 store-spec.md §3 系数表/§5 模板/§6 示例，并用 [skill:skill-creator] 校准格式
    status: completed
    dependencies:
      - create-gen-script
  - id: update-skill-md
    content: 更新 SKILL.md 布局规格与执行流程，步骤 6 改为运行 gen_store_svg.ts
    status: completed
    dependencies:
      - update-store-spec
  - id: regenerate-verify
    content: 用 [skill:generate_store_image] 重新生成 4 档 PNG，目检五个问题修复效果
    status: completed
    dependencies:
      - create-gen-script
      - update-store-spec
      - update-skill-md
---


## 用户需求

商店展示图生成存在 5 个问题，需先出方案再执行：

1. **大图不协调**：不同尺寸图片中 logo、文字大小相同（系数锚定画布高度 H），导致 1400×560 等宽幅大图元素过小、留白失衡
2. **logo 与大标题垂直未居中**：标题视觉上偏上，与 logo 未在上下方向对齐
3. **tagline 对齐基准错误**：tagline 与标题单独居中对齐，应与【logo+大标题整体行】左右居中对齐
4. **间距不美观且固定**：需根据 logo 大小、文字长短、字体大小、画布尺寸动态计算"最美间距"
5. **PNG 与 SVG 不一致**：PNG 中 logo 向右大幅偏移（根因已定位：`<image>` 缺 `width` 属性，librsvg fallback 300×150 默认尺寸所致）

## 补充说明

- 视觉风格不变：保持浅色毛玻璃背景 + 深色文字（brand 默认），仅重构布局数学
- 生成能力需可重复、可验证：布局计算从"AI 手拼"迁移为参数化脚本，每次生成自动计算最优参数
- 支持自定义尺寸（`--size WxH`），需防止极端宽高比下内容溢出



## 技术栈

- Bun + TypeScript：新增参数化布局引擎脚本 `gen_store_svg.ts`
- sharp（librsvg）：现有渲染管线 `render_store_image.ts` 零改动
- 修改 skill 文档（store-spec.md / SKILL.md）

## 实现方案

### 核心决策：布局计算从 AI 手拼迁移为脚本引擎

新增 `gen_store_svg.ts`，接收与 skill 相同的参数（`--title/--tagline/--logo/--color/--size/--out`），内部完成全部布局数学并输出各档 SVG，SKILL.md 步骤 6 改为运行脚本。理由：布局公式涉及 S 基准缩放、字宽估算、溢出保护等多处数学，AI 手拼易出错且不可复现；脚本化保证每次生成数值精确、系数一致，也满足"每次生成时动态计算最美间距"的工程化要求。

### 布局引擎核心数学（替代锚 H 的旧系数）

**内容基准 `S = √(W·H)`**（面积几何平均，随画布整体缩放）：

| 项 | 公式 |
|---|---|
| 标题字号 | `title_fs = 0.09S` |
| logo 高 | `logo_h = 0.10S`，`logo_w = logo_h × aspect` |
| tagline 字号 | `tagline_fs = 0.035S` |
| logo↔标题间距 | `gap_logo_title = 0.035S` |
| 品牌行↔tagline 间距 | `row_gap = 0.06S` |

四档预览（1280×800→S≈1012、440×280→S≈351、920×680→S≈791、1400×560→S≈885）：标题 91/32/71/80px，随画布尺寸协调缩放，消除"大图小字"。

**整体行共轴（问题 3）**：
- 行总宽 `B = logo_w + gap_logo_title + title_w`
- 行左缘 `x_left = 0.50W − B/2`；logo `x = x_left`；标题 `x = 0.50W + (logo_w + gap)/2`
- tagline `x = 0.50W`，与整体行中心共轴
- `title_w = Σ(字宽系数 × title_fs)`，字宽系数表补连字符 `-` = 0.40

**垂直基线锚定（问题 2）**：
- 弃用 `dominant-baseline="central"`（锚 em 框中心，混合大小写字形视觉偏上）
- 改基线锚定：`text y = yc + 0.35 × font_size`（Helvetica 视觉中心约在基线下方 0.35em），logo `y = yc − logo_h/2`，行中心 `yc = 0.45H`

**动态间距（问题 4）**：间距由 S 推导（随画布缩放），并随 logo 尺寸（logo_h）、字号（title_fs）联动；加溢出保护——`B_max = 0.9W`，若 `B > B_max` 等比压缩 `k = B_max/B`（作用于 title_fs/logo_h/gap，保持比例）；tagline 同理独立校验 `tagline_w ≤ 0.92W`，超宽则单独缩小 tagline_fs。保证任意自定义尺寸不翻车。

**PNG 偏移修复（问题 5）**：`<image>` 显式写 `width = logo_w`（= height × 宽高比），消除 librsvg 对无 intrinsic 尺寸 SVG 的 300×150 fallback 导致的右偏，PNG 与浏览器 SVG 预览一致。

### 脚本职责

1. 参数解析 + 尺寸展开（含自定义 WxH）
2. logo 读取：base64 data URI + 宽高比（SVG 读 viewBox；PNG 用 sharp metadata）
3. 主色提取：SVG 取首个 linearGradient 第一 stop；PNG 缩小 8×8 取高饱和像素；转 HSL 得 H
4. 按上述数学计算每档坐标 → 拼 SVG（背景 L1a/L1b/L1c 保持现有毛玻璃规格；文本 XML 转义）
5. 落盘 `<W>x<H>.svg` → 打印清单

### 性能与可靠性

- 全部为纯字符串拼装 + 正则/线性扫描，单档生成毫秒级，无性能瓶颈
- 四档独立生成（宽高比不同），禁止 resize 复用（沿用现有约定）
- 字宽估算误差 <1%W 可接受（沿用现有系数表 + 连字符修正），溢出保护兜底极端文案

## 目录结构

```
.codebuddy/skills/generate_store_image/
├── scripts/
│   ├── gen_store_svg.ts        # [NEW] 参数化布局引擎：S 基准缩放、整体行共轴、
│   │                           #   基线锚定、动态间距、溢出保护、image width 修复
│   │                           #   参数：--title/--tagline/--logo/--color/--size/--out
│   │                           #   输出：.output/store-image/svg/<W>x<H>.svg
│   └── render_store_image.ts   # [UNCHANGED] 现有渲染脚本（WxH.svg → WxH.png + 尺寸校验）
├── references/
│   └── store-spec.md           # [MODIFY] §3 布局系数表改 S 基准 + 基线锚定 + 整体行共轴
│                               #   + 动态间距 + 溢出保护；§5 模板更新 image width/坐标；
│                               #   §6 示例与字宽系数表更新
└── SKILL.md                    # [MODIFY] 布局规格章节、执行流程步骤 6 改为运行
                                #   gen_store_svg.ts、AI 提示词模板改为脚本调用说明
```

## 关键代码结构

```ts
// gen_store_svg.ts 核心布局函数签名（脚本内部实现）
interface LayoutInput {
  W: number; H: number;          // 画布尺寸
  logoAspect: number;            // logo 宽高比（SVG viewBox / PNG metadata）
  title: string; tagline: string;
}
interface LayoutResult {
  titleFs: number; logoH: number; logoW: number; taglineFs: number;
  gapLogoTitle: number; rowGap: number;          // 动态间距
  logoX: number; logoY: number;                  // 行左缘定位
  titleX: number; titleBaselineY: number;        // 基线锚定
  taglineX: number; taglineBaselineY: number;    // 与整体行共轴
}
function computeLayout(input: LayoutInput): LayoutResult;
```


## Agent Extensions

### Skill
- **skill-creator**
  - Purpose: 校准 store-spec.md / SKILL.md 的 skill 文档格式（精简主文件、数据源入 references、逐条可执行指令），保证修改后的文档符合 skill 规范
  - Expected outcome: 两份文档格式合规，系数与脚本实现一致
- **generate_store_image**
  - Purpose: 按新流程重新生成 4 档 PNG，验证五个问题的修复效果
  - Expected outcome: 生成 4 张图全部 PASS 尺寸校验，目检确认大图协调、垂直居中、tagline 共轴、间距美观、PNG 无右偏
