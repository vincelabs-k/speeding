---
name: update-skill-linux-test
overview: 修正方向：将 extension_launch_checklist skill 新增的 Linux 验证步骤定位为"成品扩展在 Linux 环境的安装与使用验证"（基于 WSL2 + Linux Chromium 加载已构建产物），而非开发工具链验证。通用化、两级流程（headless 快速 smoke + WSLg 深入交互）、报告联动。
todos:
  - id: validate-skill-spec
    content: 依据 [skill:skill-creator] 校验 SKILL.md 规范与 frontmatter，确认插入方案
    status: pending
  - id: insert-linux-step
    content: 插入通用化 Step 3（Linux 成品兼容性验证）：实测基线、前置、预检、加载验证、两级流程、平台差异专项
    status: pending
    dependencies:
      - validate-skill-spec
  - id: renumber-report
    content: 原 Step 3 顺延为 Step 4，报告追加 Linux 成品验证小节并同步编号与触发词
    status: pending
    dependencies:
      - insert-linux-step
---


## 产品概述
更新 `extension_launch_checklist` skill（`C:\Users\Mrzha\.codebuddy\skills\extension_launch_checklist\SKILL.md`），新增"Linux 成品兼容性验证"步骤：验证**已构建成品插件**在 Linux Chromium 中的安装与使用，覆盖上架前跨平台可用性检查。

## 核心功能
- **验证对象为成品**：仅验证构建产物（zip 或解压目录）在 Linux 的安装（manifest 解析、资源完整性、权限位）与使用（SW 启动、CS 注入、popup、内嵌平台资源）。**不涉及** bun/node 等开发构建工具链，不重建产物
- **通用化**：触发条件、命令、坑清单均基于项目特征与占位符（`<产物目录>`），不绑定具体项目，可跨任意 Chromium 扩展/WXT 项目复用
- **快速高效**：基于本机 WSL2 Ubuntu，分钟级完成——headless smoke 快速路径 + WSLg 图形深入路径两级
- **实测基线**：写入真实 WSL2 系统信息（Ubuntu 24.04.1 LTS、内核 6.18.35.2-microsoft-standard-WSL2、16 核/15Gi 内存、git 2.54.0、chromium 未装）
- **平台差异专项**：内嵌 .wasm/二进制兼容（file/ldd/GLIBC）、Linux 大小写敏感、/mnt/c 跨文件系统权限位
- **报告联动**：输出报告追加"Linux 成品兼容性验证"小节，沿用【事实】/【推测】置信度标注



## 技术方案
### 修改目标
唯一文件：`C:\Users\Mrzha\.codebuddy\skills\extension_launch_checklist\SKILL.md`

### 结构调整
- Step 1（静态基线核查）、Step 2（动态网络侦查）保持不变
- 新增 **Step 3: Linux 成品兼容性验证（WSL2）**，插入 Step 2 之后
- 原 Step 3（输出报告）顺延为 **Step 4**，报告格式追加 `#### 5. Linux 成品兼容性验证（WSL2）` 小节
- frontmatter `allowed-tools: Read, Grep, Glob, WebSearch, WebFetch, Bash` 已含 Bash（可执行 `wsl -e bash -c`），无需修改

### Step 3 内容设计（核心）
1. **触发条件**：上架前需确认成品 Linux 可用；扩展含平台相关资源（.wasm/原生模块/二进制/内嵌字体）；涉及文件系统/路径逻辑；与 Step 1 静态核查联动触发
2. **本机基线**：写入实测值（Ubuntu 24.04.1 LTS / 内核 6.18.35.2 / 16 核 / 15Gi / git 2.54.0 / chromium 未装）
3. **前置条件**：Windows 侧已构建产物（zip 或解压目录）；WSL 一次性 `sudo apt install -y chromium`
4. **验证流程（顺序执行）**：
   - 静态预检：解压 zip，检查 manifest.json/_locales/icons 存在性与权限位（zip 解压后可能丢失可读位）
   - 加载验证：`chromium --headless=new --load-extension=<产物目录> --disable-extensions-except=<产物目录> --user-data-dir=<临时目录> --enable-logging=stderr --v=1`，从 stderr 抓取 manifest 解析失败 / SW 启动报错 / icon 缺失日志
   - 快速 smoke：headless + 目标页面确认 content script 注入，日志无 Uncaught/ERROR
   - 深入验证（可选）：WSLg 图形界面加载扩展，手动跑核心功能流程，与 Windows 行为比对
   - 平台差异专项：内嵌二进制 `file`/`ldd` 与 GLIBC 版本比对（Ubuntu 24.04 = GLIBC 2.39）；manifest 引用路径与磁盘文件名大小写核对；产物建议拷入 WSL 内部目录（~）再加载，规避 /mnt/c 权限位异常
5. **常见坑**：/mnt/c 跨盘权限位异常、Linux 大小写敏感致资源路径失配、内嵌原生二进制缺 Linux 版或 GLIBC 过高、headless 无法覆盖 popup UI 交互（需 WSLg）

### 通用化与边界
- 所有命令使用占位符与项目无关描述，不出现具体项目名
- 明确"不重建产物、不装 bun/node"的验证边界，与开发构建阶段完全解耦

### 校验
- 修改后完整通读 SKILL.md：Step 编号、报告小节编号、触发词连贯
- 依据 [skill:skill-creator] 校验 frontmatter 与 Markdown 结构合规


## Agent Extensions
### Skill
- **skill-creator**
  - Purpose: 依据 CodeBuddy skill 创建/更新规范，校验 SKILL.md 的 frontmatter（description、allowed-tools）、Markdown 结构与既有风格一致性，确认新增 Step 3 合规
  - Expected outcome: 确认插入方案符合 skill 标准，无格式违规，可安全写入
