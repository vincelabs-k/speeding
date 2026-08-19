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

按绘制顺序固定 L1a → L1b → L1c → L2 → L3，内容尺寸与间距由基准 `S = √(W·H)` 推导（**禁止自由坐标与自由构图**）。全部布局数学已固化为 `scripts/gen_store_svg.ts`，**AI 禁止手拼 SVG 字符串**，只需填参数调用脚本。

1. **L1a 线性基底**：135° 对角线渐变铺满全画布。light 模式 3 stops 由 logo 主色 HSL 派生（`hsl(H,45%,97%) → hsl(H,55%,92%) → hsl(H,60%,86%)`，H 取自 logo 主色）；dark 模式用 §2 表固定 primary/accent/gradient-end。
2. **L1b 毛玻璃光斑**（仅 light 模式）：2–3 个半透明装饰色块（`hsl(H,70%,80%)`、`fill-opacity` 0.25–0.4，错落分布），应用 `feGaussianBlur(stdDeviation=0.03H)`；`fill-opacity` 放各形状上、group 只带 filter。dark 模式无此层。
3. **L1c 玻璃面**（仅 light 模式）：全画布 `#FFFFFF` `fill-opacity="0.35"` 矩形，营造 frosted glass 质感。dark 模式无此层。
4. **L2 品牌行**：logo 与标题**水平同排、整体居中**（行总宽 `B = w_logo + gap + title_w`，行左缘 `0.50W − B/2`）。标题 `text-anchor="middle"` 锚 `(0.50W + (w_logo + gap)/2, 0.45H + 0.35×title_fs)`、字号 `0.09S`、weight 800；logo 高 `0.10S`，左上 `(0.50W − B/2, 0.45H − logo_h/2)`，**必须显式写 `width`/`height`**（否则 librsvg 渲染右偏）；logo↔标题间距 `0.035S`。
5. **L3 tagline**：与整体行中心共轴，`text-anchor="middle"` 锚 `(0.50W, y_tag + 0.35×tagline_fs)`，其中 `y_tag = 0.45H + logo_h/2 + 0.06S + tagline_fs/2`，字号 `0.035S`、weight 400。

`title_w = Σ(字宽系数 × 0.09S)`（系数表见 store-spec.md §3）、`w_logo = 0.10S × (logo 源文件宽高比)`。文字色按背景模式取（store-spec.md §2）：light → 标题 `#0F172A`、tagline `#334155`；dark → 均 `#FFFFFF`。文本不使用 `dominant-baseline`，改用基线锚定（视觉中心 ≈ 基线下方 `0.35em`）。溢出保护（整体行 ≤ 0.9W、tagline ≤ 0.92W、内容高 ≤ 0.6H）由脚本自动等比压缩。

## 执行流程

1. **参数检查**：缺失 `--title` 则询问；其余按默认值补齐。
2. **确定尺寸列表**：`--size` 展开为 `[{预设名, W, H}]`（`all` → 4 档；自定义 → `[{custom, W, H}]`），每档宽高比不同，必须独立生成 SVG（禁止 resize 复用）。
3. **确定配色**：按 `--color` 查 references/store-spec.md §2 表取**背景模式**与色值（brand=light 按步骤 5 的 logo 主色派生；dark 取表内固定值），据模式确定标题/tagline 文字色。
4. **字体检查**：`--lang=zh` 时先按 store-spec.md §4 检查中文字体；英文跳过。
5. **logo 准备与主色提取**：确认 logo 文件存在（`--logo` 或默认 `public/icon/icon.svg`）；文件不存在则无 logo 层、主色回退 `#0EA5E9`。宽高比与主色提取由脚本自动完成（SVG 读 viewBox/首渐变 stop；PNG 用 sharp metadata/缩小取样）。
6. **生成 SVG**：运行布局引擎（自动完成 §3 全部布局数学、XML 转义、溢出保护与 `<image>` 显式 width 修复）：
   ```
   bun run .codebuddy/skills/generate_store_image/scripts/gen_store_svg.ts \
     --title "<产品名>" --tagline "<一句话>" --logo <路径> \
     --color <方案> --size <screenshot|all|WxH> [--lang zh] \
     [--out .output/store-image/svg]
   ```
   脚本输出 `<W>x<H>.svg` 到 `.output/store-image/svg/` 并打印 PASS 清单（含各档 title/logo/tagline 字号）。
7. **渲染 PNG**：执行
   ```
   bun run .codebuddy/skills/generate_store_image/scripts/render_store_image.ts --svg-dir .output/store-image/svg --out .output/store-image
   ```
   脚本遍历 `WxH.svg` → 渲染同尺寸 PNG → 校验像素尺寸 → 打印 PASS/FAIL 清单。
8. **校验与汇报**：脚本退出码 0 视为全部通过；否则输出失败项清单。若 FAIL 与毛玻璃渲染相关（librsvg 无法正确渲染 blur），按 store-spec.md §3 的兜底方案改造 `render_store_image.ts` 为分层合成（bg blur + fg composite）后重跑步骤 6–8。成功后打印全部 PNG 产物路径。

## 校验要点（生成后自查）

- 各档 PNG 像素尺寸与 store-spec.md §1 表一致（渲染脚本已断言）。
- 视觉检查：logo 与标题上下中心对齐、tagline 与整体行水平共轴、大图（1400×560）内容占比协调、PNG 中 logo 无向右偏移。
- 四档内容尺寸应随 `S=√(W·H)` 变化（参考 store-spec.md §6 示例表），不得出现"大图小字"。

## 后置动作

- 打印产物清单：`.output/store-image/<W>x<H>.png`（`--out` 自定义时用其路径）。
- 预览（按平台自动选择）：
  - Windows: `start <png 路径>`
  - macOS: `open <png 路径>`
  - Linux: `xdg-open <png 路径>`
- 提醒：产物目录 `.output/store-image/` 已被 `.gitignore` 忽略，不进 git、不进发布 zip（WXT 只打包 `.output/chrome-mv3/`），可放心生成。
