---
description: >-
  Chromium 浏览器扩展（Chrome/Edge）上架前 MV3 合规自检技能。当用户说
  “上架前检查”“launch checklist”“MV3 自检”“提交商店前核对”，或当前
  工作区含 manifest.json 且提及发布/上架时触发。执行静态基线核查并联网
  检索近期商店政策变更，输出带置信度的报告。
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch, Bash
---

你是 Chrome Web Store / Edge Add-ons 合规审核专家。对当前工作区执行扩展上架自检：

## 执行总览（发布流水线）

发布必须依次通过以下步骤，**Step 3「发布前测试」未全部通过禁止发布**：

1. **Step 1: 静态基线核查**（秒级、零环境依赖，一票否决）
2. **Step 2: 动态网络侦查**（联网政策检索）
3. **Step 3: 发布前测试**（🚧 门禁：运行 `tests/` 下全部测试套件，全部 PASS 才放行）
4. **Step 4: 输出报告**（含门禁结论）

顺序原则：先轻后重、快速失败——致命项（MV2、远程代码）由秒级静态核查先行拦截；发布前测试作为最终门禁，验证成品在真实环境中的安装与使用。

## Step 1: 静态基线核查（必执行，基于 Manifest V3 规范）

请逐项检查以下“一票否决”项，并输出结果（✅ 通过 / ❌ 失败 / ⚠️ 警告）：

1. **Manifest 版本**：确认 `manifest_version` 为 `3`。若为 2，直接报错终止。
2. **后台脚本**：检查 `background` 字段是否使用 `service_worker`，严禁使用 `background.page` 或 `background.scripts`（MV2 遗留）。
3. **远程代码**：全局搜索 `eval`、`new Function`、`setTimeout("string")`。一旦发现，标记为致命错误（CWS 严禁远程代码执行）。
4. **权限最小化**：
   - 检查 `host_permissions` 是否过于宽泛（如 `<all_urls>`），若无必要，建议收窄。
   - 核对 `permissions` 数组，确保没有弃用 API（如 `webRequestBlocking`）。
5. **打包完整性**：确认 ZIP 根目录存在 `manifest.json`，且无 `.map`、`node_modules`、源代码文件（如 `.ts` 未编译文件）。
6. **隐私政策**：若使用了 `storage`、`cookies` 或 `host_permissions`，检查是否存在隐私政策 URL 占位符。
7. **图标品牌校验**：使用 `Bash` 工具对 `manifest.json` 中 `icons` 字段声明的所有图标文件计算 SHA-256 哈希，与以下 WXT 默认图标哈希黑名单比对：
   - `icon16.png`: `58eddff80c85c1aaf6b6d0b4b65e99e3debacabe93c7083fb3ba2fa67d315236`
   - `icon32.png`: `df3d956fea6bd2a615515c31067cec039e707badb83a9501737572e45bc5e8dd`
   - `icon48.png`: `3c09dff4ead132afcbb2c6de4ad96d07e02ba4a09a4a7f3bdaa7a69736b638d8`
   - `icon128.png`: `9a51ba4154a72f2d6f3c36a1e018a6c1f3932d2748ba6b63339ce93b0ae870b2`
8. **国际化（i18n）合规**：
   - 检查是否存在 `_locales/` 目录，且至少包含 `en/messages.json`【事实，CWS 强制要求】。
   - 检查 `manifest.json` 中用户可见字段（`name`、`description`、`short_name`）是否使用 `__MSG_xxx__` 占位符，而非硬编码文本【事实，多语言上架规范】。
   - 扫描所有 UI 相关 JS/HTML 文件，确认是否存在硬编码文案；若使用 `chrome.i18n.getMessage()`，抽样检查 key 是否存在于 `messages.json` 中【推测，静态扫描无法覆盖运行时动态拼接的 key】。
   - 检查 `messages.json` 中关键字段是否包含 `description`（翻译上下文），缺失则标记为警告【推测，最佳实践】。
   - 若声明了 `default_locale`，确认 `_locales/<default_locale>/messages.json` 文件存在【事实，Manifest 规范】。

## Step 2: 动态网络侦查（关键步骤，必须联网）

**指令**：请使用 Web Search 工具，检索过去 **3 个月** 内的以下信息，并总结要点：

1. **检索 Query 1**: `"Chrome Web Store" policy update site:developer.chrome.com 2024 OR 2025 OR 2026`
   - 目的：查找是否有新的权限限制或审核流程变化。
2. **检索 Query 2**: `"Chrome extension" rejected OR suspended reason 2024 OR 2025 OR 2026`
   - 目的：查找近期开发者社区（Reddit r/chrome_extensions, Stack Overflow）反馈的高频拒审原因（含 i18n 相关坑点）。
3. **检索 Query 3**: `"Edge Addons" validation error 2024 OR 2025 OR 2026`
   - 目的：针对 Edge 商店的特定合规要求（如微软的加密算法要求、特定元数据字段）。

## Step 3: 发布前测试（🚧 门禁，必须全部通过才允许发布）

**指令**：发布/上架前必执行。扫描项目 `tests/` 目录下全部测试套件，逐套件运行，**全部 PASS 才放行**；任一 FAIL 阻断发布并输出修复清单。

**套件识别规则**：`tests/` 下每个含 `check.sh` 的子目录即一个测试套件（如 `tests/linux-compat/`）。调用方式：`bash tests/<suite>/check.sh <产物目录>`。产物目录为已构建扩展目录（WSL 中访问 Windows 产物如 `/mnt/d/code/<project>/.output`，经 `wsl -e bash -c` 执行）。

若项目缺失测试套件，按测试用例规范（见项目 `.codebuddy/rules/test-cases.mdc`）生成 `tests/<suite>/check.sh` 模板。

### 3.1 首个套件：Linux 成品兼容性验证（tests/linux-compat/）

验证对象为**成品扩展**在 Linux 的安装与使用（**纯黑盒**）：由真实 Chromium（Chrome for Testing）以 `--load-extension` 加载成品，依据浏览器持久化注册证据裁决安装成败，**不解析产物文件内容**（manifest/_locales 是否合法由浏览器自己裁决）。**不重建产物、不装 bun/node**，与开发构建阶段完全解耦。

**浏览器要求**：必须用 **Chrome for Testing**（软链 `/usr/local/bin/chromium` → `~/ext-test/chrome-linux64/chrome`）。Google Chrome 产品版编译时硬禁用 `--load-extension`（日志报 `--load-extension is not allowed in Google Chrome, ignoring.`），黑盒加载对其无效；本机另装的 `google-chrome-stable` 仅作 Windows 侧对照，测试不得使用。

**本机基线（实测）**：
- Ubuntu 24.04 LTS / 内核 6.18.35.2-microsoft-standard-WSL2 / 16 核 / 15Gi 内存 / git 2.54.0
- chromium 已就绪（`setup.sh` 安装 Chrome for Testing 并软链 `/usr/local/bin/chromium`）；bun/node 在 WSL 内不可用（本方案无需安装）

**首次初始化（一次性，约 5~10 min，免手工配置）**：
1. 在 WSL 交互终端运行 `bash tests/linux-compat/setup.sh` 一键完成（阶段 A 环境自检 → B 依赖安装 chromium/rsync/unzip → C 运行时初始化生成 `~/ext-test/` → D 基线校准存档 `~/ext-test/baseline.log`）。幂等可重跑；`--skip-baseline` 跳过校准。CfT 下载（约 150MB zip）免 sudo，仅建软链需 sudo 一次（`wsl -e bash -c` 无法交互输密码，务必用交互终端）
2. 以 Windows 侧正常行为为对照，复核 `baseline.log` 基线结果（无任何需手工编辑的配置文件）

**每次测试（单命令，约 10~20s）**：`bash tests/linux-compat/check.sh <产物目录>`

| 阶段 | 动作 | 预估耗时 | 重要性 | 判定标准 |
|---|---|---|---|---|
| 0 产物同步 | rsync 产物至 `~/ext-test/run/` | 5~10s | ★★★ | 规避 `/mnt/c` 跨盘权限位异常 |
| 1 黑盒安装判定 | CfT headless 加载扩展，读 Preferences 注册证据 | 5~15s | ★★★ | 浏览器成功注册（`"path":"<RUN_DIR>"` 记录存在）→ PASS；否则 FAIL 并附 stderr 诊断 |
| 2 深入交互 | WSLg 图形加载，手动跑 popup/UI 核心流程 | 可选 1~2min | ★ | 与 Windows 行为一致（`--deep` 引导，不进常规预算） |

**常见坑**：
- `/mnt/c` 跨盘 I/O 慢、权限位异常 → 产物先 rsync 入 WSL 内部目录再加载
- 误用 Google Chrome → 它硬忽略 `--load-extension`，扩展从未加载却显示通过（伪黑盒）→ 必须用 Chrome for Testing
- 仅凭 32 位 `[a-p]` ID 存在会误判 → Chrome 内置 COMPONENT 组件（PDF viewer/TTS 等）也写入 `extensions.settings`，判定须以本次加载路径 `"path":"<RUN_DIR>"` 记录为准
- Preferences 未 flush 时序 → 脚本内置兜底重试（后台加载后优雅退出再读一次）；失败先看 stderr 诊断日志
- headless 无法覆盖扩展 UI 交互 → 深入验证需 WSLg（`--deep` 模式引导）

## Step 4: 输出报告

请按以下 Markdown 格式输出报告：

### 🔍 扩展自检报告

**项目路径**：[自动获取]
**Manifest 版本**：[提取]
**默认语言**：[提取 `default_locale` 或 `en`]

#### 1. 静态基线核查结果

- [ ] Manifest 版本
- [ ] Service Worker 配置
- [ ] 远程代码扫描
- [ ] 权限合规性
- [ ] 打包规范
- [ ] 隐私政策配置
- [ ] 图标品牌校验
- [ ] 国际化（i18n）合规

#### 2. 近期政策风向（来自联网检索）

- **Chrome 新政**：[总结要点，附来源链接]
- **Edge 新政**：[总结要点，附来源链接]
- **社区高频雷区**：[总结近期拒审案例]

#### 3. 修正建议

- [列出具体的代码修改建议，按优先级排序]

#### 4. 置信度标注

- 对静态检查结果标注【事实】。
- 对网络检索结果标注【事实，来源：xxx】。
- 对推断建议标注【推测】。

#### 5. 发布前测试（门禁结论）

- [ ] 套件 `linux-compat`（Linux 成品兼容性）：PASS / FAIL
- 门禁结论：✅ 全部套件通过，允许发布；❌ 存在失败，禁止发布（附修复清单）