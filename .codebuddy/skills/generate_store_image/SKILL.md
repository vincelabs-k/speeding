---
description: >-
  生成 Chrome Web Store 商店展示图（Apple/Stripe 风格浅色毛玻璃背景：内容块 logo 与产品名同排、整体居中，其下极简介绍一行；背景由 logo 主色 HSL 派生），按官方尺寸一键批量输出 PNG。支持轮播图首图（1280×800）与 related 位置展示图（440×280 / 920×680 / 1400×560），默认品牌浅色毛玻璃 + 深色文字，与插件图标同色系。
---

# generate_store_image — 商店展示图生成

## 参数定义

若调用时未提供 `--title`，必须暂停并询问用户。

| 参数 | 必填 | 说明 |
|------|------|------|
| `--title` | 是 | 产品名（品牌行核心文案，粗体显示） |
| `--tagline` | 否 | 一行极简介绍（如功能卖点），省略则只出品牌行 |
| `--logo` | 否 | logo 文件路径（PNG/SVG）。省略默认读 `public/icon/icon.svg`；无 logo 则品牌行只显示标题，背景主色回退 brand-500（见 store-spec.md §2.1） |
| `--color` | 否 | 配色方案：`brand`（默认，light 浅色毛玻璃）/ `ocean` / `sunset` / `forest` / `midnight` / `slate`（后五套 dark 深色背景），色值与背景模式见 references/store-spec.md §2 |
| `--size` | 否 | `screenshot`（默认 1280×800）/ `promo-small`（440×280）/ `promo-large`（920×680）/ `marquee`（1400×560）/ `all`（4 档全出）/ 自定义 `WxH`（如 `1280x720`） |
| `--lang` | 否 | `en`（默认）/ `zh`（中文需先做字体检查，见 store-spec.md §4） |
| `--out` | 否 | 输出目录，默认 `.output/store-image/` |

**优先级**：用户显式传参 > 默认值。`--color` 默认 `brand`、`--size` 默认 `screenshot`。内容块一律居中，无对齐参数。

## 布局规格（固定层次，全部系数见 references/store-spec.md §3）

按绘制顺序固定 L1a → L1b → L1c → L2 → L3，尺寸由画布按比例推导，**禁止自由坐标与自由构图**。

1. **L1a 线性基底**：135° 对角线渐变铺满全画布。light 模式 3 stops 由 logo 主色 HSL 派生（`hsl(H,45%,97%) → hsl(H,55%,92%) → hsl(H,60%,86%)`，H 取自 logo 主色）；dark 模式用 §2 表固定 primary/accent/gradient-end。
2. **L1b 毛玻璃光斑**（仅 light 模式）：2–3 个半透明装饰色块（`hsl(H,70%,80%)`、`fill-opacity` 0.25–0.4，错落分布），应用 `feGaussianBlur(stdDeviation=0.03H)` 形成柔和光斑；`fill-opacity` 放各形状上、group 只带 filter。dark 模式无此层。
3. **L1c 玻璃面**（仅 light 模式）：全画布 `#FFFFFF` `fill-opacity="0.35"` 矩形，营造 frosted glass 质感。dark 模式无此层。
4. **L2 品牌行**：logo 与标题**水平同排、垂直居中**，整体锚定画布光学中心。标题 `text-anchor="middle"` 锚 `(0.50W, 0.45H)`、字号 `0.09H`、weight 800、`dominant-baseline="central"`；logo 高 `0.10H`，左上 `x = 0.50W − title_w/2 − 0.035H − w_logo`、`y = 0.40H`；logo↔标题间距 `0.035H`。
5. **L3 tagline**：品牌行下方居中，`text-anchor="middle"` 锚 `(0.50W, 0.5625H)`、字号 `0.035H`、weight 400、`dominant-baseline="central"`。

`title_w` 为标题像素宽度估算值（SVG 无 measureText），按 store-spec.md §3 字宽系数表逐字符加权：`title_w = Σ(字宽系数 × 0.09H)`。`w_logo = 0.10H × (logo 源文件宽高比)`。

文字色按背景模式取（store-spec.md §2）：light → 标题 `#0F172A`、tagline `#334155`；dark → 均 `#FFFFFF`。

## 执行流程

1. **参数检查**：缺失 `--title` 则询问；其余按默认值补齐。
2. **确定尺寸列表**：`--size` 展开为 `[{预设名, W, H}]`（`all` → 4 档；自定义 → `[{custom, W, H}]`），每档宽高比不同，必须独立生成 SVG。
3. **确定配色**：按 `--color` 查 references/store-spec.md §2 表取**背景模式**与色值（brand=light 按步骤 5 的 logo 主色派生；dark 取表内固定值），据模式确定标题/tagline 文字色。
4. **字体检查**：`--lang=zh` 时先按 store-spec.md §4 检查中文字体；英文跳过。
5. **logo 准备与主色提取**：若提供 `--logo` 或默认路径存在，读取文件转 base64 data URI；读宽高比（SVG 看 viewBox；PNG 用 `bun -e` + sharp metadata）计算 `w_logo`；同时按 §2.1 提取主色（SVG 取首个渐变第一 stop 的 stop-color；PNG 缩小至 8×8 取高饱和像素）转 HSL 得 H。文件不存在则跳过 logo 层，主色回退 `#0EA5E9`。
6. **拼 SVG**：按 store-spec.md §5 模板 + §3 系数，为每个尺寸生成完整 SVG 字符串（viewBox = 目标 WxH）；先估算 `title_w`（§3 字宽系数表）；文本做 XML 转义；`feGaussianBlur` 仅允许用于 L1b 光斑（store-spec.md §3 路径 A）。
7. **落盘中间产物**：`mkdir -p .output/store-image/svg/`，写入 `<W>x<H>.svg`。
8. **渲染 PNG**：执行
   ```
   bun run .codebuddy/skills/generate_store_image/scripts/render_store_image.ts --svg-dir .output/store-image/svg --out .output/store-image
   ```
   脚本遍历 `WxH.svg` → 渲染同尺寸 PNG → 校验像素尺寸 → 打印 PASS/FAIL 清单。
9. **校验与汇报**：脚本退出码 0 视为全部通过；否则输出失败项清单。若 FAIL 与毛玻璃渲染相关（路径 A 失败），按 store-spec.md §3 路径 B 改造 `render_store_image.ts` 为分层合成（bg blur + fg composite）后重跑步骤 6–9。成功后打印全部 PNG 产物路径。

## AI 提示词模板

当需要在多尺寸间保持一致时，统一按以下描述生成各档 SVG（渲染交由脚本，AI 只负责拼 SVG 字符串）：

```
Generate Chrome Web Store promo image SVGs, one per target size.
Common style (Apple/Stripe minimal ambient ad, frosted-glass light background):
- L1a: diagonal linear gradient base (135°, linearGradient x1=0 y1=0 x2=1 y2=1) with
  3 evenly-spaced stops derived from logo primary color H (hsl(H,45%,97%) -> hsl(H,55%,92%) -> hsl(H,60%,86%)),
  brightness decreasing monotonically from top-left to bottom-right
- L1b (light mode only): frosted-glass glow blobs — 2-3 large translucent shapes
  (circles/rounded rects, fill hsl(H,70%,80%), fill-opacity 0.25-0.4, scattered),
  grouped under a single <filter id="blur"> with <feGaussianBlur stdDeviation="0.03H"/>
  and filter region x="-20%" y="-20%" width="140%" height="140%"
- L1c (light mode only): full-canvas #FFFFFF rect at fill-opacity 0.35 (frosted glass face)
- L2 brand row (centered): title text-anchor="middle" anchored at (0.50W, 0.45H),
  font-size = 0.09H, font-weight 800, dominant-baseline central;
  logo at height 0.10H, x = 0.50W - title_w/2 - 0.035H - w_logo, y = 0.40H,
  embedded as base64 data URI, gap to title = 0.035H
- L3 tagline (centered below): text-anchor="middle" anchored at (0.50W, 0.5625H),
  font-size = 0.035H, font-weight 400
- title_w estimated per char width table (lowercase 0.52 / uppercase 0.68 / digit 0.55 /
  space 0.30 / CJK 1.00 em) x 0.09H; w_logo = 0.10H x logo aspect ratio
- Text fill by background mode: light -> title #0F172A, tagline #334155; dark -> both #FFFFFF
- font-family 'Helvetica Neue', Arial, sans-serif
- viewBox equals target WxH; escape & < > in text
- NEVER use filters other than the L1b blur; dark mode has no blobs and no glass face
```

## 后置动作

- 打印产物清单：`.output/store-image/<W>x<H>.png`（`--out` 自定义时用其路径）。
- 预览（按平台自动选择）：
  - Windows: `start <png 路径>`
  - macOS: `open <png 路径>`
  - Linux: `xdg-open <png 路径>`
- 提醒：产物目录 `.output/store-image/` 已被 `.gitignore` 忽略，不进 git、不进发布 zip（WXT 只打包 `.output/chrome-mv3/`），可放心生成。
