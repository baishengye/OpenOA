import type { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { ItcOpenIMTurboModule } from './ItcOpenIMTurboModule';
import { RNOHPackage } from '@rnoh/react-native-openharmony';

/**
 * RNOH 包入口。RNOH 0.82 用 getUITurboModuleFactoryByNameMap 注册 ArkTS TurboModule。
 */
export class ItcOpenIMPackage extends RNOHPackage {
  override getUITurboModuleFactoryByNameMap(): Map<
    string,
    (ctx: UITurboModuleContext) => UITurboModule | null
  > {
    return new Map<string, (ctx: UITurboModuleContext) => UITurboModule | null>()
      .set(ItcOpenIMTurboModule.NAME, (ctx) => new ItcOpenIMTurboModule(ctx));
  }
}
