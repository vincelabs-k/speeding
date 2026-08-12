---
name: update-skill-linux-test
overview: 将 extension_launch_checklist skill 的 Linux 兼容验证从"speeding 项目专属草案"升级为通用、快速高效的 WSL2 验证步骤（含环境自检、快速/深入双路径、报告格式追加），并写入真实 WSL 基线数据。
todos:
  - id: validate-skill-spec
    content: 依据 [skill:skill-creator] 校验 SKILL.md 更新规范与 frontmatter 约束，确认插入方案
    status: pending
  - id: insert-linux-step
    content: 在 SKILL.md 插入通用化 Step 3（Linux 环境快速验证），含实测基线、工具自检安装、快速+深入两级流程、常见坑
    status: pending
    dependencies:
      - validate-skill-spec
  - id: renumber-report
    content: 原 Step 3 顺延为 Step 4，报告格式追加 Linux 验证小节并同步编号与触发词
    status: pending
    dependencies:
      - insert-linux-step
---

## 用户需求
更新 `extension_launch_checklist` skill（`C:\Users\Mrzha\.codebuddy\skills\extension_launch_checklist\SKILL.md`），新增"Linux 环境快速验证"步骤，基于本机 WSL2 提供**通用、快速、高效**的跨平台兼容测试能力——可复用于任意 Chromium 扩展/WXT 项目，而非仅 speeding。

## 核心功能
- **通用化**：验证流程不绑定具体项目，触发条件基于项目特征（含原生依赖如 `sharp`、代码含路径/文件系统逻辑、上架前需确认构建可复现）
- **实测基线**：写入 WSL2 真实系统信息（Ubuntu 24.04.1 LTS、内核 6.18.35.2-microsoft-standard-WSL2、16 核/15Gi 内存/磁盘 1007G、git 2.54.0 已装、bun 与 node 在 WSL 内不可用）
- **工具自检与安装**：提供 WSL 内环境自检命令，指出 Windows 版 bun（Volta 安装路径）在 WSL 内不可用的坑，含 bun/node 安装指引
- **两级验证路径**：
  - 快速路径（分钟级）：WSL 内 `bun install` + 构建 + ZIP 产物 SHA-256 与 Windows 构建比对
  - 深入路径（可选）：WSLg 真实 Chromium 加载扩展交互验证
- **常见坑清单**：`/mnt/c` 跨文件系统 I/O 慢、`\` vs `/` 路径分隔符、大小写敏感、sharp 平台二进制、GLIBC 兼容
- **报告联动**：输出报告追加"Linux 环境验证"小节，沿用【事实】/【推测】置信度标注约定
- **编号连贯**：现有 Step 编号与报告小节编号顺延，不破坏既有结构

## 技术方案

### 修改目标（唯一文件）
`C:\Users\Mrzha\.codebuddy\skills\extension_launch_checklist\SKILL.md`

### 结构调整
- 现有 Step 1（静态基线核查）、Step 2（动态网络侦查）保持不变
- **新增 Step 3: Linux 环境快速验证（WSL2）**，插入在 Step 2 之后
- 原 Step 3（输出报告）顺延为 **Step 4**，其报告格式追加 `#### 5. Linux 环境验证（WSL2）` 小节
- frontmatter 的 `allowed-tools: Read, Grep, Glob, WebSearch, WebFetch, Bash` 已含 Bash（可执行 `wsl -e bash -c`），**无需修改**

### 新增 Step 3 内容设计
1. **触发条件**：基于项目特征而非项目名——`package.json` 含原生依赖（sharp 等）、代码含平台相关路径逻辑、上架前需确认构建跨平台可复现
2. **本机基线**：写入实测值（Ubuntu 24.04.1 LTS / 内核 6.18.35.2 / 16 核 / 15Gi / git 2.54.0 / bun+node 未就绪）
3. **工具自检与安装**：一次性命令采集 `uname`、`os-release`、`nproc`、`free`、`df`、`bun --version`、`node --version`；若缺失则按官方方式安装（bun 装至 `~/.bun`），并明确警告**勿使用 `/mnt/c/.../Volta` 下的 Windows 版 bun**
4. **快速路径**：项目同步（优先 `git clone` 到 WSL 内部目录避免慢 I/O）→ 按项目 `package.json` 定义的 install/build 脚本执行 → ZIP 产物 SHA-256 与 Windows 构建比对（可复现性检查）→ 原生依赖平台二进制验证
5. **深入路径（可选）**：`apt install chromium` + WSLg 图形界面 + 项目 dev 脚本加载扩展交互验证
6. **常见坑**：`/mnt/c` 跨盘 I/O 慢、路径分隔符/大小写敏感、sharp linux-x64 二进制与 GLIBC、Windows 版 bun 误用

### 通用化策略
- 所有命令使用占位符与"项目 `package.json` 定义的脚本"，不出现具体项目名
- 触发条件、验证步骤、坑清单均以项目特征描述，保证 skill 可跨项目复用

### 校验
- 修改后完整通读 SKILL.md，确认 Step 编号、报告小节编号、触发词前后连贯
- 依据 [skill:skill-creator] 规范校验 frontmatter 与 Markdown 结构符合 CodeBuddy skill 标准

## Agent Extensions

### Skill
- **skill-creator**
  - Purpose: 依据 CodeBuddy skill 创建/更新规范，校验 SKILL.md 的 frontmatter（description、allowed-tools）、Markdown 结构与既有风格一致性，确保新增 Step 3 合规
  - Expected outcome: 确认插入方案符合 skill 标准，无格式违规，可安全写入
