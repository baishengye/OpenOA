# @itc/push 模块规范

## 概述

**@itc/push** 是 OpenOA 项目的推送模块，通过 `PushProvider` 接口抽象推送能力，默认实现使用极光推送（JPush）。业务层通过全局 `push` 代理访问推送能力，可随时通过 `installPush()` 切换推送后端。

**核心职责：**
- 提供统一推送 API（init / getToken / setBadge / setAlias / setTags / stopPush / resumePush）
- 桥接原生推送事件到 JS 层事件总线
- 支持推送后端透明切换

**设计原则：**
- 接口驱动：`PushProvider` 接口隔离具体实现
- 后端可插拔：`installPush()` 注入新实现，业务层零改动
- 默认极光：Metro 按平台自动选择 JPush 或鸿蒙 Push Kit

---

## 2. 核心接口

### 2.1 PushProvider 接口

```typescript
interface PushProvider {
  /** 初始化推送 SDK。幂等，可重复调用。 */
  init(options: PushInitOptions): Promise<void>;

  /** 获取设备推送标识（registrationId / token）。 */
  getToken(): Promise<PushRegistration>;

  /** 设置应用角标数。 */
  setBadge(count: number): Promise<void>;

  /** 设置别名（用户标识，用于定向推送）。 */
  setAlias(alias: string): Promise<void>;

  /** 删除别名。 */
  deleteAlias(): Promise<void>;

  /** 设置标签（分组推送）。 */
  setTags(tags: string[]): Promise<void>;

  /** 停止推送（注销）。 */
  stopPush(): Promise<void>;

  /** 恢复推送。 */
  resumePush(): Promise<void>;

  /** 释放原生资源 / 取消监听。登出时调用。 */
  destroy(): void;
}
```

### 2.2 配置类型

```typescript
interface PushInitOptions {
  /** 推送平台 appKey（极光控制台获取） */
  appKey: string;
  /** 推送平台 masterSecret 或 appSecret（服务端校验用，客户端可不传） */
  secret?: string;
  /** 生产环境（true）还是开发环境（false）。默认 true */
  production?: boolean;
}

interface PushRegistration {
  /** 推送平台下发的设备 token / registrationId */
  token: string;
  /** 实际命中的通道：'apns' | 'fcm' | 'xiaomi' | 'huawei' | 'pushkit' | … */
  channel: string;
}

interface PushMessage {
  messageId: string;
  title?: string;
  body?: string;
  /** 业务自定义透传字段（极光 extras / APNs custom payload） */
  data?: Record<string, string>;
}
```

---

## 3. 事件总线

### 3.1 事件列表

| 事件名 | Payload | 触发时机 |
|--------|---------|----------|
| `push:message` | `PushMessage` | 前台收到推送通知 |
| `push:opened` | `PushMessage` | 用户点击通知打开 App（含冷启动） |
| `push:token` | `PushRegistration` | 设备注册成功，获取到 token |

### 3.2 订阅示例

```typescript
import { eventBus } from '@itc/base';

// 前台收到通知
eventBus.on('push:message', (msg) => {
  console.log('收到推送:', msg.title, msg.body);
});

// 点击通知打开 App
eventBus.on('push:opened', (msg) => {
  console.log('点击通知:', msg.messageId);
  // 根据 msg.data 导航到对应页面
  if (msg.data?.type === 'chat') {
    // navigateToChat(msg.data.conversationId);
  }
});

// 获取设备 token
eventBus.on('push:token', (reg) => {
  console.log('Token:', reg.token, 'Channel:', reg.channel);
  // 上报 token 到服务器
});
```

---

## 4. 推送代理

### 4.1 全局 push 对象

```typescript
export const push: PushProvider = {
  init: (options) => _provider.init(options),
  getToken: () => _provider.getToken(),
  setBadge: (count) => _provider.setBadge(count),
  setAlias: (alias) => _provider.setAlias(alias),
  deleteAlias: () => _provider.deleteAlias(),
  setTags: (tags) => _provider.setTags(tags),
  stopPush: () => _provider.stopPush(),
  resumePush: () => _provider.resumePush(),
  destroy: () => _provider.destroy(),
};
```

### 4.2 后端注入

```typescript
/**
 * 覆盖默认推送后端。用于测试或未来切换推送方案。
 * 必须在 App 启动早期（AppRegistry.registerComponent 之前）调用。
 */
export function installPush(provider: PushProvider): void;
```

**示例：切换到自研推送服务**

```typescript
import { installPush } from '@itc/push';
import { MyPushProvider } from './MyPushProvider';

// 必须在 AppRegistry.registerComponent 之前调用
installPush(new MyPushProvider());
```

---

## 5. 默认实现（极光 JPush）

### 5.1 实现类

```typescript
class ItcJpush implements PushProvider {
  private _initialized = false;

  async init(options: PushInitOptions): Promise<void>;
  async getToken(): Promise<PushRegistration>;
  async setBadge(count: number): Promise<void>;
  async setAlias(alias: string): Promise<void>;
  async deleteAlias(): Promise<void>;
  async setTags(tags: string[]): Promise<void>;
  async stopPush(): Promise<void>;
  async resumePush(): Promise<void>;
  destroy(): void;

  private detectChannel(): string;
  private normalizeMessage(raw: Record<string, unknown>): PushMessage;
}
```

### 5.2 通道检测

```typescript
private detectChannel(): string {
  if (currentPlatform === 'ios') return 'apns';
  if (currentPlatform === 'harmony') return 'pushkit';
  return 'fcm'; // Android 默认 FCM，极光自动适配厂商通道
}
```

### 5.3 消息归一化

```typescript
private normalizeMessage(raw: Record<string, unknown>): PushMessage {
  return {
    messageId: String(raw.messageID ?? raw._j_msgid ?? ''),
    title: String(raw.title ?? ''),
    body: String(raw.alertContent ?? raw.content ?? ''),
    data: (raw.extras as Record<string, string>) ?? {},
  };
}
```

---

## 6. Noop 实现

测试或未接入推送时使用，不抛错、静默通过：

```typescript
class NoopPushProvider implements PushProvider {
  init() { return Promise.resolve(); }
  getToken() { return Promise.resolve({ token: '', channel: 'none' }); }
  setBadge() { return Promise.resolve(); }
  setAlias() { return Promise.resolve(); }
  deleteAlias() { return Promise.resolve(); }
  setTags() { return Promise.resolve(); }
  stopPush() { return Promise.resolve(); }
  resumePush() { return Promise.resolve(); }
  destroy() {}
}
```

---

## 7. 平台差异

| 平台 | 推送通道 | 说明 |
|------|----------|------|
| Android | FCM + 厂商通道 | 极光自动适配小米/华为/OPPO/VIVO |
| iOS | APNs | 极光代理 |
| 鸿蒙 NEXT | Push Kit | 通过 `@react-native-ohos/jpush-react-native` |

**鸿蒙说明：**
- JPush 官方已将鸿蒙列为支持平台
- Metro 通过 `.harmony.ts` 后缀自动切换到鸿蒙适配包
- 通道检测返回 `'pushkit'`

---

## 8. 依赖关系

**dependencies：**
- `jcore-react-native@^1.9.0`
- `jpush-react-native@^3.1.0`

**peerDependencies：**
- `@itc/base`：依赖 `eventBus`、`logger`、`currentPlatform`
- `react`：`*`
- `react-native`：>= 0.77.0

**内部依赖：**
- `@itc/base`（workspace）

---

## 9. 使用示例

### 9.1 初始化推送

```typescript
import { push } from '@itc/push';
import { eventBus } from '@itc/base';

// 初始化
await push.init({
  appKey: 'your-app-key',
  production: true, // 生产环境
});

// 监听 token 获取
eventBus.on('push:token', async (reg) => {
  // 上报 token 到服务端
  await api.registerPushToken(reg.token, reg.channel);
});
```

### 9.2 用户登录后设置别名

```typescript
import { push } from '@itc/push';

async function onLogin(userId: string) {
  // 设置别名（用户标识）
  await push.setAlias(userId);
  
  // 设置标签（分组）
  await push.setTags(['active', 'vip']);
}
```

### 9.3 处理通知点击

```typescript
import { eventBus } from '@itc/base';

eventBus.on('push:opened', (msg) => {
  // 根据 data 字段导航到对应页面
  const { type, id } = msg.data ?? {};
  
  switch (type) {
    case 'chat':
      navigation.navigate('Chat', { conversationId: id });
      break;
    case 'order':
      navigation.navigate('OrderDetail', { orderId: id });
      break;
    default:
      navigation.navigate('Home');
  }
});
```

### 9.4 登出时清理

```typescript
import { push } from '@itc/push';

async function onLogout() {
  // 移除别名
  await push.deleteAlias();
  
  // 释放资源
  push.destroy();
}
```

---

## 10. 导出清单

```typescript
// 推送代理
export const push: PushProvider;

// 后端注入
export function installPush(provider: PushProvider): void;

// 类型
export type { PushProvider, PushInitOptions, PushRegistration, PushMessage };
```

---

## 11. 注意事项

1. **注入时机**：`installPush()` 必须在 `AppRegistry.registerComponent` 之前调用
2. **幂等 init**：`push.init()` 可重复调用，不会重复初始化
3. **destroy 时机**：登出时调用，清理事件监听
4. **token 上报**：首次获取 token 后应立即上报服务器
5. **极光 extras**：`push:message` / `push:opened` 的 `data` 字段对应极光推送的 `extras`
