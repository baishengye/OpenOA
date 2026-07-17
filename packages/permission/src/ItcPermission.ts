/**
 * @itc/permission 默认实现
 *
 * 跨平台权限管理，根据平台选择正确的库：
 * - HarmonyOS: 使用 @react-native-ohos/react-native-permissions
 * - iOS/Android/Windows: 使用 react-native-permissions
 */

import { Platform } from 'react-native';
import { logger } from '@itc/base';
import type { PermissionProvider } from './types';

const TAG = 'permission';

// ── 权限状态映射 ──────────────────────────────────────────────────────────────

/**
 * 统一权限状态
 * react-native-permissions 使用相同的字符串值：
 * 'unavailable' | 'denied' | 'blocked' | 'granted' | 'limited'
 */
export type UnifiedPermissionStatus =
  | 'unavailable'
  | 'denied'
  | 'blocked'
  | 'granted'
  | 'limited';

function toUnifiedStatus(status: string): UnifiedPermissionStatus {
  const validStatuses = ['unavailable', 'denied', 'blocked', 'granted', 'limited'];
  if (validStatuses.includes(status)) {
    return status as UnifiedPermissionStatus;
  }
  logger.warn(TAG, `Unknown permission status: ${status}, defaulting to 'denied'`);
  return 'denied';
}

// ── 平台判断 ──────────────────────────────────────────────────────────────────

const isHarmony = (Platform.OS as string) === 'harmony';

// ── 权限库接口 ────────────────────────────────────────────────────────────────

interface PermissionMethods {
  check(permission: string): Promise<string>;
  checkMultiple(permissions: string[]): Promise<Record<string, string>>;
  request(permission: string): Promise<string>;
  requestMultiple(permissions: string[]): Promise<Record<string, string>>;
  openSettings(): Promise<void>;
  checkNotifications?(): Promise<{ status: string; settings: Record<string, boolean> }>;
  requestNotifications?(
    options?: string[],
  ): Promise<{ status: string; settings: Record<string, boolean> }>;
}

// ── 库加载 ────────────────────────────────────────────────────────────────────

let lib: PermissionMethods | null = null;

async function getLib(): Promise<PermissionMethods> {
  if (lib) return lib;

  if (isHarmony) {
    // HarmonyOS: 使用 @react-native-ohos/react-native-permissions
    const harmonyLib = await import('@react-native-ohos/react-native-permissions');
    lib = {
      check: (p) => harmonyLib.check(p as any),
      checkMultiple: (ps) => harmonyLib.checkMultiple(ps as any),
      request: (p) => harmonyLib.request(p as any),
      requestMultiple: (ps) => harmonyLib.requestMultiple(ps as any),
      openSettings: () => harmonyLib.openSettings(),
      checkNotifications: () => harmonyLib.checkNotifications() as any,
      requestNotifications: (opts) => harmonyLib.requestNotifications(opts as any) as any,
    };
    logger.info(TAG, '使用 @react-native-ohos/react-native-permissions');
  } else {
    // iOS/Android/Windows: 使用 react-native-permissions
    const rnLib = await import('react-native-permissions');
    lib = {
      check: (p) => rnLib.check(p as any),
      checkMultiple: (ps) => rnLib.checkMultiple(ps as any),
      request: (p) => rnLib.request(p as any),
      requestMultiple: (ps) => rnLib.requestMultiple(ps as any),
      openSettings: () => rnLib.openSettings(),
      checkNotifications: () => rnLib.checkNotifications() as any,
      requestNotifications: (opts) => rnLib.requestNotifications(opts as any) as any,
    };
    logger.info(TAG, `使用 react-native-permissions (平台: ${Platform.OS})`);
  }

  return lib;
}

// ── PermissionProvider 实现 ───────────────────────────────────────────────────

export class ItcPermission implements PermissionProvider {
  async check(permission: string): Promise<UnifiedPermissionStatus> {
    try {
      const lib = await getLib();
      const status = await lib.check(permission);
      return toUnifiedStatus(status);
    } catch (error) {
      logger.warn(TAG, `check failed for ${permission}`, error);
      return 'denied';
    }
  }

  async checkMultiple(
    permissions: string[],
  ): Promise<Record<string, UnifiedPermissionStatus>> {
    try {
      const lib = await getLib();
      const result = await lib.checkMultiple(permissions);
      const unified: Record<string, UnifiedPermissionStatus> = {};
      for (const [key, value] of Object.entries(result)) {
        unified[key] = toUnifiedStatus(value);
      }
      return unified;
    } catch (error) {
      logger.warn(TAG, 'checkMultiple failed', error);
      return Object.fromEntries(
        permissions.map(p => [p, 'denied'] as [string, UnifiedPermissionStatus]),
      );
    }
  }

  async request(permission: string): Promise<UnifiedPermissionStatus> {
    try {
      const lib = await getLib();
      const status = await lib.request(permission);
      return toUnifiedStatus(status);
    } catch (error) {
      logger.warn(TAG, `request failed for ${permission}`, error);
      return 'denied';
    }
  }

  async requestMultiple(
    permissions: string[],
  ): Promise<Record<string, UnifiedPermissionStatus>> {
    try {
      const lib = await getLib();
      const result = await lib.requestMultiple(permissions);
      const unified: Record<string, UnifiedPermissionStatus> = {};
      for (const [key, value] of Object.entries(result)) {
        unified[key] = toUnifiedStatus(value);
      }
      return unified;
    } catch (error) {
      logger.warn(TAG, 'requestMultiple failed', error);
      return Object.fromEntries(
        permissions.map(p => [p, 'denied'] as [string, UnifiedPermissionStatus]),
      );
    }
  }

  async openSettings(): Promise<void> {
    const lib = await getLib();
    return lib.openSettings();
  }

  async checkNotifications(): Promise<{
    status: UnifiedPermissionStatus;
    settings: Record<string, boolean>;
  }> {
    try {
      const lib = await getLib();
      if (!lib.checkNotifications) {
        return { status: 'unavailable', settings: {} };
      }
      const result = await lib.checkNotifications();
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
      const lib = await getLib();
      if (!lib.requestNotifications) {
        return { status: 'unavailable', settings: {} };
      }

      const notificationOptions: string[] = [];
      if (options?.alert) notificationOptions.push('alert');
      if (options?.sound) notificationOptions.push('sound');
      if (options?.badge) notificationOptions.push('badge');

      const result = await lib.requestNotifications(notificationOptions);
      return {
        status: toUnifiedStatus(result.status),
        settings: result.settings,
      };
    } catch (error) {
      logger.warn(TAG, 'requestNotifications failed', error);
      return { status: 'denied', settings: {} };
    }
  }
}
