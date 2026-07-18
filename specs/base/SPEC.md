# @itc/base 模块规范

## 概述

**@itc/base** 是 OpenOA 项目的公共基座模块，提供所有端能力模块共享的基础设施，无任何业务逻辑和 feature 模块依赖。

**核心职责：**
- 统一错误模型（`ItcError` / `ErrorCode` / `Result<T>`）
- 模块生命周期契约（`ItcModule` / `BaseModule`）
- 平台抽象（`currentPlatform` / `select`）
- 类型安全事件总线（`TypedEventBus`）
- 可注入日志（`logger`）
- KV 存储抽象（`KVStorage`）

**设计原则：**
- base 绝不依赖任何 feature 模块
- feature 模块依赖 base
- 依赖方向单向：feature → base

---

## 2. 模块契约（ItcModule）

### 2.1 接口定义

```typescript
/** 模块状态机 */
type ModuleState = 'uninitialized' | 'initializing' | 'ready' | 'error';

interface ItcModule<InitOptions = void> {
  /** 模块唯一标识，与 npm 包名一致 */
  readonly name: string;

  /** 探测当前平台是否支持该能力 */
  isSupported(): Promise<boolean>;

  /** 初始化（幂等，多次调用返回同一 Promise） */
  init(options: InitOptions): Promise<void>;

  /** 释放资源（登出或切换租户时调用） */
  destroy(): Promise<void>;

  /** 当前状态 */
  readonly state: ModuleState;
}
```

### 2.2 状态流转

```
uninitialized ──init()──▶ initializing ──成功──▶ ready
                              │
                              └──失败──▶ error
                                            
ready ──destroy()──▶ uninitialized
```

### 2.3 BaseModule 实现规范

所有 feature 模块应继承 `BaseModule`，只需实现：

```typescript
abstract class BaseModule<InitOptions = void> implements ItcModule<InitOptions> {
  abstract readonly name: string;
  abstract isSupported(): Promise<boolean>;
  protected abstract onInit(options: InitOptions): Promise<void>;
  protected abstract onDestroy(): Promise<void>;
}
```

**约束：**
- `init()` 幂等：已在 `ready` 状态直接返回
- `init()` 并发安全：多个并发调用共享同一 Promise
- `destroy()` 幂等：已是 `uninitialized` 直接返回
- `onInit` 抛错时状态置 `error`，由 `init()` 透传给调用方

---

## 3. 错误模型

### 3.1 ErrorCode 枚举

```typescript
enum ErrorCode {
  // 通用 1xxx
  UNKNOWN = 1000,
  UNSUPPORTED = 1001,
  PERMISSION_DENIED = 1002,
  USER_CANCELED = 1003,
  INVALID_ARGUMENT = 1004,
  NATIVE_MODULE_UNAVAILABLE = 1005,
  TIMEOUT = 1006,

  // 生物识别 2xxx
  BIOMETRY_NO_HARDWARE = 2000,
  BIOMETRY_NOT_ENROLLED = 2001,
  BIOMETRY_LOCKOUT = 2002,
  BIOMETRY_AUTH_FAILED = 2003,
  BIOMETRY_KEY_INVALIDATED = 2004,

  // 推送 3xxx
  PUSH_PERMISSION_DENIED = 3001,

  // IM 4xxx
  IM_SDK_NOT_INIT = 4000,
  IM_NOT_LOGIN = 4001,
  IM_NETWORK_ERROR = 4002,

  // 数据库 5xxx
  DB_OPEN_FAILED = 5000,
  DB_MIGRATION_FAILED = 5001,
  DB_QUERY_FAILED = 5002,
  DB_ENCRYPTION_INVALID = 5003,
}
```

**扩展规则：**
- feature 模块可在模块内定义私有码（如 `MODULE_xxx`），但公共语义码必须用 ErrorCode
- 原生侧通过 `{ code: 'ERROR_CODE_NAME', message: '...' }` 传回错误

### 3.2 ItcError 类

```typescript
class ItcError extends Error {
  readonly code: ErrorCode;
  readonly module?: string;
  override readonly cause?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    options?: { module?: string; cause?: unknown }
  );

  static from(raw: unknown, module?: string): ItcError;
}
```

**`ItcError.from()` 转换规则：**
- 已是 `ItcError` → 直接返回
- 有 `code` 字段的 Error → 按 code 名映射到 ErrorCode
- 其余 → `UNKNOWN`

### 3.3 Result 类型

```typescript
type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ItcError };

function ok<T>(value: T): Result<T>;
function err<T = never>(error: ItcError): Result<T>;
async function toResult<T>(promise: Promise<T>, module?: string): Promise<Result<T>>;
```

---

## 4. 平台抽象

### 4.1 类型定义

```typescript
type ItcPlatform = 'android' | 'ios' | 'harmony';

/** 主版本号，如 17、18 */
type MajorVersion = number;

/** 次版本号，如 5 */
type MinorVersion = number;

/** 补丁版本号，如 0 */
type PatchVersion = number;

/** 平台版本信息 */
interface PlatformVersion {
  /** 版本号数字，如 170500（iOS 17.5.0）、3300（Android 13.0.0） */
  readonly code: number;
  /** 主版本号，如 17、13 */
  readonly major: MajorVersion;
  /** 次版本号，如 5 */
  readonly minor: MinorVersion;
  /** 补丁版本号，如 0 */
  readonly patch: PatchVersion;
  /** 版本字符串，如 "17.5.0"、"13.0.0"、"4.2.0" */
  readonly string: string;
  /** 是否为指定版本（精确匹配） */
  is(version: string | number): boolean;
  /** 是否大于等于指定版本 */
  gte(version: string | number): boolean;
  /** 是否大于指定版本 */
  gt(version: string | number): boolean;
  /** 是否小于等于指定版本 */
  lte(version: string | number): boolean;
  /** 是否小于指定版本 */
  lt(version: string | number): boolean;
}
```

### 4.2 平台判定 API

```typescript
const currentPlatform: ItcPlatform;
const isAndroid: boolean;
const isIOS: boolean;
const isHarmony: boolean;

function select<T>(branches: {
  android: T;
  ios: T;
  harmony: T;
}): T;
```

**`select()` 语义：**
- 按 `currentPlatform` 返回对应分支值
- 理论上永不回退（固定三端）

### 4.3 版本检测 API

```typescript
/** iOS 版本信息（基于 Platform.Version） */
const iosVersion: PlatformVersion;

/** Android 版本信息（基于 Platform.Version） */
const androidVersion: PlatformVersion;

/** HarmonyOS 版本信息（RNOH Platform.Version） */
const harmonyVersion: PlatformVersion;

/** 当前平台的版本信息 */
const currentVersion: PlatformVersion;
```

**版本号说明：**
- iOS：`Platform.Version` 返回如 `17.5` → 内部存储为 `17500` 或 `170500`
- Android：`Platform.Version` 返回如 `33` → 内部存储为 `3300`
- HarmonyOS：`Platform.Version` 通常返回 `0`，回退到默认值

**使用示例：**

```typescript
import { iosVersion, androidVersion, currentVersion, isIOS } from '@itc/base';

// iOS 版本判断
if (iosVersion.gte(17)) {
  // 支持 iOS 17+ 特性
}

// Android 版本判断
if (androidVersion.gte(33)) {
  // 支持 Android 13+ 权限
}

// 当前平台版本（自动选择）
if (currentVersion.gte(10)) {
  // 当前平台版本 >= 10
}

// 精确匹配
if (iosVersion.is(17.5)) {
  // 恰好是 iOS 17.5
}
```

---

## 5. 事件总线

### 5.1 接口定义

```typescript
type EventHandler<T> = (payload: T) => void;
type Unsubscribe = () => void;

interface ItcEventMap {
  // 模块通过 declaration merging 扩展
  [event: string]: unknown;
}

class TypedEventBus<M extends Record<string, unknown> = ItcEventMap> {
  on<K extends keyof M>(event: K, handler: EventHandler<M[K]>): Unsubscribe;
  once<K extends keyof M>(event: K, handler: EventHandler<M[K]>): Unsubscribe;
  emit<K extends keyof M>(event: K, payload: M[K]): void;
  removeAll<K extends keyof M>(event?: K): void;
}

const eventBus: TypedEventBus;
```

### 5.2 事件命名规范

`{module}:{eventName}`

示例：`push:message`、`im:newMessage`、`im:connectionStatusChanged`

### 5.3 约束

- 单个 handler 抛错不影响其他 handler（隔离）
- `emit` 在 handler 抛错时继续执行后续 handler

---

## 6. 日志抽象

### 6.1 接口定义

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug(tag: string, message: string, extra?: unknown): void;
  info(tag: string, message: string, extra?: unknown): void;
  warn(tag: string, message: string, extra?: unknown): void;
  error(tag: string, message: string, extra?: unknown): void;
}

class ConsoleLogger implements Logger {
  constructor(minLevel?: LogLevel); // default: 'debug'
}

function setLogger(impl: Logger): void;
const logger: Logger;
```

### 6.2 行为约束

- `logger` 始终转发到当前注入的实现
- 默认实现输出到 React Native Log（Android logcat / iOS console）+ JS console
- `minLevel` 控制最小输出级别（release 可设为 'warn'）

---

## 7. KV 存储抽象

### 7.1 接口定义

```typescript
interface KVStorage {
  getString(key: string): string | null;
  set(key: string, value: string): void;
  getBoolean(key: string): boolean | null;
  setBoolean(key: string, value: boolean): void;
  delete(key: string): void;
  contains(key: string): boolean;
  clearAll(): void;
}

function setStorage(impl: KVStorage): void;
const storage: KVStorage;
```

### 7.2 行为约束

- 未注入时使用内存实现（`MemoryStorage`），重启即失
- `getBoolean` 内部用 string 存储：true → 'true'，false → 'false'
- `getString` / `getBoolean` 返回 `null` 表示 key 不存在

### 7.3 平台实现映射

| 平台 | 推荐实现 |
|------|---------|
| Android | MMKV |
| iOS | MMKV |
| Harmony | ArkData preferences / relationalStore |

---

## 8. 导出清单

```typescript
// 错误模型
export { ErrorCode, ItcError, ok, err, toResult, type Result };

// 模块契约
export { type ItcModule, type ModuleState, BaseModule };

// 平台抽象
export {
  type ItcPlatform,
  type PlatformVersion,
  type MajorVersion,
  type MinorVersion,
  type PatchVersion,
  currentPlatform,
  currentVersion,
  isAndroid,
  isIOS,
  isHarmony,
  select,
  iosVersion,
  androidVersion,
  harmonyVersion,
};

// 事件总线
export {
  type EventHandler,
  type Unsubscribe,
  type ItcEventMap,
  TypedEventBus,
  eventBus,
};

// 日志
export { type LogLevel, type Logger, ConsoleLogger, setLogger, logger };

// KV 存储
export { type KVStorage, setStorage, storage };
```

---

## 9. 依赖关系

**peerDependencies：**
- `react`: `*`
- `react-native`: `>=0.77.0`

**内部依赖：**
- 无（base 是依赖链的根节点）

**tsconfig 约束：**
- 不要 `composite` / `references` / `paths` 指向 base 源码
- 靠 pnpm workspace 从 node_modules 解析已构建类型

---

## 10. 使用示例

### 10.1 创建 feature 模块

```typescript
import { BaseModule, ItcError, ErrorCode } from '@itc/base';

class MyModule extends BaseModule<MyOptions> {
  readonly name = 'myModule';

  async isSupported() {
    try {
      // 探测逻辑
      return true;
    } catch {
      return false;
    }
  }

  protected async onInit(options: MyOptions) {
    // 初始化逻辑
  }

  protected async onDestroy() {
    // 清理逻辑
  }
}

export const myModule = new MyModule();
```

### 10.2 统一错误处理

```typescript
try {
  await nativeModule.doSomething();
} catch (e) {
  throw ItcError.from(e, 'myModule');
}
```

### 10.3 平台分支

```typescript
import { select } from '@itc/base';

const channel = select({
  android: 'umeng',
  ios: 'apns',
  harmony: 'pushkit',
});
```

### 10.4 事件订阅

```typescript
import { eventBus } from '@itc/base';

// 扩展事件映射
declare module '@itc/base' {
  interface ItcEventMap {
    'my:event': { data: string };
  }
}

const unsubscribe = eventBus.on('my:event', (payload) => {
  console.log(payload.data);
});

// 取消订阅
unsubscribe();
```
