---
description: >-
  生成符合品牌规范的浏览器插件图标，采用两层固定布局（徽章底托 + 标准中心图标），输出至 public/icon/，支持交互式参数输入。支持 5 种底托类型和 6 套配色方案，可跨项目复用。
---

## 参数定义

若调用时未提供 `--function`，必须暂停并询问用户。

| 参数 | 必填 | 说明 |
|------|------|------|
| `--function` | 是 | 插件核心功能（如：标签页管理、视频速度控制、OCR识别） |
| `--badge` | 否 | 徽章底托类型：`rounded-rect` / `circle` / `hexagon` / `shield` / `squircle`。不传则根据 `--function` 自动匹配 |
| `--color` | 否 | 配色方案：`brand` / `ocean` / `sunset` / `forest` / `midnight` / `slate`。不传则根据 `--function` 自动匹配 |

**优先级**：用户显式传参 > 根据 `--function` 自动匹配 > 默认值（`rounded-rect` + `ocean`）

## 徽章底托类型

| 类型 | SVG 要素 | 适用场景 | 选型关键词 |
|------|---------|---------|-----------|
| `rounded-rect` 圆角矩形 | `<rect rx="14">` 116×116 居中 | **通用默认**，适合大多数工具类插件 | 标签页管理、剪贴板、下载、书签、截图、计时器 |
| `circle` 圆形 | `<circle r="58">` 圆心 (64,64) | 社交通讯、即时消息、社区互动类 | 聊天、消息、社区、分享、评论、好友 |
| `hexagon` 六边形 | `<polygon>` 外接框 116×116，水平拉伸撑满边距 | 技术开发、工具链、工程类 | 代码、调试、API、命令行、开发工具、JSON |
| `shield` 盾形 | `<path>` 经典盾牌轮廓，底部弧线收窄 | 安全隐私、防护、广告拦截类 | 密码、加密、广告拦截、隐私、权限、防火墙 |
| `squircle` 大方角 | `<rect rx="30">` 超大圆角 116×116 | 现代化工具、创意设计、AI 类 | AI、设计、生成、编辑器、笔记、智能助手 |

**自动匹配规则**：从 `--function` 中提取关键词，按"选型关键词"列匹配，命中多个时取首次命中。无命中默认 `rounded-rect`。

## 配色方案

| 方案 | 主色 `primary` | 辅色 `accent` | 渐变终点 `gradient-end` | 适用场景 |
|------|---------------|---------------|------------------------|---------|
| `brand` | `#0EA5E9` | `#38BDF8` | `#0284C7` | **项目 UI 标准色**（popup 品牌色 token `brand-500/400/600`），与扩展界面、商店展示图同色系，新图标默认推荐 |
| `sunset` | `#E65100` | `#FF9100` | `#BF360C` | 创意、娱乐、媒体 |
| `forest` | `#2E7D32` | `#69F0AE` | `#1B5E20` | 效率、健康、环保 |
| `midnight` | `#4527A0` | `#B388FF` | `#311B92` | 技术、安全、深色模式 |
| `slate` | `#37474F` | `#90A4AE` | `#263238` | 极简、专业、文档 |

**自动匹配规则**：根据 `--badge` 类型匹配默认配色：
- `rounded-rect` → `ocean`
- `circle` → `sunset`
- `hexagon` → `forest`
- `shield` → `midnight`
- `squircle` → `slate`

若用户同时指定了 `--badge` 和 `--color`，以 `--color` 为准（解耦配色与形状）。

## 全局约束

- 输出：仅 SVG 代码。
- 画布：128×128，四周留 6px 安全边距；右下角 24×24 为 Chrome Badge 预留区（软约束：仅要求中心图标避开该区，底托可覆盖）。
- 布局：**固定两层结构**，禁止自由构图：

  **Layer 1 — 徽章底托（Background Badge）**
  根据 `--badge` 参数选择对应形状，主色填充 + 对角线渐变。占据画布主体约 90%~94%，为上层图标提供稳定视觉基座。

  **Layer 2 — 标准中心图标（Center Icon）**
  根据插件功能选择最常规、最通用、不会出错的图标。白色填充或辅色描边，严格居中于底托几何中心。线条简洁，确保 16px 缩放剪影可辨识。

- 所有渐变和投影通过 SVG `<linearGradient>` 和 `<filter>` 元素实现，禁止 CSS。
- 根元素必须包含 `xmlns="http://www.w3.org/2000/svg"`。

## 图标选型参考

根据 `--function` 选择最通用的标准图标，禁止隐喻和艺术化创作：

| 功能 | 标准图标 | 方向 |
|------|---------|------|
| 播放/视频/媒体 | ▶ 播放三角 | 三角形单箭头，尖头朝右 |
| 暂停 | ⏸ 暂停双竖线 | 两根平行竖线 |
| 标签页/窗口 | □ 方形层叠 | 2 个方形重叠 |
| 书签/收藏 | ☆ 星形 | 五角星 |
| 下载 | ↓ 下载箭头 | 竖线 + 底部横线 |
| 复制/剪贴板 | 文件重叠 | 两组矩形叠放 |
| 截图/相机 | 取景框 | L 形四角 |
| 翻译/文字 | 字母或地球 | 单个大写字母或简化地球 |
| 设置/工具 | ⚙ 齿轮 | 简化齿轮 |
| 搜索 | 🔍 放大镜 | 圆 + 斜线 |
| 锁/加密 | 🔒 锁定 | 锁体 + 锁钩 |
| 时钟/闹钟 | 圆形表盘 | 圆 + 指针 |
| 二维码/扫码 | 二维码简化 | 3×3 方块阵列 |
| AI/智能 | ⚡ 闪电 | 折线闪电形状 |
| 麦克风/录音 | 麦克风 | 椭圆 + 底座弧线 |
| 音量/音频 | 音量图标 | 三角形 + 弧线波纹 |
| 同步/刷新 | 🔄 循环箭头 | 两个弧形箭头 |
| 上传/分享 | ↑ 上传箭头 | 竖线 + 上方横线 |
| 排序/筛选 | 排序箭头 | 上下箭头 |
| 代码/脚本 | 尖括号 | `</>` 或 `{}` |
| 监控/统计 | 📊 柱状图 | 3 根不同高度的矩形 |

## 两层布局规格

### Layer 1: 徽章底托

**公共属性**（所有类型共享）：
- 填充渐变：
  ```svg
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="{{color_primary}}"/>
    <stop offset="100%" stop-color="{{color_gradient_end}}"/>
  </linearGradient>
  ```
- 描边：2px，颜色 `{{color_accent}}`，`stroke-linejoin="round"`
- 投影：`<filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.15"/></filter>`
- 占位约束：占画布 90%~94%，几何中心 (64, 64)

**各类型专属规格**：

| 类型 | SVG 模板 | 尺寸 | 特殊约束 |
|------|---------|------|---------|
| `rounded-rect` | `<rect x="6" y="6" width="116" height="116" rx="14" ry="14"/>` | 116×116 | y 轴可微调 ±2px 补偿视觉重心 |
| `circle` | `<circle cx="64" cy="64" r="58"/>` | φ116 | — |
| `hexagon` | `<polygon points="64,6 122,35 122,93 64,122 6,93 6,35"/>` | 116×116 | 顶点朝上，水平拉伸撑满 6px 边距框，`stroke-linejoin="round"` |
| `shield` | `<path d="M64 3 L122 25 L122 75 C122 111 93 125 64 125 C35 125 6 111 6 75 L6 25 Z"/>` | 116×122 | y 轴微调 -2px 补偿视觉重心 |
| `squircle` | `<rect x="6" y="6" width="116" height="116" rx="30" ry="30"/>` | 116×116 | — |

### Layer 2: 标准中心图标

| 属性 | 规格 |
|------|------|
| 位置 | 底托几何中心，x=64，y=64 |
| 尺寸 | 图标包围盒 ≤ 底托边长的 55%（约 60~64px） |
| 配色 | `#FFFFFF` 白色填充优先，辅色 `{{color_accent}}` 描边 2px |
| 描边 | 2px，`stroke-linejoin="round"`, `stroke-linecap="round"` |
| 剪影要求 | 16px 缩放下主要轮廓必须可辨识，禁止密集平行线或 <3px 间距的细节 |
| 风格 | 单纯几何化，单一图标元素，无隐喻无组合 |

## 黄金法则

1. **层级比例**：底托 ∝ 画布 × 0.906（~116px），图标 ∝ 底托 × 0.55（~64px）。避免图标过大挤压负空间。

2. **间距数列**：画布边距 6px → 底托内腔边距 12px。底托外到内形成呼吸节奏。

3. **圆角与拐角策略**：
   - `rounded-rect`：rx=14px（微圆营造亲和感）
   - `circle`：无需额外处理
   - `hexagon`：顶点处 `stroke-linejoin="round"` 柔化尖角
   - `shield`：底部弧线用贝塞尔曲线 `C` 平滑过渡，顶部折角 `stroke-linejoin="round"`
   - `squircle`：rx=30px（超大圆角，接近 iOS 图标的 superellipse 感觉）
   - 图标线条统一 `stroke-linejoin="round"`, `stroke-linecap="round"`

4. **描边权重**：底托 2px 边框分隔空间，图标 2px 描边定义形状。保持一致权重。

5. **负空间平衡**：两层叠加后图形总面积 ≈ 画布 × 82%。底托外围（6px 边距）仅占 ≈18% 负空间，视觉上撑满画布，确保工具栏缩放下可辨识。

## 设计动机（防止回归）

Chrome/Edge 工具栏以 16/32px 缩放**整个画布图片**、不做内容裁剪——透明边距在缩放后按同比例保留，因此画布边距直接决定图标视觉占比。实测：旧版 84×84 底托（22px 边距）在 16px 工具栏下图标仅剩 ~10.5px 视觉尺寸，而 116×116 底托（6px 边距）可保留 ~14.5px，与"撑满画布"的周边扩展观感一致。生成时必须遵守：

- 底托撑满画布主体（90%~94%），仅保留 4~6px 抗锯齿安全边距；
- 右下角 24×24 Badge 区由浏览器**动态叠加**数字徽标，无需预留整块空白，中心图标避开该区即可；
- 禁止为"呼吸感"或"安全区"放大边距——那正是图标显小的根因。

## 执行流程

1. **参数检查**：缺失 `--function` 则询问。`--badge` 和 `--color` 如未提供则根据 `--function` 自动匹配。
2. **图标选型**：根据 `--function` 查表确定标准图标。
3. **确定底托类型和配色**：根据参数或自动匹配规则确定。
4. **目录**：`mkdir -p public/icon/`
5. **生成 SVG**：基于两层布局规格 + 选定底托类型 + 配色方案生成完整 SVG。
6. **保存**：写入 `public/icon/icon.svg`
7. **切图**（使用 `.output/icongen/` 临时目录）：
   ```
   mkdir -p .output/icongen
   ```
   写入临时脚本 `.output/icongen/resize.ts`：
   ```ts
   import sharp from 'sharp';

   const sizes = [16, 32, 48, 96, 128];

   for (const size of sizes) {
     await sharp('public/icon/icon.svg', { density: 72 })
       .resize(size, size, {
         fit: 'contain',
         background: { r: 0, g: 0, b: 0, alpha: 0 },
       })
       .png()
       .toFile(`public/icon/${size}.png`);
   }
   ```
   执行：`bun run .output/icongen/resize.ts`
8. **Manifest 校验**：确认扩展 manifest 中 `icons` 包含 16/32/48/96/128 五档尺寸，路径格式 `icon/{size}.png`。

## AI 提示词模板

```
Generate a 128×128 browser extension SVG icon with strict TWO-LAYER layout.
Output only complete <svg> code with xmlns, viewBox="0 0 128 128".

Color scheme:
  - Primary: {{color_primary}}
  - Accent: {{color_accent}}
  - Gradient end: {{color_gradient_end}}

=== LAYER 1: Background Badge ===
- Badge type: {{badge_type}}
- Shape specification: {{badge_shape_spec}}
- Fill: linearGradient from {{color_primary}} to {{color_gradient_end}}, direction 135° (top-left to bottom-right)
- Stroke: 2px {{color_accent}}, stroke-linejoin="round"
- Filter: feDropShadow dy=2 stdDeviation=4 flood-opacity=0.15
- Keep 6px safety margin to canvas edges (badge must fill ~90% of canvas)

=== LAYER 2: Standard Center Icon ===
- Function: "{{function}}"
- Choose the MOST STANDARD, CONVENTIONAL icon from the lookup table.
- NO metaphors, NO creative interpretation, NO combined elements.
- Position: Exact center of badge (64, 64)
- Fill: #FFFFFF (preferred) or {{color_accent}}
- Stroke: 2px round-linejoin, round-linecap
- Icon bounding box ≤ 64×64px
- MUST be silhouette-readable at 16×16px scale — no dense lines or <3px gaps
- Single geometric element, simple and clean

=== GLOBAL RULES ===
- Canvas: 128×128, 6px margin; bottom-right 24×24 is the Chrome badge overlay zone — keep the center icon clear of it (the badge may cover it, do NOT reserve an empty block)
- All gradients and shadows via SVG <linearGradient> and <filter>, no CSS
- Ensure xmlns="http://www.w3.org/2000/svg" on root element
```

## 后置动作

打印：✅ Icon generated: `public/icon/{16,32,48,96,128}.png`

预览（按平台自动选择）：
- Windows: `start public/icon/16.png`
- macOS: `open public/icon/16.png`
- Linux: `xdg-open public/icon/16.png`
