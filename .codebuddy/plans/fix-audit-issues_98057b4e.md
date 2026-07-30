---
name: fix-audit-issues
overview: 修复上轮完整校验发现的 4 个问题：删除默认模板文件、修正 README 速度范围、验证图标哈希、添加 .gitignore 规则。
todos:
  - id: delete-wxt-svg
    content: 删除 `public/wxt.svg`
    status: completed
  - id: fix-speed-range
    content: 修复 README.md 和 STORE_LISTING.md 中速度范围描述：0.25x → 0.5x
    status: completed
  - id: verify-icon-hashes
    content: 使用 openssl dgst -sha256 计算 public/icon/{16,32,48,128}.png 的哈希值，与 SKILL.md 白名单比对
    status: completed
  - id: update-gitignore
    content: 在 .gitignore 末尾追加 `.vscode/` 规则
    status: completed
---

## 用户需求
执行上轮校验报告中发现的所有修正项。

## 核心修改
1. 删除 WXT 默认模板文件 `public/wxt.svg`
2. 将 `README.md` 和 `docs/STORE_LISTING.md` 中的速度范围从「0.25x to 16x」修正为「0.5x to 16x」，与代码 `MIN_SPEED = 0.5` 一致
3. 对 `public/icon/{16,32,48,128}.png` 计算 SHA-256 哈希，与 SKILL.md 白名单比对，验证图标为自定义品牌图标（非 WXT 默认）
4. 将 `.vscode/settings.json` 加入 `.gitignore`

## 技术方案

四个修改均为独立、无依赖的简单变更，可批量处理。

### 修改详情

| 文件 | 操作 | 说明 |
|------|------|------|
| `public/wxt.svg` | 删除 | WXT 默认模板文件，非项目自定义资源 |
| `README.md` L7 | 替换 `0.25x` → `0.5x` | 与 `speed-controller.ts` 中 `MIN_SPEED = 0.5` 一致 |
| `docs/STORE_LISTING.md` L20 | 替换 `0.25x` → `0.5x` | 同上 |
| `.gitignore` | 追加 `.vscode/` | 覆盖整个 `.vscode` 目录 |
| 图标哈希 | 计算并比对 | 使用 `openssl dgst -sha256` 计算 4 个图标文件哈希，与 SKILL.md 白名单逐一比对 |

### 图标哈希白名单（来自 SKILL.md）

| 图标大小 | 文件 | 期望 SHA-256 |
|----------|------|-------------|
| 16x16 | `public/icon/16.png` | `58eddff80c85c1aaf6b6d0b4b65e99e3debacabe93c7083fb3ba2fa67d315236` |
| 32x32 | `public/icon/32.png` | `df3d956fea6bd2a615515c31067cec039e707badb83a9501737572e45bc5e8dd` |
| 48x48 | `public/icon/48.png` | `3c09dff4ead132afcbb2c6de4ad96d07e02ba4a09a4a7f3bdaa7a69736b638d8` |
| 128x128 | `public/icon/128.png` | `9a51ba4154a72f2d6f3c36a1e018a6c1f3932d2748ba6b63339ce93b0ae870b2` |
