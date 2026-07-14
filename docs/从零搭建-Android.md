# 从零搭建：RN 0.82 + Android + TurboModule 完整教程

> 目标：从空目录建出「RN 0.82 工程 + 一个跑通的 Android 原生 TurboModule（JS spec → codegen → Kotlin 实现）」，照本文一步步即可。
>
> 配套：运行/真机/Android Studio 同步坑见 [运行-Android.md](./运行-Android.md)，报错速查见 [踩坑速查.md](./踩坑速查.md)。

---

## 0. 心智模型

Android 的 TurboModule：**codegen 在 Gradle 构建时自动跑**，你写 JS spec + Kotlin 实现（继承 codegen 生成的抽象 Spec）+ 一个 Package 注册它。autolinking 自动把带 `codegenConfig` 的 npm 包接进来。

```
JS  TurboModuleRegistry.getEnforcing('ItcStorage')
 │
 ▼
[① JS 规格]  src/NativeItcStorage.ts          ← codegen 输入
 │  Gradle 构建时生成 abstract NativeItcStorageSpec.java（含 TurboModule 接口）
 ▼
[② Kotlin 实现]  ItcStorageModule.kt           ← 你手写，extends 那个 Spec
[②b 注册]      ItcStoragePackage.kt            ← BaseReactPackage，告诉 RN 这个模块存在
 │  autolinking 把 Package 注册进 app
 ▼
原生能力（MMKV / Keystore / BiometricPrompt ...）
```

---

## 1. 前置环境（写进 `~/.zshrc`）

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"   # JDK 21
export ANDROID_HOME="$HOME/Library/Android/sdk"      # 或你的 SDK 路径
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```
验证：`java -version`（21）、`adb version`。**JDK 必须用 Android Studio 自带 JBR 21**，否则 `./gradlew` 报找不到 Java。

---

## 2. 创建 RN 0.82 工程

```bash
npx @react-native-community/cli@latest init MyApp --version 0.82.1
cd MyApp
```
`android/gradle.properties` 确认：`newArchEnabled=true`、`hermesEnabled=true`。

---

## 3. 建一个 TurboModule 包（JS 规格 + codegenConfig）

`src/NativeItcStorage.ts`（同 iOS/鸿蒙，三端共用同一个 spec）：
```typescript
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
export interface Spec extends TurboModule {
  setString(key: string, value: string): void;
  getString(key: string): string;
  contains(key: string): boolean;
  remove(key: string): void;
  clearAll(): void;
}
export default TurboModuleRegistry.getEnforcing<Spec>('ItcStorage');
```

`package.json`：
```jsonc
{
  "name": "@itc/storage",
  "codegenConfig": {
    "name": "RNItcStorageSpec",                  // 生成的 JNI 库 / 抽象类前缀
    "type": "modules",
    "jsSrcsDir": "src",
    "android": { "javaPackageName": "com.itc.storage" }   // 生成的 Spec 放这个包
  },
  "files": ["src", "android", "ios", "*.podspec"]
}
```

---

## 4. 模块的 `android/build.gradle`

`android/build.gradle`（库模块；版本号尽量与 app 对齐）：
```gradle
buildscript {
  repositories { google(); mavenCentral() }
  dependencies {
    classpath "com.android.tools.build:gradle:8.+"
    classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:2.0.21"
  }
}
apply plugin: "com.android.library"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"          // ★ 触发该库的 codegen

android {
  namespace "com.itc.storage"
  compileSdk 35
  defaultConfig { minSdk 24 }
}
dependencies {
  implementation "com.facebook.react:react-android"   // RN 运行时
  implementation "com.tencent:mmkv:1.3.9"             // 该模块用的第三方库
}
```

---

## 5. Kotlin 实现 + Package 注册

`android/src/main/java/com/itc/storage/ItcStorageModule.kt`（继承 codegen 生成的 `NativeItcStorageSpec`）：
```kotlin
package com.itc.storage

import com.facebook.react.bridge.ReactApplicationContext
import com.tencent.mmkv.MMKV

// NativeItcStorageSpec 是 Gradle 构建时由 spec 生成的抽象类（在 build/generated/.../codegen 下）
class ItcStorageModule(reactContext: ReactApplicationContext) :
  NativeItcStorageSpec(reactContext) {

  private val kv: MMKV by lazy {
    MMKV.initialize(reactContext.applicationContext)
    MMKV.mmkvWithID("itc-storage")
  }

  override fun getName(): String = NAME

  override fun setString(key: String, value: String) { kv.encode(key, value) }
  override fun getString(key: String): String = kv.decodeString(key, "") ?: ""
  override fun contains(key: String): Boolean = kv.containsKey(key)
  override fun remove(key: String) { kv.removeValueForKey(key) }
  override fun clearAll() { kv.clearAll() }

  companion object { const val NAME = "ItcStorage" }  // ★ == JS getEnforcing('ItcStorage')
}
```

`android/src/main/java/com/itc/storage/ItcStoragePackage.kt`（让 RN 发现这个模块）：
```kotlin
package com.itc.storage

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class ItcStoragePackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == ItcStorageModule.NAME) ItcStorageModule(reactContext) else null

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      ItcStorageModule.NAME to ReactModuleInfo(
        ItcStorageModule.NAME, ItcStorageModule.NAME,
        false, false, false, true  // 最后一个 true = isTurboModule
      )
    )
  }
}
```

`android/src/main/AndroidManifest.xml`（库模块最小）：
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android" />
```

---

## 6. autolinking（让 app 自动接入这个模块）

RN 的 autolinking 会扫 `node_modules` 里带 `codegenConfig` + `android/` 的包，自动：
- 把模块的 `android/build.gradle` 接进 app 的 settings.gradle；
- 把 `ItcStoragePackage` 注册进 app；
- 触发该模块的 codegen（生成 `NativeItcStorageSpec`）。

**多数情况零配置**。app 的 `android/settings.gradle` 应有（RN 模板自带）：
```gradle
pluginManagement { includeBuild("../node_modules/@react-native/gradle-plugin") }
plugins { id("com.facebook.react.settings") }
extensions.configure(com.facebook.react.ReactSettingsExtension) { ex -> ex.autolinkLibrariesFromCommand() }
includeBuild("../node_modules/@react-native/gradle-plugin")
```
> monorepo（pnpm）下 `@react-native/gradle-plugin` 是 symlink，Android Studio 同步会报 `Missing ExternalProject for :`，需 deref + 从终端启动 AS。详见 [运行-Android.md](./运行-Android.md) §3。

---

## 7. 构建运行（真机）

```bash
# 终端A：Metro
npx react-native start                              # 或 pnpm start
# 终端B：
adb -s <serial> reverse tcp:8081 tcp:8081          # ★真机必须，否则白屏
cd android && ./gradlew :app:installDebug          # 编译+装（含 codegen）
adb -s <serial> shell am start -n <pkg>/.MainActivity
```
- `adb reverse` 每次重插 USB/重启都要重做。
- 改 JS 不用重装（Fast Refresh）；改原生/新增模块才重跑 `installDebug`。

---

## 8. 排错速查

| 现象 | 修法 |
|---|---|
| 编译报找不到 `NativeItcStorageSpec` | codegen 没跑：模块 `build.gradle` 缺 `apply plugin: "com.facebook.react"`，或没 `codegenConfig`。clean 重建。 |
| 运行时 `getEnforcing('ItcStorage')` 抛错 | 名字不一致（`NAME` vs spec vs JS），或 Package 没被 autolink（看 `npx react-native config`）。 |
| `Could not find project.android.packageName` | autolink 配置/路径问题，见 [踩坑速查.md](./踩坑速查.md)。 |
| `Unable to locate a Java Runtime` | 没设 `JAVA_HOME`（§1）。 |
| 白屏 / `Unable to load script` | 没 `adb reverse`，或 Metro 没开。 |
| Android Studio 同步 `Missing ExternalProject for :` | pnpm symlink + node PATH，见 [运行-Android.md](./运行-Android.md) §3。 |

## 附录：本仓库样例
- biometric（Keystore + BiometricPrompt，Promise）：`packages/biometric/android/src/main/java/com/itc/biometric/`
- im（OpenIM SDK）：`packages/im/android/`
