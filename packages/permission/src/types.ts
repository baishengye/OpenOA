/**
 * @itc/permission 类型定义
 * 权限状态直接使用库的字符串类型
 */

// ── 权限状态（与两端的库一致）────────────────────────────────────────────────

/**
 * 统一权限状态
 * react-native-permissions 和 @react-native-ohos/react-native-permissions 使用相同的字符串值：
 * 'unavailable' | 'denied' | 'blocked' | 'granted' | 'limited'
 */
export type UnifiedPermissionStatus =
  | 'unavailable'
  | 'denied'
  | 'blocked'
  | 'granted'
  | 'limited';

export type PermissionStatus = UnifiedPermissionStatus;

/**
 * iOS 位置精确度
 * @platform iOS 14+
 */
export type LocationAccuracy = 'full' | 'reduced';

/**
 * iOS 位置精确度请求选项
 * @platform iOS 14+
 */
export interface LocationAccuracyOptions {
  purposeKey: string;
}

// ── 通知设置（两端通用）──────────────────────────────────────────────────────

export interface NotificationSettings {
  alert?: boolean;
  badge?: boolean;
  sound?: boolean;
  carPlay?: boolean;
  criticalAlert?: boolean;
  provisional?: boolean;
  providesAppSettings?: boolean;
  lockScreen?: boolean;
  notificationCenter?: boolean;
}

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

  // ── Android 专用方法 ───────────────────────────────────────────────────────

  /**
   * 检查是否可以设置精确闹钟
   * @platform Android 12+
   */
  canScheduleExactAlarms?(): Promise<boolean>;

  // ── iOS 专用方法 ─────────────────────────────────────────────────────────

  /**
   * 检查位置精确度
   * @platform iOS 14+
   */
  checkLocationAccuracy?(): Promise<LocationAccuracy>;

  /**
   * 请求位置精确度
   * @platform iOS 14+
   */
  requestLocationAccuracy?(options?: {
    purposeKey?: string;
  }): Promise<LocationAccuracy>;

  /**
   * 打开联系人选择器
   * @platform iOS 18+
   */
  openContactPicker?(): Promise<boolean>;

  /**
   * 打开照片选择器
   * @platform iOS 14+
   */
  openPhotoPicker?(): Promise<boolean>;
}
