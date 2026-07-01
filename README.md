# OpenOA

对标钉钉的**模块化 OA App**。业务与端能力解耦，端能力模块（生物识别 / 推送 / IM）可从本项目**剥离复用**到其他项目。三端：Android / iOS / 鸿蒙 NEXT。

> 本文件是开发手册，命令可直接复制执行。
> **⚡ 三端环境 + 命令一页速查**：[docs/速查手册.md](docs/速查手册.md)（export 与三端命令都在这）。
> **从零搭建教程（事无巨细，可据此独立重建）**：[docs/从零搭建-Android.md](docs/从零搭建-Android.md) / [docs/从零搭建-iOS.md](docs/从零搭建-iOS.md) / [docs/从零搭建-鸿蒙.md](docs/从零搭建-鸿蒙.md)。
> 三端运行速查见 [docs/运行-Android.md](docs/运行-Android.md) / [docs/运行-iOS.md](docs/运行-iOS.md) / [docs/运行-鸿蒙.md](docs/运行-鸿蒙.md)，模块作者指南见 [docs/模块开发指南.md](docs/模块开发指南.md)，踩坑速查见 [docs/踩坑速查.md](docs/踩坑速查.md)，环境与磁盘布局（缓存迁外置盘）见 [docs/环境与磁盘布局.md](docs/环境与磁盘布局.md)，App 三端构建细节见 [apps/oa/README.md](apps/oa/README.md)。

---

## 1. 技术基线

| 维度 | 选型 | 说明 |
|---|---|---|
| 跨端框架 | React Native **0.77.0** | 公共基线，三端共用 |
| 鸿蒙 | RNOH（`@react-native-oh/react-native-harmony` 0.72.101-5） | HarmonyOS NEXT 纯血鸿蒙，ArkTS 原生 |
| RN 架构 | **New Architecture**（TurboModules + Fabric + Codegen） | 原生模块用 codegen 生成类型安全接口 |
| 包管理 | **pnpm** workspaces（`node-linker=hoisted`） | monorepo + 私有 npm 源（`@itc` scope） |
| 语言 | TypeScript 5.x / Kotlin / Swift+ObjC++ / ArkTS | — |

---

## 2. 目录结构

```
OpenOA/
├── pnpm-workspace.yaml          # workspace 定义（packages/* + apps/*）
├── .npmrc                       # hoisted 布局 + @itc 私有源占位
├── tsconfig.base.json           # 共享 TS 配置
├── .changeset/                  # 模块独立发版
│
├── packages/                    # 可剥离复用的端能力模块
│   ├── base/        @itc/base        公共基座（契约/Result/平台/事件总线/日志/存储）
│   ├── biometric/   @itc/biometric   生物识别（指纹/人脸 + 生物绑定密钥签名）★样板模块
│   ├── push/        @itc/push        推送（友盟/极光聚合）——占位骨架
│   └── im/          @itc/im          即时 IM（OpenIM）——占位骨架
│
├── apps/
│   └── oa/          @itc-oa/app      钉钉克隆宿主 App
│       ├── src/                      JS 层（App + 演示页 + utils）
│       ├── android/                  Android 宿主工程（Gradle）
│       ├── ios/                      iOS 宿主工程（Xcode + CocoaPods）
│       ├── harmony/                  鸿蒙宿主工程（DevEco，待生成）
│       └── vendor/bundle/            项目本地 CocoaPods（bundler 安装）
│
└── docs/                        # 开发文档
```

**依赖方向铁律：** `app → feature 模块 → @itc/base`。
`base` 绝不反向 import 任何 feature；feature 之间不互相依赖，只通过 `@itc/base` 的契约 / 事件总线通信。任一 feature 连同其 `android/ios/harmony` 目录可整包复用到其他项目（对端同装 `@itc/base`）。

---

## 3. 环境要求（本机已验证版本）

| 工具 | 版本 / 位置 | 用途 |
|---|---|---|
| Node | 20+（实测 25.2.1） | — |
| pnpm | 11.2.2 | 包管理 |
| JDK | **21**（用 Android Studio 自带 JBR） | Android Gradle 构建 |
| Android SDK | `/Volumes/MacExtend/Envirment/Android/SDK`（platform 34/36、build-tools 35、NDK 26.1） | Android |
| Xcode | 26.5 + 已下载 **iOS 26.5 平台/模拟器运行时** | iOS |
| CocoaPods | 1.15.2（bundler 装在 `apps/oa/vendor/bundle`，系统 Ruby 2.6.10） | iOS pods |
| DevEco Studio + 鸿蒙 SDK | **待安装**（SDK 已有 `/Volumes/MacExtend/Envirment/Harmony/OpenHarmony/Sdk`，缺 hvigor/ohpm/DevEco） | 鸿蒙 |

**常用环境变量（Android/iOS 命令前需 export）：**
```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="/Volumes/MacExtend/Envirment/Android/SDK"
export PATH="$ANDROID_HOME/platform-tools:$PATH"     # adb
```

---

## 4. 快速开始（JS 层）

```bash
# 1. 安装依赖（hoisted 布局，见 .npmrc）
pnpm install

# 2. 构建所有可发布的 packages（builder-bob 产出 lib/）—— 按依赖拓扑序，base 先构建
pnpm build
#   等价：pnpm -r --filter "./packages/*" build

# 3. 全量类型检查（base/biometric/push/im/app 共 5 个工程）
pnpm typecheck

# 4. 单独构建/检查某个包
pnpm --filter @itc/biometric build
pnpm --filter @itc/biometric typecheck

# 5. 启动 Metro（开发调试用）
pnpm oa:start
```

---

## 5. Android —— 构建 / 安装 / 运行（全部实测可用）

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="/Volumes/MacExtend/Envirment/Android/SDK"
ADB="$ANDROID_HOME/platform-tools/adb"

cd apps/oa/android

# Debug APK（需配合 Metro：pnpm oa:start）
./gradlew :app:assembleDebug --no-daemon
#   产物：app/build/outputs/apk/debug/app-debug.apk

# Release APK（内嵌 JS bundle、debug 签名，可独立安装，无需 Metro）★交付物
./gradlew :app:assembleRelease --no-daemon
#   产物：app/build/outputs/apk/release/app-release.apk

# 清理
./gradlew clean --no-daemon
```

**安装到真机 / 运行 / 截图：**
```bash
ADB="$ANDROID_HOME/platform-tools/adb"
"$ADB" devices                                  # 确认设备已连
"$ADB" install -r app/build/outputs/apk/release/app-release.apk
"$ADB" shell am start -n com.opendingding/.MainActivity   # 启动
"$ADB" exec-out screencap -p > /tmp/screen.png            # 截图
"$ADB" logcat -d | grep -iE "itc:app|ReactNativeJS|AndroidRuntime|FATAL"  # 看日志
```

> ✅ 已在 Redmi（Android 14）真机验证：演示页正常，`@itc/biometric` 的 Kotlin TurboModule 被成功调用（能力探测返回 `可用 true / fingerprint`）。

---

## 6. iOS —— 构建 / 运行（全部实测可用）

CocoaPods 用 **bundler 装在项目本地**（系统 Ruby 2.6.10，已在 `Gemfile` 钉住 `ffi/securerandom/logger` 兼容版本）。

```bash
cd apps/oa

# 1. 安装项目本地 CocoaPods 到 vendor/bundle（仅首次 / Gemfile 变更后）
BUNDLE_PATH=vendor/bundle BUNDLE_DISABLE_SHARED_GEMS=true bundle install

# 2. pod install（启用新架构，会触发 @itc/biometric 的 iOS codegen）
cd ios
export BUNDLE_GEMFILE="$(cd .. && pwd)/Gemfile"
export BUNDLE_PATH="$(cd .. && pwd)/vendor/bundle"
RCT_NEW_ARCH_ENABLED=1 bundle exec pod install
#   产物：OpenOA.xcworkspace（之后一律用 .xcworkspace，不要用 .xcodeproj）

# 3a. 编译 + 跑模拟器（Release 内嵌 JS，独立运行）
xcodebuild -workspace OpenOA.xcworkspace -scheme OpenOA \
  -configuration Release -sdk iphonesimulator -derivedDataPath build \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  CODE_SIGNING_ALLOWED=NO build
#   产物：build/Build/Products/Release-iphonesimulator/OpenOA.app

# 3b. 真机 .ipa：必须用你的 Apple 开发者账号签名（见下）
```

**模拟器安装 / 运行 / 截图：**
```bash
xcrun simctl boot "iPhone 17 Pro" 2>/dev/null; open -a Simulator
xcrun simctl install booted build/Build/Products/Release-iphonesimulator/OpenOA.app
xcrun simctl launch booted org.reactjs.native.example.OpenOA   # bundle id 见 ios 工程
xcrun simctl io booted screenshot /tmp/ios-screen.png
```

**真机可安装 .ipa（需你的签名）：** 用 Xcode 打开 `apps/oa/ios/OpenOA.xcworkspace` → 选中 target → Signing & Capabilities 选你的 Team → Product > Archive → Distribute App。
命令行等价（替换 TEAMID / 你的签名）：
```bash
xcodebuild -workspace OpenOA.xcworkspace -scheme OpenOA \
  -configuration Release -destination 'generic/platform=iOS' \
  -archivePath build/OpenOA.xcarchive archive \
  DEVELOPMENT_TEAM=YOURTEAMID CODE_SIGN_STYLE=Automatic
xcodebuild -exportArchive -archivePath build/OpenOA.xcarchive \
  -exportPath build/ipa -exportOptionsPlist ExportOptions.plist
```

> ⚠️ Face ID 模拟器测试：模拟器菜单 Features > Face ID > Enrolled，认证时 Features > Face ID > Matching Face。

---

## 7. 鸿蒙 NEXT —— 待环境就绪

当前缺 **DevEco Studio + hvigor/ohpm**（SDK 已存在 `/Volumes/MacExtend/Envirment/Harmony/OpenHarmony/Sdk`）。装好 DevEco 后按 [apps/oa/README.md](apps/oa/README.md#鸿蒙) 步骤：用 DevEco 创建 RNOH 宿主工程到 `apps/oa/harmony` → 注册 `ItcBiometricPackage` → `hvigorw assembleHap` 出 `.hap`。生物识别 ArkTS 实现已就绪：[packages/biometric/harmony/](packages/biometric/harmony/)。

---

## 8. 模块复用 / 新增模块

- **复用到其他项目**：对端项目 `pnpm add @itc/base @itc/biometric`（私有源或本地 link），RN autolinking / RNOH 自动接入三端原生。
- **新增模块**：照搬 `@itc/biometric` 结构 —— TS 统一 API + codegen spec（`NativeXxx.ts`）+ `android/ios/harmony` 三端原生 + 实现 `@itc/base` 的 `ItcModule` 契约。详见 [docs/模块开发指南.md](docs/模块开发指南.md)。

---

## 9. 发布（私有源）

```bash
pnpm changeset            # 交互式记录变更（选包 + 版本级别）
pnpm version-packages     # 应用版本号
pnpm release              # 构建 + changeset publish 到私有源
```
配置 `@itc` 私有源：编辑 [.npmrc](.npmrc) 取消注释并填入 Verdaccio/Nexus 地址。未就绪时开发期用 pnpm workspace 本地 link 即可。

---

## 10. 模块状态

| 包 | 端到端状态 |
|---|---|
| `@itc/base` | ✅ 完成（JS 纯逻辑，三端通用） |
| `@itc/biometric` | ✅ Android 真机真跑验证；✅ iOS 模拟器真跑验证（原生 `isAvailable` 返回真实能力）；ArkTS 实现就绪待鸿蒙环境 |
| `@itc/push` | 🚧 占位骨架（统一 API + 契约，原生待实现） |
| `@itc/im` | 🚧 占位骨架（鸿蒙端需自编译 OpenIM Go core，最大风险项） |

踩坑与排错（pnpm hoisted、Metro 解析、gradle-plugin/codegen 直依赖、Ruby gem 钉版本、NDK/SDK 对齐、公钥格式差异等）见 [docs/踩坑速查.md](docs/踩坑速查.md)。
