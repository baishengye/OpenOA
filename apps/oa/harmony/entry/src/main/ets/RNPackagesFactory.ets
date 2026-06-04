import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
// storage / biometric 均走自包含 .har 库（方式B）：ArkTS Package 从二进制库导入，
// 各自的 C++ 桥也在库内（见库的 src/main/cpp）。app 不再内嵌任何模块副本。
import { ItcStoragePackage } from '@itc/storage';
import { ItcBiometricPackage } from '@itc/biometric';
// 第三方库 op-sqlite 的 ArkTS Package。
import { RNOpSqlitePackage } from '@react-native-ohos/op-sqlite/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new ItcBiometricPackage(ctx),
    new ItcStoragePackage(ctx),
    new RNOpSqlitePackage(ctx),
  ];
}
