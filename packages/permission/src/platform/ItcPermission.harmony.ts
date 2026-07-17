/**
 * @itc/permission HarmonyOS 实现
 * 使用 @react-native-ohos/react-native-permissions
 */

import { Platform } from 'react-native';
import { logger } from '@itc/base';
import type {
  LocationAccuracy,
  PermissionProvider,
  UnifiedPermissionStatus,
} from '../types';

// 静态导入鸿蒙权限库
import HarmonyPermissions from '@react-native-ohos/react-native-permissions';

const TAG = 'permission';

// ── 平台权限前缀 ──────────────────────────────────────────────────────────────

const HARMONY_PERMISSION_PREFIX = 'ohos.permission.';
const IOS_PERMISSION_PREFIX = 'ios.permission.';
const ANDROID_PERMISSION_PREFIX = 'android.permission.';

// ── 平台校验 ──────────────────────────────────────────────────────────────────

function isValidPlatformPermission(permission: string): boolean {
  const platform = Platform.OS as string;
  if (platform === 'harmony') {
    return permission.startsWith(HARMONY_PERMISSION_PREFIX);
  } else if (platform === 'ios') {
    return permission.startsWith(IOS_PERMISSION_PREFIX);
  } else if (platform === 'android') {
    return permission.startsWith(ANDROID_PERMISSION_PREFIX);
  }
  return true;
}

// ── 权限状态映射 ──────────────────────────────────────────────────────────────

function toUnifiedStatus(status: string): UnifiedPermissionStatus {
  const validStatuses = ['unavailable', 'denied', 'blocked', 'granted', 'limited'];
  if (validStatuses.includes(status)) {
    return status as UnifiedPermissionStatus;
  }
  logger.warn(TAG, `Unknown permission status: ${status}, defaulting to 'denied'`);
  return 'denied';
}

// ── PermissionProvider 实现 ───────────────────────────────────────────────────

export class ItcPermission implements PermissionProvider {
  async check(permission: string): Promise<UnifiedPermissionStatus> {
    if (!isValidPlatformPermission(permission)) {
      logger.warn(TAG, `Permission ${permission} is not valid for platform ${Platform.OS}, returning 'unavailable'`);
      return 'unavailable';
    }
    try {
      const status = await HarmonyPermissions.check(
        permission as Parameters<typeof HarmonyPermissions.check>[0],
      );
      return toUnifiedStatus(status);
    } catch (error) {
      logger.warn(TAG, `check failed for ${permission}`, error);
      return 'denied';
    }
  }

  async checkMultiple(
    permissions: string[],
  ): Promise<Record<string, UnifiedPermissionStatus>> {
    const unified: Record<string, UnifiedPermissionStatus> = {};
    for (const permission of permissions) {
      unified[permission] = await this.check(permission);
    }
    return unified;
  }

  async request(permission: string): Promise<UnifiedPermissionStatus> {
    if (!isValidPlatformPermission(permission)) {
      logger.warn(TAG, `Permission ${permission} is not valid for platform ${Platform.OS}, returning 'unavailable'`);
      return 'unavailable';
    }
    try {
      const status = await HarmonyPermissions.request(
        permission as Parameters<typeof HarmonyPermissions.request>[0],
      );
      return toUnifiedStatus(status);
    } catch (error) {
      logger.warn(TAG, `request failed for ${permission}`, error);
      return 'denied';
    }
  }

  async requestMultiple(
    permissions: string[],
  ): Promise<Record<string, UnifiedPermissionStatus>> {
    const unified: Record<string, UnifiedPermissionStatus> = {};
    for (const permission of permissions) {
      unified[permission] = await this.request(permission);
    }
    return unified;
  }

  async openSettings(): Promise<void> {
    return HarmonyPermissions.openSettings();
  }

  async checkNotifications(): Promise<{
    status: UnifiedPermissionStatus;
    settings: Record<string, boolean>;
  }> {
    try {
      if (!HarmonyPermissions.checkNotifications) {
        return { status: 'unavailable', settings: {} };
      }
      const result = await HarmonyPermissions.checkNotifications();
      return {
        status: toUnifiedStatus(result.status),
        settings: result.settings,
      };
    } catch (error) {
      logger.warn(TAG, 'checkNotifications failed', error);
      return { status: 'denied', settings: {} };
    }
  }

  async requestNotifications(
    options?: { alert?: boolean; sound?: boolean; badge?: boolean },
  ): Promise<{ status: UnifiedPermissionStatus; settings: Record<string, boolean> }> {
    try {
      if (!HarmonyPermissions.requestNotifications) {
        return { status: 'unavailable', settings: {} };
      }

      const notificationOptions: string[] = [];
      if (options?.alert) notificationOptions.push('alert');
      if (options?.sound) notificationOptions.push('sound');
      if (options?.badge) notificationOptions.push('badge');

      const result = await HarmonyPermissions.requestNotifications(
        notificationOptions as Parameters<typeof HarmonyPermissions.requestNotifications>[0],
      );
      return {
        status: toUnifiedStatus(result.status),
        settings: result.settings,
      };
    } catch (error) {
      logger.warn(TAG, 'requestNotifications failed', error);
      return { status: 'denied', settings: {} };
    }
  }

  // ── 平台兼容方法 ─────────────────────────────────────────────────────────

  async canScheduleExactAlarms(): Promise<boolean> {
    logger.warn(TAG, 'canScheduleExactAlarms not supported on HarmonyOS');
    return false;
  }

  // ── HarmonyOS 专用方法 ───────────────────────────────────────────────────

  async checkLocationAccuracy(): Promise<LocationAccuracy> {
    logger.warn(TAG, 'checkLocationAccuracy is not applicable on HarmonyOS');
    return 'reduced';
  }

  async requestLocationAccuracy(): Promise<LocationAccuracy> {
    logger.warn(TAG, 'requestLocationAccuracy is not applicable on HarmonyOS');
    return 'reduced';
  }

  async openContactPicker(): Promise<boolean> {
    logger.warn(TAG, 'openContactPicker not supported on HarmonyOS');
    return false;
  }

  async openPhotoPicker(): Promise<boolean> {
    logger.warn(TAG, 'openPhotoPicker not supported on HarmonyOS');
    return false;
  }
}
