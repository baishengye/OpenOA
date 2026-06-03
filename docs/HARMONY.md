# 鸿蒙（RNOH）接入 + RN 0.82 迁移技术要点

记录把 OpenDingDing 接入 HarmonyOS NEXT（RNOH）以及全项目 RN 0.77 → 0.82 升级中的关键决策与踩坑。

## 1. 版本矩阵（必须对齐，否则编译/运行全崩）

| 维度 | 值 | 说明 |
|---|---|---|
| React Native | **0.82.1** | 三端共用；RNOH/DevEco 倒逼升级（见下） |
| React | **19.1.1** | RN 0.82 要求 React 19 |
| RNOH | **@react-native-oh/react-native-harmony 0.82.30** + cli 0.82.30 | 配 RN 0.82 + DevEco 6/API 24；**0.72/0.77 线只支持旧 DevEco/SDK，px2vp 等编不过** |
| DevEco Studio | 6.1.2 / 鸿蒙 SDK API 24 | hvigor/ohpm/node 自带于 `DevEco-Studio.app/Contents/tools/` |
| compatibleSdkVersion | **5.0.0(12)** | 最低支持 API = 全 HarmonyOS NEXT；targetSdkVersion 保持 24 |

> **教训**：RNOH 版本号（0.72/0.77/0.82）≈ 对应 RN 版本。装错版本（如给 RN 0.77 用 0.72.101）→ Metro 解析不到 react-native、px2vp 编译错误。**RNOH 必须匹配 RN 版本**。

## 2. RNOH 宿主工程结构（apps/oa/harmony）

DevEco 先建普通「Empty Ability」工程，再手动改造（RNOH 无 IDE 模板）：

```
apps/oa/harmony/
├── oh-package.json5            # overrides 指向 RNOH HAR
├── build-profile.json5         # signingConfigs / compatibleSdkVersion / 模块
└── entry/
    ├── oh-package.json5         # 依赖 @rnoh/react-native-openharmony（HAR 路径）
    ├── build-profile.json5      # externalNativeOptions → CMakeLists
    └── src/main/
        ├── module.json5         # requestPermissions: ACCESS_BIOMETRIC
        ├── cpp/CMakeLists.txt    # add_subdirectory RNOH cpp + rnoh_app
        ├── cpp/PackageProvider.cpp  # C++ Package（biometric 纯 ArkTS → 返回空）
        ├── ets/entryability/EntryAbility.ets  # extends RNAbility
        ├── ets/pages/Index.ets   # RNApp(appKey='OpenDingDing', jsBundleProvider)
        ├── ets/RNPackagesFactory.ets  # 注册 ItcBiometricPackage
        ├── ets/biometric/*.ets   # 内嵌的生物识别 ArkTS TurboModule（见 §4）
        └── resources/rawfile/bundle.harmony.js  # JS bundle（见 §3）
```

- HAR 引用：`"@rnoh/react-native-openharmony": "file:../../node_modules/@react-native-oh/react-native-harmony/react_native_openharmony.har"`，root `overrides` 同步。
- `RNApp` 的 `appKey` 必须 = JS 端 `AppRegistry.registerComponent` 的名字（`OpenDingDing`）。
- biometric 模块是**纯 ArkTS TurboModule**，**内嵌进 entry**（参考社区做法）；源仍在 `packages/biometric/harmony/`，将来可打成独立 .har 复用。

## 3. JS bundle（鸿蒙单独的 Metro 配置）

⚠️ **不能**把 RNOH 的 `createHarmonyMetroConfig` 混进 android/ios 的 metro.config.js——它改 polyfill/react-native 解析，会让标准 RN 运行时崩（`performance.now undefined`）。拆两份：
- `metro.config.js`：纯 RN（android/ios/Metro 开发服务器）。
- `metro.config.harmony.js`：`getDefaultConfig` + `createHarmonyMetroConfig` + monorepo（**必须含 getDefaultConfig**，否则缺 metro 0.83 的 asyncRequire）。

打包：
```bash
cd apps/oa
node node_modules/react-native/cli.js bundle-harmony --config metro.config.harmony.js --dev false
```

## 4. ArkTS 严格模式（biometric 重写要点）

ArkTS 比 TS 严得多，以下都报错，必须改：
- ❌ 内联对象类型 `Promise<{ a: string }>` → ✅ 声明 `interface`
- ❌ 无类型对象字面量 `resolve({ a: 1 })` → ✅ `const r: T = {...}; resolve(r)`
- ❌ 交叉类型 `Error & { code }` → ✅ `class CodedError extends Error`
- ❌ 对象 spread `{ ...a, b }` → ✅ 显式赋值；数组 spread 可用（`arr.slice()` + `push`）
- ❌ executor 显式标 `reject:(e:Error)=>void`（结构化类型）→ ✅ `new Promise<T>((resolve, reject) => ...)` 让其推断

## 5. 编译与签名

```bash
# CLI 编译（验证 ArkTS/C++/bundle，但签名打包有 quirk，见下）
TOOLS=/Applications/DevEco-Studio.app/Contents/tools
export DEVECO_SDK_HOME=/Applications/DevEco-Studio.app/Contents/sdk
ohpm install                 # 重链 HAR（HAR 换版本后必做）
node $TOOLS/hvigor/bin/hvigorw.js --mode module -p product=default -p module=entry@default assembleHap
```

- **签名**：DevEco → 登录华为账号 → File → Project Structure → Signing Configs → 勾「Automatically generate signature」。免费账号生成调试签名（写进 build-profile `signingConfigs`，材料在 `~/.ohos/config/`），够真机/模拟器测试；上架需正式证书。
- **CLI 出包 quirk**：`hvigorw assembleHap` 在 PackageHap 阶段报 `Error 00308018` + `@Input 'shouldDeduplicateHar' ... Received undefined`——这是 hvigorw 命令行模式的内部 quirk。**用 DevEco GUI 的 ▶️ Run** 即可正常出签名包并装机。
- **生物识别**：`module.json5` 必须声明 `ohos.permission.ACCESS_BIOMETRIC`，否则 `userAuth` 调用失败（演示页卡「探测中」）。**模拟器无生物识别硬件**，成功路径要**真机**（同 iOS 模拟器）。

## 6. RN 0.77 → 0.82 迁移各端要点

- **公共**：RN 0.82.1 + React 19.1.1；metro 升到 0.83。
- **Android**：
  - Gradle wrapper → **8.14.1**（AGP 要求 ≥8.13）
  - NDK → **27+（本机用 29）**：RN 0.82 C++ 用了 `std::format`，NDK 26 的 libc++ 没有
- **iOS**：
  - `AppDelegate.swift` 改为 **`RCTReactNativeFactory` + `RCTDefaultReactNativeFactoryDelegate`**（0.81+ 新 API）
  - hermes 预编译包可能漏下：手动补 `Pods/hermes-engine-artifacts/hermes-ios-<ver>-release.tar.gz`（Maven），并解进 `Pods/hermes-engine/destroot`
  - fmt 与新 Clang 的 consteval 冲突：Podfile post_install patch `fmt/base.h`（`FMT_USE_CONSTEVAL=0`）
  - Apple Silicon 模拟器：`ONLY_ACTIVE_ARCH=YES`

## 7. 最低兼容版本（已确认）

| 端 | 最低 | 说明 |
|---|---|---|
| 鸿蒙 | API 12（全 NEXT） | compatibleSdkVersion 5.0.0(12) |
| Android | minSdk 24（覆盖 28+） | androidx.biometric 回退到 23 |
| iOS | 15.1 | RN 0.82 底线；Face ID/Secure Enclave 远早于此 |

## 8. 鸿蒙端能力模块的复用方式 ⚠️ 重要

鸿蒙的 ArkTS **不允许把工作区里另一个目录的源码当本地源码编进来**（报 `Cannot import files outside of the current module`）。所以可复用模块（`packages/<mod>/harmony/`）的 ArkTS 不能像 Android(Kotlin)/iOS(ObjC) 那样直接被 autolink 进 App，有两种接法：

### 方式 A（当前用的）：内嵌副本 —— 每次改都要同步！

把模块的 ArkTS **复制进主工程 entry**（参考 RNOH 官方示例的做法）：

```
packages/biometric/harmony/biometric/src/main/ets/   ← 真源（可复用）
apps/oa/harmony/entry/src/main/ets/biometric/         ← 复制进来的副本（实际参与编译）
```

> 🔴 **铁律：每次改了 `packages/<mod>/harmony/` 下的鸿蒙 ArkTS，必须同步复制到 `apps/oa/harmony/entry/src/main/ets/<mod>/`**，否则主工程用的还是旧代码。
> 文件后缀：源里是 `.ts`，复制到 entry 改成 `.ets`（ArkTS）。

同步命令（biometric 为例）：
```bash
SRC=packages/biometric/harmony/biometric/src/main/ets
DST=apps/oa/harmony/entry/src/main/ets/biometric
cp "$SRC/BiometricTurboModule.ts"  "$DST/BiometricTurboModule.ets"
cp "$SRC/BiometricPackage.ts"      "$DST/BiometricPackage.ets"
```
然后在 `entry/.../RNPackagesFactory.ets` 里 `import { XxxPackage } from './<mod>/XxxPackage'` 注册。

适用：模块还在频繁改、未稳定时。优点：改完即编、无需打包。缺点：**有重复、要手动同步**。

### 方式 B（正式复用）：打成 .har，主工程依赖二进制

模块稳定后，把它做成独立 HAR（像 RNOH 自己的 `react_native_openharmony.har`），entry 依赖 .har，**删掉内嵌副本、无重复、可剥离到任何鸿蒙工程**。

1. 把 `packages/<mod>/harmony/<mod>` 配成 DevEco **HAR 模块**（需补这些文件）：
   - `oh-package.json5`（`"main": "Index.ets"`，依赖 `@rnoh/react-native-openharmony` HAR）
   - `build-profile.json5`（`"apiType": "stageMode"`，library 配置）
   - `hvigorfile.ts`（`import { harTasks } from '@ohos/hvigor-ohos-plugin'; export default { system: harTasks }`）
   - `src/main/module.json5`（`"type": "har"` 或 shared library 配置）
   - 源文件用 `.ets`；`Index.ets` re-export `XxxPackage` / `XxxTurboModule`
2. 出包：
   ```bash
   cd packages/<mod>/harmony   # 或把它纳入一个 DevEco 工程的 modules
   node $TOOLS/hvigor/bin/hvigorw.js --mode module -p product=default -p module=<mod>@default assembleHar
   # 产物：<mod>/build/default/outputs/default/<mod>.har
   ```
3. 主工程 `entry/oh-package.json5` 依赖该 .har：
   ```json5
   "dependencies": { "@itc/<mod>": "file:../../../../packages/<mod>/harmony/<mod>/build/.../<mod>.har" }
   ```
   `RNPackagesFactory.ets` 改 `import { XxxPackage } from '@itc/<mod>'`，删除 entry 内嵌副本。

适用：模块稳定、要正式复用到多个鸿蒙工程时。

> 当前 `@itc/biometric` 用**方式 A**（内嵌副本）。功能稳定后按方式 B 打 .har 收口。
