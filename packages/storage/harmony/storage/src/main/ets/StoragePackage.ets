import { RNPackage } from '@rnoh/react-native-openharmony/ts';
import type { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { ItcStorageTurboModule } from './StorageTurboModule';

/** RNOH 0.82：用 getUITurboModuleFactoryByNameMap 注册 ArkTS TurboModule。 */
export class ItcStoragePackage extends RNPackage {
  override getUITurboModuleFactoryByNameMap(): Map<
    string,
    (ctx: UITurboModuleContext) => UITurboModule | null
  > {
    return new Map<string, (ctx: UITurboModuleContext) => UITurboModule | null>()
      .set(ItcStorageTurboModule.NAME, (ctx) => new ItcStorageTurboModule(ctx));
  }
}
