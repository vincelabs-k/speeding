#!/usr/bin/env bash
# =============================================================================
# Linux 成品扩展兼容性测试（黑盒，零依赖，WSL2 内运行）
# 由真实 Chromium 加载已构建成品扩展，依据浏览器产生的注册证据
# 判定扩展能否正常安装 —— 浏览器自己裁决，不解析产物文件内容。
# 不重建产物、不安装 bun/node —— 与开发构建阶段完全解耦。
#
# 用法:
#   bash check.sh <产物目录|zip路径>            # 阶段 0~1（常规，约 10~20s）
#   bash check.sh --deep <产物目录|zip路径>     # 阶段 0~2（追加 WSLg 深入交互引导）
#
# 判定依据（黑盒）:
#   浏览器成功注册 unpacked 扩展后，会在 <user-data-dir>/Default/Preferences 的
#   "extensions":{"settings":{...}} 中写入该扩展的加载路径 "path":"<RUN_DIR>"。
#   此记录仅对本次 --load-extension 加载的扩展写入，天然排除 Chrome 内置组件；
#   manifest/_locales 无效或加载失败则无该记录 → FAIL。
#   （浏览器须为 Chrome for Testing：Google Chrome 产品版硬禁用 --load-extension）
#
# 退出码: 0=全部 PASS, 1=存在 FAIL
# =============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CFG_DIR="${HOME}/ext-test"
RUN_DIR="${CFG_DIR}/run"
CHROMIUM_BIN="${CHROMIUM_BIN:-chromium}"

PASS=0
FAIL=0
declare -a FAIL_ITEMS=()
START=$(date +%s)

log()  { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
ok()   { printf '  \u2705 PASS  %s\n' "$*"; PASS=$((PASS+1)); }
bad()  { printf '  \u274c FAIL  %s\n' "$*"; FAIL=$((FAIL+1)); FAIL_ITEMS+=("$*"); }
skip() { printf '  \u26a0\ufe0f  SKIP  %s\n' "$*"; }

# 黑盒强证据：浏览器加载的 unpacked 扩展会在 Preferences 记录加载路径。
# 仅匹配指向 RUN_DIR 的 "path" 记录，天然排除 Chrome 内置组件（COMPONENT）噪音。
# ext_registered: 0=已注册 / 1=未注册
ext_registered() {
  grep -Fq "\"path\":\"${RUN_DIR}\"" "$1" 2>/dev/null
}
# ext_id_of: 尽力提取该加载路径记录对应的扩展 ID（32 位 [a-p]）
ext_id_of() {
  grep -oE '\"[a-p]{32}\":\{\"path\":\"'"$RUN_DIR"'"' "$1" 2>/dev/null \
    | grep -oE '[a-p]{32}' | head -1
}

# ---------- 阶段 0: 产物同步 ----------
stage0_sync() {
  local src="$1"
  log "阶段 0: 产物同步（rsync -> ${RUN_DIR}）"
  if ! command -v rsync >/dev/null 2>&1; then
    bad "rsync 未安装（sudo apt install -y rsync）"
    return 1
  fi
  if [ -f "$src" ] && [[ "$src" == *.zip ]]; then
    if ! command -v unzip >/dev/null 2>&1; then
      bad "unzip 未安装（sudo apt install -y unzip）"
      return 1
    fi
    rm -rf "$RUN_DIR"
    mkdir -p "$RUN_DIR"
    unzip -qo "$src" -d "$RUN_DIR" || { bad "zip 解压失败: $src"; return 1; }
  else
    mkdir -p "$RUN_DIR"
    rsync -a --delete "${src}/" "${RUN_DIR}/" || { bad "rsync 同步失败: $src"; return 1; }
  fi
  ok "产物已同步至 ${RUN_DIR}"
}

# ---------- 阶段 1: 黑盒安装判定 ----------
stage1_install() {
  log "阶段 1: 黑盒安装判定（chromium 加载 -> 浏览器注册证据）"
  if ! command -v "$CHROMIUM_BIN" >/dev/null 2>&1; then
    bad "chromium 未安装（请先执行 setup.sh：安装 Chrome for Testing 并软链 /usr/local/bin/chromium）"
    return 1
  fi
  local tmp profile prefs logf dom pid id
  tmp="$(mktemp -d)"
  profile="${tmp}/profile"
  prefs="${profile}/Default/Preferences"
  logf="${tmp}/load.log"
  dom="${tmp}/dom.txt"

  # 主判定：--dump-dom 使 Chrome 正常退出并 flush Preferences，
  # --virtual-time-budget 给足扩展注册窗口
  timeout 30 "$CHROMIUM_BIN" --headless=new --disable-gpu \
    --load-extension="$RUN_DIR" --disable-extensions-except="$RUN_DIR" \
    --user-data-dir="$profile" --enable-logging=stderr \
    --virtual-time-budget=15000 --dump-dom about:blank >"$dom" 2>"$logf" \
    || true

  if ext_registered "$prefs"; then
    id="$(ext_id_of "$prefs")"
    if [ -n "$id" ]; then
      ok "扩展已被浏览器注册（ID: ${id}）"
    else
      ok "扩展已被浏览器注册（加载路径: ${RUN_DIR}）"
    fi
    rm -rf "$tmp"
    return 0
  fi

  # 兜底重试：后台加载后优雅退出，规避 Preferences 未 flush 的时序竞态
  skip "首轮未捕获注册记录，兜底重试（后台加载 6s 后优雅退出）"
  "$CHROMIUM_BIN" --headless=new --disable-gpu \
    --load-extension="$RUN_DIR" --disable-extensions-except="$RUN_DIR" \
    --user-data-dir="$profile" --enable-logging=stderr \
    about:blank >/dev/null 2>"${logf}.retry" &
  pid=$!
  sleep 6
  kill -TERM "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true

  if ext_registered "$prefs"; then
    id="$(ext_id_of "$prefs")"
    if [ -n "$id" ]; then
      ok "扩展已被浏览器注册（ID: ${id}）"
    else
      ok "扩展已被浏览器注册（加载路径: ${RUN_DIR}）"
    fi
  else
    bad "浏览器未注册该扩展（manifest/_locales 无效或加载失败）"
    local err
    err="$(grep -E "Failed to load extension|Could not load manifest|Not a valid tree|Manifest is not valid|not a valid manifest|Service Worker registration failed|Failed to load icon|Could not load icon|Uncaught" "$logf" "${logf}.retry" 2>/dev/null | head -5)"
    if [ -n "$err" ]; then
      echo "  诊断（浏览器日志）:"
      printf '%s\n' "$err" | sed 's/^/      /'
    else
      echo "  提示: 日志无明确错误，可 --deep 用图形模式人工核对"
    fi
  fi
  rm -rf "$tmp"
}

# ---------- 阶段 2: WSLg 深入交互（引导，可选） ----------
stage2_deep() {
  log "阶段 2: WSLg 深入交互（可选）"
  local display_ok=0
  if [ -n "${DISPLAY:-}" ] || [ -d /mnt/wslg ]; then display_ok=1; fi
  [ "$display_ok" -eq 1 ] && ok "WSLg 环境可用（DISPLAY=${DISPLAY:-:0}）" \
    || skip "未检测到 WSLg（需 wsl.conf 启用 WSLg 或 Windows 11）"
  cat <<EOF
  图形加载命令（手动执行）:
    ${CHROMIUM_BIN} --load-extension=${RUN_DIR} --disable-extensions-except=${RUN_DIR} \
             --user-data-dir=${CFG_DIR}/user-deep
  手动核对（与 Windows 侧行为比对）:
    1) 扩展已出现在工具栏且图标正常
    2) popup 打开无报错，核心功能流程走通
    3) 右键菜单 / 页面注入行为一致
EOF
}

# =============================================================================
# 主流程
# =============================================================================
DEEP=0
PRODUCT=""
case "${1:-}" in
  --deep)
    DEEP=1
    PRODUCT="${2:-}"
    ;;
  --help|-h|"")
    echo "用法: bash check.sh [--deep] <产物目录|zip路径>" >&2
    exit 2
    ;;
  *)
    PRODUCT="${1:-}"
    ;;
esac

if [ -n "$PRODUCT" ]; then
  log "===== Linux 成品兼容性测试（黑盒）====="
  log "产物: ${PRODUCT}"
  stage0_sync "$PRODUCT"
  stage1_install
  [ "$DEEP" -eq 1 ] && stage2_deep
else
  echo "用法: bash check.sh [--deep] <产物目录|zip路径>" >&2
  exit 2
fi

# ---------- 汇总 ----------
END=$(date +%s)
echo ""
echo "================ 结果汇总 ================"
echo "PASS: ${PASS}   FAIL: ${FAIL}   总耗时: $((END-START))s"
if [ "$FAIL" -gt 0 ]; then
  echo "失败项:"
  for i in "${FAIL_ITEMS[@]}"; do echo "  - ${i}"; done
  echo "门禁: ❌ 存在失败，禁止发布"
  exit 1
fi
echo "门禁: ✅ 全部通过"
exit 0
