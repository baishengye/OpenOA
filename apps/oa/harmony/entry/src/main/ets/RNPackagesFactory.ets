import type { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
import { ItcBiometricPackage } from './biometric/BiometricPackage';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new ItcBiometricPackage(ctx),
  ];
}
