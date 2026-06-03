# 在 iOS 上运行 OpenDingDing（全过程要点）

> 配套：通用环境见 [ENVIRONMENT.md](./ENVIRONMENT.md)，报错速查见 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)，
> 新增原生模块见 [ADDING_A_MODULE.md](./ADDING_A_MODULE.md)。

## 0. CocoaPods 装在工作区（不污染系统）

系统 Ruby 2.6 装不了新版 CocoaPods，本项目把它 **vendored 到 `apps/oa/vendor/bundle`**
（依赖收敛在工作区原则）。老 bundler 直接调不到 `pod`，用 `~/.zshrc` 里的 `oapod` 函数封装：

```bash
# ~/.zshrc
oapod() {
  local oa="/Volumes/MacExtend/Code/ReactNative/OpenDingDing/apps/oa"
  ( cd "$oa/ios" && BUNDLE_PATH="$oa/vendor/bundle" BUNDLE_GEMFILE="$oa/Gemfile" bundle exec pod "$@" )
}
```

- `oapod --version` → 1.15.2；`oapod install` 等价于在 `ios/` 里 `pod install`。
- **`.bundle/config` 用相对路径会坏**（老 bundler 解析不一致），只能用上面的 env 配方。
- 本机没有全局 `pod`。其它 iOS 项目要 pod，建议 `brew install cocoapods` 单独装。

## 1. 何时需要 `pod install`

只在**新增 / 改动原生依赖**时：新增 @itc 原生模块、改 podspec、升级 RN。
平时改 JS / 跑模拟器**不需要**。

```bash
oapod install     # 触发 RN 新架构 codegen + 链接所有 @itc/* podspec
```

> 例：storage 是后加的模块，最初 `pod install` 早于它 → `ItcStorage` 没链接进 iOS 构建、
> 运行时 storage 退回内存兜底。补跑 `oapod install` 后 Podfile.lock 纳入 ItcStorage + MMKV 才正常。

## 2. 跑到模拟器

iOS 模拟器**不需要 `adb reverse`**，直接连 `localhost:8081`。

**方式 1：Xcode（最省心）**
```bash
open apps/oa/ios/OpenDingDing.xcworkspace   # 注意是 .xcworkspace 不是 .xcodeproj
```
选模拟器，按 ▶。

**方式 2：命令行**（Metro 开着，另起终端）
```bash
SIM=<simulator-udid>          # 如 iPhone 17：xcrun simctl list devices 查
cd apps/oa/ios
xcrun simctl boot $SIM; open -a Simulator
xcodebuild -workspace OpenDingDing.xcworkspace -scheme OpenDingDing \
  -configuration Debug -sdk iphonesimulator -destination "id=$SIM" \
  -derivedDataPath /tmp/odd-dd build CODE_SIGNING_ALLOWED=NO
xcrun simctl install $SIM /tmp/odd-dd/Build/Products/Debug-iphonesimulator/OpenDingDing.app
xcrun simctl launch $SIM org.reactjs.native.example.OpenDingDing
```

- **别用 `npx react-native run-ios`**：它找不到 vendored `pod`，会去 `sudo gem install cocoapods` 然后失败。
- 真机 `.ipa` 需要签名证书，本项目当前只验证模拟器（见 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) §17）。

## 3. 开发循环

- 改 **JS**：Fast Refresh 自动刷；或模拟器 ⌘D → Reload。
- 改 **原生 / 新增模块**：`oapod install` →（Xcode 重 build 或重跑 xcodebuild）。

## 4. 关键事实

- Bundle ID：`org.reactjs.native.example.OpenDingDing`。
- 新架构（codegen 在 pod install 时跑）；storage=MMKV(pod)，biometric=LocalAuthentication/Secure Enclave。
- 生物绑定密钥公钥格式：iOS/鸿蒙=X9.63(04||X||Y)，Android=DER(SPKI)，后端验签需按平台归一化。
