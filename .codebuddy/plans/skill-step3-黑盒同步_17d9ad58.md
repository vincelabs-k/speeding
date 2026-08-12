---
name: skill-step3-黑盒同步
overview: 更新 extension_launch_checklist skill 的 Step 3「发布前测试」，消除全部白盒残留（已删除的 linux-compat.json 配置编辑、静态预检/加载验证/smoke/平台专项阶段表、Google Chrome 基线、大小写/GLIBC 坑点），使 skill 对测试用例的调用描述与黑盒改造后的 tests/linux-compat/check.sh 完全一致（纯黑盒）。
todos:
  - id: align-skill-step3
    content: 用 extension_launch_checklist skill 定位 SKILL.md Step 3.1 全部白盒残留
    status: completed
  - id: rewrite-step3-blackbox
    content: 重写 SKILL.md Step 3.1 六处：验证对象/CfT 基线/删配置步骤/耗时/3 阶段表/黑盒坑
    status: completed
    dependencies:
      - align-skill-step3
  - id: verify-step3-consistency
    content: 重新加载 skill 核对 Step 3 与黑盒脚本一致，无白盒术语残留
    status: completed
    dependencies:
      - rewrite-step3-blackbox
---


## 产品概述
检查 `extension_launch_checklist` skill 的 Step 3「发布前测试」对测试套件的调用描述是否与当前已黑盒改造的 `tests/linux-compat/` 一致；不一致则修正，使测试用例调用描述为**纯黑盒主导**。

## 检查结论（已确认存在 6 处白盒残留）
Skill 源文件 `C:\Users\Mrzha\.codebuddy\skills\extension_launch_checklist\SKILL.md` 的 Step 3.1（第 66-94 行）仍描述旧白盒流程，与黑盒 `check.sh` 严重脱节：

| # | 位置 | 白盒残留 | 应改为（黑盒事实） |
|---|---|---|---|
| 1 | 第 68 行 | 验证对象「manifest 解析、资源完整性、SW 启动、CS 注入、内嵌平台资源」 | 浏览器安装注册：CfT 以 `--load-extension` 加载，以 Preferences `"path":"<RUN_DIR>"` 注册证据裁决，不解析产物内容 |
| 2 | 第 72 行 | 「setup.sh 安装 Google Chrome 并软链」 | Chrome for Testing（Google Chrome 产品版硬禁用 `--load-extension`，无法黑盒） |
| 3 | 第 76 行 | 「编辑 `~/ext-test/linux-compat.json`：填 smoke.url/injectFlag/platform.resources」 | 删除该步（配置已移除，初始化仅 setup.sh 一键 + baseline.log 复核） |
| 4 | 第 79 行 | 「约 40~60s」 | 约 10~20s（实测 1~7s） |
| 5 | 第 81-88 行 | 阶段表含 1 静态预检 / 2 加载验证(stderr) / 3 功能 smoke / 4 平台专项(file/ldd/GLIBC) | 实际 3 阶段：0 产物同步 / 1 黑盒安装判定 / 2 深入交互(--deep) |
| 6 | 第 90-94 行 | 常见坑含「大小写敏感」「GLIBC ≤ 2.39」，缺黑盒坑 | 删除白盒坑，新增「必须用 CfT」「path 记录防内置组件误判」 |

## 核心功能
- 修正 SKILL.md Step 3/3.1（第 58-94 行）为纯黑盒调用描述，与 check.sh、setup.sh、测试用例.mdc 实际行为 100% 一致
- Step 1/2/4 及 Step 3 通用指令区（套件识别规则）不动
- 修改后重新加载 skill 验证 Step 3 描述与黑盒脚本一致



## 技术栈
- 目标文件：`C:\Users\Mrzha\.codebuddy\skills\extension_launch_checklist\SKILL.md`（用户全局 skill，工作区外，非项目内文件）
- 无需改动项目代码：`tests/linux-compat/check.sh`、`setup.sh`、`.codebuddy/rules/测试用例.mdc` 已是纯黑盒（上一计划已改造并验证）

## 实现方案
对 SKILL.md 的 Step 3.1 做**最小化文本替换**（6 处），对齐以下已确认的黑盒事实：
- 浏览器：Chrome for Testing（软链 `/usr/local/bin/chromium`；Google Chrome 产品版编译时硬禁用 `--load-extension`）
- 判定：Preferences `"extensions":{"settings":{...}}` 中 `"path":"<RUN_DIR>"` 加载路径强证据；仅凭 32 位 `[a-p]` ID 存在会误判（内置 COMPONENT 组件也写入 settings）
- 阶段：0 产物同步（rsync/unzip → `~/ext-test/run/`，规避 /mnt/c 跨盘）→ 1 黑盒安装判定（CfT headless 加载 + path 证据，FAIL 时输出 stderr 诊断）→ 2 深入交互（--deep，WSLg 可选）
- 初始化：setup.sh 一键（阶段 A~D）；CfT 下载免 sudo，仅软链需 sudo 一次；阶段 C 自动清理旧版 linux-compat.json
- 耗时：常规约 10~20s（实测 1~7s）

## 实现要点
- 仅替换 Step 3.1 六处，保持 Step 3 指令区「套件识别规则」与 Step 1/2/4 原文不动
- 修改后重新用 use_skill 加载，逐条核对 Step 3 与黑盒脚本/规则文档一致（无残留白盒术语：manifest 解析、GLIBC、大小写、smoke.url、injectFlag、linux-compat.json、Google Chrome deb）


## Agent Extensions
### Skill
- **extension_launch_checklist**
  - Purpose：修改前已加载确认 Step 3.1 的 6 处白盒残留位置；修改完成后再次加载，逐条核对 Step 3 描述与黑盒 check.sh/setup.sh/测试用例.mdc 完全一致
  - Expected outcome：skill 的发布前测试门禁描述与项目纯黑盒测试套件 100% 对齐，无任何白盒术语残留
