/**
 * @itc/permission 类型定义
 * 权限状态直接使用库的字符串类型
 */

import type {
  NotificationSettings,
} from '@react-native-ohos/react-native-permissions';

// ── 权限状态（与 @react-native-ohos/react-native-permissions 一致）────────────

export type PermissionStatus =
  | 'unavailable'  // 设备不支持该功能
  | 'denied'       // 权限被拒绝（可再次请求）
  | 'blocked'      // 权限被永久拒绝（需跳转设置）
  | 'granted'      // 权限已授权
  | 'limited';     // 权限受限授权（如 iOS 照片有限访问）

export { NotificationSettings };

// ── 通知权限 ──────────────────────────────────────────────────────────────────

export interface NotificationPermissionResult {
  status: PermissionStatus;
  settings: NotificationSettings;
}

export interface NotificationOptions {
  sound?: boolean;
  alert?: boolean;
  badge?: boolean;
  carPlay?: boolean;
  criticalAlert?: boolean;
  provisional?: boolean;
}

// ── PermissionProvider 接口 ───────────────────────────────────────────────────

export interface PermissionProvider {
  /** 检查单个权限状态 */
  check(permission: string): Promise<PermissionStatus>;

  /** 检查多个权限状态 */
  checkMultiple(permissions: string[]): Promise<Record<string, PermissionStatus>>;

  /** 请求单个权限 */
  request(permission: string): Promise<PermissionStatus>;

  /** 请求多个权限 */
  requestMultiple(permissions: string[]): Promise<Record<string, PermissionStatus>>;

  /** 打开系统设置页面 */
  openSettings(): Promise<void>;

  /** 检查通知权限 */
  checkNotifications?(): Promise<NotificationPermissionResult>;

  /** 请求通知权限 */
  requestNotifications?(
    options?: NotificationOptions,
  ): Promise<NotificationPermissionResult>;
}
