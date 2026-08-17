# Speeding Popup UI 设计基线

本文档是 popup 界面唯一的视觉事实源（single source of truth），所有视觉改动须与本基线对齐。适用于本扩展及后续插件矩阵的 UI 实现参考。

## 字体策略

- 使用**系统字体栈**，不打包任何 webfont（零版权风险、零加载成本）：
  ```css
  font-family: "Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif;
  ```
- 跨平台渲染差异是**有意的取舍**（Win→Segoe UI、macOS→SF、Linux→system-ui fallback），不追求像素级一致。
- **禁止**引入第三方 webfont（如 Google Fonts）：违反商店分发约束（外部资源不可变可执行/体积/CSP），且中文字体多为不可再分发许可。

## 色板（Tailwind 默认语义色，不自定义 hex）

| 用途 | Token | 说明 |
|---|---|---|
| 主按钮/激活态渐变 | `from-sky-500 to-sky-600` | bg-gradient-to-br，白字 |
| 徽章数字渐变 | `from-sky-600 to-cyan-600` | bg-clip-text text-transparent |
| 进度条渐变 | `from-sky-500 to-cyan-500` | range 滑杆填充 |
| 激活指示点 | `emerald-400` | 预设按钮右上角 2.5 圆点 |
| 中性色 | `slate-*`（50~800） | 文字/边框/背景均用 slate 系 |
| 加载动画 | `border-t-sky-500` | 旋转圈 |
| slider thumb | `#0EA5E9 → #38BDF8` 线性渐变 | 22px 圆形、3px 白边 |

## 字号阶梯（Token 化）

定义于 `entrypoints/popup/style.css` 的 `@theme`，JSX 中禁止再出现任意值字号（`text-[Npx]`）：

| 语义类 | 值 | 用途 |
|---|---|---|
| `text-display` | 28px | 速度徽章数字（bold） |
| `text-lg`（Tailwind 默认） | 18px | 标题 h1 |
| `text-body` | 13px | 预设按钮/输入框/Apply |
| `text-caption` | 12px | 模式切换/视频计数 |
| `text-sm`/`text-xs`（默认） | 14/12px | noVideo 文案 / RatingButton |
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

- 主按钮：`shadow-md shadow-sky-500/20`（预设激活 `shadow-sky-500/25`）；徽章 `shadow-lg shadow-sky-500/5`
- 动效统一 `duration-150`，交互缩放 `active:scale-[0.96/0.97]`，预设激活 `scale-[1.02]`
- slider thumb：hover `scale(1.15)`、active `scale(1.08)`，`transition: transform .15s, box-shadow .15s`

## 与旧 plan 的差异

- `popup-ui-redesign` 旧 plan 使用 **indigo** 配色基线，本扩展实际代码为 **sky/cyan** 体系，以本文档（实测）为准，勿混用 indigo。

## 组件清单（当前代码结构）

```
entrypoints/popup/
├── App.tsx            # 状态编排层（不做 UI 细节）
├── style.css          # @theme token + .speed-slider 组件样式
├── speed-model.ts     # 领域常量/数学函数（clamp/formatSpeed/对数刻度）
└── components/
    ├── LoadingView / NoVideoView   # 状态视图
    ├── SpeedBadge                  # 68px 速度徽章
    ├── SectionLabel                # 区块小标题
    ├── ModeToggle                  # 本页/全部站点
    ├── SpeedSlider                 # 对数刻度滑杆
    ├── PresetGrid                  # 预设按钮 4 列网格
    └── CustomInput                 # 自定义速度输入
```

## 后续插件矩阵复用建议

- 新插件先按本文档实现视觉，类名就地内联（Tailwind 主流形态），**不做**类名常量抽象（如 `ui.ts`）。
- 至少 2 个插件消费时：将 `@theme` token 抽为共享 CSS（构建期 `@import` 静态合并，零运行时成本）。
- 至少 3 个插件且按钮/toggle 真实重复时：再考虑 `bun workspaces` + 共享组件包。
