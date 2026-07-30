---
name: fix-icon-resize-and-regenerate
overview: 修复 generate_brand_icon skill 的切图脚本逻辑（trim+extend 导致分辨率 136×136 而非 128×128），并重新生成快速播放（双三角）图标 PNG。
todos:
  - id: fix-skill-resize-script
    content: 修改 SKILL.md step 7 的 resize 脚本：去掉 trim+extend 逻辑，替换为直接 sharp 渲染方案
    status: completed
  - id: regenerate-png-icons
    content: 使用修复后的脚本重新生成 public/icon/ 下 5 档 PNG（16/32/48/96/128）
    status: completed
    dependencies:
      - fix-skill-resize-script
  - id: verify-icon-sizes
    content: 验证所有 PNG 尺寸正确（128.png 应为 128x128）
    status: completed
    dependencies:
      - regenerate-png-icons
---

## 用户需求
修复 `generate_brand_icon` skill 中 resize 脚本的尺寸偏差问题，并用正确的脚本重新生成 5 档 PNG 图标切图。

## 核心功能
- 修改 SKILL.md 中 step 7 的 resize 脚本，去掉 `trim()` + `extend()` 逻辑，改为直接渲染 SVG 到目标尺寸
- 使用修复后的脚本重新生成 `public/icon/{16,32,48,96,128}.png`

## 技术方案

### 问题根因
SKILL.md step 7 的 resize 脚本先用 `sharp.trim({ threshold: 10 })` 裁切 SVG 透明区域，再用 `extend()` 加回 4% padding，最后 `resize(s, s)`。但 `trim threshold=10` 无法处理 SVG 中的半透明像素（如 shadow filter 边缘），导致 trim 尺寸不准（如 126×126），加 padding 后变成 136×136。

### 修复方案
直接让 sharp 从 SVG 按目标尺寸渲染，利用 SVG 自身的 `viewBox="0 0 128 128"` 提供的正确边距：

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

关键改进：
- 去掉 `trim()` → 避免半透明像素干扰
- 去掉 `extend()` → SVG 已内置 16px 边距
- `forEach(async)` → `for...of await` → 确保所有尺寸生成完毕后脚本才退出
- `fit: 'contain'` → 保持 SVG 宽高比，透明背景填充

### 当前 SVG 状态
`public/icon/icon.svg` 已是正确版本：
- `viewBox="0 0 128 128"`
- Layer 1: rounded-rect 底托 `x=22 y=22 width=84 height=84`，ocean 配色渐变
- Layer 2: 双三角快进图标，辅色 `#00C7FD` 填充

## Agent Extensions
### Skill
- **generate_brand_icon**
  - Purpose: 修改该 skill 的 SKILL.md 中 step 7 resize 脚本逻辑
  - Expected outcome: SKILL.md step 7 的 resize 脚本替换为直接渲染方案，后续使用该 skill 时不会再出现尺寸偏差
