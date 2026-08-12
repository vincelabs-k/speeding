---
name: linux-compat-黑盒改造
overview: 将 tests/linux-compat/check.sh 从「白盒静态解析 + 伪黑盒加载」改造为「纯黑盒：由 WSL 真实 chromium 加载产物，依据浏览器持久化注册状态（Preferences）与内部页面证据裁决安装成败」，同步删除配置断言文件、更新 setup.sh 与规则文档。
todos:
  - id: rewrite-check-sh
    content: 重写 check.sh 为纯黑盒：删除白盒阶段/配置解析，新增 chromium 加载 + Preferences 注册证据判定
    status: completed
  - id: sync-setup-json
    content: 更新 setup.sh 移除 --init 与配置依赖，删除 linux-compat.json
    status: completed
    dependencies:
      - rewrite-check-sh
  - id: update-rule-doc
    content: 同步测试用例.mdc：删除配置 schema，更新验证维度与耗时约定
    status: completed
    dependencies:
      - rewrite-check-sh
  - id: verify-blackbox-fail
    content: 用带 _generated bug 的 .output/chrome-mv3 实跑 check.sh，确认黑盒判定 FAIL
    status: completed
    dependencies:
      - sync-setup-json
      - update-rule-doc
---


## 产品概述
将 `tests/linux-compat/check.sh` 从白盒静态解析改造为**纯黑盒检查**：由 WSL 中安装的真实 Chromium 加载构建产物，通过浏览器产生的可观测状态判定扩展能否正常安装，不再解析产物文件内容。

## 核心功能
- 用真实 chromium（headless）以 `--load-extension` 加载产物，浏览器自己裁决安装成败
- 判定依据 = 浏览器注册证据：扩展注册成功后写入 `<user-data-dir>/Default/Preferences` 的 `extensions.settings`（32 位 `[a-p]` 扩展 ID）；未注册（manifest/locale 无效）则无记录
- 彻底删除白盒阶段：阶段 1 静态预检（manifest/图标/权限位）、阶段 1b 语言包 schema、阶段 4 平台专项（file/ldd/GLIBC）
- 删除运行级 smoke（阶段 3）与 `linux-compat.json` 配置；删除 `--init` 配置模板分支
- 保留：阶段 0 产物同步、`--deep` WSLg 交互引导、PASS/FAIL 汇总与退出码门禁（0=通过 / 1=失败）
- 测试耗时从约 40~60s 降至单次 chromium 启动级别（约 10~20s）



## 技术栈
- bash 零依赖（grep/sed，不引入 jq/python），WSL2 内运行
- Chromium（Google Chrome deb + 软链 `/usr/local/bin/chromium`，已由 setup.sh 就绪）
- 黑盒证据源：Chrome `Default/Preferences` 的 `extensions.settings`（仅扩展注册成功才写入）

## 实现方案
### 核心判定（黑盒）
扩展被浏览器成功注册后，Chrome 会将 `<32位扩展ID>` 作为 key 写入 `--user-data-dir/Default/Preferences` 的 `"extensions":{"settings":{...}}`。判定流程：

1. 用 `timeout 30 chromium --headless=new --disable-gpu --load-extension=$RUN_DIR --disable-extensions-except=$RUN_DIR --user-data-dir=$PROFILE --virtual-time-budget=15000 --dump-dom about:blank` 加载产物（`--dump-dom` 使 Chrome 正常退出并 flush Preferences；虚拟时间给足扩展注册窗口）
2. 读取 `$PROFILE/Default/Preferences`，用 `grep -oE '"[a-p]{32}"[[:space:]]*:[[:space:]]*\{'` 提取扩展注册记录
3. 命中 → PASS「扩展已注册（浏览器加载成功）」；未命中 → 兜底重试：后台启动 + sleep 6 + `kill -TERM` 优雅退出再读一次，仍无 → FAIL「浏览器未注册该扩展」
4. stderr 日志保留为诊断输出（不参与判定，仅 FAIL 时打印辅助定位）

### 防误报设计
- 全新 `--user-data-dir` 保证 profile 干净，任意 32 位 `[a-p]` ID 即本次加载的扩展
- `--virtual-time-budget` + `--dump-dom` 自然退出优先；兜底 SIGTERM 重试规避 Preferences 未 flush 的时序竞态
- 若 Preferences 文件不存在或 chromium 未安装 → FAIL（环境问题也阻断发布，符合门禁语义）

### 性能
- 单次 chromium 启动 + 磁盘读，约 10~20s，无循环探测开销
- 不重建产物、不解析产物内容，与构建阶段完全解耦

## 架构设计
```
check.sh（纯黑盒，3 阶段）
  stage0_sync    产物同步（rsync/unzip → ~/ext-test/run/）          [保留]
  stage1_install 黑盒安装判定（chromium 加载 → Preferences 注册证据）[重写 stage2_load]
  stage2_deep    WSLg 图形交互引导（--deep 时）                      [原 stage5，保留]

setup.sh（同步简化）
  stage_c_runtime 仅 mkdir -p RUN_DIR，不再调 check.sh --init
  stage_d_baseline 用 .output/chrome-mv3 实跑 check.sh 存档 baseline [保留]

删除：linux-compat.json、get_cfg_file/get_str/get_arr、stage1/1b/3/4、--init 分支
```

## 目录结构
```
d:/code/speeding/
├── tests/linux-compat/
│   ├── check.sh          # [MODIFY] 重写为纯黑盒：删白盒阶段与配置解析，新增 stage1_install（chromium 加载 + Preferences 注册证据判定），保留 stage0_sync/stage5_deep/汇总门禁
│   ├── setup.sh          # [MODIFY] stage_c_runtime 移除 check.sh --init 与 url/injectFlag 读取，删除 RUN_CFG；保留依赖安装与基线校准
│   ├── linux-compat.json # [DELETE] 配置已不需要，随白盒阶段一并移除
│   └── (check.sh --init 生成的 ~/ext-test/linux-compat.json 由脚本逻辑删除，不入版本库)
└── .codebuddy/rules/
    └── 测试用例.mdc      # [MODIFY] 删除 linux-compat.json 行与配置 schema，更新验证维度（黑盒安装注册）与耗时描述，删除 GLIBC/大小写/权限位白盒约定
```

## 实现要点
- `set -uo pipefail`、PASS/FAIL/FAIL_ITEMS 计数与退出码门禁逻辑原样保留
- 兜底重试只做一次，避免无限循环；全部路径（chromium 缺失、Preferences 缺失、超时）都落到明确 PASS/FAIL/SKIP
- stderr 日志仅 FAIL 时输出，避免误把 Chrome 噪音当错误
- 规则文档与脚本行为保持一致：验证维度改为「浏览器安装注册（黑盒）」

