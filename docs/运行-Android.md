# 在 Android 上运行 OpenDingDing（全过程要点）

> 本文是「运行已有工程」的速查。**从零搭建（含 TurboModule 三层桥接）见 [从零搭建-Android.md](./从零搭建-Android.md)。**
> 配套：通用环境见 [环境与磁盘布局.md](./环境与磁盘布局.md)，报错速查见 [踩坑速查.md](./踩坑速查.md)，
> 新增原生模块见 [模块开发指南.md](./模块开发指南.md)。

## 0. 一次性环境（写进 `~/.zshrc`）

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"   # JDK 21
export ANDROID_HOME="/Volumes/MacExtend/Envirment/Android/SDK"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

验证：`java -version` → 21；`adb version` → ok。

- **JDK 必须用 Android Studio 自带 JBR 21**。命令行 `./gradlew` 不带 `JAVA_HOME` 会报
  `Unable to locate a Java Runtime`。
- 全局设 JDK 21 会影响其它老项目；遇到要 JDK 17/11 的项目，在该项目临时
  `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`。

## 1. 跑到真机 / 模拟器（命令行，推荐）

```bash
# 终端 A：Metro（保持开着）
cd apps/oa && pnpm start

# 终端 B：连真机后
adb devices                                 # 确认设备是 device 不是 offline/unauthorized
adb -s <serial> reverse tcp:8081 tcp:8081   # 关键！否则真机连不上 Metro → 白屏
cd apps/oa/android && ./gradlew :app:installDebug
adb -s <serial> shell am start -n com.opendingding/.MainActivity
```

- **`adb reverse` 每次重插 USB / 重启手机 / 重启 adb 后都要重做**——上次「白屏」的真正原因，不是代码问题。
- 多设备时 gradle/adb 报 "more than one device"，用 `-s <serial>` 指定，或关掉模拟器。
- 小米 MIUI 装包要开「USB 安装」且手机上点确认，否则 `INSTALL_FAILED_USER_RESTRICTED`。

## 2. 开发循环

- 改 **JS**：不用重装，Fast Refresh 自动刷；或摇一摇 / `adb shell input keyevent 82` → Reload。
- 改 **原生 / 新增 @itc 模块**：重跑 `./gradlew :app:installDebug`（autolink 自动注册原生）。

## 3. 用 Android Studio 打开 `apps/oa/android`

本仓库是 **pnpm monorepo**，Android Studio 同步有两个独有坑（命令行 `./gradlew` 不受影响，所以只在 IDE 暴露）：

### 坑 A：从 Dock 启动 → `Exec failed, error: 2` → `Missing ExternalProject for :`
`settings.gradle` 的 `autolinkLibrariesFromCommand()` 在同步时会 exec **`node`**。
Dock 启动的 AS 拿不到 shell PATH（node 在 `/usr/local/bin`），exec 失败 → 工程模型残缺。
**对策**：从终端启动 AS，使其继承 PATH：
```bash
"/Applications/Android Studio.app/Contents/MacOS/studio" &
```
（永久办法：`sudo launchctl config user path "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"` 后重启，让 Dock 启动也带 node。）

### 坑 B：pnpm symlink 的复合构建 → `Missing ExternalProject for :`
`@react-native/gradle-plugin` 被 `includeBuild` 引入；pnpm 把它做成指向 `.pnpm` 的 symlink，
AS 因「symlink ↔ 真实路径」对不上而报错。**已用 `postinstall` 自动 deref 成真实目录**
（`scripts/deref-rn-gradle-plugin.sh`）。全新 `pnpm install` 后若 AS 又报错，手动
`pnpm run postinstall`。

> 排查记录：`~/Library/Logs/Google/AndroidStudio*/idea.log` 里搜 `Missing ExternalProject` / `Exec failed`。

## 4. 关键事实

- 包名 / Activity：`com.opendingding/.MainActivity`。
- `newArchEnabled=true`、`hermesEnabled=true`（新架构 + Hermes）。
- compileSdk 36 / targetSdk 34 / minSdk 24 / NDK 29 / AGP 经 RN react.rootproject 插件托管。
- storage 走 MMKV、biometric 走 Keystore/BiometricPrompt（人脸=弱生物识别，详见 [biometric 约束](./踩坑速查.md)）。
