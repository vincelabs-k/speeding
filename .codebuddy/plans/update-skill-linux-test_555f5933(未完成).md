---
name: update-skill-linux-test
overview: "更新 extension_launch_checklist skill：新增「Step 3: 兼容性测试（Linux/WSL2）」——基于固化测试脚本（skill 附属模板 + 项目配置）验证成品扩展在 Linux Chromium 的安装与使用，首次初始化后每次测试 1 分钟内完成；原 Step 3 顺延 Step 4 并追加报告小节。"
todos:
  - id: validate-skill-spec
    content: 依据 [skill:skill-creator] 校验 SKILL.md 更新规范与 frontmatter 约束，确认插入方案
    status: pending
  - id: insert-linux-step
    content: 在 SKILL.md 插入 Step 3 兼容性测试（实测基线/初始化/两级流程/常见坑），原 Step 3 顺延 Step 4 并追加报告小节
    status: pending
    dependencies:
      - validate-skill-spec
  - id: create-check-script
    content: 新建 scripts/linux-compat-check.sh 固化脚本：阶段 0~4 实现、配置读取、PASS/FAIL 输出与耗时统计
    status: pending
    dependencies:
      - insert-linux-step
  - id: verify-skill
    content: 通读 SKILL.md 与脚本，核对编号/触发词连贯，用 [skill:skill-creator] 复核合规
    status: pending
    dependencies:
      - create-check-script
---

## 产品概述
更新 `extension_launch_checklist` skill，新增「兼容性测试（Linux/WSL2）」步骤：验证**已构建成品扩展**在 Linux Chromium 中的安装与使用（manifest 解析、资源完整性、SW 启动、CS 注入、内嵌平台资源）。不重建产物、不涉及 bun/node 等开发工具链。

## 核心功能
- **验证对象为成品**：仅验证构建产物在 Linux 的安装与使用，与开发构建阶段完全解耦
- **架构：skill 方法论 + 固化测试脚本**：skill 承载引导/判定标准/报告格式；固化 bash 断言脚本承载测试用例，跨项目通用
- **高效两级流程**：首次初始化（一次性约 5~10min）后，每次测试单命令 40~60s 出结果；headless 快速路径 + WSLg 深入路径（可选）
- **项目断言配置**：`linux-compat.json`（smoke 页面 URL、注入断言标志、平台资源清单），每项目一份，skill 自动生成模板
- **实测基线**：写入真实 WSL2 信息（Ubuntu 24.04.1 LTS、内核 6.18.35.2-microsoft-standard-WSL2、16 核/15Gi、git 2.54.0、chromium 未装）
- **平台差异专项**：内嵌 .wasm/二进制 GLIBC 检查、Linux 大小写敏感、/mnt/c 权限位
- **报告联动**：输出报告追加「兼容性测试（Linux/WSL2）」小节，沿用【事实】/【推测】置信度标注


## 技术栈
- Bash 脚本（零依赖，WSL2 内直接运行）+ Markdown（SKILL.md）
- 无需引入测试框架（不装 Playwright/Jest），契合 WSL 快速验证场景

## 实施方法
采用「skill 方法论层 + 固化脚本测试用例层」两层架构：SKILL.md Step 3 定义触发条件、流程编排、判定标准与常见坑；`scripts/linux-compat-check.sh` 为固化断言脚本模板，skill 触发时生成到 `~/ext-test/`，项目特定断言通过 `linux-compat.json` 注入，保证 skill 跨项目通用、流程可复现、每次测试一条命令完成。

## 修改目标

```
C:\Users\Mrzha\.codebuddy\skills\extension_launch_checklist\
├── SKILL.md                              # [MODIFY] 插入 Step 3，原 Step 3 顺延 Step 4 并追加报告小节
└── scripts\
    └── linux-compat-check.sh             # [NEW] 固化断言脚本模板
```

运行时生成（不入仓库）：`~/ext-test/check.sh`、`~/ext-test/linux-compat.json`、`~/ext-test/run/`

## 详细设计

### SKILL.md 结构调整
- Step 1（静态基线核查）、Step 2（动态网络侦查）保持不变
- 新增 **Step 3: 兼容性测试（Linux/WSL2）**，插入 Step 2 之后
- 原 Step 3（输出报告）顺延为 **Step 4**，报告格式追加 `#### 5. 兼容性测试（Linux/WSL2）` 小节
- frontmatter 的 `allowed-tools` 已含 Bash，无需修改

### Step 3 内容设计
1. **触发条件**：上架前需确认成品 Linux 可用；扩展含平台相关资源（.wasm/原生二进制/内嵌字体）；涉及文件系统/路径逻辑
2. **本机基线**：写入实测值（Ubuntu 24.04.1 LTS / 内核 6.18.35.2 / 16 核 / 15Gi / git 2.54.0 / chromium 未装 / bun、node 在 WSL 内不可用且无需安装）
3. **首次初始化**（一次性）：`sudo apt install -y chromium`；skill 生成 `~/ext-test/check.sh` 与配置模板；用当前产物跑一次基线校准
4. **每次测试流程**（单命令入口 `bash ~/ext-test/check.sh <产物目录>`）：

| 阶段 | 动作 | 耗时 | 重要性 |
|---|---|---|---|
| 0 产物同步 | `rsync -a --delete <产物目录>/ ~/ext-test/run/` | 5~10s | ★★★ |
| 1 静态预检 | manifest 可解析、_locales/icons 存在、权限位 644/755 | 5s | ★★★ |
| 2 加载验证 | headless chromium 加载，stderr 抓 manifest/SW/icon 错误 | 15~25s | ★★★ |
| 3 功能 smoke | 目标页面断言 CS 注入标志，日志无 Uncaught/ERROR | 10s | ★★★ |
| 4 平台专项 | 条件触发：file/ldd 查架构与 GLIBC（Ubuntu 24.04=2.39）；大小写核对 | 5~10s | ★★ |
| 5 深入交互 | WSLg 图形加载，手动比对 popup/UI 行为（可选） | 1~2min | ★ |

5. **常见坑**：/mnt/c 跨盘权限位异常、大小写敏感致资源路径失配、内嵌二进制缺 Linux 版或 GLIBC 过高、headless 无法覆盖 popup 交互（需 WSLg）

### 固化脚本 linux-compat-check.sh 设计
- 零依赖 bash，POSIX 兼容，含 `--init`（生成配置模板+目录结构）与默认（执行阶段 0~4）两种模式
- 读取 `~/ext-test/linux-compat.json`：`smoke.url`、`smoke.injectFlag`、`platform.resources[]`；配置缺失时跳过 smoke/平台专项并在输出中标注
- 输出机器可判定 PASS/FAIL 清单 + 各阶段耗时统计；退出码 0=全部通过、1=存在失败

### 关键接口契约

```bash
# check.sh 用法（固化后）
bash ~/ext-test/check.sh <产物目录>            # 常规测试（阶段 0~4）
bash ~/ext-test/check.sh --init <产物目录>      # 首次初始化：建目录+生成配置模板
bash ~/ext-test/check.sh --deep <产物目录>      # 含 WSLg 深入验证（阶段 5 引导）
```

```json
// linux-compat.json（每项目一份，skill 首次运行自动生成模板）
{
  "smoke": { "url": "", "injectFlag": "" },
  "platform": { "resources": [] }
}
```

## 执行注意
- 修改后完整通读 SKILL.md，确认 Step 编号、报告小节编号、触发词前后连贯
- 脚本保持零依赖，不得引入 jq/python 等未安装工具（用 grep/sed 解析 JSON 或降级为按行 key 匹配）
- 不修改既有 Step 1/2 内容，避免无关重构


## Agent Extensions

### Skill
- **skill-creator**
  - Purpose: 校验 SKILL.md 的 frontmatter（description、allowed-tools）、Markdown 结构与既有风格一致性，确认新增 Step 3 与脚本模板符合 CodeBuddy skill 标准
  - Expected outcome: 插入方案合规、无格式违规，编号连贯
- **extension_launch_checklist**
  - Purpose: 本任务修改目标本身，更新后需按其既有风格（中文编号步骤、置信度标注、检查项清单）校验新增内容与现有 Step 1/2 风格一致
  - Expected outcome: 新增 Step 3 与现有结构无缝衔接，触发词可被 skill 正常识别
