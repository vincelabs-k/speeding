---
name: speed-memory-feature
overview: 为 Speeding 扩展增加 per-domain 速度记忆功能（chrome.storage.sync + local 兜底），popup 增加 "This site / All sites" 模式切换。
todos:
  - id: add-storage-permission
    content: 在 wxt.config.ts 的 manifest.permissions 中新增 "storage"
    status: completed
  - id: create-storage-module
    content: 创建 entrypoints/utils/storage.ts，实现 sync+local 读写函数
    status: completed
  - id: update-speed-controller
    content: 修改 SpeedController 构造函数，支持可选初始速度参数
    status: completed
  - id: update-content-script
    content: 改造 content.ts：集成 storage 初始化逻辑，新增 SET_MODE 处理，扩展 GET_SPEED 响应
    status: completed
    dependencies:
      - add-storage-permission
      - create-storage-module
      - update-speed-controller
  - id: update-popup-ui
    content: 改造 App.tsx：新增 mode/domain 状态，新增 "This site / All sites" 切换组件，扩展 sendMessage 类型
    status: completed
    dependencies:
      - update-content-script
  - id: bump-and-build
    content: 版本号升至 1.0.2，build + zip 打包
    status: completed
    dependencies:
      - update-popup-ui
---

## 用户需求

为浏览器扩展增加视频播放速度记忆功能，核心包括：

- **站点独立记忆**：用户在每个网站上设置的播放速度会被单独记住，下次访问同一网站自动恢复
- **双模式切换**：提供 "This site"（当前网站独立记忆）和 "All sites"（所有网站共用同一速度）两种模式，默认 "This site"
- **跨设备云同步**：使用 `chrome.storage.sync` 主存储实现跟随账号同步，`chrome.storage.local` 兜底防超额
- **直观词汇**：模式切换标签用 "This site / All sites"，避免使用 "全局速度 / 网站速度" 这类技术化表述


## 技术栈

- 语言：TypeScript（严格模式）
- 框架：WXT + React 18
- 样式：Tailwind CSS v4（sky/cyan 浅蓝色系，沿用现有风格）
- 存储：`chrome.storage.sync`（主） + `chrome.storage.local`（兜底）
- 运行时：Chrome MV3（`browser.*` 命名空间）

## 实现方案

### 架构选择：Content Script 集中管理存储

所有 storage 读写放在 content script 中完成，理由：
- content script 知道当前 tab 的 `location.hostname`，无需通过 popup 传递
- popup 保持轻量，仅通过 message 通信
- 避免 popup 和 CS 之间的 storage 竞态

```
popup (UI)  ──tabs.sendMessage──>  content script (storage I/O)  ──>  chrome.storage.sync
                                                                    ──>  chrome.storage.local (fallback)
                                                                    ──>  SpeedController (DOM)
```

### 数据流

**打开 popup**：
1. Popup 发送 `GET_SPEED`
2. CS 读取 storage → 根据 `speedMode` 取对应速度
3. CS 返回 `{ speed, videoCount, speedMode, domain }`
4. Popup 渲染速度 + 模式开关

**调整速度**：
1. Popup 发送 `SET_SPEED { speed }`
2. CS 写入 storage（根据当前 mode 写入 `siteSpeeds[hostname]` 或 `globalSpeed`）
3. CS 应用到所有 `<video>` 元素
4. CS 返回 `{ success, speed }`

**切换模式**：
1. Popup 发送 `SET_MODE { mode }`
2. CS 写入 `speedMode` 到 storage
3. CS 读取新模式对应速度，应用到 video
4. CS 返回 `{ success, speed, speedMode }`
5. Popup 更新 UI

### Sync + Local 兜底策略

```ts
// 读：sync 优先，fallback local
async function readStorage<T>(keys: string[]): Promise<Record<string, T>> {
  const syncResult = await chrome.storage.sync.get(keys);
  // 检查有效值（排除空对象）
  const missing = keys.filter(k => syncResult[k] === undefined || syncResult[k] === null);
  if (missing.length === 0) return syncResult;
  const localResult = await chrome.storage.local.get(missing);
  return { ...localResult, ...syncResult };
}

// 写：sync 优先，quota exceeded → local
async function writeStorage(items: Record<string, unknown>): Promise<void> {
  try {
    await chrome.storage.sync.set(items);
  } catch {
    // quota exceeded → fallback to local
    await chrome.storage.local.set(items);
  }
}
```

### 消息协议

| 消息 | 方向 | Payload | 响应 |
|---|---|---|---|
| `GET_SPEED` | Popup → CS | `{}` | `{ speed, videoCount, speedMode, domain }` |
| `SET_SPEED` | Popup → CS | `{ speed }` | `{ success, speed }` |
| `SET_MODE` | Popup → CS | `{ mode }` | `{ success, speed, speedMode }` |

## 实现细节

### 文件改动清单

```
d:/code/speeding/
├── wxt.config.ts                          # [MODIFY] 新增 "storage" 权限
├── entrypoints/
│   ├── utils/
│   │   ├── storage.ts                     # [NEW] sync+local 存储抽象层
│   │   └── speed-controller.ts            # [MODIFY] 构造函数支持初始速度参数
│   ├── content.ts                         # [MODIFY] 新增 SET_MODE 处理，集成 storage
│   └── popup/
│       └── App.tsx                        # [MODIFY] 新增模式切换 UI，新状态字段
```

### 各文件详细说明

#### `wxt.config.ts` [MODIFY]
- `manifest.permissions` 从 `['activeTab']` 改为 `['activeTab', 'storage']`

#### `entrypoints/utils/storage.ts` [NEW]
**用途**：封装 chrome.storage.sync + local 的读写逻辑，提供统一接口。

**功能**：
- `getSpeedMode(): Promise<'this' | 'all'>` — 读取模式，默认 `'this'`
- `setSpeedMode(mode: 'this' | 'all'): Promise<void>` — 写入模式
- `getGlobalSpeed(): Promise<number>` — 读取全局速度，默认 1
- `setGlobalSpeed(speed: number): Promise<void>` — 写入全局速度
- `getSiteSpeed(hostname: string): Promise<number | null>` — 读取网站速度，无记录返回 null
- `setSiteSpeed(hostname: string, speed: number): Promise<void>` — 写入网站速度
- `getResolvedSpeed(hostname: string): Promise<number>` — 根据模式取最终速度：
  - 模式为 `'all'` → 返回 `globalSpeed`
  - 模式为 `'this'` → 返回 `siteSpeeds[hostname]`，若无记录返回 1（默认）

**实现要求**：
- 所有读操作：sync 优先，key 缺失/null 时回退 local
- 所有写操作：sync 优先，catch `chrome.runtime.lastError` 后写 local
- Storage key 使用常量：`GLOBAL_SPEED_KEY`、`MODE_KEY`、`SITE_SPEEDS_KEY`
- 函数式模块（不自建 class），导出具名函数

#### `entrypoints/utils/speed-controller.ts` [MODIFY]
**改动**：构造函数接受可选的初始速度参数。

**实现要求**：
- `constructor(initialSpeed?: number)` — 若传入则用传入值，否则默认 1.0
- `setSpeed()` 签名不变，内部逻辑不变
- 其余方法不变

#### `entrypoints/content.ts` [MODIFY]
**改动**：新增 SET_MODE 消息处理 + 集成 storage。

**实现要求**：
- 从 `location.hostname` 获取当前域名
- 初始化时：调用 storage 获取 `speedMode` 和对应速度，传入 `SpeedController` 构造函数
- `GET_SPEED` 响应增加 `speedMode` 和 `domain` 字段
- `SET_SPEED`：先调用 `controller.setSpeed()`，再调用 storage 写入（根据当前 mode 决定写 `globalSpeed` 或 `siteSpeeds[hostname]`）
- 新增 `SET_MODE`：写入 storage → 读取新模式速度 → `controller.setSpeed()` → 返回新速度
- 所有 storage 操作通过 `storage.ts` 导出的函数完成

#### `entrypoints/popup/App.tsx` [MODIFY]
**改动**：新增模式切换 UI，新增状态字段。

**实现要求**：
- 新增状态：`speedMode: 'this' | 'all'`、`domain: string`
- `GET_SPEED` 响应处理增加 `speedMode` 和 `domain` 字段的赋值
- 新增 `handleModeChange`：调用 `sendMessage('SET_MODE', undefined, mode)` → 更新 UI
- `sendMessage` 类型扩展为 `'GET_SPEED' | 'SET_SPEED' | 'SET_MODE'`
- UI 新增模式切换组件：位于 Header 下方、Slider 上方
- 模式切换组件设计：两个并排按钮，各自带图标和文字标签
  - 选中态：sky 渐变背景 + 白色文字 + 阴影
  - 未选中态：白底 + 边框 + slate 文字，hover 变浅蓝
  - "This site" 按钮 + "All sites" 按钮并排，等宽
  - site 模式选中时，在按钮下方显示当前域名（小号灰色文字）
- 模式切换按钮复用现有 preset 按钮的样式风格

### 性能考量
- storage 读写仅在用户操作时触发（打开 popup、调整速度、切换模式），非高频操作
- 无需缓存或节流
- `chrome.storage.sync` 读写是异步的，使用 async/await，不阻塞 UI

### 错误处理
- storage 读写失败不抛异常，静默降级（sync → local）
- 首次访问某网站且 `siteSpeeds` 无记录时，返回默认值 1
- Content script 未响应时（如非视频页面），popup 显示 no-video 状态

### 向后兼容
- 版本号升至 1.0.2（breaking: 新增 storage 权限）
- 旧用户升级后首次打开：storage 为空 → 默认 mode='this'，speed=1，无感知

