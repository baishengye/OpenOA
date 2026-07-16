import { Platform } from 'react-native';
import { BoxShadow as BoxShadowBase } from './BoxShadow';
import { BoxShadowOHOS as BoxShadowOHOS } from './BoxShadow.ohos';
import { Shadow as ShadowBase } from './Shadow';
import { ShadowOHOS as ShadowOHOS } from './Shadow.ohos';
import { Blend as BlendBase } from './Blend';
import { BlendOHOS as BlendOHOS } from './Blend.ohos';

// 根据平台选择实现
const BoxShadowImpl = (Platform.OS as string) === 'harmony' ? BoxShadowOHOS : BoxShadowBase;
const ShadowImpl = (Platform.OS as string) === 'harmony' ? ShadowOHOS : ShadowBase;
const BlendImpl = (Platform.OS as string) === 'harmony' ? BlendOHOS : BlendBase;

export {
  BoxShadowImpl as BoxShadow,
  ShadowImpl as Shadow,
  BlendImpl as Blend,
};
