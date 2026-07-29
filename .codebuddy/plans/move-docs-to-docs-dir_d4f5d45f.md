---
name: move-docs-to-docs-dir
overview: 将 PRIVACY.md 和 STORE_LISTING.md 移动到 docs/ 目录，使项目根目录保持整洁。
todos:
  - id: create-docs-dir
    content: 创建 docs/ 目录
    status: completed
  - id: move-files
    content: 移动 PRIVACY.md 和 STORE_LISTING.md 到 docs/ 目录
    status: completed
    dependencies:
      - create-docs-dir
  - id: update-readme-link
    content: 更新 README.md 中隐私政策链接从 ./PRIVACY.md 改为 ./docs/PRIVACY.md
    status: completed
    dependencies:
      - move-files
---

将面向用户/审核方的文档文件（PRIVACY.md、STORE_LISTING.md）从根目录迁移到 `docs/` 目录，保持项目根目录整洁。README.md 中指向 PRIVACY.md 的链接路径需同步更新。
