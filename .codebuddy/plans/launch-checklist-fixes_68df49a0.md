---
name: launch-checklist-fixes
overview: 修复上架自检中的 2 个阻塞项（版本号、隐私政策）和 3 个建议项（权限说明、author 字段、描述细化），确保扩展可同时提交 Chrome Web Store 和 Edge Add-ons。
todos:
  - id: fix-version
    content: 修改 package.json 版本号从 0.0.0 改为 1.0.0
    status: completed
  - id: update-manifest-config
    content: 更新 wxt.config.ts manifest 块：新增 privacy_policy_url、author 字段，细化 description
    status: completed
  - id: create-privacy-md
    content: 新建 PRIVACY.md 隐私政策文档，声明不收集任何用户数据
    status: completed
  - id: create-store-listing
    content: 新建 STORE_LISTING.md，包含 *://*/* 权限说明和商店描述文案
    status: completed
  - id: update-readme
    content: 更新 README.md 为项目介绍，替换 WXT 模板占位内容
    status: completed
  - id: build-and-verify
    content: 执行 bun run build 验证构建产物 manifest.json 包含所有新增字段
    status: completed
    dependencies:
      - fix-version
      - update-manifest-config
      - create-privacy-md
      - create-store-listing
      - update-readme
---

## 上架阻塞项与建议项修复

基于上轮自检报告，修复以下全部问题：

### 阻塞项
1. **版本号 `0.0.0` 改为有效 semver**：`package.json` 第 5 行 `"version": "0.0.0"` → `"version": "1.0.0"`
2. **新增隐私政策 URL**：`wxt.config.ts` 的 `manifest` 块添加 `privacy_policy_url`，并创建 `PRIVACY.md` 作为隐私政策文档原文

### 建议项
3. **添加 Edge `author` 字段**：`wxt.config.ts` 的 `manifest` 块添加 `author: { email: '...' }`
4. **细化扩展描述**：`description` 中注明具体支持的视频平台（Bilibili、YouTube、Vimeo 等）
5. **准备权限说明文案**：创建 `STORE_LISTING.md`，包含 `*://*/*` 权限书面理由、商店描述文案
6. **更新 README**：当前 README 为 WXT 模板占位文字，更新为项目说明

## 技术方案

### 修改范围

仅涉及配置文件和文档文件，无逻辑代码变更：

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 第5行 version 字段 |
| `wxt.config.ts` | 修改 | manifest 块新增 3 个字段 |
| `PRIVACY.md` | 新建 | 隐私政策文档 |
| `STORE_LISTING.md` | 新建 | 商店上架辅助材料 |
| `README.md` | 修改 | 替换模板内容 |

### 关键决策

- **隐私政策托管**：`privacy_policy_url` 需指向实际可访问的 URL。`PRIVACY.md` 提供文档原文，用户需自行托管到 GitHub Pages 或其他服务后回填 URL
- **author 字段**：WXT 的 `manifest` 配置支持 `author` 字段，会直接写入生成出的 `manifest.json`
- **description**：保持在 CWS 132 字符限制内，添加平台关键词有助于商店 SEO
