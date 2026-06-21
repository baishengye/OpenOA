# @itc/hotfix

可剥离复用的**热修复 / OTA 模块**——三端 JS bundle 在线更新。对外是稳定抽象接口（`HotfixProvider`），默认实现基于 **CodePush**（`react-native-code-push`，鸿蒙走 RNOH 移植包）。

> 设计：**接口 + 实现分离**。业务只见 `hotfix.*`，看不到 CodePush；日后换 OTA 方案只改本模块内部 + `installHotfix`。

## 在其他 app 中引入

**1. 加依赖**（CodePush 主包必须在 **app** 的 dependencies，否则 autolink 扫不到 → 运行时 `NativeModules.CodePush` undefined → 崩）
```jsonc
// app/package.json
{
  "dependencies": {
    "@itc/hotfix": "workspace:*",
    "react-native-code-push": "8.3.1"
  }
}
```

**2. 包裹根组件**（`index.js`）
```ts
import { hotfix } from '@itc/hotfix';
import App from './src/App';

// MANUAL：不自动检查，只有手动调 hotfix.sync() 才升级（也可 'ON_APP_START' / 'ON_APP_RESUME'）
const HotfixApp = hotfix.wrapApp(App, { checkFrequency: 'MANUAL' });
AppRegistry.registerComponent(appName, () => HotfixApp);
```

**3. 业务里手动同步 / 查询**
```ts
await hotfix.sync({ installMode: 'ON_NEXT_RESTART' });  // 下载+安装；返回 SyncStatus
const remote = await hotfix.checkForUpdate();            // RemoteUpdate | null
const local  = await hotfix.getCurrentVersion();         // { label, description, appVersion } | null
await hotfix.notifyAppReady();                           // 回滚保护：新包跑起来后确认 OK
```

**4. 原生接入（坑多，务必照文档）**
- **iOS**：`pod install`；`AppDelegate` 的 `bundleURL()` release 分支必须返回 `CodePush.bundleURL()`，否则 OTA 不生效。详见 [docs/踩坑速查.md §17b](../../docs/踩坑速查.md)。
- **Android**：`MainApplication.getJSBundleFile()` 返回 `CodePush.getJSBundleFile()`；app/build.gradle apply `codepush.gradle`；release 加 `usesCleartextTraffic`（dev）。本库 `react-native-code-push@8.3.1` 需 [patches/](../../patches/) 的补丁（`ChoreographerCompat` 已删）才能在 RN 0.82 编过。详见 [docs/踩坑速查.md §11b/11c](../../docs/踩坑速查.md)。
- **鸿蒙**：RNOH 移植包；turbo module 名 `RTNCodePush` 三处一致；`EntryAbility.onCreate` 预置 `AppStorage` 的 `CodePushConfig`。详见 [docs/踩坑速查.md §21~23](../../docs/踩坑速查.md)。

## API（`HotfixProvider`）
| 方法 | 说明 |
|---|---|
| `wrapApp(Component, { checkFrequency, installMode })` | 包裹根组件，接管 OTA 生命周期 |
| `sync(options?)` | 检查+下载+安装，返回 `SyncStatus` |
| `checkForUpdate()` | 仅查询，返回 `RemoteUpdate \| null` |
| `getCurrentVersion()` | 当前已装 bundle 版本 |
| `notifyAppReady()` | 确认新包正常（回滚保护） |
| `installHotfix(provider)` | 覆盖默认实现（测试 / 换方案用，须在 `registerComponent` 前调） |

`InstallMode`：`IMMEDIATE` / `ON_NEXT_RESTART` / `ON_NEXT_RESUME`。

## 注意
- **需自建 code-push-server**（微软 App Center 已退役）。无 server / 无 deployment key 时 `sync`/`checkForUpdate` 优雅失败（被 `ItcError` 包），不崩。
- **OTA 应用统一用冷启动**：RN 0.82 新架构下 `ON_NEXT_RESUME`（切后台回前台）不可靠，三端都用 `ON_NEXT_RESTART` + 彻底冷启动才稳。
- apk/ipa 定版后**别再重 build**：CodePush「binary 优先」，build time 一变就丢弃已下载的 OTA、回退内置包。
- 未注册任何 provider 时默认 `NoopHotfixProvider`（全部 no-op），保证逻辑可跑。
