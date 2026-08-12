#!/usr/bin/env bash
# =============================================================================
# WSL2 兼容性测试环境一键初始化（零依赖，WSL2 内运行）
# 幂等可重跑：已装依赖跳过、已生成配置跳过。
#
# 用法:
#   bash setup.sh                 # 阶段 A~D 全流程（含基线校准）
#   bash setup.sh --skip-baseline # 跳过阶段 D 基线校准
#
# 阶段:
#   A 环境自检   -> 发行版/内核/内存/磁盘 + WSLg
#   B 依赖安装   -> apt 装 rsync/unzip/curl；chromium 用 Chrome for Testing（CfT，
#                   ~/ext-test/chrome-linux64/chrome）软链 /usr/local/bin/chromium。
#                   Google Chrome 产品版硬禁用 --load-extension，无法用于黑盒加载
#   C 运行时初始化 -> 创建 ~/ext-test/run/ 运行时目录，清理旧版配置模板
#   D 基线校准   -> 用项目 .output/chrome-mv3/ 实跑 check.sh 存档 baseline.log
#
# 退出码: 0=全部 PASS, 1=存在 FAIL
# =============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CFG_DIR="${HOME}/ext-test"
BASELINE_LOG="${CFG_DIR}/baseline.log"
DEFAULT_PRODUCT="${PROJECT_ROOT}/.output/chrome-mv3"
NEED_SUDO_FIX=""

PASS=0
FAIL=0
declare -a FAIL_ITEMS=()
START=$(date +%s)

log()  { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
ok()   { printf '  \u2705 PASS  %s\n' "$*"; PASS=$((PASS+1)); }
bad()  { printf '  \u274c FAIL  %s\n' "$*"; FAIL=$((FAIL+1)); FAIL_ITEMS+=("$*"); }
skip() { printf '  \u26a0\ufe0f  SKIP  %s\n' "$*"; }

# =============================================================================
# 阶段 A: 环境自检
# =============================================================================
stage_a_env() {
  log "阶段 A: 环境自检"
  local os_name os_ver kernel mem_kb mem_gib disk_kb disk_gib cpu

  os_name="$(grep -E '^NAME=' /etc/os-release 2>/dev/null | sed -E 's/^NAME="?([^"]*)"?$/\1/')"
  os_ver="$(grep -E '^VERSION_ID=' /etc/os-release 2>/dev/null | sed -E 's/^VERSION_ID="?([^"]*)"?$/\1/')"
  kernel="$(uname -r 2>/dev/null)"
  cpu="$(nproc 2>/dev/null)"
  mem_kb="$(grep -m1 'MemTotal' /proc/meminfo 2>/dev/null | sed -E 's/[^0-9]//g')"
  [ -n "$mem_kb" ] && mem_gib=$(( mem_kb / 1024 / 1024 )) || mem_gib=0
  disk_kb="$(df -kP . 2>/dev/null | tail -1 | sed -E 's/ +/ /g' | cut -d' ' -f4)"
  [ -n "$disk_kb" ] && disk_gib=$(( disk_kb / 1024 / 1024 )) || disk_gib=0

  if [ -n "$os_name" ] && [ -n "$kernel" ]; then
    ok "发行版: ${os_name} ${os_ver:-?} / 内核 ${kernel}"
  else
    bad "无法识别发行版（/etc/os-release 或 uname 不可用）"
  fi
  ok "硬件: ${cpu:-?} 核 / ${mem_gib:-?} Gi 内存 / 可用磁盘 ${disk_gib:-?} Gi"
  [ "$disk_gib" -ge 5 ] || skip "可用磁盘不足 5G（${disk_gib}G），apt 安装可能失败"

  if [ -d /mnt/wslg ]; then
    ok "WSLg 可用（/mnt/wslg）"
  else
    skip "未检测到 /mnt/wslg（WSLg 图形能力受限；深入验证需 Windows 11 + wsl.conf 启用）"
  fi
}

# =============================================================================
# 阶段 B: 依赖安装（幂等）
# =============================================================================
# sudo 可用性探测：免密 > 交互输密码 > 失败
sudo_ensure() {
  if ! sudo -n true 2>/dev/null; then
    if ! sudo -v 2>/dev/null; then
      bad "sudo 不可用或无法交互输密码；请在交互终端执行: sudo -v 后再运行本脚本"
      NEED_SUDO_FIX=1
      return 1
    fi
    ok "sudo 交互认证成功"
  fi
  return 0
}

stage_b_deps() {
  log "阶段 B: 依赖安装（chromium / rsync / unzip）"
  local need="" p

  # ---- 基础依赖（apt）----
  for p in rsync unzip curl; do
    if command -v "$p" >/dev/null 2>&1; then
      skip "已安装，跳过: ${p}"
    else
      need="${need} ${p}"
    fi
  done
  if [ -n "$need" ]; then
    sudo_ensure || return 1
    log "apt-get update + install:${need}"
    if ! DEBIAN_FRONTEND=noninteractive sudo apt-get update -qq || \
       ! DEBIAN_FRONTEND=noninteractive sudo apt-get install -y ${need}; then
      bad "基础依赖安装失败，修复命令: sudo apt-get install -y${need}"
      NEED_SUDO_FIX=1
      return 1
    fi
    ok "基础依赖安装完成:${need}"
  else
    ok "基础依赖全部就绪"
  fi

  # ---- chromium（Chrome for Testing：Google Chrome 产品版硬禁用 --load-extension，
  #     无法用于黑盒加载；CfT 支持全部测试 flags）----
  local cft_bin="${CFG_DIR}/chrome-linux64/chrome"
  # 已就绪且为 CfT → 幂等确认软链后返回
  if [ -x "$cft_bin" ]; then
    sudo_ensure || return 1
    sudo ln -sf "$cft_bin" /usr/local/bin/chromium
    if command -v chromium >/dev/null 2>&1; then
      ok "chromium 就绪: /usr/local/bin/chromium -> Chrome for Testing ($(/usr/local/bin/chromium --version 2>/dev/null | head -1))"
      return 0
    fi
    bad "chromium 软链创建失败"
    return 1
  fi
  # 已有 chromium 且指向 CfT（非本机解压根）→ 直接使用
  if command -v chromium >/dev/null 2>&1 \
     && /usr/local/bin/chromium --version 2>/dev/null | grep -q "Google Chrome for Testing"; then
    ok "chromium 已就绪: $(command -v chromium)"
    return 0
  fi
  # 下载 Chrome for Testing 到 ~/ext-test（一次性，免 sudo；仅软链需 sudo 一次）
  local cft_ver cft_url zip="/tmp/cft.zip"
  log "获取 Chrome for Testing 最新稳定版号"
  cft_ver="$(curl -fsSL --max-time 60 https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_STABLE 2>/dev/null | head -1)"
  if [ -z "$cft_ver" ]; then
    bad "获取 CfT 版本号失败（网络不可达 googlechromelabs.github.io）"
    return 1
  fi
  cft_url="https://storage.googleapis.com/chrome-for-testing-public/${cft_ver}/linux64/chrome-linux64.zip"
  log "下载 Chrome for Testing ${cft_ver}（约 170MB，1~5min）"
  if ! curl -fsSL --max-time 600 -o "$zip" "$cft_url"; then
    bad "CfT 下载失败: ${cft_url}"
    rm -f "$zip"
    return 1
  fi
  if ! unzip -qo "$zip" -d "$CFG_DIR"; then
    bad "CfT 解压失败（zip 可能损坏）"
    rm -f "$zip"
    return 1
  fi
  rm -f "$zip"
  sudo_ensure || return 1
  sudo ln -sf "$cft_bin" /usr/local/bin/chromium
  if command -v chromium >/dev/null 2>&1; then
    ok "chromium 就绪: /usr/local/bin/chromium -> Chrome for Testing (${cft_ver})"
  else
    bad "chromium 软链创建失败"
    return 1
  fi
}

# =============================================================================
# 阶段 C: 运行时初始化
# =============================================================================
stage_c_runtime() {
  log "阶段 C: 运行时初始化（创建 ${CFG_DIR}/run/）"
  mkdir -p "${CFG_DIR}/run"
  # 清理黑盒改造前的旧版配置模板（check.sh 已不再依赖配置）
  if [ -f "${CFG_DIR}/linux-compat.json" ]; then
    rm -f "${CFG_DIR}/linux-compat.json"
    ok "已清理旧版配置模板: ${CFG_DIR}/linux-compat.json"
  else
    skip "无旧版配置模板需要清理"
  fi
  ok "运行时目录就绪: ${CFG_DIR}/run/"
}

# =============================================================================
# 阶段 D: 基线校准（可选，--skip-baseline 跳过）
# =============================================================================
stage_d_baseline() {
  if [ "${SKIP_BASELINE:-0}" -eq 1 ]; then
    skip "已通过 --skip-baseline 跳过基线校准"
    return 0
  fi
  log "阶段 D: 基线校准（${DEFAULT_PRODUCT} -> ${BASELINE_LOG}）"
  if [ ! -d "$DEFAULT_PRODUCT" ]; then
    skip "产物目录不存在（${DEFAULT_PRODUCT}），跳过校准；可后续手动: bash ${SCRIPT_DIR}/check.sh <产物目录>"
    return 0
  fi
  bash "${SCRIPT_DIR}/check.sh" "$DEFAULT_PRODUCT" 2>&1 | tee "$BASELINE_LOG"
  local rc=${PIPESTATUS[0]}
  if [ "$rc" -eq 0 ]; then
    ok "基线校准 PASS（结果存档: ${BASELINE_LOG}）"
  else
    bad "基线校准 FAIL（详见: ${BASELINE_LOG}）"
  fi
}

# =============================================================================
# 主流程
# =============================================================================
SKIP_BASELINE=0
case "${1:-}" in
  --skip-baseline) SKIP_BASELINE=1 ;;
  --help|-h|"") : ;;
  *) echo "用法: bash setup.sh [--skip-baseline]" >&2; exit 2 ;;
esac

log "===== WSL2 兼容性测试环境初始化 ====="
stage_a_env
stage_b_deps || true
stage_c_runtime
stage_d_baseline

# ---------- 汇总 ----------
END=$(date +%s)
echo ""
echo "================ 结果汇总 ================"
echo "PASS: ${PASS}   FAIL: ${FAIL}   总耗时: $((END-START))s"
if [ "$FAIL" -gt 0 ]; then
  echo "失败项:"
  for i in "${FAIL_ITEMS[@]}"; do echo "  - ${i}"; done
  [ -n "$NEED_SUDO_FIX" ] && echo "提示: sudo 相关失败请在 WSL 交互终端执行（wsl -e bash -c 无法交互输密码）"
  echo "初始化: ❌ 存在失败，请修复后重跑（脚本幂等，可安全重跑）"
  exit 1
fi
echo "初始化: ✅ 完成"
echo ""
echo "后续使用:"
echo "  1) 每次测试: wsl -e bash -c \"bash ${SCRIPT_DIR}/check.sh <产物目录|zip路径>\""
echo "  2) 深入验证: wsl -e bash -c \"bash ${SCRIPT_DIR}/check.sh --deep <产物目录>\"（需 WSLg 交互 shell 确认 DISPLAY）"
exit 0
