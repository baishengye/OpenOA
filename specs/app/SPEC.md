# apps/oa 主应用规范

## 概述

**apps/oa** 是 OpenOA 项目的宿主 App（对标钉钉），消费所有 `@itc/*` 模块。App 展示各模块能力演示页面，提供三端（Android / iOS / 鸿蒙 NEXT）统一的入口和配置。

**核心职责：**
- 初始化所有 @itc/* 模块（storage / push / im 等）
- 提供各模块能力演示页面
- 验证 @itc/* 模块在三端的可用性
- 作为参考模板供业务 App 接入

**设计原则：**
- 宿主负责调用 `installStorage()` / `installPush()` 等注入方法
- 业务层通过 `@itc/base` 的全局代理访问各模块能力
- 热修复默认 MANUAL（手动触发），避免自动更新干扰演示

---

## 2. 项目结构

```
apps/oa/
├── package.json                  # 依赖声明（含所有 @itc/* workspace 依赖）
├── index.js                      # App 入口：热修复包装 + AppRegistry
├── app.json                      # App 名称配置
├── tsconfig.json                 # TypeScript 配置
├── babel.config.js               # Babel 配置
├── metro.config.js               # Metro 配置（Android/iOS）
├── metro.config.harmony.js       # Metro 配置（鸿蒙）
├── react-native.config.js        # RN CLI 配置（含 autolinking）
├── src/
│   ├── App.tsx                   # App 根组件
│   ├── db/
│   │   └── smoke.ts              # @itc/db 冒烟测试
│   ├── screens/
│   │   ├── DemoScreen.tsx        # 演示主页
│   │   └── demo/
│   │       ├── AuthTab.tsx       # 生物识别演示
│   │       ├── CapsTab.tsx       # 能力探测演示
│   │       ├── DbTab.tsx         # 数据库演示
│   │       ├── HotfixTab.tsx     # 热修复演示
│   │       ├── ImTab.tsx         # IM 演示
│   │       ├── KeyTab.tsx        # 生物密钥演示
│   │       ├── PushTab.tsx       # 推送演示
│   │       ├── StorageTab.tsx    # 存储演示
│   │       ├── UikitTab.tsx      # UI 组件演示
│   │       ├── shared.tsx        # 演示公共组件
│   │       └── imDemo/           # IM 详细演示
│   └── utils/
│       ├── usePush.ts            # 推送初始化 hook
│       └── base64.ts             # Base64 工具
├── android/                      # Android 原生工程
├── ios/                          # iOS 原生工程
├── harmony/                      # 鸿蒙原生工程
└── scripts/
    └── harmony-rport.mjs         # 鸿蒙 Metro 端口转发脚本
```

---

## 3. 入口与初始化

### 3.1 index.js

```javascript
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { hotfix } from '@itc/hotfix';

// 手动检查更新模式（避免自动下载干扰演示）
const HotfixApp = hotfix.wrapApp(App, { checkFrequency: 'MANUAL' });
AppRegistry.registerComponent(appName, () => HotfixApp);
```

### 3.2 App.tsx

```tsx
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { currentPlatform, logger } from '@itc/base';
import { UIProvider } from '@itc/uikit';
import { DemoScreen } from './screens/DemoScreen';
import { usePush } from './utils/usePush';

logger.info('app', `OpenOA 启动，平台=${currentPlatform}`);

export default function App(): JSX.Element {
  usePush(); // 初始化推送

  return (
    <UIProvider defaultMode="light">
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.markBar}>
          <Text>🟢 {BUILD_MARK} · {currentPlatform}</Text>
        </View>
        <DemoScreen />
      </View>
    </UIProvider>
  );
}
```

### 3.3 usePush hook

```typescript
/**
 * 推送初始化 hook。
 * 在 App 启动时调用一次，初始化极光推送并监听推送事件。
 */
export function usePush(): void {
  // 监听推送事件
  eventBus.on('push:token', (reg: PushRegistration) => {
    logger.info(TAG, `设备注册: channel=${reg.channel} token=...`);
  });
  eventBus.on('push:message', (msg: PushMessage) => {
    logger.info(TAG, `收到推送: ${msg.title}`);
  });
  eventBus.on('push:opened', (msg: PushMessage) => {
    logger.info(TAG, `点击通知打开: ${msg.title}`);
  });

  // 初始化推送
  push.init({
    appKey: JPUSH_APPKEY,
    production: false,
  });
}
```

---

## 4. 依赖关系

### 4.1 @itc/* 模块依赖

```json
{
  "@itc/base": "workspace:*",
  "@itc/biometric": "workspace:*",
  "@itc/db": "workspace:*",
  "@itc/hotfix": "workspace:*",
  "@itc/rn-client-sdk-plus": "workspace:*",
  "@itc/push": "workspace:*",
  "@itc/storage": "workspace:*",
  "@itc/uikit": "workspace:*"
}
```

### 4.2 原生模块依赖

| 原生包 | 用途 |
|--------|------|
| `@op-engineering/op-sqlite` | Android/iOS SQLite |
| `@react-native-ohos/op-sqlite` | 鸿蒙 SQLite |
| `react-native-code-push` | Android/iOS 热修复 |
| `@react-native-ohos/react-native-code-push` | 鸿蒙热修复 |
| `react-native-mmkv-storage` | Android/iOS KV 存储 |
| `@react-native-oh-tpl/react-native-mmkv-storage` | 鸿蒙 KV 存储 |
| `react-native-safe-area-context` | 安全区域 |

---

## 5. 三端构建

### 5.1 Android

```bash
cd apps/oa/android

# Release APK（内嵌 JS，无需 Metro）
./gradlew :app:assembleRelease --no-daemon
#   → app/build/outputs/apk/release/app-release.apk

# Debug APK（配合 Metro）
./gradlew :app:assembleDebug --no-daemon

# 安装
adb install -r app/build/outputs/apk/release/app-release.apk
```

**配置要点：**
- `newArchEnabled=true`（新架构）
- `hermesEnabled=true`
- `compileSdk=36`
- autolinking 自动注册所有 @itc/* 原生模块

### 5.2 iOS

```bash
cd apps/oa

# 安装 CocoaPods
BUNDLE_PATH=vendor/bundle bundle install
cd ios
RCT_NEW_ARCH_ENABLED=1 bundle exec pod install

# 编译
xcodebuild -workspace OpenOA.xcworkspace -scheme OpenOA \
  -configuration Release -sdk iphonesimulator -derivedDataPath build \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO build
```

**配置要点：**
- `Info.plist` 包含 `NSFaceIDUsageDescription`
- 新架构已启用（`RCT_NEW_ARCH_ENABLED=1`）

### 5.3 鸿蒙 NEXT

```bash
# 启动 Metro（鸿蒙平台）
pnpm oa:harmony

# 出包
cd apps/oa/harmony && ./hvigorw assembleHap --mode module -p product=default

# 装机
hdc install entry/build/.../entry-default-signed.hap
```

**配置要点：**
- Metro 使用 `metro.config.harmony.js`（`createHarmonyMetroConfig`）
- 需要在 `entry/oh-package.json5` 注册 @itc/biometric 等原生模块

---

## 6. 演示页面

### 6.1 演示主页

`src/screens/DemoScreen.tsx` 是主演示页面，包含各模块的 Tab 切换入口。

### 6.2 演示 Tab 列表

| Tab | 文件 | 演示内容 |
|-----|------|----------|
| 能力探测 | `CapsTab.tsx` | 设备生物识别能力探测 |
| 认证 | `AuthTab.tsx` | 生物识别认证 |
| 注册免密 | `KeyTab.tsx` | 创建生物绑定密钥 |
| 指纹登录 | `KeyTab.tsx` | 用私钥签名验证 |
| 数据库 | `DbTab.tsx` | @itc/db 冒烟测试 |
| 存储 | `StorageTab.tsx` | MMKV 读写测试 |
| 推送 | `PushTab.tsx` | 推送初始化和事件 |
| 热修复 | `HotfixTab.tsx` | 手动检查更新 |
| IM | `ImTab.tsx` + `imDemo/` | 即时通讯功能 |
| UI | `UikitTab.tsx` | UI 组件展示 |

---

## 7. 冒烟测试

### 7.1 @itc/db 冒烟测试

```typescript
import { openDatabase } from '@itc/db';

export async function runDbSmoke(): Promise<SmokeResult> {
  const db = await openDatabase({
    name: 'oa-smoke.db',
    migrations: [{
      version: 1,
      name: 'create-smoke',
      up: 'CREATE TABLE IF NOT EXISTS smoke (id INTEGER PRIMARY KEY AUTOINCREMENT, v TEXT, ts INTEGER)',
    }],
  });

  await db.run('INSERT INTO smoke (v, ts) VALUES (?, ?)', [`hello-${Date.now()}`, Date.now()]);
  const cnt = await db.queryOne<{ n: number }>('SELECT COUNT(*) AS n FROM smoke');
  db.close();

  return { ok: true, lines: [`✅ count = ${cnt?.n}`] };
}
```

---

## 8. 配置说明

### 8.1 app.json

```json
{
  "name": "OpenOA",
  "displayName": "OpenOA"
}
```

### 8.2 op-sqlite 配置

```json
{
  "op-sqlite": {
    "sqlcipher": false,
    "libsql": false
  }
}
```

- `sqlcipher: false`：不使用加密（演示场景）
- `libsql: false`：不使用 libsql 远程同步

### 8.3 热修复配置

```typescript
hotfix.wrapApp(App, {
  checkFrequency: 'MANUAL'  // 手动检查更新
});
```

---

## 9. 环境变量

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="/Volumes/MacExtend/Envirment/Android/SDK"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

---

## 10. 与业务 App 的关系

```
┌─────────────────────────────────────────────────────────────┐
│                    业务 App（生产）                          │
│  - 替换 app.json 中的 App 名称                              │
│  - 配置 JPUSH_APPKEY                                        │
│  - 替换 OpenIM 服务器地址                                   │
│  - 按需启用热修复自动检查                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ 参照
┌─────────────────────────────────────────────────────────────┐
│                    apps/oa（演示宿主）                       │
│  - 展示各 @itc/* 模块能力                                   │
│  - 提供完整的三端构建流程                                   │
│  - 验证模块集成的正确性                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. 注意事项

1. **AppKey 配置**：`usePush.ts` 中的 `JPUSH_APPKEY` 需要替换为实际极光 AppKey
2. **热修复模式**：默认 MANUAL，避免自动更新干扰演示；生产环境可改为 ON_APP_RESUME
3. **新架构**：Android/iOS 均启用新架构（`newArchEnabled=true`）
4. **签名**：真机运行需要配置有效的签名证书
5. **鸿蒙**：需要 DevEco Studio + hvigor/ohpm 环境才能构建
6. **BUILD_MARK**：`App.tsx` 中的 `BUILD_MARK` 用于确认 Metro 是否连接、在跑最新 bundle
7. **Autolinking**：所有 @itc/* 模块通过 autolinking 自动注册，无需手动配置
