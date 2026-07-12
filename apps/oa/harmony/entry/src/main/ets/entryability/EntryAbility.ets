import { RNAbility } from '@rnoh/react-native-openharmony';
import { AbilityConstant, Want } from '@kit.AbilityKit';
import { initHotfix } from '../hotfix/HotfixInit';

export default class EntryAbility extends RNAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    // 热修复初始化：必须 在 super.onCreate（RN 实例化、turbo module 构造）之前。
    // buildProfileFields 在 build 时从 build-profile.json5 注入，IDE 类型检查时使用空字符串。
    initHotfix({
      staging: 'yN8RRIc5TJuezxBmoNCGbvVoC6Wf4ksvOXqog',
      production: 'yzBXvMzCxkajfzy9eW3QnaJvt4i14ksvOXqog',
      serverUrl: 'http://172.16.80.101:3000',
      publicKey: '',
    });
    super.onCreate(want, launchParam);
  }

  getPagePath(): string {
    return 'pages/Index';
  }
}
