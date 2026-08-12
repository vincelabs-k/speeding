---
name: update-skill-linux-test
overview: "更新 extension_launch_checklist skill 新增「Step 3: 兼容性测试（Linux/WSL2）」；测试用例（固化脚本 + 项目配置）落位到项目独立目录 tests/linux-compat/；并将测试用例规范写入项目规则 .codebuddy/rules/测试用例.mdc。验证成品扩展在 Linux 的安装与使用，首次初始化后每次测试 1 分钟内完成。"
todos:
  - id: validate-skill-spec
    content: 依据 [skill:skill-creator] 校验 SKILL.md 与 .mdc 规范，确认插入与落位方案
    status: pending
  - id: insert-linux-step
    content: 在 SKILL.md 插入 Step 3 兼容性测试并指引 tests/linux-compat/，原 Step 3 顺延 Step 4 追加报告小节
    status: pending
    dependencies:
      - validate-skill-spec
  - id: create-test-suite
    content: 新建 tests/linux-compat/check.sh（阶段 0~4、零依赖、PASS/FAIL+耗时）与 linux-compat.json 配置模板
    status: pending
    dependencies:
      - insert-linux-step
  - id: add-project-rule
    content: 新建 .codebuddy/rules/测试用例.mdc，固化测试用例目录/命名/schema/调用/边界规范
    status: pending
    dependencies:
      - create-test-suite
  - id: verify-all
    content: 通读 SKILL.md、check.sh、测试用例.mdc，核对编号/触发词连贯，用 [skill:skill-creator] 复核合规
    status: pending
    dependencies:
      - add-project-rule
---

## 产品概述

更新 `extension_launch_checklist` skill，新增「兼容性测试（Linux/WSL2）」步骤：验证**已构建成品扩展**在 Linux Chromium 中的安装与使用（manifest 解析、资源完整性、SW 启动、CS 注入、内嵌平台资源）。不重建产物、不涉及 bun/node 等开发工具链。

## 核心功能

- **测试用例独立落位**：测试脚本与断言配置放入项目内专门的测试用例目录 `tests/linux-compat/`，随项目版本控制、CI 可复用；skill 不再持有脚本实体，仅在项目缺失时生成模板
- **测试用例规范入项目 rules**：新增 `.codebuddy/rules/测试用例.mdc`，固化目录约定、文件命名、配置 schema、调用方式、边界与平台差异检查约定
- **验证对象为成品**：仅验证构建产物在 Linux 的安装与使用，与开发构建阶段完全解耦
- **高效两级流程**：首次初始化（一次性约 5~10min）后，每次测试单命令 40~60s 出结果；headless 快速路径 + WSLg 深入路径（可选）
- **实测基线**：写入真实 WSL2 信息（Ubuntu 24.04.1 LTS、内核 6.18.35.2-microsoft-standard-WSL2、16 核/15Gi、git 2.54.0、chromium 未装）
- **平台差异专项**：内嵌 .wasm/二进制 GLIBC 检查、Linux 大小写敏感、/mnt/c 权限位
- **报告联动**：输出报告追加「兼容性测试（Linux/WSL2）」小节，沿用【事实】/【推测】置信度标注


## 技术栈

- Bash 脚本（零依赖，WSL2 内直接运行，不引入 jq/python，用 grep/sed 解析）
- Markdown（SKILL.md）+ .mdc 项目规则（frontmatter 格式与现有 分发方式.mdc/国际化.mdc 一致）

## 实施方法

采用「skill 方法论层 + 项目测试用例层」两层架构：
- **SKILL.md Step 3** 定义触发条件、流程编排、判定标准与常见坑，并指引测试用例位置 `tests/linux-compat/`；若项目无 `tests/linux-compat/check.sh`，则由 skill 生成模板到该目录
- **tests/linux-compat/check.sh** 为固化断言脚本（项目资产，随版本控制，CI 可复用）；项目特定断言通过 `linux-compat.json` 注入
- **运行时暂存区** `~/ext-test/run/` 由脚本内部管理（不入版本库），规避 /mnt/c 跨盘权限位问题

## 修改目标

```
C:\Users\Mrzha\.codebuddy\skills\extension_launch_checklist\
└── SKILL.md                      # [MODIFY] 插入 Step 3，原 Step 3 顺延 Step 4 并追加报告小节

d:\code\speeding\
├── tests\
│   └── linux-compat\
│       ├── check.sh              # [NEW] 固化测试脚本（阶段 0~4、配置读取、PASS/FAIL 输出、耗时统计、零依赖）
│       └── linux-compat.json     # [NEW] 项目断言配置模板
└── .codebuddy\rules\
    └── 测试用例.mdc              # [NEW] 项目规则：测试用例规范（alwaysApply: true）
```

## 详细设计

### 1. SKILL.md 结构调整
- Step 1（静态基线核查）、Step 2（动态网络侦查）保持不变
- 新增 **Step 3: 兼容性测试（Linux/WSL2）**，插入 Step 2 之后，内容含：
  - 触发条件：上架前需确认成品 Linux 可用；扩展含平台相关资源（.wasm/原生二进制/内嵌字体）；涉及文件系统/路径逻辑
  - 本机基线：实测值（Ubuntu 24.04.1 LTS / 内核 6.18.35.2 / 16 核 / 15Gi / git 2.54.0 / chromium 未装）
  - 测试用例位置指引：`tests/linux-compat/check.sh` + `linux-compat.json`；缺失时生成模板
  - 首次初始化（一次性）：`sudo apt install -y chromium`；`check.sh --init` 生成配置模板；用当前产物跑一次基线校准
  - 每次测试流程表（阶段/动作/耗时/重要性）
  - 常见坑清单
- 原 Step 3（输出报告）顺延为 **Step 4**，报告格式追加 `#### 5. 兼容性测试（Linux/WSL2）` 小节
- frontmatter `allowed-tools` 已含 Bash，无需修改

### 2. 固化脚本 check.sh 设计
- 零依赖 bash，POSIX 兼容，三种模式：
  - 默认：执行阶段 0~4（产物同步 → 静态预检 → 加载验证 → 功能 smoke → 平台专项）
  - `--init`：初始化目录结构 + 生成 linux-compat.json 模板
  - `--deep`：阶段 5 WSLg 深入验证引导（可选）
- 阶段实现要点：
  - 阶段 0：`rsync -a --delete <产物目录>/ ~/ext-test/run/`
  - 阶段 1：manifest.json 存在且含 `manifest_version`/`name`/`version`；`_locales/`、`icons/` 必需资源存在；`stat -c %a` 权限位为 644/755，无 000/0600
  - 阶段 2：`chromium --headless=new --load-extension=~/ext-test/run --disable-extensions-except=~/ext-test/run --user-data-dir=<临时目录> --enable-logging=stderr --v=1`，从 stderr grep manifest 解析失败 / SW 启动报错 / icon 缺失关键字
  - 阶段 3：读取配置 `smoke.url`/`smoke.injectFlag`，`--dump-dom` 断言注入标志存在，日志无 Uncaught/ERROR
  - 阶段 4：条件触发（配置 `platform.resources[]` 非空时），`file` 查架构、`ldd` 查 GLIBC（Ubuntu 24.04 = GLIBC 2.39）；manifest 引用路径与磁盘文件名大小写核对
- 输出机器可判定 PASS/FAIL 清单 + 各阶段耗时统计；退出码 0=全部通过、1=存在失败
- 配置缺失时跳过 smoke/平台专项并在输出中标注

### 3. linux-compat.json 配置模板
```json
{
  "smoke": { "url": "", "injectFlag": "" },
  "platform": { "resources": [] }
}
```

### 4. 测试用例.mdc 项目规则（新增）
- frontmatter：`description` / `alwaysApply: true` / `enabled: true` / `updatedAt` / `provider`（与现有 .mdc 一致）
- 正文规范：目录约定（tests/linux-compat/）、文件命名（check.sh、linux-compat.json）、配置 schema、调用方式（`bash tests/linux-compat/check.sh <产物目录>`）、与 extension_launch_checklist skill 的联动、边界（不重建产物/不装 bun/node）、平台差异检查约定（GLIBC ≤ 2.39、大小写敏感、权限位）

## 执行注意

- 修改后完整通读 SKILL.md、check.sh、测试用例.mdc，确认 Step 编号、报告小节编号、触发词前后连贯
- 脚本保持零依赖（grep/sed 解析 JSON，按行 key 匹配，不引入 jq/python）
- 不修改既有 Step 1/2 内容与既有 rules 文件（分发方式.mdc/国际化.mdc）
- 产物路径占位符：Windows 侧 `d:/code/speeding/.output` 在 WSL 中对应 `/mnt/d/code/speeding/.output`，脚本经 `wsl -e bash -c` 执行


## Agent Extensions

### Skill
- **skill-creator**
  - Purpose: 校验 SKILL.md 更新与 .mdc 项目规则的 frontmatter（description/alwaysApply/enabled）与 Markdown 结构符合 CodeBuddy 规范，确认插入方案合规
  - Expected outcome: 新增 Step 3 与测试用例.mdc 无格式违规，结构可安全写入
- **extension_launch_checklist**
  - Purpose: 本任务修改目标本身，更新后按其既有风格（中文编号步骤、✅/❌/⚠️ 检查项、【事实】/【推测】置信度标注）校验新增 Step 3 与现有 Step 1/2 风格一致、触发词衔接
  - Expected outcome: 新增内容与现有结构无缝衔接，skill 触发词可正常识别新步骤
