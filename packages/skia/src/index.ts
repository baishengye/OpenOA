/**
 * @itc/skia
 * 2D 图形渲染封装，基于 @shopify/react-native-skia 的三端适配
 *
 * 业务层只应从此文件导入，不应直接引用 @shopify/react-native-skia 或 @react-native-ohos/react-native-skia
 */

// ============================================
// 容器组件
// ============================================
export { Canvas } from './components/Canvas';
export { Group } from './components/Group';

// ============================================
// 基础形状
// ============================================
export { Circle } from './components/shapes/Circle';
export { Rect } from './components/shapes/Rect';
export { RoundedRect } from './components/shapes/RoundedRect';
export { Oval } from './components/shapes/Oval';
export { Line } from './components/shapes/Line';
export { Points } from './components/shapes/Points';
export { Path } from './components/shapes/Path';
export { DiffRect } from './components/shapes/DiffRect';
export { Patch } from './components/shapes/Patch';
export { Box } from './components/shapes/Box';

// ============================================
// 渐变组件
// ============================================
export { LinearGradient } from './components/gradients/LinearGradient';
export { RadialGradient } from './components/gradients/RadialGradient';
export { SweepGradient } from './components/gradients/SweepGradient';
export { TwoPointConicalGradient } from './components/gradients/TwoPointConicalGradient';
export { FractalNoise } from './components/gradients/FractalNoise';
export { Turbulence } from './components/gradients/Turbulence';

// ============================================
// 效果组件
// ============================================
export { BoxShadow } from './components/effects/BoxShadow';
export { Shadow } from './components/effects/Shadow';
export { Blend } from './components/effects/Blend';

// ============================================
// 着色器组件
// ============================================
export { ColorShader } from './components/shaders/ColorShader';
export { ImageShader } from './components/shaders/ImageShader';
export { Shader } from './components/shaders/Shader';
export { RuntimeShader } from './components/shaders/RuntimeShader';

// ============================================
// 滤镜组件
// ============================================
export { Blur } from './components/filters/Blur';
export { DisplacementMap } from './components/filters/DisplacementMap';
export { Offset } from './components/filters/Offset';
export { Morphology } from './components/filters/Morphology';
export { ColorMatrix } from './components/filters/ColorMatrix';
export { BlurMask } from './components/filters/BlurMask';

// ============================================
// 路径效果
// ============================================
export { DiscretePathEffect } from './components/path-effects/DiscretePathEffect';
export { DashPathEffect } from './components/path-effects/DashPathEffect';
export { CornerPathEffect } from './components/path-effects/CornerPathEffect';
export { Path1DPathEffect } from './components/path-effects/Path1DPathEffect';
export { Path2DPathEffect } from './components/path-effects/Path2DPathEffect';
export { Line2DPathEffect } from './components/path-effects/Line2DPathEffect';

// ============================================
// 高级组件
// ============================================
export { Atlas } from './components/advanced/Atlas';
export { Vertices } from './components/advanced/Vertices';
export { Picture } from './components/advanced/Picture';

// ============================================
// 工具函数
// ============================================
export { isHarmonyOS, isSkiaSupported, getSkiaImplementation } from './utils/platform';

// ============================================
// 类型导出
// ============================================
export type {
  // 基础类型
  Color,
  SkColor,
  SkPoint,
  SkRect,
  SkRRect,
  Transform2d,
  TileMode,
  BlendMode,
  StrokeJoin,
  StrokeCap,
  FillType,
  ClipOp,
  PointMode,
  VertexMode,
  ColorChannel,
  MorphologyOperator,
  BlurStyle,
  FilterMode,
  MipmapMode,
  Fit,
  Path1DEffectStyle,
  AaMode,
  // Skia 原生对象
  SkPath,
  SkImage,
  SkPicture,
  SkRuntimeEffect,
  SkShader,
  SkPaint,
  SkImageFilter,
  SkPathEffect,
  SkMatrix,
  // 组件 Props
  CanvasProps,
  GroupProps,
  CircleProps,
  RectProps,
  RoundedRectProps,
  DiffRectProps,
  LineProps,
  PointsProps,
  OvalProps,
  PathProps,
  PatchProps,
  CubicBezierHandle,
  PictureProps,
  BoxProps,
  AtlasProps,
  VerticesProps,
  BoxShadowProps,
  // 滤镜 Props
  ShaderProps,
  ColorShaderProps,
  ImageShaderProps,
  LinearGradientProps,
  RadialGradientProps,
  TwoPointConicalGradientProps,
  SweepGradientProps,
  FractalNoiseProps,
  TurbulenceProps,
  BlendProps,
  DiscretePathEffectProps,
  DashPathEffectProps,
  CornerPathEffectProps,
  Path1DPathEffectProps,
  Path2DPathEffectProps,
  Line2DPathEffectProps,
  ShadowProps,
  BlurProps,
  DisplacementMapProps,
  OffsetProps,
  MorphologyProps,
  RuntimeShaderProps,
  BlurMaskProps,
  ColorMatrixProps,
} from './types';
