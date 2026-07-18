/**
 * @itc/permission Android/iOS 实现
 * 使用 react-native-permissions
 */

import { Platform } from 'react-native';
import { logger } from '@itc/base';
import type {
  LocationAccuracy,
  PermissionProvider,
  UnifiedPermissionStatus,
} from '../types';

// 静态导入权限库
import RNP from 'react-native-permissions';

const TAG = 'permission';

// ── 平台权限前缀 ──────────────────────────────────────────────────────────────

const IOS_PERMISSION_PREFIX = 'ios.permission.';
const ANDROID_PERMISSION_PREFIX = 'android.permission.';

// ── 平台校验 ──────────────────────────────────────────────────────────────────

function isValidPlatformPermission(permission: string): boolean {
  if (Platform.OS === 'ios') {
    return permission.startsWith(IOS_PERMISSION_PREFIX);
  } else if (Platform.OS === 'android') {
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
      const status = await RNP.check(permission as Parameters<typeof RNP.check>[0]);
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
      const status = await RNP.request(permission as Parameters<typeof RNP.request>[0]);
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
    return RNP.openSettings();
  }

  async checkNotifications(): Promise<{
    status: UnifiedPermissionStatus;
    settings: Record<string, boolean>;
  }> {
    try {
      if (!RNP.checkNotifications) {
        return { status: 'unavailable', settings: {} };
      }
      const result = await RNP.checkNotifications();
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
      if (!RNP.requestNotifications) {
        return { status: 'unavailable', settings: {} };
      }

      const notificationOptions: string[] = [];
      if (options?.alert) notificationOptions.push('alert');
      if (options?.sound) notificationOptions.push('sound');
      if (options?.badge) notificationOptions.push('badge');

      const result = await RNP.requestNotifications(
        notificationOptions as Parameters<typeof RNP.requestNotifications>[0],
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

  // ── Android 专用方法 ───────────────────────────────────────────────────────

  async canScheduleExactAlarms(): Promise<boolean> {
    try {
      if (typeof RNP.canScheduleExactAlarms !== 'function') {
        logger.warn(TAG, 'canScheduleExactAlarms not supported on this platform');
        return false;
      }
      return await RNP.canScheduleExactAlarms();
    } catch (error) {
      logger.warn(TAG, 'canScheduleExactAlarms failed', error);
      return false;
    }
  }

  // ── iOS 专用方法 ─────────────────────────────────────────────────────────

  async checkLocationAccuracy(): Promise<LocationAccuracy> {
    try {
      if (typeof RNP.checkLocationAccuracy !== 'function') {
        logger.warn(TAG, 'checkLocationAccuracy not supported on this platform');
        return 'reduced';
      }
      return await RNP.checkLocationAccuracy();
    } catch (error) {
      logger.warn(TAG, 'checkLocationAccuracy failed', error);
      return 'reduced';
    }
  }

  async requestLocationAccuracy(options?: {
    purposeKey?: string;
  }): Promise<LocationAccuracy> {
    try {
      if (typeof RNP.requestLocationAccuracy !== 'function') {
        logger.warn(TAG, 'requestLocationAccuracy not supported on this platform');
        return 'reduced';
      }
      const purposeKey = options?.purposeKey ?? '';
      return await RNP.requestLocationAccuracy({ purposeKey } as Parameters<typeof RNP.requestLocationAccuracy>[0]);
    } catch (error) {
      logger.warn(TAG, 'requestLocationAccuracy failed', error);
      return 'reduced';
    }
  }

  async openContactPicker(): Promise<boolean> {
    try {
      if (typeof RNP.openContactPicker !== 'function') {
        logger.warn(TAG, 'openContactPicker not supported on this platform');
        return false;
      }
      await RNP.openContactPicker();
      return true;
    } catch (error) {
      logger.warn(TAG, 'openContactPicker failed', error);
      return false;
    }
  }

  async openPhotoPicker(): Promise<boolean> {
    try {
      if (typeof RNP.openPhotoPicker !== 'function') {
        logger.warn(TAG, 'openPhotoPicker not supported on this platform');
        return false;
      }
      await RNP.openPhotoPicker();
      return true;
    } catch (error) {
      logger.warn(TAG, 'openPhotoPicker failed', error);
      return false;
    }
  }
}
