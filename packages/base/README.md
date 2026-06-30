# @itc/base

OpenDingDing 的**公共基座**——所有可剥离复用的 `@itc/*` 端能力模块共享、与业务无关的基础设施。**纯 TS、零原生依赖**（peer 仅 `react` / `react-native`）。

> 依赖方向铁律：feature 模块（biometric/push/im/storage/db/hotfix/uikit）依赖 base，**base 绝不反向依赖任何 feature**。

## 在其他 app / 模块中引入

```jsonc
// 该 app 或模块的 package.json
{
  "dependencies": { "@itc/base": "workspace:*" }   // monorepo 内
  // 发布到私有 registry 后则用版本号，如 "^0.1.0"
}
```

```bash
pnpm install
```

**无需任何原生接入**（纯 JS）。装好即可 `import { ... } from '@itc/base'`。

## 提供什么

### 1. 统一错误 / 结果模型
```ts
import { ItcError, ErrorCode, ok, err, toResult, type Result } from '@itc/base';

throw new ItcError(ErrorCode.USER_CANCELED, '用户取消', { module: 'biometric' });
const safe = await toResult(somePromise);   // Result<T> = { ok, value } | { ok:false, error:ItcError }
```
- 所有 `@itc/*` 模块对外抛的错误都规整为 `ItcError`，`error.code` 取自 `ErrorCode`（1xxx 通用 / 2xxx 生物 / 3xxx 推送 / 4xxx IM / 5xxx DB）。
- `ItcError.from(raw, module)` 把原生 reject（`{ code, message }`）规整为 `ItcError`。

### 2. 模块契约（生命周期）
```ts
import { BaseModule, type ItcModule } from '@itc/base';

// feature 模块继承 BaseModule，只实现 onInit/onDestroy/isSupported，
// 自动获得 state 流转 + init 幂等。
```
- `isSupported()` 是三端**能力探测与降级**的统一入口（false → 走降级路径）。
- 宿主用 `init()` / `destroy()` 集中编排模块生命周期（登录后 init、登出时 destroy）。

### 3. 平台分支
```ts
import { currentPlatform, isAndroid, isIOS, isHarmony, select } from '@itc/base';
// currentPlatform: 'android' | 'ios' | 'harmony'（RNOH 把 Platform.OS 报 'harmony'）
const channel = select({ android: 'umeng', ios: 'apns', harmony: 'pushkit' });
```

### 4. 类型化事件总线
```ts
import { eventBus } from '@itc/base';
const off = eventBus.on('push:message', (msg) => { /* ... */ });
off();                          // 取消订阅
// 模块通过声明合并扩展事件表：
// declare module '@itc/base' { interface ItcEventMap { 'push:message': PushMessage } }
```

### 5. 可注入的 Logger / Storage（薄抽象）
```ts
import { logger, setLogger, ConsoleLogger, storage, setStorage } from '@itc/base';

logger.info('app', '启动');                 // 默认 ConsoleLogger
setLogger(new ConsoleLogger('warn'));       // release 收紧级别 / 接埋点

storage.getString('k');                     // 默认内存实现（重启即失）
// 宿主启动时由 @itc/storage 的 installStorage() 注入 MMKV 持久化后端，业务层只用这个 storage 代理
```

## 注意
- **base 保持极薄**：不内置任何原生存储/网络依赖。真正的持久化由宿主用 `@itc/storage` 的 `installStorage()` 注入，未注入时 `storage` 走内存兜底，逻辑可跑但重启丢失。
- `select()` 缺省回退顺序按 `currentPlatform`；非三端（web/windows）`currentPlatform` 回退到 `'android'` 语义。
- 扩展 `ItcEventMap` / 私有 `ErrorCode` 段时用**声明合并**，不要改 base 源码。
