# @itc/push

统一**推送模块**。沿用 [@itc/biometric](../biometric) 的结构：统一 TS API + `ItcModule` 契约 + 三端原生 + 回调（到达/点击/角标）经 [@itc/base](../base) 的 `eventBus` 下发。

> ⚠️ **当前为占位骨架**：API 已定型，**原生尚未实现**——`isSupported()` 返回 `false`，`init/getToken/setBadge` 抛 `ItcError(NATIVE_MODULE_UNAVAILABLE)`。先按此 API 写业务，原生补齐后无缝生效。

## 在其他 app 中引入

```jsonc
// app/package.json
{ "dependencies": { "@itc/base": "workspace:*", "@itc/push": "workspace:*" } }
```

```ts
import { push } from '@itc/push';
import { eventBus } from '@itc/base';

if (await push.isSupported()) {                 // 降级入口：false 则走轮询/不推送
  await push.init({ appKey, appSecret });
  const reg = await push.getToken();            // { token, channel } —— 上报后端用于定向推送
  await push.setBadge(0);
}

// 原生回调统一经事件总线（声明合并已扩展 ItcEventMap）
const off1 = eventBus.on('push:message', (m /* PushMessage */) => {});   // 到达
const off2 = eventBus.on('push:opened',  (m /* PushMessage */) => {});   // 点击通知
const off3 = eventBus.on('push:token',   (r /* PushRegistration */) => {}); // token 刷新
```

`PushMessage` = `{ messageId, title?, body?, data? }`；
`PushRegistration` = `{ token, channel }`（channel 便于排障：`'apns'|'pushkit'|'xiaomi'|'huawei'|...`）。

## 三端策略（规划）
| 端 | 通道 |
|---|---|
| Android | 友盟 / 极光（内置小米/华为/OPPO/VIVO/魅族厂商通道） |
| iOS | APNs |
| 鸿蒙 NEXT | 华为 Push Kit |

## 注意
- **角标 / 通道差异大**：`channel` 字段回传实际命中的厂商通道，后端定向推送与排障都依赖它。
- 原生补齐前，业务对 `push.*` 的调用要用 `isSupported()` 门控或 `try/catch` 兜 `ItcError`。
- 原生实现后接入方式同 `@itc/biometric`（待补 `src/NativeItcPush.ts` codegen spec + android/ios/harmony 原生；鸿蒙 `oh-package.json5` + RNOH 注册）。
