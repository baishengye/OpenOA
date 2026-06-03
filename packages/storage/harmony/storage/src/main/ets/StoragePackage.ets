import { RNPackage, TurboModulesFactory } from '@rnoh/react-native-openharmony/ts';
import type { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { ItcStorageTurboModule } from './StorageTurboModule';

class ItcStorageTurboModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === ItcStorageTurboModule.NAME) {
      return new ItcStorageTurboModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === ItcStorageTurboModule.NAME;
  }
}

export class ItcStoragePackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new ItcStorageTurboModulesFactory(ctx);
  }
}
