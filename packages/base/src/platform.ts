/**
 * 平台抽象。在 RN `Platform` 之上扩展鸿蒙判定，给上层提供统一的三端分支入口。
 *
 * RNOH 运行时会把 `Platform.OS` 报告为 `'harmony'`，因此鸿蒙判定无需原生代码。
 */
import { Platform } from 'react-native';

export type ItcPlatform = 'android' | 'ios' | 'harmony';

/** 当前运行平台。非三端（web/windows 等）一律回退到 android 分支语义并打日志由上层处理。 */
export const currentPlatform: ItcPlatform = ((): ItcPlatform => {
  switch (Platform.OS) {
    case 'ios':
      return 'ios';
    case 'harmony' as string:
      return 'harmony';
    default:
      return 'android';
  }
})();

export const isAndroid = currentPlatform === 'android';
export const isIOS = currentPlatform === 'ios';
export const isHarmony = currentPlatform === 'harmony';

/**
 * 三端分支选择器：按当前平台取值，缺省回退顺序 harmony→android。
 *
 * @example
 *   const channel = select({ android: 'umeng', ios: 'apns', harmony: 'pushkit' });
 */
export function select<T>(branches: {
  android: T;
  ios: T;
  harmony: T;
}): T {
  return branches[currentPlatform];
}
