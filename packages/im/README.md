# @itc/im

即时 **IM 模块**（封装 OpenIM）。沿用 [@itc/biometric](../biometric) 的结构：统一 TS API + `ItcModule` 契约 + 三端原生 + 事件经 [@itc/base](../base) 的 `eventBus` 下发。

> ⚠️ **当前为占位骨架**：API 已定型，**原生尚未实现**——`isSupported()` 返回 `false`，`init/login/sendText` 抛 `ItcError(NATIVE_MODULE_UNAVAILABLE)`。先按此 API 写业务，原生补齐后无缝生效。

## 在其他 app 中引入

```jsonc
// app/package.json
{ "dependencies": { "@itc/base": "workspace:*", "@itc/im": "workspace:*" } }
```

```ts
import { im } from '@itc/im';
import { eventBus } from '@itc/base';

if (await im.isSupported()) {                       // 降级入口：false 则隐藏 IM 入口
  await im.init({ apiUrl, wsUrl, platformId });
  await im.login(userId, token);
  const msg = await im.sendText(conversationId, 'hi');
}

// 新消息 / 连接状态经事件总线下发（声明合并已扩展 ItcEventMap）
const off1 = eventBus.on('im:newMessage', (m /* IMMessage */) => {});
const off2 = eventBus.on('im:connectionChanged', (s /* ConnectionState */) => {});
```

`IMMessage` = `{ clientMsgId, conversationId, senderId, contentType, content, createTime }`；
`ConnectionState` = `'connecting' | 'connected' | 'disconnected' | 'kickedOffline'`。

## 三端策略（规划）
| 端 | 方案 |
|---|---|
| Android / iOS | 官方 `open-im-sdk-rn`（gomobile 编译的 openim-sdk-core） |
| 鸿蒙 NEXT | 自编译 openim-sdk-core(Go) 为 OHOS arm64 `.so` + ArkTS NAPI 绑定 |

## 注意
- **鸿蒙端是本项目最大技术风险项**（Go→OHOS .so + NAPI），需独立 PoC 验证后再排期。
- 原生补齐前，业务侧对 `im.*` 的调用要用 `isSupported()` 门控或 `try/catch` 兜 `ItcError`，避免占位实现抛错冒泡。
- 原生实现后接入方式同 `@itc/biometric`（autolink + codegen spec；鸿蒙 `oh-package.json5` + RNOH `RNPackagesFactory` 注册）。
