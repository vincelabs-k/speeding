---
description: >-
  生成 Chrome Web Store 商店展示图（Apple/Intel 广告式极简风格：纯色/渐变背景 + 左上角 logo + 粗大产品名 + 一行极简介绍），按官方尺寸一键批量输出 PNG。支持轮播图首图（1280×800）与 related 位置展示图（440×280 / 920×680 / 1400×560），默认使用项目品牌色 brand，与插件 UI 同色系。
---

# generate_store_image — 商店展示图生成

## 参数定义

若调用时未提供 `--title`，必须暂停并询问用户。

| 参数 | 必填 | 说明 |
|------|------|------|
| `--title` | 是 | 产品名（封面核心文案，粗大显示） |
| `--tagline` | 否 | 一行极简介绍（如功能卖点），省略则只出标题 |
| `--logo` | 否 | logo 文件路径（PNG/SVG）。省略默认读 `public/icon/icon.svg`；无 logo 则跳过 L2 层 |
| `--color` | 否 | 配色方案：`brand`（默认）/ `ocean` / `sunset` / `forest` / `midnight` / `slate`，色值见 references/store-spec.md §2 |
| `--size` | 否 | `screenshot`（默认 1280×800）/ `promo-small`（440×280）/ `promo-large`（920×680）/ `marquee`（1400×560）/ `all`（4 档全出）/ 自定义 `WxH`（如 `1280x720`） |
| `--align` | 否 | `center`（默认，水平居中）/ `left`（左对齐，与 logo 左边缘一致） |
| `--lang` | 否 | `en`（默认）/ `zh`（中文需先做字体检查，见 store-spec.md §4） |
| `--out` | 否 | 输出目录，默认 `.output/store-image/` |

**优先级**：用户显式传参 > 默认值。`--color` 默认 `brand`、`--size` 默认 `screenshot`。

## 三层布局规格

固定三层结构，全部尺寸由画布按比例推导（系数表见 references/store-spec.md §3），**禁止自由坐标与自由构图**。

1. **L1 背景**：135° 对角线渐变（primary → gradient-end）铺满全画布，与品牌图标底托渐变方向一致。
2. **L2 logo**：左上角定位（左边距 = W×4%，上边距 = H×6%），等比缩放、高度 = H×0.16；`--logo` 省略则跳过。
3. **L3 文字组**：整体垂直居中于画布。标题粗体 weight 800、字号 = H×0.16；副标题其下、字号 = H×0.06、间距 = 0.8×标题字号；按 `--align` 居中或左对齐。

## 执行流程

1. **参数检查**：缺失 `--title` 则询问；其余按默认值补齐。
2. **确定尺寸列表**：`--size` 展开为 `[{预设名, W, H}]`（`all` → 4 档；自定义 → `[{custom, W, H}]`），每档宽高比不同，必须独立生成 SVG。
3. **确定配色**：按 `--color` 查 references/store-spec.md §2 表取 primary / accent / gradient-end。
4. **字体检查**：`--lang=zh` 时先按 store-spec.md §4 检查中文字体；英文跳过。
5. **logo 准备**：若提供 `--logo` 或默认路径存在，读取文件并转 base64 data URI；不存在则本层跳过。
6. **拼 SVG**：按 store-spec.md §5 模板 + §3 系数，为每个尺寸生成完整 SVG 字符串（viewBox = 目标 WxH），文本做 XML 转义。
7. **落盘中间产物**：`mkdir -p .output/store-image/svg/`，写入 `<W>x<H>.svg`。
8. **渲染 PNG**：执行
   ```
   bun run .codebuddy/skills/generate_store_image/scripts/render_store_image.ts --svg-dir .output/store-image/svg --out .output/store-image
   ```
   脚本遍历 `WxH.svg` → 渲染同尺寸 PNG → 校验像素尺寸 → 打印 PASS/FAIL 清单。
9. **校验与汇报**：脚本退出码 0 视为全部通过；否则输出失败项清单。成功后打印全部 PNG 产物路径。

## AI 提示词模板

当需要在多尺寸间保持一致时，统一按以下描述生成各档 SVG（渲染交由脚本，AI 只负责拼 SVG 字符串）：

```
Generate Chrome Web Store promo image SVGs, one per target size.
Common style (Apple/Intel minimal ad):
- Solid-to-gradient background (135° diagonal linearGradient: primary -> gradient-end) filling 100% canvas
- Logo at top-left (margin-left = W*4%, margin-top = H*6%), height = H*16%, preserveAspectRatio meet
- Title text: font-weight 800, font-size = H*16%, fill #FFFFFF, centered (or left-aligned at W*4% if --align=left)
- Tagline below: font-size = H*6%, spacing = 0.8*title size, fill #FFFFFF
- Text group vertically centered; font-family 'Helvetica Neue', Arial, sans-serif
- Embed logo as base64 data URI in <image>, never use file paths
- viewBox equals target WxH; escape & < > in text
```

## 后置动作

- 打印产物清单：`.output/store-image/<preset>_<W>x<H>.png`（`--out` 自定义时用其路径）。
- 预览（按平台自动选择）：
  - Windows: `start <png 路径>`
  - macOS: `open <png 路径>`
  - Linux: `xdg-open <png 路径>`
- 提醒：产物目录 `.output/store-image/` 已被 `.gitignore` 忽略，不进 git、不进发布 zip（WXT 只打包 `.output/chrome-mv3/`），可放心生成。
