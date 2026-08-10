---
name: rate-button-and-stats
overview: 在 popup 底部添加"去应用商店评价"按钮，仅对周使用 3 次以上的重要用户展示；同时开发隐私安全的用户行为统计模块。
todos:
  - id: create-constants
    content: 创建 constants.ts：定义 isEdge()、EXTENSION_ID、getStoreUrl()
    status: pending
  - id: create-stats
    content: 创建 stats.ts 统计模块：实现 recordOpen、getWeeklyOpenCount、isQualifiedUser，自动裁剪 14 天旧数据
    status: pending
  - id: create-rating-button
    content: 创建 RatingButton.tsx 组件：记录使用、判断资格、渲染评分按钮
    status: pending
    dependencies:
      - create-constants
      - create-stats
  - id: integrate-app
    content: 在 App.tsx main 状态底部集成 RatingButton 组件
    status: pending
    dependencies:
      - create-rating-button
  - id: compliance-check
    content: 使用 [skill:extension_launch_checklist] 运行 MV3 合规自检，确保新增功能不影响商店审核
    status: pending
    dependencies:
      - integrate-app
---


## 用户需求

在 Speeding 扩展的 popup 主界面底部，新增一个"去应用商店评价"按钮。点击后根据当前浏览器类型，跳转到 Chrome Web Store 或 Edge Add-ons 的插件详情页。

按钮并非始终展示，仅当用户当周的 popup 打开次数达到 3 次及以上时，才显示该按钮——以此识别活跃/重要用户，避免对轻度使用者造成打扰。

为实现该能力，需配套开发一个**可扩展的用户行为统计模块**，记录用户的每日使用频次，并为后续统计其他行为指标预留接口。该模块严格遵循隐私安全原则：仅本地存储匿名计数，不采集任何个人身份信息、不联网传输。

## 核心功能

- **统计模块**：每次 popup 打开时自动记录当日使用次数，仅保留最近 14 天数据，使用 `chrome.storage.local` 独立存储（不跨设备同步）
- **重要用户识别**：计算当周（周一至周日）累计使用次数，>= 3 次判定为重要用户
- **评分按钮**：在 popup main 状态的 Custom 区域与底部说明文字之间展示，含星标图标和引导文案
- **浏览器区分**：运行时通过 UA 检测 Edge 浏览器，自动链接到对应商店；非 Edge 则默认走 Chrome Web Store
- **可扩展架构**：统计模块以独立工具文件形式存在，暴露通用 API 供将来添加其他行为统计



## 技术选型

- **语言/框架**：TypeScript + React 19 + WXT（沿用现有技术栈）
- **样式**：Tailwind CSS v4（与现有 popup 风格一致）
- **存储**：`chrome.storage.local`——仅本地，不同步，符合隐私要求
- **浏览器检测**：`navigator.userAgent` 运行时 UA 解析
- **扩展 ID 配置**：新建 `constants.ts` 集中管理商店 URL 和 ID

## 实现方案

### 1. 统计模块 (`entrypoints/utils/stats.ts`)

**设计原则**：极简、匿名、仅本地。与现有 storage.ts 风格一致。

**数据结构**：
```
UsageRecord: { date: string, count: number }  // date = "YYYY-MM-DD", count = 当日打开次数
```

**存储键**：`"usageStats"`，存入 `chrome.storage.local`（专属区域，不影响 sync 中的 speed 配置）。

**核心函数**：
- `recordOpen()`：获取今日日期 → 读取现有 records → 找到今日记录 count+1 或追加新记录 → 裁剪超出 14 天的旧数据 → 写入
- `getWeeklyOpenCount()`：读取 records → 计算当前日历周（周一为起点）内所有记录的 count 总和
- `isQualifiedUser()`：`getWeeklyOpenCount() >= 3`

**性能**：每次 popup 打开执行一次 async 读写（O(n)，n <= 14），数据量极小，无性能瓶颈。

### 2. 浏览器检测 + 商店 URL 常量 (`entrypoints/utils/constants.ts`)

```typescript
// Browser detection: checks UA for "Edg/" pattern
export const isEdge = (): boolean => navigator.userAgent.includes("Edg/");

// Extension IDs — update these after first store publication
export const EXTENSION_ID = "YOUR_EXTENSION_ID_PLACEHOLDER";

export const getStoreUrl = (): string => {
  if (isEdge()) {
    return `https://microsoftedge.microsoft.com/addons/detail/speeding/${EXTENSION_ID}`;
  }
  return `https://chromewebstore.google.com/detail/${EXTENSION_ID}/reviews`;
};
```

### 3. RatingButton 组件

在 App.tsx 中新增一个小组件（约 40 行），位于 custom 区域之后、说明文字之前。组件内部：

1. `useEffect` 调用 `recordOpen()` 记录本次打开
2. `useState` + `useEffect` 异步检查 `isQualifiedUser()`
3. 满足条件时渲染一个居中按钮，点击调用 `browser.tabs.create({ url: getStoreUrl() })`

**按钮样式**：轻量、不抢占视觉焦点，使用与现有 UI 一致的 sky 渐变 + 圆角 + hover 效果，外加一个小星星 SVG 图标。

### 4. App.tsx 改动

在 main 状态的 JSX 中，Custom 区域 `</div>` 与底部说明文字 `<p>` 之间，插入 `<RatingButton />`。

### 5. 隐私合规

- 仅存储 `date` + `count`，无用户标识
- 使用 `chrome.storage.local`，不参与 Chrome Sync
- 数据保留 14 天，自动清理过期记录
- 与 docs/PRIVACY.md 现有声明兼容，无需修改

## 目录结构

```
d:/code/speeding/
├── entrypoints/
│   ├── popup/
│   │   ├── App.tsx              # [MODIFY] 插入 RatingButton 组件调用
│   │   └── RatingButton.tsx     # [NEW] 评分按钮组件：打开时记录统计 → 判断是否展示 → 点击跳转商店
│   └── utils/
│       ├── storage.ts           # (不变，作为参考)
│       ├── stats.ts             # [NEW] 用户行为统计模块：recordOpen / getWeeklyOpenCount / isQualifiedUser
│       └── constants.ts         # [NEW] 扩展常量：isEdge / EXTENSION_ID / getStoreUrl
```

## 关键代码结构

### stats.ts 接口
```typescript
interface UsageRecord { date: string; count: number; }
declare function recordOpen(): Promise<void>;
declare function getWeeklyOpenCount(): Promise<number>;
declare function isQualifiedUser(): Promise<boolean>;
```

### constants.ts 接口
```typescript
declare function isEdge(): boolean;
declare const EXTENSION_ID: string;
declare function getStoreUrl(): string;
```

### RatingButton 组件逻辑流程
```
mounted → recordOpen() + check isQualifiedUser() → 
  true  → render button → onClick → tabs.create(storeUrl)
  false → render null
```


## Agent Extensions

### Skill
- **extension_launch_checklist**
  - 用途：实现完成后，检查新增代码是否影响 MV3 合规性（尤其是新增 storage usage 权限声明、隐私政策是否需要更新）
  - 预期结果：输出合规自检报告，确保评分按钮和统计模块不会导致商店审核被拒
