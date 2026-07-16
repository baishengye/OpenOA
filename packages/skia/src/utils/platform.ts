/**
 * 平台检测工具
 */
import { Platform } from 'react-native';

export function isHarmonyOS(): boolean {
  return (Platform.OS as string) === 'harmony';
}

export function isSkiaSupported(): boolean {
  if (isHarmonyOS()) {
    return false;
  }
  return true;
}

export function getSkiaImplementation(): 'shopify' | 'ohos' | 'none' {
  if (isHarmonyOS()) {
    return 'ohos';
  }
  return 'shopify';
}
