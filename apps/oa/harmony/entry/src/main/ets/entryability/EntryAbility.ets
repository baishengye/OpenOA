import { RNAbility } from '@rnoh/react-native-openharmony';
import { AbilityConstant, Want } from '@kit.AbilityKit';
import { initHotfix } from '@itc/hotfix';
// BuildProfile 是 entry 模块编译期生成的（buildProfileFields → BuildProfile.ets），
// 只能在 entry 内 import（裸模块名，hvigor 自动解析）；HAR 库里读不到，所以在这里读出再传给 initHotfix。
import BuildProfile from 'BuildProfile';

export default class EntryAbility extends RNAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    // 热修复初始化：把 build-profile.json5 的 buildProfileFields 喂给底层 OTA 后端。
    // 必须在 super.onCreate（RN 实例化、turbo module 构造）之前，否则 CodePushBuilder 读不到配置会崩。
    initHotfix({
      staging: BuildProfile.Staging,
      production: BuildProfile.Production,
      serverUrl: BuildProfile.ServerUrl,
      publicKey: BuildProfile.PublicKey,
    });
    super.onCreate(want, launchParam);
  }

  getPagePath(): string {
    return 'pages/Index';
  }
}
