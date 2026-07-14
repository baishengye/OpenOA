# 从零搭建：RN 0.82 + iOS + TurboModule 完整教程

> 目标：从空目录建出「RN 0.82 工程 + 一个跑通的 iOS 原生 TurboModule（JS spec → codegen → Obj‑C++ 实现）」，照本文一步步即可，不依赖他人。
>
> 配套：运行速查见 [运行-iOS.md](./运行-iOS.md)，报错速查见 [踩坑速查.md](./踩坑速查.md)。

---

## 0. 心智模型

iOS 的 TurboModule 比鸿蒙简单：**codegen 在 `pod install` 时自动跑**，你只写 JS spec + Obj‑C++ 实现，中间的 C++ JSI 桥由 RN 的 codegen 生成。

```
JS  TurboModuleRegistry.getEnforcing('ItcStorage')
 │
 ▼
[① JS 规格]  src/NativeItcStorage.ts        ← codegen 输入
 │  pod install 时 RN codegen 生成 NativeItcStorageSpec 协议（C++/ObjC）
 ▼
[② Obj‑C++ 实现]  ios/ItcStorage.mm          ← 你手写，conform 那个协议
 │  （RCT_EXPORT_MODULE + getTurboModule:）
 ▼
原生能力（MMKV / Keychain / LocalAuthentication ...）
```

---

## 1. 前置环境

| 工具 | 说明 |
|---|---|
| Xcode + Command Line Tools | iOS 编译、模拟器 |
| Ruby + Bundler + CocoaPods | 装 Pods（**建议 vendored 到工程，不污染系统**，见 §6） |
| Node ≥ 18 | RN / Metro / codegen |

> 系统 Ruby 2.6 装不了新 CocoaPods，本仓库把它 vendored 到 `apps/oa/vendor/bundle`，用 `oapod` 函数调起（见 [运行-iOS.md](./运行-iOS.md)）。

---

## 2. 创建 RN 0.82 工程

```bash
npx @react-community/cli@latest init MyApp --version 0.82.1   # 如失败用下行
npx @react-native-community/cli@latest init MyApp --version 0.82.1
cd MyApp
```

新架构默认开启（0.82 强制）。iOS 侧由 `RCT_NEW_ARCH_ENABLED=1` 控制，`pod install` 时传入。

---

## 3. 建一个 TurboModule 包（JS 规格 + codegenConfig）

`src/NativeItcStorage.ts`：
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

`package.json` 里声明 codegen（**iOS/Android 共用这个标准 `codegenConfig`**，鸿蒙才用单独的 `harmony.codegenConfig`）：
```jsonc
{
  "name": "@itc/storage",
  "codegenConfig": {
    "name": "RNItcStorageSpec",     // 生成的 spec 名（C++/ObjC 协议前缀）
    "type": "modules",
    "jsSrcsDir": "src",             // codegen 扫这个目录找 Native*.ts
    "android": { "javaPackageName": "com.itc.storage" }
  },
  "files": ["src", "ios", "android", "*.podspec"]
}
```

---

## 4. podspec（把原生代码 + codegen 接进 CocoaPods）

工程根 `ItcStorage.podspec`：
```ruby
require "json"
package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ItcStorage"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.license      = "UNLICENSED"
  s.authors      = "ITC"
  s.platforms    = { :ios => "15.1" }
  s.source       = { :git => "", :tag => "#{s.version}" }
  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.dependency "MMKV", "~> 1.3.9"          # 该模块用到的第三方原生库

  install_modules_dependencies(s)          # ★关键：接入 RN 新架构 codegen + 依赖
end
```

> `install_modules_dependencies(s)` 是 RN 提供的辅助：它根据 `codegenConfig` 在 `pod install` 时为这个 pod 生成 TurboModule 的 C++/ObjC 协议并接好依赖。**没有它，TurboModule 不会被 codegen。**

---

## 5. Obj‑C++ 原生实现

`ios/ItcStorage.h`：
```objc
#import <Foundation/Foundation.h>
#import <RNItcStorageSpec/RNItcStorageSpec.h>   // ← pod install 生成的协议头

NS_ASSUME_NONNULL_BEGIN
@interface ItcStorage : NSObject <NativeItcStorageSpec>   // conform 生成的协议
@end
NS_ASSUME_NONNULL_END
```

`ios/ItcStorage.mm`（`.mm` 才能混 C++）：
```objc
#import "ItcStorage.h"
#import <MMKV/MMKV.h>

@implementation ItcStorage {
  MMKV *_kv;
}

RCT_EXPORT_MODULE(ItcStorage)   // ★ 模块名，必须 == JS 端 getEnforcing('ItcStorage')

- (MMKV *)kv {
  if (!_kv) { [MMKV initializeMMKV:nil]; _kv = [MMKV mmkvWithID:@"itc-storage"]; }
  return _kv;
}

// 方法签名要与生成的协议（来自 spec）一致
- (void)setString:(NSString *)key value:(NSString *)value { [self.kv setString:value forKey:key]; }
- (NSString *)getString:(NSString *)key { return [self.kv getStringForKey:key] ?: @""; }
- (NSNumber *)contains:(NSString *)key { return @([self.kv containsKey:key]); }
- (void)remove:(NSString *)key { [self.kv removeValueForKey:key]; }
- (void)clearAll { [self.kv clearAll]; }

// ★ 把本类接到 TurboModule 系统（返回生成的 JSI 实现）
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeItcStorageSpecJSI>(params);
}
@end
```

> 同步返回布尔用 `NSNumber`；codegen 会按 spec 里的类型生成对应的 C++ 转换。复杂例子（Promise/对象返回，如 biometric）见 `packages/biometric/ios/`。

---

## 6. App 里安装 Pods（vendored CocoaPods）

不污染系统的装法（系统 Ruby 太老）：
```bash
cd apps/oa            # 你的 app 目录
bundle config set path vendor/bundle      # 或用 env：BUNDLE_PATH=vendor/bundle
bundle install                            # 装 CocoaPods 到 vendor/bundle
```

`apps/oa/ios/Podfile` 里依赖你的本地模块（autolink 通常自动发现 `@itc/*`；monorepo/特殊路径才需手动）：
```ruby
# 多数情况无需手写，RN autolinking 会从 node_modules 找到带 podspec 的包
```

装 Pods（**会触发 codegen**，生成 §5 引用的 `RNItcStorageSpec` 协议）：
```bash
RCT_NEW_ARCH_ENABLED=1 bundle exec pod install   # 或本仓库的 oapod install
```

> **每次改了 spec、或新增模块，都要重跑 `pod install`** 重新 codegen，否则协议不更新、编译报找不到符号。

---

## 7. 构建运行

**Xcode（推荐）**：`open ios/MyApp.xcworkspace`（**.xcworkspace 不是 .xcodeproj**），选模拟器按 ▶。

**命令行**：
```bash
# 终端A：Metro
npx react-native start
# 终端B：构建装到模拟器
SIM=<udid>   # xcrun simctl list devices 查
xcodebuild -workspace ios/MyApp.xcworkspace -scheme MyApp -configuration Debug \
  -sdk iphonesimulator -destination "id=$SIM" -derivedDataPath /tmp/dd build CODE_SIGNING_ALLOWED=NO
xcrun simctl install $SIM /tmp/dd/Build/Products/Debug-iphonesimulator/MyApp.app
xcrun simctl launch $SIM <bundle-id>
```
> 别用 `npx react-native run-ios`（会去 sudo 装 cocoapods）。详见 [运行-iOS.md](./运行-iOS.md)。

---

## 8. 排错速查

| 现象 | 修法 |
|---|---|
| 编译报找不到 `RNItcStorageSpec.h` / `NativeItcStorageSpec` | codegen 没跑：podspec 缺 `install_modules_dependencies(s)`，或没重跑 `pod install`。 |
| 运行时 `getEnforcing('ItcStorage')` 抛错 | 模块名不一致（`RCT_EXPORT_MODULE` vs spec vs JS），或 pod 没装进 app。 |
| storage 退回内存兜底 | 模块加得晚于上次 pod install，重跑 `pod install` 把它纳入 Podfile.lock。 |
| `bundle install` 报 ffi/ruby 版本 | 用 vendored bundle，别用系统 Ruby；见 [踩坑速查.md](./踩坑速查.md)。 |
| 真机要签名 | 配置 Team/证书；本仓库当前只验证模拟器。 |

## 附录：本仓库样例
- biometric（LocalAuthentication/Secure Enclave，Promise）：`packages/biometric/ios/ItcBiometric.{h,mm}`
- im（OpenIM SDK）：`packages/im/ios/`
