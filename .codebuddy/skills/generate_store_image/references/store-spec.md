# Chrome Web Store 展示图规范（Store Image Spec）

本文件是 `generate_store_image` skill 的静态规范数据源。SKILL.md 通过查表引用本文件中的尺寸、配色、布局系数与字体约束，不重复抄录。

## 1. 官方尺寸表（Chrome Web Store）

| 预设名 | 像素尺寸 W×H | 投放场景 | 宽高比 |
|--------|--------------|----------|--------|
| `screenshot` | 1280×800 | 商店详情页轮播图第一张（用户打开插件主页时最先看到） | 16:10 |
| `promo-small` | 440×280 | related（相关推荐）位置展示图 | 11:7 |
| `promo-large` | 920×680 | 推广位大图 | 23:17 |
| `marquee` | 1400×560 | 顶部横幅宣传位 | 5:2 |

- 格式：PNG 或 JPEG；本 skill 一律输出 **PNG**。
- 每档宽高比不同（16:10 / 11:7 / 23:17 / 5:2），因此每个尺寸必须独立生成 SVG（viewBox = 目标 WxH），**禁止**生成单一尺寸后 resize 复用——会造成文字与间距比例失真。
- `--size` 支持 `screenshot` / `promo-small` / `promo-large` / `marquee` / `all`（一次输出全部 4 档）/ 自定义 `WxH`（如 `1280x720`，宽高为正整数，以 `x` 分隔）。

## 2. 配色方案表（与 generate_brand_icon 同步）

| 方案 | 背景模式 | 主色 `primary` | 辅色 `accent` | 渐变终点 `gradient-end` | 适用场景 |
|------|---------|---------------|---------------|------------------------|---------|
| `brand` | `light` | logo 主色派生（§2.1） | logo 主色派生（§2.1） | logo 主色派生（§2.1） | **默认方案**。浅色毛玻璃背景，色阶由 logo 主色 HSL 派生，与扩展图标同色系 |
| `ocean` | `dark` | `#0071C5` | `#00C7FD` | `#005A9E` | 工具、效率（通用备选） |
| `sunset` | `dark` | `#E65100` | `#FF9100` | `#BF360C` | 创意、娱乐、媒体 |
| `forest` | `dark` | `#2E7D32` | `#69F0AE` | `#1B5E20` | 效率、健康、环保 |
| `midnight` | `dark` | `#4527A0` | `#B388FF` | `#311B92` | 技术、安全、深色模式 |
| `slate` | `dark` | `#37474F` | `#90A4AE` | `#263238` | 极简、专业、文档 |

- 默认 `--color=brand`（light），背景色由 **logo 主色动态派生**（§2.1），保证与扩展图标同色系；其余 5 套（dark）为固定色值。
- **背景模式决定文字色**，两者为一对一映射，禁止混用：
  - `light`（浅色背景）：标题 `#0F172A`（slate-900）、tagline `#334155`（slate-700）。
  - `dark`（深色背景）：标题与 tagline 均为 `#FFFFFF`。
- 背景只用品牌色阶（light 为 logo 派生浅色 + 白色玻璃面；dark 用固定 primary/accent/gradient-end）；文字只用中性深色或白色，不额外引入彩色。

### 2.1 logo 派生浅色毛玻璃（light 模式专用，brand 默认）

**主色提取**（禁止猜测，须读取 logo 源文件）：
- SVG：取首个 `<linearGradient>` 第一 `<stop>` 的 `stop-color`（如 `public/icon/icon.svg` → `#0071C5`）；无渐变则取首个 `fill` 色。
- PNG：`bun -e` + sharp 缩小至 8×8，取饱和度最高的像素色。
- 无 logo 时回退主色 `#0EA5E9`（brand-500）。

**派生算法**（保持主色色相 H，S/L 为固定派生参数）：
- 基底 3 stops：`hsl(H, 45%, 97%)` → `hsl(H, 55%, 92%)` → `hsl(H, 60%, 86%)`（近白 → 浅蓝，亮度自左上向右下单调递减）。
- 装饰光斑色：`hsl(H, 70%, 80%)`，`fill-opacity` 0.25–0.4。

**三层背景结构**（按绘制顺序）：
1. **L1a 基底**：135° 对角单层线性渐变（`x1="0" y1="0" x2="1" y2="1"`），3 stops 等距，铺满全画布。
2. **L1b 装饰光斑**：2–3 个半透明色块（大圆/圆角矩形，错落分布），应用 `feGaussianBlur`（stdDeviation = 0.03H）形成柔和光斑；半透明度用各形状的 `fill-opacity`（避免 group opacity + filter 的兼容风险）。
3. **L1c 玻璃面**：全画布 `#FFFFFF` `fill-opacity="0.35"` 矩形，营造 frosted glass 通透质感。

绘制顺序：L1a → L1b → L1c → L2 品牌行 → L3 tagline（文字与 logo 在玻璃面之上，保证可读性）。

## 3. 布局比例系数表（四层固定，相对画布 H 推导）

内容块（品牌行 + tagline）**整体居中**：主视觉品牌行中心线锚定画布光学中心 `y = 0.45H`（垂直方向略偏上以平衡留白），水平锚定 `x = 0.50W`。**禁止自由坐标、自由构图**。

| 层 | 内容 | 定位与尺寸规则 | 系数（相对画布） |
|----|------|----------------|------------------|
| L1a 基底 | logo 派生浅色线性渐变铺满全画布 | `<linearGradient x1="0" y1="0" x2="1" y2="1">`，3 stops：`hsl(H,45%,97%)` → `hsl(H,55%,92%)` → `hsl(H,60%,86%)` | 100% 画布 |
| L1b 装饰光斑 | 2–3 个半透明色块 + 高斯模糊 | 大圆/圆角矩形错落分布，`fill="hsl(H,70%,80%)"`、`fill-opacity` 0.25–0.4，`feGaussianBlur stdDeviation="0.03H"` | 覆盖全画布 |
| L1c 玻璃面 | 全画布半透明白 | `<rect>` `#FFFFFF` `fill-opacity="0.35"` | 100% 画布 |
| L2 品牌行 | logo 与标题**水平同排**，整体居中 | 标题 `text-anchor="middle"` 锚 `(0.50W, 0.45H)`、字号 `0.09H`、weight 800、`dominant-baseline="central"`；logo 高 `0.10H`，左上 `x = 0.50W − title_w/2 − 0.035H − w_logo`、`y = 0.40H`；logo↔标题间距 `0.035H` | logo 0.10H / 标题 0.09H |
| L3 tagline | 品牌行下方，居中 | `text-anchor="middle"` 锚 `(0.50W, 0.5625H)`、字号 `0.035H`、weight 400、`dominant-baseline="central"` | 0.035H |

### 坐标计算（相对画布 W/H）

- **标题宽度估算**（SVG 无 measureText）：`title_w = Σ(字宽系数 × 0.09H)`，按文案逐字符加权求和：

  | 字符类型 | 字宽系数（相对 1em） |
  |----------|---------------------|
  | 小写字母 | 0.52 |
  | 大写字母 | 0.68 |
  | 数字     | 0.55 |
  | 空格     | 0.30 |
  | 中文/全角 | 1.00 |

- 品牌行中心线：`y_brand = 0.45H`。
- 标题锚点：`(0.50W, 0.45H)`，`text-anchor="middle"`、`dominant-baseline="central"`、字号 `0.09H`。
- logo（高 `0.10H`，`preserveAspectRatio="xMidYMid meet"`）：左上 `x = 0.50W − title_w/2 − 0.035H − w_logo`、`y = 0.40H`，其中 `w_logo = 0.10H × (logo 源文件宽高比)`——AI 需先读取 logo 源文件宽高（SVG 看 viewBox；PNG 用 `bun -e` + sharp metadata），禁止猜测。
- tagline 中心线：`y_tag = 0.45H + 0.05H + 0.045H + 0.0175H = 0.5625H`；锚点 `(0.50W, 0.5625H)`，`text-anchor="middle"`。
- 内容块总高 = `0.18H`（顶 `0.40H` → 底 `0.58H`），四档宽高比下上下留白均安全（16:10 留白 0.42H；5:2 marquee 留白 0.21H 仍充足）。

### SVG 能力边界（生图方式裁决）
- 本结构使用 `linearGradient` / `feGaussianBlur` / `stop-opacity`，均为 sharp 内置 librsvg 支持的能力。
- `feGaussianBlur` **仅用于毛玻璃光斑（L1b）**，`stdDeviation = 0.03H`。librsvg 对 filter 支持存在不确定性（大半径渲染耗时风险）：
  - **路径 A（首选）**：纯 SVG `feGaussianBlur`，`render_store_image.ts` 零改动。执行时先以 1280×800 单档实测验证渲染正确性与耗时。
  - **路径 B（兜底）**：若路径 A 渲染异常/过慢，改 `scripts/render_store_image.ts` 为分层合成——SVG 目录产出 `<W>x<H>.bg.svg`（基底+装饰光斑，需模糊）与 `<W>x<H>.fg.svg`（玻璃面+logo+文字，透明背景），脚本用 `sharp().blur()` 处理 bg 层后再 `composite` fg 层；SKILL.md 步骤 6/7 同步改为双 SVG 拼装。
- 边界记录：真实噪点/复杂滤镜超出 librsvg 能力时，备选路径 ① sharp 像素级渲染、② image_gen 生图；本期不启用。

## 4. 字体约束

- 文案以**英文为主**。SVG 统一使用字体栈 `'Helvetica Neue', Arial, sans-serif`，sharp 内置 librsvg 自动 fallback 到系统字体，无需前置字体检查。
- 标题：`font-weight="800"`（粗黑体观感）；tagline：`font-weight="400"`。
- **中文文案**（如 `--lang=zh`）：必须先检查系统是否安装中文字体：
  - Linux/WSL：`fc-list :lang=zh | head`，缺失则提示安装 `fonts-noto-cjk`；
  - Windows：确认 Microsoft YaHei 存在；
  - 字体栈改为 `'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif`。
- 禁止在 SVG 中引用外部字体文件（如 `@font-face` + 远程 URL）——扩展分发政策禁止加载远程资源。

## 5. SVG 模板要素清单（渲染脚本 / SKILL.md 拼装时参照）

light 模式（默认 brand）完整模板：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H">
  <defs>
    <!-- L1a 基底：logo 主色派生 3 stops（§2.1），亮度自左上向右下递减 -->
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl({{H}},45%,97%)"/>
      <stop offset="50%" stop-color="hsl({{H}},55%,92%)"/>
      <stop offset="100%" stop-color="hsl({{H}},60%,86%)"/>
    </linearGradient>
    <!-- L1b 毛玻璃光斑：filter region 放大，避免大半径模糊被裁剪 -->
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="{{0.03*H}}"/>
    </filter>
  </defs>
  <rect width="W" height="H" fill="url(#base)"/>
  <!-- L1b 装饰光斑：fill-opacity 放各形状上，group 只带 filter -->
  <g filter="url(#blur)">
    <circle cx="{{0.15*W}}" cy="{{0.22*H}}" r="{{0.30*H}}" fill="hsl({{H}},70%,80%)" fill-opacity="0.35"/>
    <circle cx="{{0.85*W}}" cy="{{0.75*H}}" r="{{0.26*H}}" fill="hsl({{H}},70%,80%)" fill-opacity="0.30"/>
    <rect x="{{0.60*W}}" y="{{0.10*H}}" width="{{0.25*W}}" height="{{0.18*H}}" rx="{{0.09*H}}" fill="hsl({{H}},70%,80%)" fill-opacity="0.25"/>
  </g>
  <!-- L1c 玻璃面 -->
  <rect width="W" height="H" fill="#FFFFFF" fill-opacity="0.35"/>
  <!-- L2 品牌行（logo + 标题同排，整体居中）:
       <image href="data:image/png;base64,..."
              x="{{0.50*W - title_w/2 - 0.035*H - w_logo}}" y="{{0.40*H}}" height="{{0.10*H}}"
              preserveAspectRatio="xMidYMid meet"/>
       <text x="{{0.50*W}}" y="{{0.45*H}}" text-anchor="middle" dominant-baseline="central"
             font-family="'Helvetica Neue', Arial, sans-serif" font-size="{{0.09*H}}" font-weight="800"
             fill="{{title_fill}}">TITLE</text> -->
  <!-- L3 tagline:
       <text x="{{0.50*W}}" y="{{0.5625*H}}" text-anchor="middle" dominant-baseline="central"
             font-family="'Helvetica Neue', Arial, sans-serif" font-size="{{0.035*H}}" font-weight="400"
             fill="{{tagline_fill}}">TAGLINE</text> -->
</svg>
```

- `{{H}}` = logo 主色 HSL 色相（§2.1 提取）。
- `{{title_fill}}` / `{{tagline_fill}}` 按 §2 背景模式取：light → `#0F172A` / `#334155`；dark → `#FFFFFF` / `#FFFFFF`。
- dark 模式：无毛玻璃、无 L1b/L1c，保持原单层 3-stop 对角线性渐变（§2 表固定色值），文字白字。
- logo 必须以 **base64 data URI** 内嵌进 `<image>`，禁止使用相对路径/绝对路径引用（规避跨盘与打包路径问题）。
- 文本转义：标题/副标题中的 `&` → `&amp;`、`<` → `&lt;`、`>` → `&gt;`。
- `feGaussianBlur` 仅允许出现在 L1b 的 `filter` 中；渲染异常时按 §3 路径 B 降级。

## 6. 示例输出描述

以 `--title "Speeding" --tagline "Video Speed Controller 0.25x~16x" --color brand --size all` 为例：

- 产出 4 个 PNG：`1280x800.png`、`440x280.png`、`920x680.png`、`1400x560.png`（与渲染脚本输出文件名一致）。
- 视觉效果：浅色毛玻璃背景——logo 主色 `#0071C5` 派生（`hsl(207,45%,97%) → hsl(207,55%,92%) → hsl(207,60%,86%)`，135° 对角线性渐变）+ 3 个模糊柔和光斑（`hsl(207,70%,80%)` 半透明）+ 白色玻璃面（opacity 0.35）；居中内容块——logo（高 80px）与粗体 "Speeding"（字号 72px，`#0F172A`）同排，整体锚定画布中心 `(640, 360)`；其下居中对齐一行 tagline "Video Speed Controller 0.25x~16x"（字号 28px，`#334155`）。
- 文件名命名：`<W>x<H>.png`；渲染脚本按 `WxH.svg` 渲染为 `WxH.png`。
