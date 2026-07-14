# @itc/hotfix 模块规范

## 概述

**@itc/hotfix** 是 OpenOA 项目的热修复（OTA JS 更新）模块，通过 `HotfixProvider` 接口抽象热修复能力，默认实现使用 CodePush。业务层通过全局 `hotfix` 代理访问热修复能力，可随时通过 `installHotfix()` 切换热修复后端。

**核心职责：**
- 提供统一热修复 API（checkForUpdate / sync / getCurrentVersion / notifyAppReady）
- 封装 CodePush 三端实现（鸿蒙走 @react-native-oh-tpl 移植包）
- 支持推送后端透明切换

**设计原则：**
- 接口驱动：`HotfixProvider` 接口隔离具体实现
- 后端可插拔：`installHotfix()` 注入新实现，业务层零改动
- 默认 CodePush：Metro 按平台自动选择官方或鸿蒙移植包

---

## 2. 核心接口

### 2.1 HotfixProvider 接口

```typescript
interface HotfixProvider {
  /** 检查服务端是否有新版本更新 */
  checkForUpdate(): Promise<RemoteUpdate | null>;

  /** 同步下载并安装更新 */
  sync(options?: SyncOptions): Promise<SyncStatus>;

  /** 获取当前已安装的更新版本信息 */
  getCurrentVersion(): Promise<LocalVersion | null>;

  /** 通知热修复模块当前 App 已准备就绪（标记更新为成功） */
  notifyAppReady(): Promise<void>;

  /** 包装 App 根组件，注入热修复检查逻辑 */
  wrapApp<P extends object>(
    Component: ComponentType<P>,
    options?: WrapOptions
  ): ComponentType<P>;
}
```

### 2.2 配置类型

```typescript
type InstallMode = 'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME';

type CheckFrequency = 'ON_APP_START' | 'ON_APP_RESUME' | 'MANUAL';

type SyncStatus =
  | 'UP_TO_DATE'       // 已是最新的
  | 'UPDATE_INSTALLED' // 更新已安装
  | 'UPDATE_IGNORED'   // 用户忽略更新
  | 'ERROR'            // 发生错误
  | 'IN_PROGRESS';     // 同步进行中

interface SyncOptions {
  /** 普通更新的安装模式，默认 ON_NEXT_RESUME */
  installMode?: InstallMode;
  /** 强制更新的安装模式，默认 IMMEDIATE */
  mandatoryInstallMode?: InstallMode;
  /** App 进入后台后最少停留秒数才触发更新检查 */
  minimumBackgroundDuration?: number;
}

interface WrapOptions {
  /** 更新检查频率，默认 ON_APP_RESUME */
  checkFrequency?: CheckFrequency;
  /** 普通更新的安装模式 */
  installMode?: InstallMode;
  /** 强制更新的安装模式 */
  mandatoryInstallMode?: InstallMode;
}

interface RemoteUpdate {
  label: string;        // 更新版本标签
  description: string;  // 更新描述
  isMandatory: boolean; // 是否强制更新
  packageSize: number;  // 更新包大小（字节）
}

interface LocalVersion {
  label: string;        // 当前版本标签
  description: string;  // 当前版本描述
  appVersion: string;   // 对应的 App 版本号
}
```

---

## 3. 全局代理

### 3.1 hotfix 对象

```typescript
export const hotfix: HotfixProvider = {
  checkForUpdate: () => _provider.checkForUpdate(),
  sync: (options?: SyncOptions) => _provider.sync(options),
  getCurrentVersion: () => _provider.getCurrentVersion(),
  notifyAppReady: () => _provider.notifyAppReady(),
  wrapApp: (Component, options?: WrapOptions) => _provider.wrapApp(Component, options),
};
```

### 3.2 后端注入

```typescript
/**
 * 覆盖默认 OTA 后端。用于测试或未来切换热修复方案。
 * 必须在 AppRegistry.registerComponent 之前调用。
 */
export function installHotfix(provider: HotfixProvider): void;
```

---

## 4. 默认实现（CodePush）

### 4.1 实现类

```typescript
class ItcHotfix implements HotfixProvider {
  async checkForUpdate(): Promise<RemoteUpdate | null>;
  async sync(options?: SyncOptions): Promise<SyncStatus>;
  async getCurrentVersion(): Promise<LocalVersion | null>;
  async notifyAppReady(): Promise<void>;
  wrapApp<P extends object>(Component: ComponentType<P>, options?: WrapOptions): ComponentType<P>;
}
```

### 4.2 CodePush 映射

| @itc/hotfix 类型 | CodePush 常量 |
|------------------|---------------|
| `InstallMode.IMMEDIATE` | `codePush.InstallMode.IMMEDIATE` |
| `InstallMode.ON_NEXT_RESTART` | `codePush.InstallMode.ON_NEXT_RESTART` |
| `InstallMode.ON_NEXT_RESUME` | `codePush.InstallMode.ON_NEXT_RESUME` |
| `CheckFrequency.ON_APP_START` | `codePush.CheckFrequency.ON_APP_START` |
| `CheckFrequency.ON_APP_RESUME` | `codePush.CheckFrequency.ON_APP_RESUME` |
| `CheckFrequency.MANUAL` | `codePush.CheckFrequency.MANUAL` |

### 4.3 状态映射

| CodePush SyncStatus | @itc/hotfix SyncStatus |
|---------------------|------------------------|
| `UP_TO_DATE` | `'UP_TO_DATE'` |
| `UPDATE_INSTALLED` | `'UPDATE_INSTALLED'` |
| `UPDATE_IGNORED` | `'UPDATE_IGNORED'` |
| `UNKNOWN_ERROR` | `'ERROR'` |
| `SYNC_IN_PROGRESS` | `'IN_PROGRESS'` |

---

## 5. Noop 实现

测试或未接入热修复时使用，不抛错、静默通过：

```typescript
class NoopHotfixProvider implements HotfixProvider {
  checkForUpdate() { return Promise.resolve(null); }
  sync() { return Promise.resolve<SyncStatus>('UP_TO_DATE'); }
  getCurrentVersion() { return Promise.resolve(null); }
  notifyAppReady() { return Promise.resolve(); }
  wrapApp(Component) { return Component; }
}
```

---

## 6. 平台差异

| 平台 | 实现包 | 说明 |
|------|--------|------|
| Android | `react-native-code-push` | 官方包 |
| iOS | `react-native-code-push` | 官方包 |
| 鸿蒙 NEXT | `@react-native-ohos/react-native-code-push` | RNOH 移植包 |

**Metro 选择机制：**
- 三端统一使用 `@itc/hotfix` JS API
- 鸿蒙的原生差异由 metro/HAR 在底层透明处理
- 业务层无需感知平台差异

---

## 7. 依赖关系

**dependencies：**
- `react-native-code-push@^8.2.2`
- `@react-native-ohos/react-native-code-push@8.2.3`

**peerDependencies：**
- `react-native`：>= 0.77.0

**内部依赖：**
- 无（hotfix 不依赖 @itc/base）

---

## 8. 使用示例

### 8.1 包装 App 根组件

```typescript
import { hotfix } from '@itc/hotfix';
import { App } from './App';

// 包装 App 根组件，注入热修复检查逻辑
const WrappedApp = hotfix.wrapApp(App, {
  checkFrequency: 'ON_APP_RESUME',    // 每次从后台恢复时检查更新
  installMode: 'ON_NEXT_RESUME',      // 普通更新在下次恢复时安装
  mandatoryInstallMode: 'IMMEDIATE',  // 强制更新立即安装
});

AppRegistry.registerComponent('MyApp', () => WrappedApp);
```

### 8.2 手动检查更新

```typescript
import { hotfix } from '@itc/hotfix';

async function checkForHotfix() {
  const update = await hotfix.checkForUpdate();
  if (update) {
    console.log('发现新版本:', update.label);
    console.log('更新描述:', update.description);
    console.log('包大小:', (update.packageSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('是否强制:', update.isMandatory ? '是' : '否');

    if (!update.isMandatory) {
      // 非强制更新，用户可选
      const confirmed = await showConfirmDialog('发现新版本，是否更新？');
      if (confirmed) {
        await hotfix.sync({ installMode: 'ON_NEXT_RESTART' });
      }
    } else {
      // 强制更新，直接同步
      await hotfix.sync();
    }
  } else {
    console.log('已是最新版本');
  }
}
```

### 8.3 监听同步状态

```typescript
import { hotfix } from '@itc/hotfix';

async function startSync() {
  const status = await hotfix.sync({
    installMode: 'ON_NEXT_RESUME',
    mandatoryInstallMode: 'IMMEDIATE',
    minimumBackgroundDuration: 30, // 后台至少 30 秒
  });

  switch (status) {
    case 'UP_TO_DATE':
      console.log('已是最新的');
      break;
    case 'UPDATE_INSTALLED':
      console.log('更新已安装，将在下次重启时生效');
      break;
    case 'UPDATE_IGNORED':
      console.log('用户忽略更新');
      break;
    case 'ERROR':
      console.log('更新失败');
      break;
    case 'IN_PROGRESS':
      console.log('同步进行中');
      break;
  }
}
```

### 8.4 获取当前版本信息

```typescript
import { hotfix } from '@itc/hotfix';

async function showVersionInfo() {
  const version = await hotfix.getCurrentVersion();
  if (version) {
    console.log('当前版本标签:', version.label);
    console.log('当前版本描述:', version.description);
    console.log('App 版本:', version.appVersion);
  } else {
    console.log('未安装热更新，使用原生包');
  }
}
```

### 8.5 通知更新成功

```typescript
import { hotfix } from '@itc/hotfix';

// 在 App 完全启动并准备好后调用
// 告知 CodePush 当前更新已成功应用
await hotfix.notifyAppReady();
```

### 8.6 切换热修复后端（示例）

```typescript
import { installHotfix } from '@itc/hotfix';
import { MyCustomHotfixProvider } from './MyCustomHotfixProvider';

// 在 registerComponent 之前注入自定义实现
installHotfix(new MyCustomHotfixProvider());
```

---

## 9. 导出清单

```typescript
// 热修复代理
export const hotfix: HotfixProvider;

// 后端注入
export function installHotfix(provider: HotfixProvider): void;

// 类型
export type {
  InstallMode,
  CheckFrequency,
  SyncStatus,
  SyncOptions,
  WrapOptions,
  RemoteUpdate,
  LocalVersion,
  HotfixProvider,
};
```

---

## 10. 注意事项

1. **注入时机**：`installHotfix()` 必须在 `AppRegistry.registerComponent` 之前调用
2. **wrapApp 调用时机**：必须在 `AppRegistry.registerComponent` 之前
3. **notifyAppReady**：应在 App 完全启动并准备好后调用
4. **强制更新**：强制更新会忽略用户选择，直接安装
5. **后台更新**：`minimumBackgroundDuration` 控制 App 在后台停留多久后才触发更新
6. **状态机**：同步进行中再次调用 sync 会返回 `IN_PROGRESS`
7. **零依赖**：@itc/hotfix 不依赖 @itc/base，保持轻量
