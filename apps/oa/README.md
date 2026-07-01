# @itc-oa/app —— OA 宿主 App

对标钉钉的 OA App 宿主，消费 `@itc/*` 模块。已含 JS 层（入口、演示页、Metro/Babel/TS 配置）与 **Android / iOS 原生宿主工程**（已实测构建）。鸿蒙工程待环境就绪后生成。

演示页：[src/screens/BiometricDemoScreen.tsx](src/screens/BiometricDemoScreen.tsx) —— 能力探测 → 认证 → 注册免密 → 验签。

---

## 环境变量（每个终端先 export）

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="/Volumes/MacExtend/Envirment/Android/SDK"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

---

## Android（✅ 已真机验证）

```bash
cd apps/oa/android

# 独立可安装 release APK（内嵌 JS，无需 Metro）
./gradlew :app:assembleRelease --no-daemon
#   → app/build/outputs/apk/release/app-release.apk

# 开发用 debug APK（配合 Metro：pnpm oa:start）
./gradlew :app:assembleDebug --no-daemon

# 安装 + 启动 + 截图
adb install -r app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.opendingding/.MainActivity
adb exec-out screencap -p > /tmp/oa-android.png
```

应用包名 `com.opendingding`，AppRegistry 名 `OpenOA`（见 [app.json](app.json)）。

### Android 接入要点（已配置）
- `android/gradle.properties`：`newArchEnabled=true`、`hermesEnabled=true`
- `android/build.gradle`：`compileSdk=36`、`ndkVersion=26.1.10909125`（对齐本机已装；RN 默认 35/27.1）
- autolinking 自动注册 `@itc/biometric`（`MainApplication.kt` 用 `PackageList`，无需手改）

---

## iOS（✅ 工程+pod+codegen 接入；模拟器验证见下）

CocoaPods 由 **bundler 装在项目本地 `vendor/bundle`**（系统 Ruby 2.6.10）。

```bash
cd apps/oa

# 1) 安装项目本地 CocoaPods（首次 / 改 Gemfile 后）
BUNDLE_PATH=vendor/bundle BUNDLE_DISABLE_SHARED_GEMS=true bundle install

# 2) pod install（启用新架构，触发 @itc/biometric iOS codegen）
cd ios
export BUNDLE_GEMFILE="$(cd .. && pwd)/Gemfile"
export BUNDLE_PATH="$(cd .. && pwd)/vendor/bundle"
RCT_NEW_ARCH_ENABLED=1 bundle exec pod install
#   → 生成 OpenOA.xcworkspace（之后一律用它，别用 .xcodeproj）

# 3) 编译到模拟器（Apple Silicon：ONLY_ACTIVE_ARCH=YES 只编 arm64，避开 x86_64 fmt 编译失败）
xcodebuild -workspace OpenOA.xcworkspace -scheme OpenOA \
  -configuration Release -sdk iphonesimulator -derivedDataPath build \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO build
#   → build/Build/Products/Release-iphonesimulator/OpenOA.app
```

**模拟器运行 / 截图：**
```bash
xcrun simctl boot "iPhone 17 Pro"; open -a Simulator
xcrun simctl install booted build/Build/Products/Release-iphonesimulator/OpenOA.app
xcrun simctl launch booted org.reactjs.native.example.OpenOA
xcrun simctl io booted screenshot /tmp/oa-ios.png
# Face ID 模拟：模拟器菜单 Features > Face ID > Enrolled / Matching Face
```

**真机 .ipa（需你的 Apple 账号签名）：** Xcode 打开 `ios/OpenOA.xcworkspace` → target 的 Signing & Capabilities 选 Team → Product > Archive > Distribute。
- `Info.plist` 已含 `NSFaceIDUsageDescription`。
- 命令行 archive 见根 [README.md](../../README.md#6-ios--构建--运行全部实测可用)。

---

## 鸿蒙 NEXT（待环境）

SDK 已在 `/Volumes/MacExtend/Envirment/Harmony/OpenHarmony/Sdk`，但缺 **DevEco Studio + hvigor/ohpm**。装好 DevEco 后：

1. DevEco 新建 “Empty Ability” 工程到 `apps/oa/harmony`（或用 RNOH 模板）。
2. 按 RNOH 文档放置 `react-native-harmony` HAR，配置 Metro（[metro.config.js](metro.config.js) 已用 `createHarmonyMetroConfig` 支持 harmony 平台）。
3. `entry/oh-package.json5` 依赖生物识别 harmony 模块：
   ```json5
   "dependencies": { "@itc/biometric": "file:../../../packages/biometric/harmony/biometric" }
   ```
4. 在 RNOH `RNPackagesFactory` 注册：
   ```ts
   import { ItcBiometricPackage } from '@itc/biometric';
   // createRNPackages(ctx) { return [ new ItcBiometricPackage(ctx) ]; }
   ```
5. 出包：`cd apps/oa/harmony && ./hvigorw assembleHap --mode module -p product=default`
6. 装机：`hdc install entry/build/.../entry-default-signed.hap`（`hdc` 在 `…/OpenHarmony/Sdk/<ver>/toolchains/hdc`）。

> 生物识别 ArkTS 实现已就绪：[../../packages/biometric/harmony/](../../packages/biometric/harmony/)（userAuth + HUKS）。

---

## 验证点（三端一致）

1. 进页显示当前平台 + 生物识别能力（类型/可用性）。
2. 「① 认证」拉起系统生物识别。
3. 「② 注册免密登录」生成生物绑定密钥，打印公钥前缀。
4. 「③ 指纹登录（验签）」认证后用私钥签名，打印签名前缀。
