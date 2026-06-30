/**
 * @itc/push —— 推送模块统一对外 API。
 *
 * 业务层只 import 本文件。内部默认使用极光（jpush-react-native），通过 PushProvider
 * 接口隔离——日后切换友盟/个推/自建只需实现 PushProvider 并改一行 installPush()。
 *
 * 事件：
 *  - push:message  前台收到推送通知
 *  - push:opened   用户点击通知打开 App（含冷启动点击）
 *  - push:token    设备注册成功，返回 PushRegistration
 *
 * 三端：
 *  - Android：极光 + 厂商通道（小米/华为/OPPO/VIVO）
 *  - iOS：APNs（极光代理）
 *  - 鸿蒙 NEXT：华为 Push Kit（通过 @react-native-ohos 移植包）
 */

// 内部实现（不对外导出）。切换推送方案时只需替换这一行 + 下方 installPush。
import { jpushProvider } from './ItcJpush';
import type { PushProvider, PushInitOptions, PushRegistration, PushMessage } from './types';

export type { PushProvider, PushInitOptions, PushRegistration, PushMessage };

// ── Noop 实现（兜底 / 测试用）────────────────────────────────────────────────

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

// ── 注册 + 代理 ───────────────────────────────────────────────────────────────

let _provider: PushProvider = new NoopPushProvider();

/**
 * 覆盖默认推送后端。用于测试或未来切换推送方案。
 * 必须在 App 启动早期（AppRegistry.registerComponent 之前）调用。
 *
 * @example
 * // 切换到自研推送服务
 * import { MyPushProvider } from './MyPush';
 * installPush(new MyPushProvider());
 */
export function installPush(provider: PushProvider): void {
  _provider = provider;
}

/** 全局推送代理，委托给当前已注册的 provider。业务层只使用这个对象。 */
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

// ── 自动注入默认实现 ───────────────────────────────────────────────────────────
// 三端统一接入极光；鸿蒙的原生差异由 RNOH metro.config.harmony.js 自动重定向
// jpush-react-native → @react-native-ohos/jpush-react-native，对外透明。
installPush(jpushProvider);

