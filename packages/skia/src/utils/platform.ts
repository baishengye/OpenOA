/**
 * 平台检测工具
 * 用于检测当前运行环境是否为 HarmonyOS 平台
 */

import { Platform } from 'react-native';

/**
 * 判断当前是否为 HarmonyOS 平台
 */
export function isHarmonyOS(): boolean {
  return (Platform.OS as string) === 'harmony';
}

/**
 * 判断当前平台是否支持 Skia
 * HarmonyOS 需要额外检查 @react-native-ohos/react-native-skia 是否正确安装
 */
export function isSkiaSupported(): boolean {
  if (isHarmonyOS()) {
    try {
      // 在 HarmonyOS 环境下检查 Skia 模块存在性
      import('@react-native-ohos/react-native-skia');
      return true;
    } catch {
      return false;
    }
  }
  // Android/iOS 默认支持
  return true;
}

/**
 * 获取 Skia 模块的运行时加载
 * 注意：在构建时总是导入 @shopify/react-native-skia，运行时通过平台自动切换
 * HarmonyOS 会在运行时通过 Metro 自动切换到 @react-native-ohos/react-native-skia
 */
export function getSkiaImplementation(): any {
  if (isHarmonyOS()) {
    try {
      // HarmonyOS 使用 React Native OH 版本
      return require('@react-native-ohos/react-native-skia');
    } catch {
      throw new Error(
        '@react-native-ohos/react-native-skia is not installed. ' +
        'Please install it for HarmonyOS support.'
      );
    }
  }
  // Android/iOS 使用官方版本
  return require('@shopify/react-native-skia');
}
