import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
import { ItcBiometricPackage } from './biometric/BiometricPackage';
import { ItcStoragePackage } from './storage/StoragePackage';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new ItcBiometricPackage(ctx),
    new ItcStoragePackage(ctx),
  ];
}
