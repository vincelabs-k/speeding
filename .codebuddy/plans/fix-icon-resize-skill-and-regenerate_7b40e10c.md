---
name: fix-icon-resize-skill-and-regenerate
overview: 修改 generate_brand_icon skill 的 resize 步（加入 trim+extend），再引用 skill 重新生成项目图标。
todos:
  - id: modify-skill-resize
    content: 修改 SKILL.md 第 155-166 行 resize 脚本，加入 trim + extend 逻辑
    status: completed
  - id: regen-icon
    content: 使用 [skill:generate_brand_icon] 以参数 --function="视频速度控制" --badge=rounded-rect --color=ocean 重新生成图标
    status: completed
    dependencies:
      - modify-skill-resize
---

## 修改目标
修复 `generate_brand_icon` skill 中 resize 步骤的缺陷：原始 resize 脚本直接缩放整张 128×128 SVG 画布（含大量透明边距），导致 16/32px 小尺寸图标中实际内容占比过小，浏览器 toolbar 显示偏小一号。

## 修改范围
1. 修改 `SKILL.md` 第 155-166 行 resize 脚本，加入 `sharp.trim()` 裁剪透明区域 + `extend()` 补回安全 padding
2. 用更新后的 skill 为当前项目重新生成图标（参数：`--function="视频速度控制" --badge=rounded-rect --color=ocean`）


## 技术方案

### Skill 提示词修改
修改 `C:\Users\Mrzha\.codebuddy\skills\generate_brand_icon\SKILL.md` 第 159-165 行的 resize 脚本：

```ts
import sharp from 'sharp';

[16, 32, 48, 96, 128].forEach(async (s) => {
  const trimmed = await sharp('public/icon/icon.svg').trim(10).png().toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const pad = Math.round(Math.max(width!, height!) * 0.04); // 4% padding
  await sharp(trimmed)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(s, s)
    .png()
    .toFile(`public/icon/${s}.png`);
});
```

**关键改动**：
- `trim(10)`：裁剪透明边距，tolerance=10 防止毛边遗漏
- `extend()`：补回 4% 安全 padding，避免图标边缘紧贴画布导致抗锯齿残缺
- `resize(s, s)`：内容区域撑满目标尺寸

### 图标重新生成
使用 [skill:generate_brand_icon] 重新执行完整流程（SVG 生成 + resize 输出），参数沿用当前项目配置。

### 影响范围
- `SKILL.md`：skill 提示词层面，一劳永逸，后续所有项目受益
- `public/icon/`：当前项目 6 个文件全部覆盖更新


## 使用的 Agent Extensions

### Skill
- **generate_brand_icon**
  - 用途：按当前项目参数（`--function="视频速度控制" --badge=rounded-rect --color=ocean`）重新生成完整图标集
  - 预期结果：生成 16/32/48/96/128 五档 PNG，内容撑满画布，toolbar 显示正常大小
