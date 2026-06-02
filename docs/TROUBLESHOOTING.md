# 踩坑速查（实战记录）

按「现象 → 原因 → 解法」整理，均为本项目搭建三端时真实遇到并解决的问题。

---

## 通用 / pnpm monorepo

### 1. Metro 报 `Unable to resolve module invariant from react-native/...Button.js`
- **原因**：`metro.config.js` 里设了 `resolver.disableHierarchicalLookup = true`，破坏了 pnpm `.pnpm` 嵌套 node_modules 的逐级向上查找，react-native 的传递依赖（invariant 等）找不到。
- **解法**：**移除** `disableHierarchicalLookup`。pnpm 下必须保留逐级查找。见 [apps/oa/metro.config.js](../apps/oa/metro.config.js)。

### 2. pnpm + RN 各种解析/autolink/codegen 失败
- **原因**：pnpm 默认符号链接结构，RN 假设扁平 node_modules。
- **解法**：[.npmrc](../.npmrc) 设 `node-linker=hoisted` + `shamefully-hoist=true`。

### 3. builder-bob 构建报 `exports['.'].types should not be set when esm enabled` 或消费方把 enum 当 `{}`
- **原因**：esm 模式下 `package.json` 的 `exports` 若把 `default` 直接指向 `.js`，TS 在其旁找不到 `.d.ts`（类型在 `lib/typescript/module/`）。
- **解法**：`exports['.']` 用 `import: { types, default }` 嵌套，`types` 指向 `./lib/typescript/module/index.d.ts`。见各包 package.json。

### 4. 库 tsc 报 `TS6305 / TS6059`（输出文件未构建 / 不在 rootDir）
- **原因**：给库 tsconfig 加了 `composite`+`references` 或把 `paths` 指向 base **源码**，与 builder-bob 输出布局冲突 / 把 base 源码拉进 rootDir。
- **解法**：库 tsconfig **不要** composite/references/paths-to-source；靠 pnpm workspace 从 node_modules 解析 base 的**已构建**类型（`pnpm build` 拓扑序保证 base 先构建）。

### 5. `ItcError` 报 `override` 缺失（TS4114）
- **原因**：`target: esnext` 下 `Error` 已有 `cause`，覆盖需显式 `override`。
- **解法**：`override readonly cause?`。见 [packages/base/src/result.ts](../packages/base/src/result.ts)。

---

## Android

### 6. autolinking 报 `Could not find project.android.packageName in react-native config output`
- **原因**：RN 0.77 把 CLI 拆出，`react-native config` 依赖 `@react-native-community/cli`，未安装则 autolink 拿不到配置。
- **解法**：把 `@react-native-community/cli`、`-platform-android`、`-platform-ios`（15.0.1）加为 app devDependency。

### 7. settings.gradle `includeBuild('../node_modules/@react-native/gradle-plugin')` 找不到
- **原因**：`@react-native/gradle-plugin`、`@react-native/codegen` 是 react-native 的**传递**依赖，pnpm 不会软链进 `apps/oa/node_modules`。
- **解法**：把这两个包加为 app 的**直接** devDependency，pnpm 即软链到位，模板默认相对路径生效。

### 8. Gradle 找不到 Java / `Unable to locate a Java Runtime`
- **原因**：未装独立 JDK。
- **解法**：用 Android Studio 自带 JBR：`export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`（JDK 21）。

### 9. compileSdk 35 / NDK 27.1 未安装
- **解法**：对齐本机已装版本 —— [android/build.gradle](../apps/oa/android/build.gradle) 设 `compileSdkVersion=36`、`ndkVersion=26.1.10909125`。

### 10. 库模块 buildscript 插件 classpath 冲突
- **原因**：feature 库 `android/build.gradle` 自带 `com.android.tools.build:gradle` classpath，与宿主根工程的 AGP 版本冲突。
- **解法**：库只声明 kotlin 插件 classpath（版本取自 `rootProject.ext.kotlinVersion`），AGP 由宿主提供。见 [packages/biometric/android/build.gradle](../packages/biometric/android/build.gradle)。

### 11. guava / maven 依赖 `Remote host terminated the handshake`
- **原因**：网络抖动。**解法**：重试 `./gradlew` 即可。

---

## iOS

### 12. `bundle install` 报 `ffi-1.17 requires ruby >= 3.0`（系统 Ruby 2.6.10）
- **解法**：[Gemfile](../apps/oa/Gemfile) 钉住 `ffi < 1.17`、`securerandom < 0.4`、`logger < 1.6`。

### 13. `Bundler::SudoNotPermittedError`（想装到系统目录）
- **原因**：`bundle config set --local path` 未生效。
- **解法**：用环境变量：`BUNDLE_PATH=vendor/bundle BUNDLE_DISABLE_SHARED_GEMS=true bundle install`，把 gem 装到项目本地 `vendor/bundle`。

### 14. `xcodebuild ... Unable to find a destination ... iOS 26.5 is not installed`
- **原因**：Xcode 只有 SDK 头文件，未下载 iOS 平台/模拟器运行时。
- **解法**：`xcodebuild -downloadPlatform iOS`（约 7GB，装到系统盘）。

### 15. 编译 `fmt/format-inl.h: call to consteval function ... is not a constant expression`
- **原因**：Xcode 26.5 新版 Clang 下，fmt **11.0.0.2** 的 `base.h` 会**无条件**把 `FMT_USE_CONSTEVAL` 重定义为 1（无 `#ifndef` 守卫），导致 `-DFMT_USE_CONSTEVAL=0` 宏**无效**；而该 clang 的 consteval 对 fmt 用法过严，编译失败。
- **解法**：直接 **patch `Pods/fmt/include/fmt/base.h`**，在 `#if FMT_USE_CONSTEVAL` 块前插入 `#undef FMT_USE_CONSTEVAL` + `#define FMT_USE_CONSTEVAL 0` 强制关闭。已写进 [Podfile](../apps/oa/ios/Podfile) 的 `post_install`（每次 `pod install` 自动重打，幂等）。
  > 注意：单纯给 `GCC_PREPROCESSOR_DEFINITIONS` 加 `FMT_USE_CONSTEVAL=0` 对 fmt 11.0 无效——头文件会覆盖它。必须改头文件。

### 16. Apple Silicon 上编译模拟器在 x86_64 切片失败
- **解法**：加 `ONLY_ACTIVE_ARCH=YES`（只编 arm64）。Release 默认编全架构。

### 17. 真机 .ipa 无法产出
- **原因**：Apple 要求开发者签名（Team + Provisioning + 设备 UDID），无法代办。
- **解法**：Xcode 打开 `.xcworkspace` 选自己的 Team → Archive → Distribute。

---

## 工作习惯

### 18. 后台命令明明失败却报 exit 0
- **原因**：命令以 `| tail` 结尾，捕获到的是 `tail` 的退出码，且日志被截断。
- **解法**：长构建**不要**管道到 tail；让后台原样捕获完整日志，事后 `grep`。

---

## 设计约束（非 bug，但需牢记）

- **TurboModule spec 入参用基本类型**（string/boolean），不用 object —— 规避 iOS codegen 为对象入参生成 C++ 结构体，三端签名才简单一致。
- **生物绑定公钥格式三端不一致**：Android=DER(SPKI)，iOS/鸿蒙=X9.63（`04||X||Y`）。后端验签需按平台标识归一化。
