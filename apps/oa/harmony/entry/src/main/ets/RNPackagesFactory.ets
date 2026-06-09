import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
// biometric 走自包含 .har 库（方式B）：ArkTS Package 从二进制库导入，C++ 桥也在库内。
import { ItcBiometricPackage } from '@itc/biometric';
// 第三方库 op-sqlite 的 ArkTS Package。
import { RNOpSqlitePackage } from '@react-native-ohos/op-sqlite/ts';
// storage 改用 MMKV（RNOH 移植包），原 @itc/storage 自包含 TurboModule 已废弃。
import { RNMMKVStoragePackage } from '@react-native-oh-tpl/react-native-mmkv-storage';
// 热修复 OTA（CodePush 鸿蒙移植包）。
import { CodePushPackage } from '@react-native-oh-tpl/react-native-code-push/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new ItcBiometricPackage(ctx),
    new RNMMKVStoragePackage(ctx),
    new RNOpSqlitePackage(ctx),
    new CodePushPackage(ctx),
  ];
}
