import { Platform } from 'react-native';
import { DiscretePathEffect as DiscretePathEffectBase } from './DiscretePathEffect';
import { DiscretePathEffectOHOS as DiscretePathEffectOHOS } from './DiscretePathEffect.ohos';
import { DashPathEffect as DashPathEffectBase } from './DashPathEffect';
import { DashPathEffectOHOS as DashPathEffectOHOS } from './DashPathEffect.ohos';
import { CornerPathEffect as CornerPathEffectBase } from './CornerPathEffect';
import { CornerPathEffectOHOS as CornerPathEffectOHOS } from './CornerPathEffect.ohos';
import { Path1DPathEffect as Path1DPathEffectBase } from './Path1DPathEffect';
import { Path1DPathEffectOHOS as Path1DPathEffectOHOS } from './Path1DPathEffect.ohos';
import { Path2DPathEffect as Path2DPathEffectBase } from './Path2DPathEffect';
import { Path2DPathEffectOHOS as Path2DPathEffectOHOS } from './Path2DPathEffect.ohos';
import { Line2DPathEffect as Line2DPathEffectBase } from './Line2DPathEffect';
import { Line2DPathEffectOHOS as Line2DPathEffectOHOS } from './Line2DPathEffect.ohos';

// 根据平台选择实现
const DiscretePathEffectImpl = (Platform.OS as string) === 'harmony' ? DiscretePathEffectOHOS : DiscretePathEffectBase;
const DashPathEffectImpl = (Platform.OS as string) === 'harmony' ? DashPathEffectOHOS : DashPathEffectBase;
const CornerPathEffectImpl = (Platform.OS as string) === 'harmony' ? CornerPathEffectOHOS : CornerPathEffectBase;
const Path1DPathEffectImpl = (Platform.OS as string) === 'harmony' ? Path1DPathEffectOHOS : Path1DPathEffectBase;
const Path2DPathEffectImpl = (Platform.OS as string) === 'harmony' ? Path2DPathEffectOHOS : Path2DPathEffectBase;
const Line2DPathEffectImpl = (Platform.OS as string) === 'harmony' ? Line2DPathEffectOHOS : Line2DPathEffectBase;

export {
  DiscretePathEffectImpl as DiscretePathEffect,
  DashPathEffectImpl as DashPathEffect,
  CornerPathEffectImpl as CornerPathEffect,
  Path1DPathEffectImpl as Path1DPathEffect,
  Path2DPathEffectImpl as Path2DPathEffect,
  Line2DPathEffectImpl as Line2DPathEffect,
};
