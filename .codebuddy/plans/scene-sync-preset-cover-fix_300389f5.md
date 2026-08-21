---
name: scene-sync-preset-cover-fix
overview: 修复场景编辑后速度不与滑块/播放同步、扩充预置场景站点表、修复无视频页面 Scenes/All sites tab 点击无效三处问题，并 bump 版本至 1.1.1 通过发布门禁。
todos:
  - id: preset-sites
    content: 扩充 speed-model.ts 的 DEFAULT_SITE_SCENES 至 46 条并补充三类归类规则注释
    status: completed
  - id: save-scenes-resolve
    content: content.ts SAVE_SCENES 分支在 scenes 模式下重解析速度并返回 speed/speedMode
    status: completed
  - id: popup-fix
    content: App.tsx handleScenesSave 回写滑块/徽章/输入，handleModeChange 乐观切换 + storage 兜底
    status: completed
    dependencies:
      - save-scenes-resolve
  - id: version-gate
    content: 版本升至 1.1.1，更新 docs/ui-baseline.md，构建后用 [skill:extension_launch_checklist] 执行发布门禁
    status: completed
    dependencies:
      - preset-sites
      - popup-fix
---

## 用户需求
针对场景预设功能的三项修复与增强：

1. **场景编辑速度同步滑块**：选中（绑定）场景并编辑该场景的倍速值后，保存时速度应在 "Drag to adjust" 拖拽条、速度徽章、自定义输入框同步生效。
2. **预置站点核查与扩充**：检查主流视频/学习/音频网站是否已纳入预置场景映射，未纳入的由我指定归类规则并补充。
3. **无视频页面模式切换修复**：在未探测到视频的页面（content script 未注入），popup 中 Scenes / All sites 标签无法点击生效，需定位并修复。

## 产品概述
- 场景编辑即改即用：编辑场景倍速保存后，若该场景绑定当前站点则立即应用新速度并同步全部速度控件，符合 Auto-speed 定位。
- 预置站点全覆盖：按「课程学习 / 剧集影视 / 外语听力」三类规则扩充主流平台映射，新用户开箱即用。
- 模式切换兜底：无 content script 页面也能切换并持久化模式，打开视频页后自动恢复生效。

## 核心功能
- Scenes 模式下编辑场景倍速 → 保存后重解析场景速度并应用到视频与 UI 控件
- 预置站点映射扩充至约 46 个主流平台，附明确归类规则
- 无视频页面：Scenes / All sites 标签点击即时高亮切换，模式写入 storage，下次有视频页面自动应用


## 技术栈
沿用现有技术栈，无新增依赖：WXT + React 19 + TypeScript strict + Tailwind v4 + browser.* / chrome.*（现状）+ Bun。无新增 i18n key、无权限变更。

## 实现方案

### 问题 1：场景编辑速度同步拖拽条
**根因**：`App.tsx handleScenesSave` 仅更新 scenes 列表并发送 `SAVE_SCENES`，不回写 `speed/sliderDragPct/customInput`；content.ts 的 `SAVE_SCENES` 分支仅 `saveScenes()` 后返回 `{success:true}`，scenes 模式下不重解析速度。

**修复**（两条链路配合）：
- `content.ts` `SAVE_SCENES` 分支：保存后若 `currentMode === 'scenes'`，调用 `getResolvedSpeed(hostname)` 重解析（scenes 模式经 siteSceneId 解析场景 speed）并 `controller.setSpeed(resolved)`，响应增加 `{ success, speed, speedMode }`。
- `App.tsx` `handleScenesSave` 改为 async：`sendMessage('SAVE_SCENES', next)` 成功后，若响应含 `speed`，回写 `setSpeed / setCustomInput(formatSpeed) / setSliderDragPct(speedToLogPct)`。
- 效果：编辑绑定场景的速度 → 保存即应用，滑块/徽章/自定义输入同步，符合预期。

### 问题 2：预置站点扩充（归类规则 + 清单）
`speed-model.ts` `DEFAULT_SITE_SCENES` 扩充。归类规则（用户授权代定）：
- **course（刷课程/学习）**：教育、课程、技能学习平台
- **series（追剧/影视）**：长视频剧集、影视、动漫、流媒体娱乐平台
- **listening（外语听力）**：播客、演讲、有声书、外语新闻听力平台

新增 23 条（总量 23 → 46）：
- course +8：`linkedin.com`（LinkedIn Learning）、`codecademy.com`、`udacity.com`、`masterclass.com`、`study.163.com`（网易云课堂）、`ke.qq.com`（腾讯课堂）、`teachable.com`、`alison.com`
- series +7：`tv.apple.com`（Apple TV+）、`paramountplus.com`、`peacocktv.com`、`max.com`（HBO Max 新域名）、`crunchyroll.com`（动漫）、`sohu.com`（搜狐视频）、`le.com`（乐视）
- listening +8：`spotify.com`（播客）、`soundcloud.com`、`podbean.com`、`audible.com`（有声书）、`ximalaya.com`（喜马拉雅）、`npr.org`、`voanews.com`（VOA 听力）、`bbc.com`（BBC Learning English）

匹配逻辑沿用现有 `getSiteSceneId`（显式绑定 > 预置后缀回退），无需改动 storage.ts。

### 问题 3：无视频页面模式切换失效
**根因（已定位）**：`handleModeChange` 依赖 content script 响应才 `setSpeedMode(mode)`；在 content script 未注入的页面（`chrome://*`、Web Store、`about:`、`file://` 等，WXT `matches:['*://*/*']` 不覆盖），`browser.tabs.sendMessage` reject，catch 后模式状态从未更新 → 标签视觉与场景区块均不切换。

**修复**：`App.tsx handleModeChange` 改为**乐观切换 + storage 兜底**：
1. 立即 `setSpeedMode(mode)`（UI 即时响应，Scenes 区块/滑块区域随之切换）；
2. `sendMessage('SET_MODE', mode)` 成功 → 用响应同步 `speed/speedMode/sceneId/sliderDragPct/customInput`；
3. 失败（无 content script）→ `import { setSpeedMode } from '../utils/storage'` 直接写 storage 持久化（popup 同扩展上下文可访问 chrome.storage）；下次打开视频页时 content script 初始化读取该 mode 自动应用。

content.ts `SET_MODE` 分支无需改动（有 content script 时逻辑已正确）。

### 性能与可靠性
- `SAVE_SCENES` 重解析仅在 scenes 模式 + 编辑保存时触发一次，低频路径，无性能问题
- 乐观切换避免 UI 阻塞；storage 兜底保证模式持久化与后续页面一致性（与 ui-baseline.md「无视频时速度控件保持可交互、打开视频后自动应用预设置」既有意图对齐）
- 无新增权限、无新增 i18n key、无新依赖；向后兼容（旧存储结构不变）

## 目录结构
```
d:/code/speeding/
├── entrypoints/
│   ├── popup/
│   │   ├── speed-model.ts              # [MODIFY] DEFAULT_SITE_SCENES 扩充至 46 条，注释补充归类规则
│   │   └── App.tsx                     # [MODIFY] handleScenesSave 回写速度控件；handleModeChange 乐观切换 + storage 兜底
│   ├── content.ts                      # [MODIFY] SAVE_SCENES 分支 scenes 模式下重解析速度并返回 speed/speedMode
│   └── utils/storage.ts                # [MODIFY] 无（setSpeedMode 已导出，仅 App.tsx 新增 import）
├── package.json                        # [MODIFY] version 1.1.0 → 1.1.1
└── docs/ui-baseline.md                 # [MODIFY] 场景区块规范补充「编辑即生效」「无视频页模式切换兜底」说明
```
说明：`getResolvedSpeed` 已含 scenes 分支且导出 `setSpeedMode`，storage.ts 无需改动；无新增翻译 key，不需要 `generate:i18n`。

## 关键代码结构
```ts
// App.tsx — 修改后关键签名（乐观切换 + 兜底）
const handleModeChange = useCallback(async (mode: SpeedMode) => {
  if (mode === speedMode) return;
  setSpeedMode(mode); // 1. 乐观切换，UI 即时响应
  const res = await sendMessage('SET_MODE', mode).catch(() => undefined);
  if (res && 'speed' in res && typeof res.speed === 'number') {
    /* 2. 有 content script：同步 speed/speedMode/sceneId/slider */
  } else {
    await setSpeedMode(mode); // 3. 无 content script：storage 兜底持久化
  }
}, [speedMode, sendMessage]);

// content.ts — SAVE_SCENES 分支（scenes 模式重解析）
if (msg.type === 'SAVE_SCENES' && Array.isArray(msg.scenes)) {
  await saveScenes(msg.scenes!);
  if (currentMode === 'scenes') {
    const resolved = await getResolvedSpeed(hostname);
    controller.setSpeed(resolved);
    return { success: true, speed: controller.getSpeed(), speedMode: currentMode };
  }
  return { success: true };
}
```


## Agent Extensions
### Skill
- **extension_launch_checklist**
  - 用途：修复完成后执行发布门禁——Step 3 运行 `tests/linux-compat/check.sh` 黑盒套件（真实 Chromium 加载 1.1.1 产物），并核查 MV3 静态基线
  - 预期结果：全部套件 PASS、门禁放行，确认改动未引入权限/远程代码/i18n 违规
