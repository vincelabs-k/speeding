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

## 3. 布局比例系数表（四层固定，相对画布尺寸 S=√(W·H) 推导）

内容块（品牌行 + tagline）**整体居中**：主视觉品牌行中心线锚定画布光学中心 `y = 0.45H`（垂直方向略偏上以平衡留白），水平锚定 `x = 0.50W`。**禁止自由坐标、自由构图**。

令 `S = √(W·H)`（面积几何平均），所有内容尺寸与间距均锚定 S，保证不同宽高比档位间视觉占比协调。

| 层 | 内容 | 定位与尺寸规则 | 系数（相对 S） |
|---|---|---|---|
| L1a 基底 | logo 派生浅色线性渐变铺满全画布 | `<linearGradient x1="0" y1="0" x2="1" y2="1">`，3 stops：`hsl(H,45%,97%)` → `hsl(H,55%,92%)` → `hsl(H,60%,86%)` | 100% 画布 |
| L1b 装饰光斑 | 2–3 个半透明色块 + 高斯模糊 | 大圆/圆角矩形错落分布，`fill="hsl(H,70%,80%)"`、`fill-opacity` 0.25–0.4，`feGaussianBlur stdDeviation="0.03H"` | 覆盖全画布 |
| L1c 玻璃面 | 全画布半透明白 | `<rect>` `#FFFFFF` `fill-opacity="0.35"` | 100% 画布 |
| L2 品牌行 | logo 与标题**水平同排、整体居中** | 整体行总宽 `B = w_logo + gap + title_w`；标题 `text-anchor="middle"` 锚 `(0.50W + (w_logo + gap)/2, 0.45H + 0.35×title_fs)`、字号 `0.09S`、weight 800；logo 高 `0.10S`，左上 `x = 0.50W − B/2`、`y = 0.45H − logo_h/2`；logo↔标题间距 `0.035S` | logo 0.10S / 标题 0.09S |
| L3 tagline | 品牌行下方，与整体行中心共轴 | `text-anchor="middle"` 锚 `(0.50W, y_tag + 0.35×tagline_fs)`，其中 `y_tag = 0.45H + logo_h/2 + 0.06S + tagline_fs/2`；字号 `0.035S`、weight 400 | tagline 0.035S / 行间距 0.06S |

### 坐标计算（相对画布 W/H）

- **内容基准**：`S = √(W·H)`。
- **标题宽度估算**（SVG 无 measureText）：`title_w = Σ(字宽系数 × 0.09S)`，按文案逐字符加权求和：

  | 字符类型 | 字宽系数（相对 1em） |
  |----------|---------------------|
  | 小写字母 | 0.52 |
  | 大写字母 | 0.68 |
  | 数字     | 0.55 |
  | 空格     | 0.30 |
  | 连字符 `-` | 0.40 |
  | 中文/全角 | 1.00 |

- 品牌行中心线：`y_brand = 0.45H`。
- 品牌行总宽：`B = w_logo + gap + title_w`，其中 `w_logo = 0.10S × (logo 源文件宽高比)`，`gap = 0.035S`。
- 整体行左缘：`x_left = 0.50W − B/2`。
- logo：左上 `(x_left, 0.45H − logo_h/2)`，宽高 `(w_logo, logo_h)`，`preserveAspectRatio="xMidYMid meet"`；**必须显式写 `width` 与 `height`**，否则 librsvg 会对无 intrinsic 尺寸的 SVG 内容 fallback 300×150，导致 PNG 渲染右偏。
- 标题锚点：`(0.50W + (w_logo + gap)/2, 0.45H + 0.35×title_fs)`，`text-anchor="middle"`、字号 `0.09S`。弃用 `dominant-baseline="central"`（librsvg 与浏览器对 em 框中心对齐存在差异），改用基线锚定：字形视觉中心约在基线下方 `0.35em` 处。
- tagline 中心线：`y_tag = 0.45H + logo_h/2 + 0.06S + tagline_fs/2`；锚点 `(0.50W, y_tag + 0.35×tagline_fs)`，`text-anchor="middle"`。
- **溢出保护**：
  - 整体行宽度 `B ≤ 0.9W`，否则等比压缩所有内容尺寸与间距（保持比例）；
  - tagline 宽度 `≤ 0.92W`，否则单独压缩 tagline 字号；
  - 内容块总高 `≤ 0.6H`，否则等比压缩。

### SVG 渲染一致性约束

- `<image>` 必须显式设置 `width` 与 `height`（由 logo 宽高比计算），并内嵌为 base64 data URI。
- 文本使用基线锚定而非 `dominant-baseline`，减少浏览器预览与 sharp/librsvg 渲染差异。
- 四档宽高比不同，必须独立生成 SVG（`viewBox = 目标 WxH`），禁止 resize 复用。
- `feGaussianBlur` 仅允许出现在 L1b 的 `filter` 中；渲染异常时改 `render_store_image.ts` 为分层合成兜底（bg blur + fg composite）。

## 4. 字体约束

- 文案以**英文为主**。SVG 统一使用字体栈 `'Helvetica Neue', Arial, sans-serif`，sharp 内置 librsvg 自动 fallback 到系统字体，无需前置字体检查。
- 标题：`font-weight="800"`（粗黑体观感）；tagline：`font-weight="400"`。
- **中文文案**（如 `--lang=zh`）：必须先检查系统是否安装中文字体：
  - Linux/WSL：`fc-list :lang=zh | head`，缺失则提示安装 `fonts-noto-cjk`；
  - Windows：确认 Microsoft YaHei 存在；
  - 字体栈改为 `'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif`。
- 禁止在 SVG 中引用外部字体文件（如 `@font-face` + 远程 URL）——扩展分发政策禁止加载远程资源。

## 5. SVG 模板要素清单（gen_store_svg.ts 生成时参照）

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
  <!-- L2 品牌行（logo + 标题同排，整体居中于 0.50W）:
       <image href="data:image/svg+xml;base64,..."
              x="{{x_left}}" y="{{0.45*H - logo_h/2}}" width="{{w_logo}}" height="{{logo_h}}"
              preserveAspectRatio="xMidYMid meet"/>
       <text x="{{0.50*W + (w_logo + gap)/2}}" y="{{0.45*H + 0.35*title_fs}}" text-anchor="middle"
             font-family="'Helvetica Neue', Arial, sans-serif" font-size="{{title_fs}}" font-weight="800"
             fill="{{title_fill}}">TITLE</text> -->
  <!-- L3 tagline（与整体行中心共轴）:
       <text x="{{0.50*W}}" y="{{y_tag + 0.35*tagline_fs}}" text-anchor="middle"
             font-family="'Helvetica Neue', Arial, sans-serif" font-size="{{tagline_fs}}" font-weight="400"
             fill="{{tagline_fill}}">TAGLINE</text> -->
</svg>
```

- `{{H}}` = logo 主色 HSL 色相（§2.1 提取）。
- `{{title_fill}}` / `{{tagline_fill}}` 按 §2 背景模式取：light → `#0F172A` / `#334155`；dark → `#FFFFFF` / `#FFFFFF`。
- dark 模式：无毛玻璃、无 L1b/L1c，保持原单层 3-stop 对角线性渐变（§2 表固定色值），文字白字。
- logo 必须以 **base64 data URI** 内嵌进 `<image>`，禁止使用相对路径/绝对路径引用（规避跨盘与打包路径问题）。
- `<image>` 必须显式写 `width` 与 `height`，不得只写 `height`。
- 文本转义：标题/副标题中的 `&` → `&amp;`、`<` → `&lt;`、`>` → `&gt;`。
- 文本不使用 `dominant-baseline="central"`，改用基线锚定 `y = 视觉中心 y + 0.35em`。

## 6. 示例输出描述

以 `--title "Speeding" --tagline "Auto-speed for Every Site" --color brand --size all` 为例，由 `gen_store_svg.ts` 自动计算布局：

- 产出 4 个 PNG：`1280x800.png`、`440x280.png`、`920x680.png`、`1400x560.png`（与渲染脚本输出文件名一致）。
- 四档内容尺寸（基于 S=√(W·H)）：

  | 尺寸 | S ≈ | logo 高 | 标题字号 | tagline 字号 |
  |------|-----|---------|----------|--------------|
  | 1280×800 | 1012 | 101px | 91px | 35px |
  | 440×280 | 351 | 35px | 32px | 12px |
  | 920×680 | 791 | 79px | 71px | 28px |
  | 1400×560 | 885 | 89px | 80px | 31px |

- 视觉效果：浅色毛玻璃背景——logo 主色 `#0071C5` 派生（`hsl(206,45%,97%) → hsl(206,55%,92%) → hsl(206,60%,86%)`，135° 对角线性渐变）+ 3 个模糊柔和光斑（`hsl(206,70%,80%)` 半透明）+ 白色玻璃面（opacity 0.35）；居中内容块——logo（高约 80–101px）与粗体 "Speeding"（字号 32–91px，`#0F172A`）同排，整体以画布光学中心 `(0.50W, 0.45H)` 为锚点水平居中；其下 tagline "Auto-speed for Every Site"（字号 12–35px，`#334155`）与整体行中心共轴。
- 文件名命名：`<W>x<H>.png`；渲染脚本按 `WxH.svg` 渲染为 `WxH.png`。
