---
name: docs-sync-scene-presets
overview: 同步全部面向用户文档与场景预设特性（1.1.0 三 tab + 场景编辑 + 46 预置站点）一致：修正 STORE_LISTING.md / PRIVACY.md / README.md 的硬错误，补齐场景卖点文案与隐私数据披露，更新 PRIVACY 日期。
todos:
  - id: store-listing
    content: 用 [skill:store-listing-copywriter] 更新 STORE_LISTING.md：补场景卖点、改三模式 Key Features
    status: completed
  - id: privacy
    content: 更新 PRIVACY.md：三模式表述、补场景数据披露、日期改 2026-08-21
    status: completed
  - id: readme-index
    content: 更新 README.md 与 docs/index.md：补场景特性、修正示例速度与预置一致
    status: completed
---

## 用户需求
检查并修复项目文档/介绍与最后一次 git 提交（`d5de980`，1.1.0 场景预设特性）不一致之处，用户已确认「修全部」：修正 4 处硬错误（三 tab UI 矛盾、隐私数据披露不完整）、补齐场景预设差异化卖点（STORE_LISTING/README/index.md）、更新 PRIVACY 日期。

## 特性事实（修改基准）
- popup 三 tab：This site / Scenes / All sites
- 场景预设：内置 3 场景（课程 16×、追剧 1.25×、外语听力 0.75×），可增删改
- 站点场景绑定：46 个预置站点映射，用户显式绑定优先
- 无视频页模式切换兜底：popup 乐观切换 + 直写 storage
- 隐私数据新增：场景列表（name+speed）、站点→场景绑定（domain+sceneId）

## 核心功能
- 修正 STORE_LISTING.md、PRIVACY.md、README.md 中与三 tab 模式矛盾的模式表述
- PRIVACY.md 补全场景数据披露、更新日期至 2026-08-21
- 三处对外文档补场景预设卖点，保持事实准确（示例速度与预置映射一致）


## 技术方案
纯文档修改任务，不涉及代码、i18n、版本号或构建产物变更，无需构建与发布门禁。

### 修改内容与要点
1. **`docs/STORE_LISTING.md`**：
   - Short Description（≤132 字符）：加入场景预设卖点，如 `Set speed once, remembered per site. Scene presets for courses (16x), bingeing & listening. Pitch-preserving 0.5x–16x.`（保持字符数合规）
   - Detailed Description：新增场景预设段落（课程 16× / 追剧 1.25× / 外语听力 0.75×、可自定义场景、主流站点自动匹配场景）
   - Key Features：`"This site" / "All sites" mode` 改为三模式（This site / Scenes / All sites），补场景预设与站点自动匹配条目
2. **`docs/PRIVACY.md`**：
   - L12 Mode preference 改为三模式（"This site" / "Scenes" / "All sites"）
   - L35 storage 理由补全数据披露：场景列表（名称+倍速值）、站点→场景绑定（域名+场景 ID），仍声明仅本地/Chrome Sync、不含个人信息
   - L3 Last Updated 更新为 August 21, 2026
3. **`README.md`**：
   - Features 补场景预设条目，三模式表述
   - L5 示例改为与预置映射一致（如 YouTube 自动 0.75× 听力、Udemy 自动 16× 课程），避免误导
4. **`docs/index.md`**：介绍句补场景预设特性

### 约束
- 场景英文命名沿用现有 i18n 语义：Course study / Binge-watching / Listening practice
- 所有新增描述必须与 `speed-model.ts` 预置映射事实一致（YouTube→listening 0.75×、Udemy→course 16×）
- 不动代码、不动 `public/_locales`、不 bump 版本


## Agent Extensions
### Skill
- **store-listing-copywriter**
  - 用途：为 STORE_LISTING.md 撰写/润色场景预设卖点的 Short Description（≤132 字符）与 Detailed Description 场景段落，确保符合 Chrome Web Store / Edge Add-ons 文案规范
  - 预期结果：产出事实准确、突出差异化卖点、字符数合规的商店文案，并同步 Key Features 三模式表述
