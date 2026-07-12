import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
// OpenIM SDK
import { ItcOpenIMPackage } from '@itc/openim';
// biometric 走自包含 .har 库（方式B）：ArkTS Package 从二进制库导入，C++ 桥也在库内。
import { ItcBiometricPackage } from '@itc/biometric';
// 第三方库 op-sqlite 的 ArkTS Package。
import { RNOpSqlitePackage } from '@react-native-ohos/op-sqlite/ts';
// storage 改用 MMKV（RNOH 移植包），原 @itc/storage 自包含 TurboModule 已废弃。
import { RNMMKVStoragePackage } from '@react-native-oh-tpl/react-native-mmkv-storage';
// 热修复 OTA（CodePush 鸿蒙移植包，支持 autolink）。
import { CodePushPackage } from '@react-native-ohos/react-native-code-push/ts';
// safe-area-context 鸿蒙移植包（@react-native-ohos 5.6.3，RNOH 0.82）；取代旧 stub 降级。
import { SafeAreaViewPackage } from '@react-native-ohos/react-native-safe-area-context/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new ItcOpenIMPackage(ctx),
    new ItcBiometricPackage(ctx),
    new RNMMKVStoragePackage(ctx),
    new RNOpSqlitePackage(ctx),
    new CodePushPackage(ctx),
    new SafeAreaViewPackage(ctx),
  ];
}
