import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
import { ItcBiometricPackage } from './biometric/BiometricPackage';
// storage 走 .har 方式接入（方式 B 样例）：源在 packages/storage/harmony，
// 由 hvigorw assembleHar 打成 storage.har，entry 依赖二进制、无源码内嵌。
import { ItcStoragePackage } from '@itc/storage';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new ItcBiometricPackage(ctx),
    new ItcStoragePackage(ctx),
  ];
}
