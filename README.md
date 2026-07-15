# OpenOA

对标钉钉的**模块化 OA App**。业务与端能力解耦，端能力模块（生物识别 / 推送 / IM）可从本项目**剥离复用**到其他项目。三端：Android / iOS / 鸿蒙 NEXT。

> 本文件是开发手册，命令可直接复制执行。
> **⚡ 三端环境 + 命令一页速查**：[docs/速查手册.md](docs/速查手册.md)（export 与三端命令都在这）。
> **从零搭建教程（事无巨细，可据此独立重建）**：[docs/从零搭建-Android.md](docs/从零搭建-Android.md) / [docs/从零搭建-iOS.md](docs/从零搭建-iOS.md) / [docs/从零搭建-鸿蒙.md](docs/从零搭建-鸿蒙.md)。
> 三端运行速查见 [docs/运行-Android.md](docs/运行-Android.md) / [docs/运行-iOS.md](docs/运行-iOS.md) / [docs/运行-鸿蒙.md](docs/运行-鸿蒙.md)，模块作者指南见 [docs/模块开发指南.md](docs/模块开发指南.md)，踩坑速查见 [docs/踩坑速查.md](docs/踩坑速查.md)，热修复服务端部署见 [docs/热修复服务端部署.md](docs/热修复服务端部署.md)，打包/OTA 发版脚本见 [docs/脚本速查.md](docs/脚本速查.md)，环境与磁盘布局（缓存迁外置盘）见 [docs/环境与磁盘布局.md](docs/环境与磁盘布局.md)，App 三端构建细节见 [apps/oa/README.md](apps/oa/README.md)。

---

## 1. 技术基线

| 维度 | 选型 | 说明 |
|---|---|---|
| 跨端框架 | React Native **0.82.1** | 公共基线，三端共用 |
| 鸿蒙 | RNOH（`@react-native-oh/react-native-harmony` 0.82.30） | HarmonyOS NEXT 纯血鸿蒙，ArkTS 原生 |
| RN 架构 | **New Architecture**（TurboModules + Fabric + Codegen） | 原生模块用 codegen 生成类型安全接口 |
| 包管理 | **pnpm** workspaces（`node-linker=hoisted`） | monorepo + 私有 npm 源（`@itc` scope） |
| 语言 | TypeScript 5.x / Kotlin / Swift+ObjC++ / ArkTS | — |
| 本地数据库 | **op-sqlite** + Drizzle ORM（可选） | SQLite 三端封装 + 版本化迁移 |
| KV 存储 | **MMKV**（react-native-mmkv-storage） | 微信开源高性能 KV，鸿蒙走移植包 |
| 热修复 | **CodePush**（自建 server） | OTA JS Bundle 更新，三端统一 |
| UI 方案 | **Tamagui** v2（封装在 @itc/uikit 内部） | 对外不暴露，便于日后替换底层 |

---

## 1.5 三端兼容性（版本要求）

| 平台 | 最低版本 | 推荐版本 | 最高兼容 | 说明 |
|---|---|---|---|---|
| **Android** | API 24（Android 7.0） | API 34（Android 14） | API 36 | minSdk / targetSdk / compileSdk |
| **iOS** | 15.1 | 17.x | 18.x | — |
| **HarmonyOS** | 5.0.0（API 12） | 6.1.1（API 24） | 6.1.1（API 24） | compatibleSdk / targetSdk |

> **说明**：
> - Android 和 iOS 版本由 React Native 0.82 和 IM SDK 共同决定
> - HarmonyOS 5.0.0(API 12) 为兼容模式最低要求，6.1.1(API 24) 为推荐目标版本
> - 实际测试建议覆盖各平台最近 2 个大版本

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
│   ├── base/        @itc/base        公共基座（契约/Result/平台/事件总线/日志/存储接口）
│   ├── biometric/   @itc/biometric   生物识别（指纹/人脸 + 生物绑定密钥签名）★样板模块
│   ├── db/          @itc/db          本地 SQLite 基础设施（三端 op-sqlite 封装 + 版本化迁移）
│   ├── flash-list/  @itc/flash-list  高性能列表（@shopify/flash-list 三端封装）
│   ├── skia/        @itc/skia        2D 图形渲染（@shopify/react-native-skia 三端封装）
│   ├── storage/     @itc/storage     KV 持久化（MMKV 封装，实现 @itc/base 的 KVStorage 接口）
│   ├── hotfix/      @itc/hotfix      热修复（CodePush 三端封装，OTA JS Bundle 更新）
│   ├── uikit/       @itc/uikit       基础 UI 控件库（Tamagui 封装：Button/Text/Input/表单/主题）
│   ├── push/        @itc/push        推送（极光 JPush 三端封装）✅ 已实现
│   ├── im/          @itc/rn-client-sdk-plus 即时 IM（OpenIM + 鸿蒙 HAR 封装）✅ 已实现
│
├── apps/
│   └── oa/          @itc-oa/app      钉钉克隆宿主 App
│       ├── src/                      JS 层（App + 演示页 + utils）
│       ├── android/                  Android 宿主工程（Gradle）
│       ├── ios/                      iOS 宿主工程（Xcode + CocoaPods）
│       ├── harmony/                  鸿蒙宿主工程（DevEco Studio，已接入 RNOH）
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
| DevEco Studio + 鸿蒙 SDK | **已安装**（SDK `/Volumes/MacExtend/Envirment/Harmony/OpenHarmony/Sdk`，DevEco `/Applications/DevEco-Studio.app`） | 鸿蒙 |

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

# 3. 全量类型检查（base/biometric/db/storage/hotfix/uikit/push/im/app 共 9 个工程）
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

## 7. 鸿蒙 NEXT —— ✅ 已接入，可构建运行

DevEco Studio 已安装，RNOH 宿主工程在 `apps/oa/harmony`（DevEco 打开该目录）。鸿蒙使用独立的 Metro 配置（`metro.config.harmony.js`）和 bundle 命令（`bundle-harmony`），**不能**用标准 Metro。

```bash
cd apps/oa

# 鸿蒙 Metro（开发热更新用）
pnpm start:harmony

# 鸿蒙离线 bundle（打进 rawfile）
npx react-native bundle-harmony --dev false --config metro.config.harmony.js

# DevEco 构建：打开 apps/oa/harmony → Build → Run
# 真机需先做端口转发：hdc rport tcp:8081 tcp:8081
```

> 详细运行流程与 TurboModule 注册链见 [docs/运行-鸿蒙.md](docs/运行-鸿蒙.md)，架构与版本矩阵见 [docs/鸿蒙接入要点.md](docs/鸿蒙接入要点.md)。生物识别 ArkTS 实现已就绪：[packages/biometric/harmony/](packages/biometric/harmony/)。

---

## 8.1 IM 模块使用指南（@itc/rn-client-sdk-plus）

基于 OpenIM SDK 的即时通讯模块，支持三端（Android/iOS/Harmony）。

### 核心 API

```typescript
import ItcOpenIMSDK from '@itc/rn-client-sdk-plus';
import { eventBus } from '@itc/base';

// 生成操作 ID（用于追踪）
const operationID = `op_${Date.now()}`;

// 初始化
await ItcOpenIMSDK.initSDK(
  JSON.stringify({
    platformID: 1,
    apiAddr: 'https://your-api.example.com',
    wsAddr: 'wss://your-ws.example.com',
    dataDir: '/data/your_app/im',  // 鸿蒙可选
  }),
  operationID
);

// 登录
await ItcOpenIMSDK.login(
  JSON.stringify({ userID: 'user123', token: 'your_token' }),
  operationID
);

// 发送文本消息
const textMsg = await ItcOpenIMSDK.createTextMessage('Hello!', operationID);
const sendResult = await ItcOpenIMSDK.sendMessage(
  JSON.stringify({ message: textMsg, conversationID: 'conversation_id' }),
  operationID
);

// 从本地路径创建图片消息
const imageMsg = await ItcOpenIMSDK.createImageMessageFromFullPath(
  '/path/to/image.jpg',
  operationID
);

// 创建群组
const group = await ItcOpenIMSDK.createGroup(
  JSON.stringify({
    groupType: 2,  // GroupType.Work
    groupName: '项目群',
    memberList: [{ userID: 'user456', role: 2 }],
  }),
  operationID
);

// 获取会话列表
const conversations = await ItcOpenIMSDK.getAllConversationList(operationID);

// 获取好友列表
const friends = await ItcOpenIMSDK.getFriendList(false, operationID);

// 获取群成员
const members = await ItcOpenIMSDK.getGroupMemberList(
  JSON.stringify({ groupID: 'group_id', filter: 0 }),
  operationID
);
```

### 事件监听

```typescript
import { eventBus } from '@itc/base';

// 连接状态变化
eventBus.on('im:connectionChanged', (state) => {
  console.log('连接状态:', state);
});

// 新消息
eventBus.on('im:newMessage', (msg) => {
  console.log('收到消息:', msg);
});

// 消息发送进度
eventBus.on('im:sendMessageProgress', (data) => {
  console.log(`发送进度: ${data.progress}%`);
});

// 收到新群邀请
eventBus.on('im:receiveJoinApplication', (data) => {
  console.log('新加群申请:', data);
});

// 被踢下线
eventBus.on('im:kickedOffline', () => {
  console.log('被踢下线');
});

// 用户信息更新
eventBus.on('im:userInfoUpdated', (data) => {
  console.log('用户信息更新:', data);
});

// 会话更新
eventBus.on('im:conversationChanged', (conversations) => {
  console.log('会话更新:', conversations);
});

// 好友申请
eventBus.on('im:friendApplicationChanged', (application) => {
  console.log('好友申请:', application);
});

// 群信息更新
eventBus.on('im:groupInfoChanged', ({ groupId, info }) => {
  console.log(`群 ${groupId} 信息更新:`, info);
});

// 文件上传进度
eventBus.on('im:uploadProgress', (data) => {
  console.log(`上传进度: ${data.progress}%`);
});

// 文件上传完成
eventBus.on('im:uploadComplete', (result) => {
  console.log('上传完成:', result);
});
```

### 三端实现策略

| 端 | 实现方案 | 状态 |
|---|---|---|
| Android | open-im-sdk-rn（gomobile 编译的 openim-sdk-core） | ✅ 已实现 |
| iOS | open-im-sdk-rn（gomobile 编译的 openim-sdk-core） | ✅ 已实现 |
| 鸿蒙 NEXT | imsdk.har（OpenIM 官方 ArkTS 封装）+ RNOH UITurboModule | ✅ 已实现 |

### 鸿蒙特殊说明

鸿蒙端使用 `imsdk.har` 包作为底层 SDK，通过 `ItcOpenIMTurboModule`（[packages/im/harmony/imsdk/src/main/ets/ItcOpenIMTurboModule.ets](packages/im/harmony/imsdk/src/main/ets/ItcOpenIMTurboModule.ets)）暴露给 RN 层。

**目录结构：**
```
packages/im/
├── src/                        # TS 统一 API 层
│   ├── ItcOpenIMSDK.ts         # 主入口，封装三端调用
│   ├── emitter.ts              # 事件发射器
│   ├── types/                  # 类型定义（enum/entity/eventArgs/params）
│   ├── errors/                 # 错误定义
│   └── constants/              # 常量（事件名等）
├── android/                    # Android 原生实现
├── ios/                        # iOS 原生实现
└── harmony/imsdk/              # 鸿蒙实现（RNOH TurboModule）
    └── src/main/ets/
        ├── ItcOpenIMTurboModule.ets  # TurboModule 实现
        ├── ItcOpenIMPackage.ets      # 包注册
        ├── generated/                # codegen 生成
        └── types/                    # ArkTS 类型
```

---

## 8.1 FlashList 模块使用指南（@itc/flash-list）

基于 @shopify/flash-list 的高性能列表封装，支持三端（Android/iOS/Harmony）。

### 核心 API

```typescript
import { FlashList, MessageList } from '@itc/flash-list';

// 普通列表
function App() {
  return (
    <FlashList
      data={items}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      keyExtractor={(item) => item.id}
      estimatedItemSize={80}
    />
  );
}

// IM 消息列表（默认倒序）
function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <MessageList<Message>
      data={messages}
      renderItem={({ item }) => <MessageBubble message={item} />}
      onEndReached={loadMoreHistory}
    />
  );
}
```

### 组件说明

| 组件 | 用途 | 特性 |
|------|------|------|
| `FlashList<T>` | 通用高性能列表 | 支持 `getItemType`、`horizontal`、`onEndReached` 等优化特性 |
| `MessageList<T>` | IM 场景消息列表 | 默认倒序排列，适合聊天界面 |

### 三端实现策略

| 端 | 底层实现 | 支持版本 |
|---|---|---|
| Android | @shopify/flash-list | RN 0.82+ |
| iOS | @shopify/flash-list | RN 0.82+ |
| 鸿蒙 NEXT | @react-native-ohos/flash-list | API 12+ / RN 0.82+ |

### 特性

- ✅ **API 隐藏**：完全隐藏底层实现，业务只依赖本包
- ✅ **三端一致**：所有平台 API 和行为完全一致
- ✅ **MessageList**：IM 场景专用组件（默认倒序排列）
- ✅ **性能优化**：支持 `getItemType`、`horizontal`、`onEndReached` 等 FlashList 优化特性
- ✅ **类型安全**：完整的 TypeScript 类型定义

---

## 8.2 Skia 模块使用指南（@itc/skia）

基于 @shopify/react-native-skia 的 2D 图形渲染封装，支持三端（Android/iOS/Harmony）。

### 核心 API

```typescript
import {
  Canvas,
  Circle,
  Group,
  Rect,
  Path,
  LinearGradient,
  RadialGradient,
  BoxShadow,
} from '@itc/skia';

// 颜色混合示例
function CMYKCanvas() {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Group blendMode="multiply">
        <Circle cx={64} cy={64} r={64} color="cyan" />
        <Circle cx={192} cy={64} r={64} color="magenta" />
        <Circle cx={128} cy={192} r={64} color="yellow" />
      </Group>
    </Canvas>
  );
}

// 渐变填充示例
function GradientCanvas() {
  return (
    <Canvas style={{ width: 200, height: 200 }}>
      <Rect x={10} y={10} width={80} height={80}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 80, y: 80 }}
          colors={['#667eea', '#764ba2']}
        />
      </Rect>
    </Canvas>
  );
}

// 带阴影的图形
function ShadowCanvas() {
  return (
    <Canvas style={{ width: 200, height: 200 }}>
      <Group>
        <Circle cx={80} cy={80} r={50} color="#dee2e6">
          <BoxShadow dx={4} dy={4} blur={8} color="#868e96" />
        </Circle>
      </Group>
    </Canvas>
  );
}
```

### 组件分类

| 分类 | 组件 | 说明 |
|------|------|------|
| 画布 | `Canvas` | Skia 绘图容器 |
| 图形 | `Circle`, `Rect`, `RoundedRect`, `Oval`, `Line`, `Points`, `DiffRect` | 基础几何图形 |
| 路径 | `Path`, `Patch`, `Atlas`, `Vertices` | 复杂路径和顶点绘制 |
| 分组 | `Group` | 分组和混合模式 |
| 效果 | `BoxShadow`, `Shadow` | 阴影效果 |
| 渐变 | `LinearGradient`, `RadialGradient`, `TwoPointConicalGradient`, `SweepGradient` | 渐变填充 |
| 着色器 | `FractalNoise`, `Turbulence`, `ColorShader`, `ImageShader` | 高级着色效果 |
| 滤镜 | `Blur`, `ColorMatrix`, `DisplacementMap`, `Offset`, `Morphology` | 图像滤镜 |

### 三端实现策略

| 端 | 底层实现 | 支持版本 |
|---|---|---|
| Android | @shopify/react-native-skia | RN 0.82+ |
| iOS | @shopify/react-native-skia | RN 0.82+ |
| 鸿蒙 NEXT | @react-native-ohos/react-native-skia | API 12+ / RN 0.82+ |

### 特性

- ✅ **API 统一**：三端使用相同 API，无需条件导入
- ✅ **完整类型**：所有组件和属性都有 TypeScript 类型定义
- ✅ **ManualLink 支持**：提供完整的 HarmonyOS ManualLink 配置指南
- ✅ **渐进增强**：部分高级特性在 HarmonyOS 可能有细微差异

---

## 8.3 推送模块使用指南（@itc/push）

基于极光推送（JPush）的统一推送模块，支持三端（Android/iOS/Harmony）。

### 核心 API

```typescript
import { push } from '@itc/push';
import { eventBus } from '@itc/base';

// 初始化
await push.init({
  appKey: 'your_jpush_app_key',
  secret: 'your_jpush_secret',
  production: true,  // false = 开发环境
});

// 获取设备 Token
const reg = await push.getToken();
// { token: 'xxx', channel: 'fcm'|'apns'|'pushkit' }

// 设置角标
await push.setBadge(0);

// 设置别名（用于定向推送）
await push.setAlias('user_123');

// 设置标签
await push.setTags(['vip', 'android']);

// 删除别名
await push.deleteAlias();

// 停止推送
await push.stopPush();

// 恢复推送
await push.resumePush();
```

### 事件监听

```typescript
import { eventBus } from '@itc/base';

// Token 刷新
eventBus.on('push:token', (reg) => {
  console.log('设备 Token:', reg.token);
  console.log('通道类型:', reg.channel);  // fcm/apns/pushkit
  // 上报后端
});

// 通知到达（前台收到通知）
eventBus.on('push:message', (msg) => {
  console.log('标题:', msg.title);
  console.log('内容:', msg.body);
  console.log('扩展数据:', msg.data);
});

// 通知点击（从通知栏打开 App）
eventBus.on('push:opened', (msg) => {
  console.log('点击的通知:', msg.messageId);
  // 根据 msg.data 跳转页面
});
```

### 三端实现策略

| 端 | 实现方案 | 通道标识 |
|---|---|---|
| Android | jpush-react-native + jcore-react-native | `fcm`（自动适配厂商通道） |
| iOS | jpush-react-native + jcore-react-native | `apns` |
| 鸿蒙 NEXT | jpush-react-native + jcore-react-native（RNOH 适配） | `pushkit` |

### 推送通道说明

- **channel 字段**：回传实际命中的厂商通道，便于后端定向推送和排障
- **Android 通道**：默认 FCM，极光自动适配小米/华为/OPPO/VIVO/魅族厂商通道
- **鸿蒙通道**：使用华为 Push Kit，通过 RNOH 框架透明适配

---

## 8.3 模块复用 / 新增模块

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
| `@itc/biometric` | ✅ Android 真机验证；✅ iOS 模拟器验证（原生 `isAvailable` 返回真实能力）；✅ ArkTS 实现已验证（鸿蒙通话/通知权限 + 生物识别绑定） |
| `@itc/db` | ✅ 完成（op-sqlite 三端封装 + 版本化迁移 + 事务 + Drizzle ORM 适配） |
| `@itc/flash-list` | ✅ 完成（@shopify/flash-list 三端封装 + MessageList IM 场景支持） |
| `@itc/skia` | ✅ 完成（@shopify/react-native-skia 三端封装 + 完整类型定义） |
| `@itc/storage` | ✅ 完成（MMKV 三端封装，实现 KVStorage 接口，鸿蒙走移植包） |
| `@itc/hotfix` | ✅ 完成（CodePush 三端封装 + 自建 server 验证，OTA 更新可用） |
| `@itc/uikit` | ✅ 完成（Tamagui v2 封装，Button/Text/Input/表单/主题等基础控件） |
| `@itc/push` | ✅ 已实现（jpush-react-native + jcore-react-native 三端封装，鸿蒙由 RNOH 适配） |
| `@itc/rn-client-sdk-plus` | ✅ 已实现（JS API + Android/iOS/Harmony 三端；鸿蒙使用 imsdk.har + RNOH TurboModule 封装） |

踩坑与排错（pnpm hoisted、Metro 解析、gradle-plugin/codegen 直依赖、Ruby gem 钉版本、NDK/SDK 对齐、公钥格式差异、CodePush 三端接入、Tamagui 补丁等）见 [docs/踩坑速查.md](docs/踩坑速查.md)。
