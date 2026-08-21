# Speeding Popup UI 设计基线

本文档是 popup 界面唯一的视觉事实源（single source of truth），所有视觉改动须与本基线对齐。适用于本扩展及后续插件矩阵的 UI 实现参考。

## 字体策略

- 使用**系统字体栈**，不打包任何 webfont（零版权风险、零加载成本）：
  ```css
  font-family: "Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif;
  ```
- 跨平台渲染差异是**有意的取舍**（Win→Segoe UI、macOS→SF、Linux→system-ui fallback），不追求像素级一致。
- **禁止**引入第三方 webfont（如 Google Fonts）：违反商店分发约束（外部资源不可变可执行/体积/CSP），且中文字体多为不可再分发许可。

## 色板（brand token，SSOT 为 style.css @theme）

| 用途 | Token | 说明 |
|---|---|---|
| 主按钮/激活态渐变 | `from-brand-500 to-brand-600` | bg-gradient-to-br，白字 |
| 徽章数字渐变 | `from-brand-600 to-brand-400` | bg-clip-text text-transparent |
| 进度条渐变 | `from-brand-500 to-brand-400` | range 滑杆填充 |
| 激活指示点 | `emerald-400` | 预设按钮右上角 2.5 圆点 |
| 场景绑定指示点 | `emerald-300` | 场景卡片已绑定当前站点时左端圆点 |
| 中性色 | `slate-*`（50~800） | 文字/边框/背景均用 slate 系 |
| 加载动画 | `border-t-brand-500` | 旋转圈 |
| slider thumb | `var(--color-brand-500) → var(--color-brand-400)` 线性渐变 | 22px 圆形、3px 白边 |

## 字号阶梯（Token 化）

定义于 `entrypoints/popup/style.css` 的 `@theme`，JSX 中禁止再出现任意值字号（`text-[Npx]`）：

| 语义类 | 值 | 用途 |
|---|---|---|
| `text-display` | 28px | 速度徽章数字（bold） |
| `text-lg`（Tailwind 默认） | 18px | 标题 h1 |
| `text-body` | 13px | 预设按钮/输入框/Apply |
| `text-caption` | 12px | 模式切换/视频计数 |
| `text-sm`/`text-xs`（默认） | 14/12px | RatingButton |
| `text-hint` | 11px | 拖拽提示、noVideoHint |
| `text-micro` | 10px | 区块小标题/label/rangeStep/shortcutHint |

## 圆角

| 用途 | 值 |
|---|---|
| 卡片容器 | `rounded-xl`（12px） |
| 模式切换容器 | `rounded-lg` |
| 输入框/Apply/预设 | `rounded-lg` |
| 速度徽章/图标容器 | `rounded-2xl` |
| 激活指示点/加载圈 | `rounded-full` |

## 间距

- 外层固定宽 `w-[360px] bg-white`
- 区块水平 padding `px-5`；区块间 gap `pb-3`（最后区块 `pb-5`）
- header：`pt-5 pb-4`；模式切换与视频计数标题间距 `mt-0.5`
- 小标题与内容间距 `mb-2`；domain 提示 `mt-1.5`；hint 文案 `mt-1.5`/`mt-2`

## 阴影与动效

- 主按钮：`shadow-md shadow-brand-500/20`（预设激活 `shadow-brand-500/25`）；徽章 `shadow-lg shadow-brand-500/5`
- 动效统一 `duration-150`，交互缩放 `active:scale-[0.96/0.97]`，预设激活 `scale-[1.02]`
- slider thumb：hover `scale(1.15)`、active `scale(1.08)`，`transition: transform .15s, box-shadow .15s`

## 无视频横幅（NoVideoBanner）

- 触发条件：`videoCount === 0`（含 GET_SPEED 失败的无 content script 页面）；检测到视频后自动消失
- 位置：header 之下、ModeToggle 之上；外层容器 `px-5 pb-3`
- 视觉：`rounded-lg` 品牌渐变底 `bg-gradient-to-r from-brand-500 to-brand-600`，白字，`shadow-md shadow-brand-500/20`
- 内部结构：白色线条图标（strokeWidth 1.5）+ 主文案 `noVideo`（`text-body font-semibold`）→ 提示语 `noVideoHint`（`text-hint text-white/80`）→ 白色胶囊 CTA `noVideoCta`（`bg-white text-brand-600`，hover `bg-white/95`，`active:scale-[0.97]`）
- CTA 行为：`browser.tabs.create` 打开示例站点（YouTube），把无视频场景转化为体验入口
- 无视频时 header 隐藏视频计数副标题（避免 "0 videos detected" 矛盾文案），状态提示由横幅统一承担
- 无视频时速度控件保持可交互：SET_SPEED/SET_MODE 由后台持久化，打开视频后 `SpeedController` 自动应用预设置
- 无 content script 页面（chrome://、Web Store 等）模式切换兜底：popup 乐观切换 tab 并直写 storage（`setSpeedMode`），下次打开视频页自动应用

## 与旧 plan 的差异

- `popup-ui-redesign` 旧 plan 使用 **indigo** 配色基线，本扩展实际代码为 **sky/cyan** 体系，以本文档（实测）为准，勿混用 indigo。

## 组件清单（当前代码结构）

```
entrypoints/popup/
├── App.tsx            # 状态编排层（不做 UI 细节）
├── style.css          # @theme token + .speed-slider 组件样式
├── speed-model.ts     # 领域常量/数学函数 + Scene 类型/DEFAULT_SCENES/DEFAULT_SITE_SCENES
└── components/
    ├── LoadingView                 # 加载状态视图
    ├── NoVideoBanner               # 无视频醒目横幅（含「去 YouTube 试试」CTA）
    ├── SpeedBadge                  # 68px 速度徽章
    ├── SectionLabel                # 区块小标题
    ├── ModeToggle                  # 三 tab：本页/场景/全部站点（Scenes 居中）
    ├── SceneSection                # 场景区块：列表 + 添加/空态（编排）
    ├── SceneItem                   # 场景卡片：绑定高亮 + 悬停编辑/删除
    ├── SceneForm                   # 行内编辑表单（名称 + 倍速 + 保存/取消）
    ├── SpeedSlider                 # 对数刻度滑杆
    ├── PresetGrid                  # 预设按钮 4 列网格
    └── CustomInput                 # 自定义速度输入
```

## 场景区块（SceneSection）

- 触发条件：`speedMode === 'scenes'`，位于 ModeToggle 之下、SpeedSlider 之上，`px-5 pb-3`
- 场景卡片：横向布局（左端指示点 + 场景名 + 倍速徽章），已绑定当前站点 → brand 渐变底 + 白字 + `shadow-md shadow-brand-500/20`；未绑定 → `bg-white/80` + hover `bg-brand-50/40`
- 编辑/删除图标：`opacity-0 group-hover:opacity-100`（hover/键盘 focus 浮现），删除 hover 转 `text-red-500`
- 「添加场景」：虚线边框胶囊按钮（`border-dashed border-slate-300`）
- 行内表单：两栏输入（名称 + 倍速 0.5–16），Enter 保存 / Esc 取消，名称非空才允许保存
- 场景名解析：内置场景（`builtin: true`）name 为 i18n key，经 `browser.i18n.getMessage` 解析；用户改名后 `builtin: false` 存自由文本
- 编辑即生效：scenes 模式下编辑当前绑定场景的倍速并保存 → content 重解析并应用新速度，滑块/徽章/自定义输入同步

## 后续插件矩阵复用建议

- 新插件先按本文档实现视觉，类名就地内联（Tailwind 主流形态），**不做**类名常量抽象（如 `ui.ts`）。
- 至少 2 个插件消费时：将 `@theme` token 抽为共享 CSS（构建期 `@import` 静态合并，零运行时成本）。
- 至少 3 个插件且按钮/toggle 真实重复时：再考虑 `bun workspaces` + 共享组件包。
