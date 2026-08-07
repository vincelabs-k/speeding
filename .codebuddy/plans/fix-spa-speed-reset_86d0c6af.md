---
name: fix-spa-speed-reset
overview: 在 speed-controller.ts 中为每个 video 添加 ratechange 事件监听，对抗 SPA 导航时播放器对 playbackRate 的重置，同时清理 destroy 时的监听器防止内存泄漏。无需新增任何权限。
todos:
  - id: fix-speed-reset
    content: 修改 speed-controller.ts：在 trackVideo 中添加 ratechange 监听防止播放器重置速度，在 purgeDisconnected 和 destroy 中清理监听器
    status: completed
---


## 问题描述
Bilibili 是 SPA 应用，点击推荐视频后不刷新整页，而是通过客户端路由替换视频内容。扩展的 `SpeedController` 只在首次加载时通过 `MutationObserver` 检测新 `<video>` 并设置 `playbackRate`，但 Bilibili 播放器初始化 JS 在此之后还会运行，将 `playbackRate` 重置为默认值 1.0，覆盖扩展设置的速度。

## 修复目标
在 `trackVideo()` 中监听 HTMLVideoElement 原生 `ratechange` 事件，当检测到播放器将速度改回非目标值时，立即重新应用扩展设定的速度。同时完善 `purgeDisconnected()` 和 `destroy()` 中的事件监听器清理，防止内存泄漏。

## 权限影响
零权限变动。`ratechange` 是 HTMLVideoElement 原生事件，`MutationObserver` 已在用，现有 `activeTab` + `storage` 权限完全足够。不涉及新 `host_permissions`、CSP 变更或远程脚本。



## 技术方案

### 修改策略
仅修改 `d:/code/speeding/entrypoints/utils/speed-controller.ts` 一个文件，不涉及其他模块。

### 核心改动点

**1. 新增 `videoListeners` WeakMap**
- 存储 `HTMLVideoElement -> () => void` 的映射，用于在清理时精确移除 `ratechange` 监听器
- 使用 `WeakMap` 而非 `Map`：当 video 元素被 GC 时自动释放，不产生额外内存占用

**2. `trackVideo()` 增加 ratechange 守护**
- 定义 `apply()` 闭包：guard `video.playbackRate !== this.currentSpeed` 后设置值
- 首次调用 `apply()` 立即设置速度
- `video.addEventListener('ratechange', apply)` 监听后续播放器重置
- `this.videoListeners.set(video, apply)` 存储引用

**3. `purgeDisconnected()` 增加监听器清理**
- 当 `!video.isConnected` 时：从 WeakMap 取出 listener → `removeEventListener` → 删除 WeakMap 条目 → 从 Set 删除

**4. `destroy()` 增加全量清理**
- 在现有逻辑基础上，遍历 `observedVideos` 逐一移除 `ratechange` 监听
- 最后清空 WeakMap

### 防死循环机制
```typescript
const apply = () => {
  if (video.playbackRate !== this.currentSpeed) {
    video.playbackRate = this.currentSpeed;
  }
};
```
设置 `playbackRate` 后会再次触发 `ratechange`，但此时值已等于 `this.currentSpeed`，guard 条件为 false，不再执行，保证不会死循环。

### 兼容性
`ratechange` 是 W3C 标准事件，所有主流浏览器（Chrome/Edge/Firefox/Safari）均支持。方案与网站播放器实现无关，YouTube、Netflix 等同样兼容。

### 权限
无变更。当前 `permissions: ['activeTab', 'storage']` 足够。

