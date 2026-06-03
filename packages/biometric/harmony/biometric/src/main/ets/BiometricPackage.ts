import type { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { ItcBiometricTurboModule } from './BiometricTurboModule';
import { RNOHPackage } from '@rnoh/react-native-openharmony';

/**
 * RNOH 包入口。RNOH 0.82 用 getUITurboModuleFactoryByNameMap 注册 ArkTS TurboModule
 * （旧版 createTurboModulesFactory/hasTurboModule 不被新架构识别，会报 "Couldn't find Turbo Module"）。
 */
export class ItcBiometricPackage extends RNOHPackage {
  override getUITurboModuleFactoryByNameMap(): Map<
    string,
    (ctx: UITurboModuleContext) => UITurboModule | null
  > {
    return new Map<string, (ctx: UITurboModuleContext) => UITurboModule | null>()
      .set(ItcBiometricTurboModule.NAME, (ctx) => new ItcBiometricTurboModule(ctx));
  }
}
