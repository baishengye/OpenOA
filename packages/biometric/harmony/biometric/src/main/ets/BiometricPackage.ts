import {
  RNPackage,
  TurboModulesFactory,
} from '@rnoh/react-native-openharmony/ts';
import type {
  TurboModule,
  TurboModuleContext,
} from '@rnoh/react-native-openharmony/ts';
import { ItcBiometricTurboModule } from './BiometricTurboModule';

class ItcBiometricTurboModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === ItcBiometricTurboModule.NAME) {
      return new ItcBiometricTurboModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === ItcBiometricTurboModule.NAME;
  }
}

/** RNOH 包入口。宿主 harmony 工程在 RNPackagesFactory 中注册它。 */
export class ItcBiometricPackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new ItcBiometricTurboModulesFactory(ctx);
  }
}
