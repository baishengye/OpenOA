import { Platform } from 'react-native';
import { Blur as BlurBase } from './Blur';
import { BlurOHOS as BlurOHOS } from './Blur.ohos';
import { BlurMask as BlurMaskBase } from './BlurMask';
import { BlurMaskOHOS as BlurMaskOHOS } from './BlurMask.ohos';
import { ColorMatrix as ColorMatrixBase } from './ColorMatrix';
import { ColorMatrixOHOS as ColorMatrixOHOS } from './ColorMatrix.ohos';
import { DisplacementMap as DisplacementMapBase } from './DisplacementMap';
import { DisplacementMapOHOS as DisplacementMapOHOS } from './DisplacementMap.ohos';
import { Morphology as MorphologyBase } from './Morphology';
import { MorphologyOHOS as MorphologyOHOS } from './Morphology.ohos';
import { Offset as OffsetBase } from './Offset';
import { OffsetOHOS as OffsetOHOS } from './Offset.ohos';

// 根据平台选择实现
const BlurImpl = (Platform.OS as string) === 'harmony' ? BlurOHOS : BlurBase;
const BlurMaskImpl = (Platform.OS as string) === 'harmony' ? BlurMaskOHOS : BlurMaskBase;
const ColorMatrixImpl = (Platform.OS as string) === 'harmony' ? ColorMatrixOHOS : ColorMatrixBase;
const DisplacementMapImpl = (Platform.OS as string) === 'harmony' ? DisplacementMapOHOS : DisplacementMapBase;
const MorphologyImpl = (Platform.OS as string) === 'harmony' ? MorphologyOHOS : MorphologyBase;
const OffsetImpl = (Platform.OS as string) === 'harmony' ? OffsetOHOS : OffsetBase;

export {
  BlurImpl as Blur,
  BlurMaskImpl as BlurMask,
  ColorMatrixImpl as ColorMatrix,
  DisplacementMapImpl as DisplacementMap,
  MorphologyImpl as Morphology,
  OffsetImpl as Offset,
};
