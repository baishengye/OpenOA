/**
 * HarmonyOS 平台适配层
 * 处理 @react-native-ohos/react-native-skia 与 @shopify/react-native-skia 之间的差异
 *
 * 主要差异点:
 * 1. 运行时加载: HarmonyOS 需要使用 @react-native-ohos/react-native-skia
 * 2. API 层面两版本基本兼容，import 路径保持一致
 */

import { Platform } from 'react-native';

/**
 * 当前是否为 HarmonyOS 平台
 */
export function isHarmonyOS(): boolean {
  return (Platform.OS as string) === 'harmony';
}

/**
 * 当前平台是否支持 Skia
 * HarmonyOS 需要额外检查 @react-native-ohos/react-native-skia 是否正确安装
 */
export function isSkiaSupported(): boolean {
  if (isHarmonyOS()) {
    try {
      // 在 HarmonyOS 环境下检查 Skia 模块存在性
      require('@react-native-ohos/react-native-skia');
      return true;
    } catch {
      return false;
    }
  }
  // Android/iOS 默认支持
  return true;
}

/**
 * 获取当前平台的 Skia 模块
 * @returns Skia 模块（平台自动切换）
 * @throws 当 HarmonyOS 模块未安装时抛出错误
 */
export function getSkiaImplementation(): any {
  if (isHarmonyOS()) {
    try {
      // HarmonyOS 使用 React Native OH 版本
      return require('@react-native-ohos/react-native-skia');
    } catch {
      throw new Error(
        '@react-native-ohos/react-native-skia is not installed. ' +
        'Please install it for HarmonyOS support: npm install @react-native-ohos/react-native-skia'
      );
    }
  }
  // Android/iOS 使用官方版本
  return require('@shopify/react-native-skia');
}
