import { Platform } from 'react-native';
import { LinearGradient as LinearGradientBase } from './LinearGradient';
import { LinearGradientOHOS as LinearGradientOHOS } from './LinearGradient.ohos';
import { RadialGradient as RadialGradientBase } from './RadialGradient';
import { RadialGradientOHOS as RadialGradientOHOS } from './RadialGradient.ohos';
import { SweepGradient as SweepGradientBase } from './SweepGradient';
import { SweepGradientOHOS as SweepGradientOHOS } from './SweepGradient.ohos';
import { TwoPointConicalGradient as TwoPointConicalGradientBase } from './TwoPointConicalGradient';
import { TwoPointConicalGradientOHOS as TwoPointConicalGradientOHOS } from './TwoPointConicalGradient.ohos';
import { FractalNoise as FractalNoiseBase } from './FractalNoise';
import { FractalNoiseOHOS as FractalNoiseOHOS } from './FractalNoise.ohos';
import { Turbulence as TurbulenceBase } from './Turbulence';
import { TurbulenceOHOS as TurbulenceOHOS } from './Turbulence.ohos';

// 根据平台选择实现
const LinearGradientImpl = (Platform.OS as string) === 'harmony' ? LinearGradientOHOS : LinearGradientBase;
const RadialGradientImpl = (Platform.OS as string) === 'harmony' ? RadialGradientOHOS : RadialGradientBase;
const SweepGradientImpl = (Platform.OS as string) === 'harmony' ? SweepGradientOHOS : SweepGradientBase;
const TwoPointConicalGradientImpl = (Platform.OS as string) === 'harmony' ? TwoPointConicalGradientOHOS : TwoPointConicalGradientBase;
const FractalNoiseImpl = (Platform.OS as string) === 'harmony' ? FractalNoiseOHOS : FractalNoiseBase;
const TurbulenceImpl = (Platform.OS as string) === 'harmony' ? TurbulenceOHOS : TurbulenceBase;

export {
  LinearGradientImpl as LinearGradient,
  RadialGradientImpl as RadialGradient,
  SweepGradientImpl as SweepGradient,
  TwoPointConicalGradientImpl as TwoPointConicalGradient,
  FractalNoiseImpl as FractalNoise,
  TurbulenceImpl as Turbulence,
};
