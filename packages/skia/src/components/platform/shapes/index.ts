import { Platform } from 'react-native';
import { Circle as CircleBase } from './Circle';
import { CircleOHOS as CircleOHOS } from './Circle.ohos';
import { Rect as RectBase } from './Rect';
import { RectOHOS as RectOHOS } from './Rect.ohos';
import { RoundedRect as RoundedRectBase } from './RoundedRect';
import { RoundedRectOHOS as RoundedRectOHOS } from './RoundedRect.ohos';
import { Oval as OvalBase } from './Oval';
import { OvalOHOS as OvalOHOS } from './Oval.ohos';
import { Line as LineBase } from './Line';
import { LineOHOS as LineOHOS } from './Line.ohos';
import { Points as PointsBase } from './Points';
import { PointsOHOS as PointsOHOS } from './Points.ohos';
import { Path as PathBase } from './Path';
import { PathOHOS as PathOHOS } from './Path.ohos';
import { DiffRect as DiffRectBase } from './DiffRect';
import { DiffRectOHOS as DiffRectOHOS } from './DiffRect.ohos';
import { Patch as PatchBase } from './Patch';
import { PatchOHOS as PatchOHOS } from './Patch.ohos';
import { Box as BoxBase } from './Box';
import { BoxOHOS as BoxOHOS } from './Box.ohos';

// 根据平台选择实现
const CircleImpl = (Platform.OS as string) === 'harmony' ? CircleOHOS : CircleBase;
const RectImpl = (Platform.OS as string) === 'harmony' ? RectOHOS : RectBase;
const RoundedRectImpl = (Platform.OS as string) === 'harmony' ? RoundedRectOHOS : RoundedRectBase;
const OvalImpl = (Platform.OS as string) === 'harmony' ? OvalOHOS : OvalBase;
const LineImpl = (Platform.OS as string) === 'harmony' ? LineOHOS : LineBase;
const PointsImpl = (Platform.OS as string) === 'harmony' ? PointsOHOS : PointsBase;
const PathImpl = (Platform.OS as string) === 'harmony' ? PathOHOS : PathBase;
const DiffRectImpl = (Platform.OS as string) === 'harmony' ? DiffRectOHOS : DiffRectBase;
const PatchImpl = (Platform.OS as string) === 'harmony' ? PatchOHOS : PatchBase;
const BoxImpl = (Platform.OS as string) === 'harmony' ? BoxOHOS : BoxBase;

export {
  CircleImpl as Circle,
  RectImpl as Rect,
  RoundedRectImpl as RoundedRect,
  OvalImpl as Oval,
  LineImpl as Line,
  PointsImpl as Points,
  PathImpl as Path,
  DiffRectImpl as DiffRect,
  PatchImpl as Patch,
  BoxImpl as Box,
};
