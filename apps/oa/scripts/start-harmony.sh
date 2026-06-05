#!/usr/bin/env bash
# 起鸿蒙 Metro，并在之前自动设端口转发（hdc rport，等价安卓的 adb reverse）。
# hdc 自解析：不依赖 PATH/zshrc，避免 `sh: hdc: command not found`。
set -e

# 解析 hdc：① PATH；② $DEVECO_SDK_HOME；③ DevEco 默认安装位置。
HDC="$(command -v hdc 2>/dev/null || true)"
if [ -z "$HDC" ]; then
  for base in "$DEVECO_SDK_HOME" "/Applications/DevEco-Studio.app/Contents/sdk"; do
    cand="$base/default/openharmony/toolchains/hdc"
    if [ -n "$base" ] && [ -x "$cand" ]; then HDC="$cand"; break; fi
  done
fi

if [ -n "$HDC" ]; then
  echo "[start:harmony] hdc rport tcp:8081 tcp:8081（$HDC）"
  "$HDC" rport tcp:8081 tcp:8081 || true   # 已设过会报 already，无害
else
  echo "[start:harmony] ⚠️ 找不到 hdc，跳过端口转发。"
  echo "  设备连不上 Metro（旧界面/白屏）时，手动：hdc rport tcp:8081 tcp:8081"
fi

# 起鸿蒙专用 Metro（cwd 由 pnpm 设为 apps/oa）。
exec ./node_modules/.bin/react-native start --config metro.config.harmony.js
