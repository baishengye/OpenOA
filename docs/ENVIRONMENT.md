# 开发环境与磁盘布局

本机三端工具链的实际位置，以及「把缓存收敛到外置盘 MacExtend」的软链方案（换机/重装时可照此复刻）。

## 工具链位置一览

| 工具 | 位置 | 备注 |
|---|---|---|
| Node / pnpm | 系统 | node 25、pnpm 11.2.2 |
| JDK | `/Applications/Android Studio.app/Contents/jbr/Contents/Home` | 用 Android Studio 自带 JBR（JDK 21）作 `JAVA_HOME` |
| Android SDK | `/Volumes/MacExtend/Envirment/Android/SDK` | platform 34/36、build-tools 35、NDK 26.1、emulator 镜像 android-36 |
| Xcode | `/Applications/Xcode.app`（26.5） | 已下载 iOS 26.5 平台/模拟器运行时 |
| CocoaPods | 工作区 `apps/oa/vendor/bundle` | bundler 装（系统 Ruby 2.6.10，见 [apps/oa/Gemfile](../apps/oa/Gemfile)） |
| DevEco Studio | `/Applications/DevEco-Studio.app`（9.4G） | 自带 hvigorw/ohpm/node/emulator 于 `Contents/tools/` |
| 鸿蒙 SDK | `/Volumes/MacExtend/Envirment/Harmony/OpenHarmony/Sdk` | DevEco 的 `oh.sdk.location` 已指向；Huawei 系统镜像在 `…/Harmony/Huawei/Sdk` |

**常用环境变量：**
```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="/Volumes/MacExtend/Envirment/Android/SDK"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

## 已迁到 MacExtend 的缓存（软链）

为给系统盘腾空间，下列缓存目录已迁到 MacExtend，并在原位置留软链（工具透明无感、可逆）：

| 原位置（系统盘） | → 实际位置（MacExtend） | 大小 |
|---|---|---|
| `~/.gradle` | `/Volumes/MacExtend/Envirment/Android/.gradle` | 5.7G |
| `~/Library/Developer/Xcode/DerivedData` | `/Volumes/MacExtend/Envirment/IOS/DerivedData` | 2.3G |
| `~/.Huawei`（鸿蒙模拟器数据） | `/Volumes/MacExtend/Envirment/Harmony/home/.Huawei` | 1.3G |
| `~/.hvigor`（鸿蒙构建缓存） | `/Volumes/MacExtend/Envirment/Harmony/home/.hvigor` | 20M |
| `~/.ohpm`（鸿蒙包缓存） | `/Volumes/MacExtend/Envirment/Harmony/home/.ohpm` | 64K |

### 复刻命令（换机/重装后）

> ⚠️ 操作前**退出 Xcode / Android Studio / DevEco / 模拟器**，并停掉 gradle 守护，避免文件占用。

```bash
# Android Gradle 缓存
mv ~/.gradle /Volumes/MacExtend/Envirment/Android/.gradle
ln -s /Volumes/MacExtend/Envirment/Android/.gradle ~/.gradle

# Xcode DerivedData
mv ~/Library/Developer/Xcode/DerivedData /Volumes/MacExtend/Envirment/IOS/DerivedData
ln -s /Volumes/MacExtend/Envirment/IOS/DerivedData ~/Library/Developer/Xcode/DerivedData

# 鸿蒙 home 缓存
mkdir -p /Volumes/MacExtend/Envirment/Harmony/home
for d in .Huawei .hvigor .ohpm; do
  mv ~/$d /Volumes/MacExtend/Envirment/Harmony/home/$d
  ln -s /Volumes/MacExtend/Envirment/Harmony/home/$d ~/$d
done
```

### 验证软链
```bash
ls -ld ~/.gradle ~/Library/Developer/Xcode/DerivedData ~/.Huawei ~/.hvigor ~/.ohpm
# 均应显示 -> /Volumes/MacExtend/...
```

## 仍在系统盘（不可 / 不宜迁移）

- **Xcode.app、Android Studio.app、DevEco.app 程序本体** —— 必须留 `/Applications`（从外置盘运行有签名/稳定性风险）。
- **iOS 模拟器运行时（`/Library/Developer/CoreSimulator/Images/` 的磁盘镜像，~8.5G）** —— Apple/CoreSimulator 托管，固定在系统盘并挂载，**不要动也不要清理**。曾因清理把它弄丢（`simctl list runtimes` 变空、模拟器无法构建/运行）。
  - **丢失后恢复**（重新下载并注册，约 8.5G 到系统盘）：
    ```bash
    xcodebuild -downloadPlatform iOS
    xcrun simctl list runtimes        # 应重新出现 iOS 26.5 (Ready)
    ```
- 零碎 IDE 配置缓存（共几 MB，忽略）。

## 注意
- MacExtend 是外置盘：**断开/未挂载时**，gradle/Xcode/DevEco 会因软链失效而报错；构建前确保 MacExtend 已挂载。
- 详细各端构建/运行命令见根 [README.md](../README.md)；踩坑见 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)。
