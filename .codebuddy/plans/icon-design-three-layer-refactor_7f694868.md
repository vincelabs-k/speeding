---
name: icon-design-three-layer-refactor
overview: 将 generate_brand_icon SKILL.md 的图标设计方案从随机构图重构为三层固定结构：【徽章基座 + 主题隐喻居中 + 插件标识中下】，保留品牌色与字体约束。
todos:
  - id: rewrite-skill-md
    content: 使用 [skill:skill-creator] 重写 SKILL.md：替换全局约束为三层布局结构（徽章底托 + 中图案 + 缩写标识），适配 5 条黄金法则到三层体系，新增缩写推导规则，重写 AI 提示词模板
    status: completed
  - id: verify-icon-generation
    content: 使用 [skill:generate_brand_icon] 生成图标验证新 SKILL.md 效果，确认三层结构输出正确
    status: completed
    dependencies:
      - rewrite-skill-md
---

## 产品概述
重构 `generate_brand_icon` SKILL.md 的图形设计方案，从当前"自由构图、硬直角扁平风"切换为三层结构化布局，提升图标的美感、辨识度和品牌一致性。

## 核心特性
- **三层固定布局**：底层徽章底托（Background Badge）+ 中层主题隐喻图案（Center Motif）+ 底层插件缩写标识（Bottom Label），彻底消除随机构图
- **徽章底托**：圆角盾牌形或圆角矩形，主色 #0071C5 填充，允许主色→加深色的微渐变营造立体感，轻量投影增加层次
- **主题隐喻中图案**：辅色 #00C7FD 描边/填充，居中置于底托之上，线条简洁确保 16px 缩放仍可辨识
- **缩写标识**：插件名缩写（1-4 个大写字母），Saira 风格几何无衬线字体并转为 SVG path，置于画布中下位置，白色填充作为视觉落点
- 配色（#0071C5 / #00C7FD）和字体风格（Saira 全大写）保持个人风格不变

## 技术方案

### 涉及文件
| 文件 | 操作 | 说明 |
|------|------|------|
| `C:\Users\Mrzha\.codebuddy\skills\generate_brand_icon\SKILL.md` | 重写 | 重构设计约束、黄金法则、提示词模板 |
| `d:/code/speeding/.gitignore` | 不变 | `.icon-tmp/` 已存在 |
| `d:/code/speeding/wxt.config.ts` | 不变 | icons 配置已就绪 |

### 三层结构化 SVG 模板

```
128×128 Canvas
+-- 16px margin (all sides) --+
|                               |
|   [Background Badge]          |  ~80×80px 圆角盾牌，主色渐变填充
|     +-- center region --+     |
|     |  [Center Motif]    |     |  主题图标，辅色描边/填充，居中
|     +--------------------+     |
|         [Bottom Label]         |  缩写 path，y≈85-95，白色填充
|                               |
|   (右下角 24×24 Badge 留空)    |
+-------------------------------+
```

### 实现方案

**1. 全局约束替换**
- 删除：硬直角 0px、4px 网格强制、禁止渐变阴影 等限制
- 新增：三层布局结构定义、每层位置/尺寸/配色规则

**2. 黄金法则适配**
- 比例体系：徽章底托与中心图案遵循 φ 比例（底托占画布 0.618，图案占底托 0.618）
- 间距层次：保持 φ 递减数列，底托外边距 16px，内边距 10px，图案到缩写 8px
- 圆角曲率：底托 6-8px 圆角（大元素微圆），图案内部线条 1-2px 锐度，缩写转 path 保留几何棱角
- 描边权重：底托 2px 描边，图案 2px 辅色描边，缩写无需描边
- 负空间平衡：三层叠加后正形占比约 38%，Badge 区预留 24×24 空白

**3. 缩写推导规则**
新增参数 `--abbreviation`：若未提供，从项目名自动推导——取每个单词首字母大写（如 Speeding → SP）；单字项目取前 2-3 个字母。

**4. AI 提示词模板重构**
从"规范 + 需求 + 微调"三段式改为结构化三层构图指令，明确每层的元素、位置、尺寸范围和配色规则。

### 执行流程（保持不变）
参数检查 → 目录创建 → SVG 生成 → 保存 → 切图（bun + sharp → .icon-tmp/） → Manifest 校验

## Agent Extensions
### Skill
- **skill-creator**
  - 用途：按照 skill 创建规范，重写 `generate_brand_icon` 的 SKILL.md，确保三层布局结构清晰、约束分级合理、AI 提示词可准确执行
  - 预期产出：完整的 SKILL.md 重写稿，包含三层布局定义、适配后的黄金法则、结构化 AI 提示词模板
