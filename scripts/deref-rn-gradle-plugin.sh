#!/usr/bin/env bash
# 把 apps/oa/node_modules/@react-native/gradle-plugin 从 pnpm 的 symlink
# 换成真实目录拷贝。
#
# 为什么需要：Android Studio 用 includeBuild 把该 gradle-plugin 作为「复合构建」
# 引入；pnpm 默认把它做成指向 ../../node_modules/.pnpm/... 的符号链接，AS 在导入
# 工程模型时会因「symlink 路径 ↔ 真实路径」对不上而报 `Missing ExternalProject for :`，
# 同步失败（命令行 ./gradlew 不受影响，所以只在 IDE 同步时暴露）。
# 把它落成真实目录后，AS 的工程模型即可正常解析。
#
# pnpm install 每次会把它还原成 symlink，故挂在 root postinstall 上自动修复。
# 幂等：已是真实目录则跳过。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LINK="$ROOT/apps/oa/node_modules/@react-native/gradle-plugin"

if [ ! -e "$LINK" ]; then
  echo "[deref-rn-gradle-plugin] 跳过：$LINK 不存在（尚未安装依赖？）"
  exit 0
fi

if [ ! -L "$LINK" ]; then
  echo "[deref-rn-gradle-plugin] 跳过：已是真实目录"
  exit 0
fi

TARGET="$(cd "$LINK" && pwd -P)"
echo "[deref-rn-gradle-plugin] 解除 symlink → 真实拷贝"
echo "  link:   $LINK"
echo "  target: $TARGET"
rm "$LINK"
cp -R "$TARGET" "$LINK"
echo "[deref-rn-gradle-plugin] 完成"
