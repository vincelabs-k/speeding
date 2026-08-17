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

| 方案 | 主色 `primary` | 辅色 `accent` | 渐变终点 `gradient-end` | 适用场景 |
|------|---------------|---------------|------------------------|---------|
| `brand` | `#0EA5E9` | `#38BDF8` | `#0284C7` | **默认方案**。项目 UI 标准色（popup 品牌 token `brand-500/400/600`），与扩展界面、品牌图标同色系 |
| `ocean` | `#0071C5` | `#00C7FD` | `#005A9E` | 工具、效率（通用备选） |
| `sunset` | `#E65100` | `#FF9100` | `#BF360C` | 创意、娱乐、媒体 |
| `forest` | `#2E7D32` | `#69F0AE` | `#1B5E20` | 效率、健康、环保 |
| `midnight` | `#4527A0` | `#B388FF` | `#311B92` | 技术、安全、深色模式 |
| `slate` | `#37474F` | `#90A4AE` | `#263238` | 极简、专业、文档 |

- 默认 `--color=brand`，保证与插件 UI 同色系；其余 5 套保留作可选。
- 文案（产品名、副标题）统一使用 **`#FFFFFF` 白色**，无论背景深浅——背景为品牌渐变主色，白色文字对比度足够；若用户明确要求深色文字（如 `slate` 浅色场景），允许切换 `#0F172A`（slate-900）。

## 3. 布局比例系数表（三层固定，相对画布 H 推导）

所有尺寸一律按以下系数推导，**禁止自由坐标、自由构图**。

| 层 | 内容 | 定位与尺寸规则 | 系数（相对画布） |
|----|------|----------------|------------------|
| L1 背景 | 135° 对角线渐变（primary → gradient-end）铺满全画布 | `<linearGradient x1="0" y1="0" x2="1" y2="1">`，同品牌图标底托渐变方向 | 100% 画布 |
| L2 logo | 左上角定位，等比缩放 | 左边距 = W×4%；上边距 = H×6%；高度 = H×0.16（宽度随比例）；`--logo` 省略则整层跳过 | 0.16H |
| L3 标题 | 水平居中（或左对齐），粗体 | 标题字重 800；字号 = H×0.16；若 `--align=left` 则与 logo 左对齐（x = W×4%） | 0.16H |
| L3 副标题 | 位于标题下方，居中/左对齐 | 字号 = H×0.06；与标题间距 = 0.8 × 标题字号；`--tagline` 省略则整行跳过 | 0.06H |

### 文字组垂直排布（以画布中心为基准）
1. 文字组整体垂直居中于画布。
2. 组内自上而下：标题（字号 0.16H）→ 间距（0.8×标题字号）→ 副标题（字号 0.06H）。
3. 计算方式：先按字号 + 间距算出文字组总高，再相对画布 H 垂直居中，禁止直接贴底或贴顶。

### 对齐模式
- `--align=center`（默认）：标题与副标题水平居中于画布中心。
- `--align=left`：标题与副标题左对齐，x = W×4%（与 logo 左边缘一致），营造 Apple/Intel 左对齐广告版式。

## 4. 字体约束

- 文案以**英文为主**。SVG 统一使用字体栈 `'Helvetica Neue', Arial, sans-serif`，sharp 内置 librsvg 自动 fallback 到系统字体，无需前置字体检查。
- 标题：`font-weight="800"`（粗黑体观感）；副标题：`font-weight="400"`。
- **中文文案**（如 `--lang=zh`）：必须先检查系统是否安装中文字体：
  - Linux/WSL：`fc-list :lang=zh | head`，缺失则提示安装 `fonts-noto-cjk`；
  - Windows：确认 Microsoft YaHei 存在；
  - 字体栈改为 `'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif`。
- 禁止在 SVG 中引用外部字体文件（如 `@font-face` + 远程 URL）——扩展分发政策禁止加载远程资源。

## 5. SVG 模板要素清单（渲染脚本 / SKILL.md 拼装时参照）

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{{primary}}"/>
      <stop offset="100%" stop-color="{{gradient_end}}"/>
    </linearGradient>
  </defs>
  <rect width="W" height="H" fill="url(#bg)"/>
  <!-- L2 logo: <image href="data:image/png;base64,..." x="W*0.04" y="H*0.06" height="H*0.16" preserveAspectRatio="xMidYMid meet"/> -->
  <!-- L3 标题: <text x="centerX" y="..." text-anchor="middle|start" font-family="..." font-size="H*0.16" font-weight="800" fill="#FFFFFF">TITLE</text> -->
  <!-- L3 副标题: <text x="centerX" y="..." font-size="H*0.06" font-weight="400" fill="#FFFFFF">TAGLINE</text> -->
</svg>
```

- logo 必须以 **base64 data URI** 内嵌进 `<image>`，禁止使用相对路径/绝对路径引用（规避跨盘与打包路径问题）。
- 文本转义：标题/副标题中的 `&` → `&amp;`、`<` → `&lt;`、`>` → `&gt;`。

## 6. 示例输出描述

以 `--title "Video Speed" --tagline "Playback speed from 0.5× to 16×" --color brand --size all` 为例：

- 产出 4 个 PNG：`screenshot_1280x800.png`、`promo-small_440x280.png`、`promo-large_920x680.png`、`marquee_1400x560.png`。
- 视觉效果：天蓝渐变背景（#0EA5E9 → #0284C7，135° 对角线）、左上角品牌 logo（高约 128px/1280 画布）、画布中央巨大白色粗体 "Video Speed"、其下一行较小白色副标题。
- 文件名命名：`<预设名>_<W>x<H>.png`；自定义尺寸为 `<custom>_<W>x<H>.png`。
