import { RNAbility } from '@rnoh/react-native-openharmony';
import { AbilityConstant, Want } from '@kit.AbilityKit';
import { initHotfix } from '@itc/hotfix';

export default class EntryAbility extends RNAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    // 热修复初始化：部署配置/底层 OTA 后端细节封装在 @itc/hotfix（填 deployment key 见其 HotfixConfig）。
    // 必须在 super.onCreate（RN 实例化）之前。
    initHotfix();
    super.onCreate(want, launchParam);
  }

  getPagePath(): string {
    return 'pages/Index';
  }
}
