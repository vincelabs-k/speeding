---
name: pre-release-checklist-fixes
overview: 修复发版前 3 个问题：README License 标注修正为 Apache 2.0、manifest description 补充 Bilibili、.gitignore 补充构建产物目录。
todos:
  - id: fix-readme-license
    content: README.md:47 — 将 [MIT] 改为 [Apache 2.0]
    status: completed
  - id: fix-description-bilibili
    content: wxt.config.ts:15 — description 中 YouTube 前插入 Bilibili
    status: completed
  - id: fix-gitignore
    content: .gitignore — 在 dist 行后追加 .output/ 和 *.zip
    status: completed
  - id: rebuild-and-zip
    content: 执行 bun run build && bun run zip，验证构建产物
    status: completed
    dependencies:
      - fix-readme-license
      - fix-description-bilibili
      - fix-gitignore
---

## 发版前收尾修复

修复上版自检报告中剩余的 3 个小问题，使项目在提交 Chrome Web Store / Edge Add-ons 前全部就绪。

### 修复项

1. **README 许可证标注修正** — `README.md:47` 写的是 `[MIT]`，但 `LICENSE` 文件实际是 Apache 2.0。改为 `[Apache 2.0]` 保持一致。
2. **Manifest description 补全 Bilibili** — `wxt.config.ts:15` 描述中缺少 Bilibili，与 `STORE_LISTING.md`、`README.md`、`docs/index.md` 不一致。补全为 `Works on Bilibili, YouTube, Vimeo, Netflix, and online course platforms.`
3. **`.gitignore` 补充构建产物** — 补充 `.output/`（WXT 构建输出目录）和 `*.zip`（打包产物），避免误提交。


## 修改清单

3 个文件修改，均为单行文本变更，无新依赖、无 API 变更。

| 文件 | 行 | 变更 |
|------|-----|------|
| `README.md` | 47 | `[MIT]` → `[Apache 2.0]` |
| `wxt.config.ts` | 15 | description 中 `YouTube` 前插入 `Bilibili, ` |
| `.gitignore` | 85 行后 | 追加 `.output/` 和 `*.zip` |

修改完成后执行 `bun run build && bun run zip` 重新打包。

