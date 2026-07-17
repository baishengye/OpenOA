/**
 * @itc/permission 入口文件
 * 跨平台统一权限 API
 *
 * 使用方式：
 * ```typescript
 * import { permission, ITC_PERMISSIONS, ITC_RESULTS } from '@itc/permission';
 *
 * // HarmonyOS
 * const status = await permission.check(ITC_PERMISSIONS.HARMONY.CAMERA);
 *
 * // 请求权限
 * const result = await permission.request(ITC_PERMISSIONS.HARMONY.CAMERA);
 *
 * // 检查状态
 * if (result === ITC_RESULTS.GRANTED) {
 *   // 权限已授权
 * }
 * ```
 */

import type {
  PermissionProvider,
  PermissionStatus,
  NotificationPermissionResult,
  NotificationOptions,
} from './types';
import { ITC_PERMISSIONS, ITC_RESULTS } from './permissions';
import { ItcPermission } from './ItcPermission';

// ── 导出类型 ─────────────────────────────────────────────────────────────────

export type {
  PermissionProvider,
  PermissionStatus,
  NotificationPermissionResult,
  NotificationOptions,
};

// ── 导出 ITC 前缀的权限常量 ─────────────────────────────────────────────────

export { ITC_PERMISSIONS, ITC_RESULTS };

// ── 导出单独权限常量（便于按需导入）────────────────────────────────────────

export * from './permissions';

// ── 注册 + 代理 ───────────────────────────────────────────────────────────────

let _provider: PermissionProvider = new ItcPermission();

/**
 * 覆盖默认权限后端。通常无需调用；供测试或未来切换权限方案时使用。
 */
export function installPermission(provider: PermissionProvider): void {
  _provider = provider;
}

/** 全局权限代理，委托给当前已注册的 provider。 */
export const permission: PermissionProvider = {
  check: (permissionId: string) => _provider.check(permissionId),
  checkMultiple: (permissions: string[]) =>
    _provider.checkMultiple(permissions),
  request: (permissionId: string) => _provider.request(permissionId),
  requestMultiple: (permissions: string[]) =>
    _provider.requestMultiple(permissions),
  openSettings: () => _provider.openSettings(),
  checkNotifications: () => {
    if (!_provider.checkNotifications) {
      return Promise.resolve<NotificationPermissionResult>({
        status: 'unavailable',
        settings: {},
      });
    }
    return _provider.checkNotifications();
  },
  requestNotifications: (options?: NotificationOptions) => {
    if (!_provider.requestNotifications) {
      return Promise.resolve<NotificationPermissionResult>({
        status: 'unavailable',
        settings: {},
      });
    }
    return _provider.requestNotifications(options);
  },
};
