---
name: narrow-differentiation-copy
overview: 修改 wxt.config.ts、package.json、README.md 的文案，定位从"通用倍速工具"转向"Auto-speed / set-and-forget"，同时在 README 中加入 Who it's for / Who it's NOT for 差异化宣导。
todos:
  - id: update-manifest-desc
    content: 修改 wxt.config.ts L15 的 manifest.description 为 auto-speed 定位文案（≤132 字符）
    status: completed
  - id: update-package-desc
    content: 修改 package.json L3 的 description 与 manifest 保持一致
    status: completed
  - id: update-readme
    content: 重写 README.md 开头、Features、Why Speeding，新增差异化对比章节
    status: completed
  - id: launch-checklist
    content: 使用 [skill:extension_launch_checklist] 执行上架前合规自检
    status: completed
    dependencies:
      - update-manifest-desc
---

## 产品概述
Speeding 浏览器扩展的描述文案重定位。从"通用视频倍速工具"转为"Auto-speed — Set once, never touch again"的差异化定位，锚定在线课程学习者和播客听众人群，避免与 300 万用户的 Video Speed Controller 正面竞争。

## 核心改动
- **manifest.description**（商店短描述）：≤132 字符，用 auto-speed 替代 feature dump，加入 Udemy 和 podcast 等垂类场景词
- **package.json description**：与 manifest 保持一致的 auto-speed 风格
- **README.md**：开头场景化改写，Features 改为用户视角列表，新增"Who this is for / Who should use VSC instead"差异化对比
- **无需修改任何源代码逻辑**，纯文案改动


## 技术说明
本次为纯文案修改，不涉及技术实现。改动范围：

- `wxt.config.ts` L15：替换 manifest.description 字符串
- `package.json` L3：替换 description 字段
- `README.md`：替换开头段落、Features 列表、Why Speeding 章节，新增差异化对比章节

## CWS 上架页面重点修改项
在 Chrome Web Store Developer Dashboard 中，以下字段需要手动修改（不走 manifest）：

1. **Store Listing → Detailed description**（长描述）：复制粘贴准备好的 auto-speed 场景化长文案（见下文），取代当前简短的功能列表
2. **Store Listing → Short description**（短描述，自动从 manifest 读取，无需手动改）
3. **Category**：确保选中 Productivity 或 Accessibility，可额外勾选 Education
4. **Store Listing → "What's new"**：填写 v1.0.2 更新日志（含中文）
5. **Privacy practices → Data disclosure**：确认声明"不收集任何用户数据"

### 建议的商店长描述（CWS Dashboard — Detailed Description）

```
Speeding remembers your preferred playback speed on every site.
Set it once — 2x on YouTube, 1.5x on Bilibili, 3x on Udemy —
and it stays. No more reaching for the speed button every time.

Built for people who DON'T want a controller.
You set the speed. Speeding remembers it. That's it.

Features:
- Per-site auto-speed — each site remembers its own setting
- "This site only" or "All sites" mode for flexible control
- 0.5x – 16x range with 0.25x steps
- Works on any HTML5 video or audio (podcasts too)
- Privacy-first — zero data collection, zero tracking

Who is this for?
- Online course learners (Udemy, Coursera, Bilibili courses)
- Podcast & audiobook listeners
- Anyone tired of keyboard shortcuts and OSD controllers
```


## Agent Extensions
### Skill
- **extension_launch_checklist**
  - 用途：文案修改完成后，对扩展执行 MV3 上架前合规自检，确保描述变更未引入新问题
  - 预期结果：输出合规自检报告，确认 manifest 字段、权限声明、隐私权政策均符合 CWS 最新要求
