---
name: fix-inconsistencies-readme-docs-rules
overview: 修正 README/package.json/docs/rules 四方不一致：去掉 audio 声称、重写 popup/快捷键定位语、更新 Edge 链接、修正 wxt-project.mdc 规则 4 处与实况不符。
todos:
  - id: fix-readme
    content: 修正 README.md：去 audio 声称（L11 去 "or audio"、L13 删整行、L5 "Open a podcast" 换视频语境），重写定位语为"轻量 popup + Alt+↑/↓ 快捷键、无 OSD"，调整受众行 L19/L21
    status: completed
  - id: fix-package-docs
    content: 修正 package.json description（去 "& podcasts"）与 docs/index.md（Edge 真实链接、保留 github 源码链接并补充 gitee 镜像链接）
    status: completed
  - id: fix-rules
    content: 修正 .codebuddy/rules/wxt-project.mdc 四处规则（React 19、允许唯一 Tailwind 入口 CSS、tabs.sendMessage/runtime.onMessage 通信、Chrome MV3 优先+Firefox 兼容）并更新 updatedAt 为 2026-08-13
    status: completed
  - id: verify-and-sync
    content: grep 验证 README/package.json/docs/rules 无残留过时声称（audio-only/podcast/No popup），git add/commit/push 同步远程仓库
    status: completed
    dependencies:
      - fix-readme
      - fix-package-docs
      - fix-rules
---


## 用户需求
检查「项目实况 / README / skill / rules」四者的信息一致性，列出不一致项并由用户确认修改方案后执行修正。已确认四项决策：

1. **去掉 audio/播客声称**：README 声称支持 audio/播客，但代码仅处理 `<video>` → 修改 README/package.json 文案，去掉 audio 声称（不实现 audio 功能）
2. **README 定位语改为准确描述**："No popup, no OSD, no keyboard shortcuts" 与实况（有 popup + Alt+↑/↓ 快捷键）冲突 → 保留功能，重写定位语
3. **docs 源码链接保留 github**：本项目 gitee 与 github 镜像同步，保留 github 链接，可补充 gitee 镜像链接；Edge "coming soon" 改为已上架真实链接
4. **规则全部修正**：wxt-project.mdc 四处（React 18→19、NO .css、postMessage 架构、Chrome MV3 only）修正为与实况一致

## 核心修改范围
- `README.md`：tagline/引言、Features 列表、受众行、VSC 对比段
- `package.json`：description 去 "& podcasts"
- `docs/index.md`：Edge 真实链接、源码链接保留 github + 补 gitee 镜像
- `.codebuddy/rules/wxt-project.mdc`：4 处规则正文修正 + updatedAt 更新

## 边界
- 仅改文档/文案/规则文本，不触碰任何运行时代码（speed-controller.ts、content.ts 等）
- 不动 translations/messages.ts（其 extDescription 16 语言均只说 video，无需改，也无需跑 generate:i18n）
- 归档目录 `~/codebuddy-archive-2026-08/` 不参与验证与修改

