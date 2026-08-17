---
name: 品牌色 token 化与 generate_store_image skill
overview: 两阶段实施：阶段一 B 方案——在 entrypoints/popup/style.css 的 @theme 中建立品牌色 token（--color-brand-*），替换 8 个组件中的 sky-*/cyan-* 类名，并同步 generate_brand_icon 配色表；阶段二 A 方案——新建 generate_store_image skill（默认 brand 配色），一键生成 Chrome Web Store 商店展示图 PNG。
todos:
  - id: brand-token
    content: 在 style.css 的 @theme 新增 brand-50~700 与 surface 颜色 token，并将 body 背景与滑块渐变改为 var() 引用
    status: completed
  - id: replace-classnames
    content: 替换 8 个 popup 组件的 sky-*/cyan-* 类名为 brand-* 对应色阶，保持透明度/hover/focus 变体原样迁移
    status: completed
    dependencies:
      - brand-token
  - id: sync-icon-skill
    content: 用 [skill:generate_brand_icon] 规范在 generate_brand_icon/SKILL.md 配色方案表新增第 6 套 brand 方案（#0EA5E9/#38BDF8/#0284C7），不动现有 5 套
    status: completed
  - id: verify-build
    content: 运行 bun run compile 与 bun run build 验证 token 化无 TS 错误且样式类名正常生成
    status: completed
    dependencies:
      - brand-token
      - replace-classnames
  - id: create-store-spec
    content: 用 [skill:skill-creator] 规范创建 generate_store_image/references/store-spec.md：CWS 四档尺寸表、6 套配色表（含 brand）、布局比例系数表、字体约束、示例描述
    status: completed
    dependencies:
      - brand-token
      - sync-icon-skill
  - id: create-render-script
    content: 创建 generate_store_image/scripts/render_store_image.ts：遍历 .output/store-image/svg/ 下 WxH.svg 渲染同尺寸 PNG 并校验像素尺寸
    status: completed
    dependencies:
      - create-store-spec
  - id: create-skill-main
    content: 创建 generate_store_image/SKILL.md 主文件：参数表、三层布局规格、执行流程、AI 提示词模板、后置动作
    status: completed
    dependencies:
      - create-store-spec
      - create-render-script
---

## 产品概述
两阶段实施：

**阶段一（B 方案）：规范化项目品牌色 token**
- 项目当前无统一品牌色 token（仅 1 处 @theme 定义字号，颜色以 Tailwind 默认 sky-*/cyan-* 类名 + style.css 硬编码 hex 散落分布）
- 在 `entrypoints/popup/style.css` 的 `@theme` 中新增 `brand-*` 色阶 token 与 `surface`，颜色值与 UI 现状完全一致（视觉零变化），随后批量替换 8 个组件中的 sky-*/cyan-* 类名
- 同步给 `generate_brand_icon` 新增 `brand` 配色方案，使 icon / UI / 商店图三处同源

**阶段二：create generate_store_image skill**
- 新建 `generate_store_image` skill，按 Chrome Web Store 官方尺寸批量生成商店展示图（Apple/Intel 广告式极简风格）：纯色/微渐变背景铺满 + 左上角 logo + 居中粗大产品名 + 一行极简介绍
- 支持两个投放场景：Screenshot 轮播首图（1280×800）与 Promotional Image（440×280、920×680、1400×560）
- 默认使用阶段一定义的 `brand` 品牌色，保证与插件 UI 同色系；仅输出 PNG，SVG 仅作内存中间产物

## 核心功能
- 品牌色 token：`--color-brand-50~700` + `--color-surface`，类名 `bg-brand-500` / `from-brand-500` / `text-brand-400` 等直接可用
- 组件类名替换：8 个 popup 组件中 sky-*/cyan-* 全部替换为 brand-* 对应色阶（色值不变，视觉无回归）
- skill 参数化：`--title`（必填）/ `--tagline` / `--logo`（默认 `public/icon/icon.svg`）/ `--color`（默认 brand）/ `--size`（screenshot / promo-small / promo-large / marquee / all / 自定义 WxH）/ `--align`（center / left）
- 布局固定三层（背景 / logo / 文字组），全部尺寸按画布比例推导，禁止自由构图


## 技术栈
- 阶段一：Tailwind CSS v4 `@theme` token 机制（无 tailwind.config，颜色 token 走 CSS 变量），Bun 包管理器
- 阶段二：复用现有依赖 `sharp ^0.35.3`（SVG→PNG 渲染），skill 形态为 SKILL.md + references/ + scripts/，遵循 skill-creator 规范，`generate_` 前缀与既有 skill 归组，自包含不互相引用
- 无新增依赖，不触碰 manifest / 构建链 / entrypoints 结构

## 实现方案
### 阶段一：品牌色 token 规范化
**1. style.css @theme 新增 token**（Tailwind v4 自动生成对应类名）：

```css
@theme {
  --color-brand-50:  #F0F9FF;   /* sky-50  */
  --color-brand-100: #E0F2FE;   /* sky-100 */
  --color-brand-200: #BAE6FD;   /* sky-200 */
  --color-brand-300: #7DD3FC;   /* sky-300 */
  --color-brand-400: #38BDF8;   /* sky-400 */
  --color-brand-500: #0EA5E9;   /* sky-500 */
  --color-brand-600: #0284C7;   /* sky-600 */
  --color-brand-700: #0369A1;   /* sky-700 */
  --color-surface:   #F8FAFC;   /* body 背景 */
}
```

**2. 替换映射**（sky-* 对阶替换，cyan-* 按语义映射，色值不变）：
- `from-sky-500 to-sky-600` → `from-brand-500 to-brand-600`
- `text-sky-400/600` → `text-brand-400/600`
- `hover:border-sky-200/300` → `hover:border-brand-200/300`
- `hover:bg-sky-50` / `bg-sky-50` → `hover:bg-brand-50` / `bg-brand-50`
- `from-sky-50 via-white to-cyan-50` → `from-brand-50 via-white to-brand-100`
- `from-sky-600 to-cyan-600`（SpeedBadge 文字渐变）→ `from-brand-600 to-brand-400`
- `from-sky-500 to-cyan-500`（SpeedSlider 轨道）→ `from-brand-500 to-brand-400`
- `ring-sky-400/40` → `ring-brand-400/40`；`shadow-sky-500/20` → `shadow-brand-500/20`；`border-t-sky-500` → `border-t-brand-500`
- style.css 硬编码：body 背景 → `var(--color-surface)`；滑块渐变 → `var(--color-brand-500), var(--color-brand-400)`；rgba 阴影（透明度变体）保留字面量，避免过度设计
- slate-* 中性色不替换

**3. generate_brand_icon 同步**：SKILL.md 配色方案表新增第 6 套 `brand`（primary #0EA5E9 / accent #38BDF8 / gradient-end #0284C7），标注为项目 UI 标准色、新图标默认推荐；不动现有 5 套色值（兼容已生成 public/icon/*），本次不重生成图标

### 阶段二：generate_store_image skill
**职责分工**（借鉴 generate_brand_icon 五段式骨架）：
- **SKILL.md**：AI 编排层。解析参数 → 确定尺寸列表与配色 → 按 store-spec.md 布局系数为每个尺寸拼 SVG（内存字符串）→ 写入 `.output/store-image/svg/` → 调用 scripts 渲染 → 校验并输出产物路径
- **references/store-spec.md**：静态规范数据（CWS 尺寸表 / 6 套配色表含 brand / 布局比例系数 / 字体约束），SKILL.md 查表引用，保持轻量
- **scripts/render_store_image.ts**：`bun run` 执行，入参 `--svg-dir <目录> --out <目录>`，遍历 `WxH.svg` 用 `sharp(svg).png()` 渲染同尺寸 PNG，校验像素尺寸后打印清单

**布局规格**（三层固定，相对画布 H 推导）：
| 层 | 内容 | 比例系数 |
|---|---|---|
| L1 背景 | 135° 对角线渐变 primary→gradient-end（同 brand 图标底托渐变）铺满 | 100% |
| L2 logo | 左上角：左边距 = W×4%，上边距 = H×6%；等比缩放高 = 0.16H；省略则跳过 | 0.16H |
| L3 文字组 | 标题 weight 800 字号 0.16H；副标题字号 0.06H；间距 0.8×标题字号；水平居中（--align=left 切换左对齐） | 0.16H / 0.06H |

**关键执行细节**：
- logo 转 base64 data URI 内嵌进 SVG（规避相对路径/跨盘，librsvg 兼容）；SVG 仅内存拼接 + 落盘 .output/store-image/svg/ 作中间产物
- 字体：英文 sans-serif 栈 `'Helvetica Neue', Arial, sans-serif`；SKILL.md 注明中文需 Noto Sans CJK
- 多尺寸一致性：每尺寸独立生成 SVG（viewBox = 目标 WxH），字号/边距按系数推导，避免单 SVG resize 比例失真（1280×800 与 440×280 宽高比不同）
- 产物目录 `.output/store-image/`（.gitignore 已忽略 .output/，不进 git；WXT zip 只打 .output/chrome-mv3/，不进发布包）
- 默认 `--color=brand`、`--size=screenshot`，`--size=all` 一次产出全部 4 个官方尺寸

## 实施注意
- 替换类名后必须跑 `bun run compile`（tsc --noEmit）确认 TS 无错；Tailwind v4 类名由 @theme 自动生成，无需额外配置
- 替换时保持每处类名的透明度变体（/40 /60 /15 /20 /25 /5）、hover/focus 前缀原样迁移，避免视觉回归
- skill 三文件命名与结构严格对齐 skill-creator 规范；配色表在 store-spec.md 完整复制（skill 自包含约束）

## 架构设计
无系统级架构变更。阶段一仅改动 popup 样式层（token 定义 + 类名替换，色值不变零回归）；阶段二新增内容全部位于 `.codebuddy/skills/` 下，与现有 5 个 project 级 skill 平级，保持 `generate_` 命名前缀归组。

## 目录结构
```
d:/code/speeding/
├── entrypoints/
│   └── popup/
│       ├── style.css                    # [MODIFY] @theme 新增 --color-brand-50~700 + --color-surface；body 背景与滑块渐变改 var() 引用
│       ├── RatingButton.tsx             # [MODIFY] hover:bg-sky-50/hover:border-sky-300/hover:text-sky-600 → brand-* 对应
│       └── components/
│           ├── SpeedSlider.tsx          # [MODIFY] from-sky-500 to-cyan-500 → from-brand-500 to-brand-400
│           ├── NoVideoView.tsx          # [MODIFY] bg-sky-50 / text-sky-400 → bg-brand-50 / text-brand-400
│           ├── SpeedBadge.tsx           # [MODIFY] 渐变/边框/阴影/文字渐变 4 处 sky/cyan → brand-*
│           ├── ModeToggle.tsx           # [MODIFY] ring/渐变/阴影/hover 4 处 sky → brand-*
│           ├── PresetGrid.tsx           # [MODIFY] ring/渐变/阴影/hover 4 处 sky → brand-*
│           ├── LoadingView.tsx          # [MODIFY] border-t-sky-500 → border-t-brand-500
│           └── CustomInput.tsx          # [MODIFY] focus 边框/ring/渐变/hover/阴影 6 处 sky → brand-*
├── .codebuddy/
│   └── skills/
│       ├── generate_brand_icon/
│       │   └── SKILL.md                 # [MODIFY] 配色方案表新增第 6 套 brand（#0EA5E9/#38BDF8/#0284C7）
│       └── generate_store_image/        # [NEW] 新建 skill 目录
│           ├── SKILL.md                 # [NEW] 主流程：参数表 + 三层布局规格 + 执行流程 + AI 提示词模板 + 后置动作
│           ├── references/
│           │   └── store-spec.md        # [NEW] CWS 四档尺寸表 + 6 套配色表 + 布局比例系数表 + 字体约束 + 示例描述
│           └── scripts/
│               └── render_store_image.ts # [NEW] sharp 批量渲染脚本：--svg-dir → 同尺寸 PNG + 像素校验
```

## 关键代码结构
**阶段一 token 定义**（style.css @theme，接口级）：
```css
@theme {
  /* 现有字号 token 保留不变 */
  --color-brand-50:  #F0F9FF;
  --color-brand-100: #E0F2FE;
  --color-brand-200: #BAE6FD;
  --color-brand-300: #7DD3FC;
  --color-brand-400: #38BDF8;
  --color-brand-500: #0EA5E9;
  --color-brand-600: #0284C7;
  --color-brand-700: #0369A1;
  --color-surface:   #F8FAFC;
}
```

**阶段二渲染脚本入参**（render_store_image.ts，接口级）：
```ts
// 用法: bun run scripts/render_store_image.ts --svg-dir <dir> --out <dir>
// 遍历 <svg-dir> 下所有 WxH.svg（viewBox=目标尺寸），sharp 渲染为 <out>/WxH.png
// 校验输出 PNG 像素尺寸与文件名一致，打印 PASS/FAIL 清单
```


## Agent Extensions
### Skill
- **skill-creator**
  - 用途：按 CodeBuddy skill 规范（frontmatter、references/scripts 结构、allowed-tools）创建 `generate_store_image` 的 SKILL.md 与目录骨架，确保新 skill 符合平台扫描与触发机制
  - 预期结果：SKILL.md frontmatter（name/description）、五段式主体结构与现有 skill 规范一致，可被正常识别与触发
- **generate_brand_icon**
  - 用途：读取其 SKILL.md 配色方案表结构，同步新增 `brand` 第 6 套配色，保证 icon 与 UI/skill 色系同源
  - 预期结果：generate_brand_icon 配色表含 brand 方案，且不影响现有 5 套与已生成图标产物
