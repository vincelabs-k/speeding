---
name: fix-tailwind-wxt-build
overview: 将 Tailwind CSS 从 @tailwindcss/vite（在 WXT 下不生效）切换到 @tailwindcss/postcss 方案，并创建一个 PostCSS 配置文件，确保所有 Tailwind 类名被正确编译到构建产物中。
todos:
  - id: replace-deps
    content: Replace @tailwindcss/vite with @tailwindcss/postcss via bun
    status: completed
  - id: create-postcss-config
    content: Create postcss.config.js with @tailwindcss/postcss plugin
    status: completed
    dependencies:
      - replace-deps
  - id: clean-wxt-config
    content: Remove @tailwindcss/vite import and vite plugin config from wxt.config.ts
    status: completed
    dependencies:
      - replace-deps
  - id: verify-build
    content: Clean build cache, rebuild and verify Tailwind CSS in output
    status: completed
    dependencies:
      - create-postcss-config
      - clean-wxt-config
---

## 问题描述
Popup 中所有 Tailwind 类名（`w-[360px]`、`h-[222px]`、`px-6`、`text-base` 等间距/尺寸/字号类）完全不生效，截图显示 UI 仍为旧的窄版布局。根因是 `@tailwindcss/vite` 插件在 WXT 的 CSS 处理 pipeline 中不兼容，构建产物里无任何 Tailwind CSS 代码。

## 修复目标
- 将 Tailwind CSS v4 的处理方式从 Vite 插件切换到 PostCSS 插件，使 WXT 能正确编译 Tailwind 实用类
- 构建产物中应包含完整的 Tailwind CSS，App.tsx 中已有的所有 Tailwind 类名全部生效
- 涉及文件：`package.json`、`wxt.config.ts`、新建 `postcss.config.js`

## 核心改动
1. 依赖替换：`@tailwindcss/vite` → `@tailwindcss/postcss`
2. `wxt.config.ts`：移除 `@tailwindcss/vite` 的 import 和 vite plugins 配置
3. 新建 `postcss.config.js`：配置 `@tailwindcss/postcss` 作为 PostCSS 插件


## 技术方案

### 根因
WXT 框架内置使用 PostCSS 处理所有 CSS 文件。`@tailwindcss/vite` 作为 Vite 插件，其 `transform` hook 与 WXT 的 CSS pipeline 存在兼容问题，导致 `style.css` 中的 `@import "tailwindcss"` 指令不被处理，Tailwind 实用类永远不会被注入到最终构建产物中。

### 解决方案
切换到 `@tailwindcss/postcss`，直接作为 PostCSS 插件嵌入 WXT 现有的 CSS 处理 pipeline。`@tailwindcss/postcss` 同样支持 Tailwind v4 语法（`@import "tailwindcss"`），无需修改任何 CSS 或 TSX 代码。

### 文件改动详情

#### 1. `package.json` — 依赖替换
- 移除：`@tailwindcss/vite`（devDependencies）
- 新增：`@tailwindcss/postcss`（devDependencies）
- 执行命令：`bun remove @tailwindcss/vite && bun add -D @tailwindcss/postcss`

#### 2. `wxt.config.ts` — 移除 Vite 插件相关代码
- 删除第 1 行：`import tailwindcss from "@tailwindcss/vite";`
- 删除第 12 行：`vite: () => ({ plugins: [tailwindcss()] }),`
- 其余配置保持不变

#### 3. `postcss.config.js`（新建，项目根目录）
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```
WXT 自动发现并加载根目录的 `postcss.config.js`，无需额外配置。

### 不需要改动的文件
- `entrypoints/popup/style.css`：`@import "tailwindcss"` 保持不变
- `entrypoints/popup/App.tsx`：所有 Tailwind 类名已正确，无需改动
- `entrypoints/popup/main.tsx`：CSS import 路径正确，无需改动

