---
name: docs-index-pages
overview: 为 docs/ 目录创建 GitHub Pages 入口文件：index.md 首页导航 + _config.yml Jekyll 配置。
todos:
  - id: create-config
    content: 新建 docs/_config.yml，设置 Jekyll 站点标题
    status: completed
  - id: create-index
    content: 新建 docs/index.md，作为文档站首页并列出导航链接
    status: completed
---

## 需求
为已通过 GitHub Pages 开放的 `docs/` 目录补充入口文件，使访问者能看到文档导航。

## 核心功能
- `docs/index.md`：文档站首页，列出 PRIVACY.md 和 STORE_LISTING.md 的导航链接
- `docs/_config.yml`：Jekyll 基础配置，设置站点标题

## 方案
新建 2 个文件，无代码变更。

### 文件说明
- **`docs/index.md`**：Markdown 首页，含 Jekyll frontmatter，链接到两个已有文档，附带简短说明
- **`docs/_config.yml`**：Jekyll 配置，设置 `title: Speeding Docs`，使用默认主题即可
