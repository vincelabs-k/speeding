---
name: generate_store_image 商店展示图 skill
overview: 新建 .codebuddy/skills/generate_store_image/ skill，按 Chrome Web Store 官方尺寸一键生成商店展示图（promotional + screenshot 轮播首图），风格为纯色背景 + logo + 粗大产品名 + 极简副标题，复用 generate_brand_icon 配色方案与 public/icon/ 产物，输出 PNG。
todos:
  - id: create-references
    content: 用 [skill:skill-creator] 规范创建 references/store-spec.md：CWS 四档官方尺寸表、5 套配色表（复制 generate_brand_icon 色值）、布局比例系数表、字体栈与语言约束、示例输出描述
    status: pending
  - id: create-render-script
    content: 创建 scripts/render_store_image.ts：sharp 批量渲染脚本，遍历 .output/store-image/svg/ 下 WxH.svg 输出同尺寸 PNG 并校验像素尺寸
    status: pending
    dependencies:
      - create-references
  - id: create-skill-main
    content: 创建 SKILL.md 主文件：参数表（title 必填/tagline/logo/color/size/align）、三层布局规格、执行流程（拼 SVG→调脚本→校验）、AI 提示词模板、后置动作
    status: pending
    dependencies:
      - create-references
      - create-render-script
---

## 产品概述
创建一个名为 `generate_store_image` 的图片生成 skill，用于批量生成 Chrome Web Store 商店展示图（专业术语：**Promotional Screenshot / Feature Graphic**，Apple/Intel 广告式极简风格）。图片结构为：简洁纯色（或轻微渐变）背景铺满画布 + 左上角 logo + 居中的粗大产品名 + 一行稍小但醒目的极简介绍。

## 核心功能
- 支持两个投放场景，一次生成多个官方尺寸：
  - **Screenshot（轮播图第一张）**：1280×800
  - **Promotional Image（related 位置展示图）**：440×280、920×680、1400×560（marquee）
- 参数化输入：`--title`（产品名，必填）、`--tagline`（一行极简介绍，可省略）、`--logo`（复用 `generate_brand_icon` 产物，默认读 `public/icon/icon.svg`）、`--color`（5 套既有配色）、`--size`（尺寸预设或自定义 WxH）
- 产出形式：**仅 PNG**，SVG 仅作内存中间产物不落盘
- 文案以英文为主，使用系统 sans-serif 字体栈，无需中文字体检查
- 布局固定三层（背景 / logo / 文字组），全部尺寸由画布按比例推导，禁止自由构图


## 技术栈
- 复用现有依赖：`sharp ^0.35.3`（SVG→PNG 渲染），包管理器 Bun，无新增依赖
- Skill 形态：纯 SKILL.md 编排 + `references/` 规范数据 + `scripts/` 渲染脚本，与 `generate_brand_icon` 的 `generate_` 前缀归组

## 实现方案
### Skill 目录结构（新建）
```
.codebuddy/skills/generate_store_image/
├── SKILL.md                      # [NEW] 主流程：参数表 + 三层布局规格 + 执行流程 + AI 提示词模板 + 后置动作
├── references/
│   └── store-spec.md             # [NEW] CWS 官方尺寸表、5 套配色表、布局比例系数表、字体约束、示例描述
└── scripts/
    └── render_store_image.ts     # [NEW] sharp 批量渲染脚本：SVG 目录 → 多尺寸 PNG
```

### 职责分工（借鉴 generate_brand_icon 五段式骨架）
- **SKILL.md**：AI 编排层。解析参数 → 确定尺寸列表与配色 → 按 store-spec.md 的布局系数为每个尺寸拼 SVG（内存字符串）→ 写入 `.output/store-image/svg/` → 调用 scripts 渲染 → 校验并输出产物路径。
- **references/store-spec.md**：静态规范数据，SKILL.md 通过查表引用（尺寸/配色/字号系数），保持 SKILL.md 轻量，符合 skill-creator 规范。
- **scripts/render_store_image.ts**：`bun run` 直接执行。入参 `--svg-dir <目录> --out <目录>`，遍历目录下每个 `WxH.svg`（viewBox 即目标尺寸），用 `sharp(svg).png()` 原样渲染为对应 PNG，校验输出像素尺寸后打印清单。SVG 留在 `.output/store-image/`（不入版本库），交付物仅 PNG。

### 布局规格（三层固定，全尺寸按比例推导）
| 层 | 内容 | 比例系数（相对画布 H） |
|---|---|---|
| L1 背景 | 主色纯色铺满，叠加 135° 对角线渐变（primary → gradient-end，同品牌图标底托渐变，保证视觉一致） | 100% |
| L2 logo | 左上角定位：左边距 = 宽×4%，上边距 = 高×6%；等比缩放，高度 = 高×0.16；`--logo` 省略则跳过 | 0.16H |
| L3 文字组 | 水平居中（`--align=left` 可切换 Apple/Intel 左对齐）；产品名粗体 weight 800，字号 = 0.16H；副标题其下，字号 = 0.06H，间距 = 0.8×标题字号 | 0.16H / 0.06H |

### 关键执行细节
- **logo 内嵌**：logo 文件（SVG/PNG）先转 base64 data URI 内嵌进 SVG 模板，规避相对路径与跨盘问题，与 sharp librsvg 渲染兼容。
- **字体**：英文为主，SVG `font-family` 用通用栈 `'Helvetica Neue', Arial, sans-serif`，librsvg 自动 fallback 系统字体，无需 `fc-list` 前置检查；SKILL.md 注明中文需安装 Noto Sans CJK 并显式声明字体栈。
- **多尺寸一致性**：每个尺寸的 SVG 独立生成（viewBox = 目标 WxH），字号/边距按系数推导，避免单 SVG resize 造成的比例失真（如 1280×800 与 440×280 宽高比不同）。
- **参数默认**：`--color` 默认 ocean；`--size` 默认 screenshot，支持 `all` 一次产出全部 4 个官方尺寸（贴合"related 展示 + 轮播图"同时投放场景）。
- **产物目录**：`.output/store-image/`（SVG 中间产物 + PNG 交付物），与 `.output/icongen/` 惯例一致，不入版本库。

## 架构说明
无系统级架构变更（不触碰 entrypoints/、manifest、构建链）。新增内容全部位于 `.codebuddy/skills/` 下，与现有 5 个 project 级 skill 平级，保持 `generate_` 命名前缀归组。skill 自包含，不互相引用（遵循既有约束），配色表在 store-spec.md 中完整复制，不依赖 generate_brand_icon 的 SKILL.md。


## Agent Extensions
### Skill
- **skill-creator**
  - 用途：按 CodeBuddy skill 规范（frontmatter、references/scripts 结构、allowed-tools）创建 `generate_store_image` 的 SKILL.md 与目录骨架，确保新 skill 符合平台扫描与触发机制。
  - 预期结果：SKILL.md frontmatter（name/description）、五段式主体结构与现有 skill 规范一致，可被正常识别与触发。
