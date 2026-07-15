/**
 * @itc/skia 类型定义
 * 为 Skia 组件提供统一的类型接口
 */

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

// ============================================
// 基础类型定义
// ============================================

/** 颜色类型 */
export type Color = string;

/** Skia 颜色类型 */
export type SkColor = string;

/** 二维点 */
export interface SkPoint {
  x: number;
  y: number;
}

/** 矩形 */
export interface SkRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 圆角矩形 */
export interface SkRRect {
  rect: SkRect;
  cornerRadii?: [number, number, number, number];
}

/** 变换矩阵 */
export type Transform2d = number[];

/** 平铺模式 */
export type TileMode = 'clamp' | 'repeat' | 'mirror' | 'decal';

/** 混合模式 */
export type BlendMode =
  | 'clear'
  | 'src'
  | 'dst'
  | 'srcOver'
  | 'dstOver'
  | 'srcIn'
  | 'dstIn'
  | 'srcOut'
  | 'dstOut'
  | 'srcATop'
  | 'dstATop'
  | 'xor'
  | 'plus'
  | 'modulate'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'colorDodge'
  | 'colorBurn'
  | 'hardLight'
  | 'softLight'
  | 'difference'
  | 'exclusion'
  | 'multiply'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

/** 描边连接样式 */
export type StrokeJoin = 'miter' | 'round' | 'bevel';

/** 描边端点样式 */
export type StrokeCap = 'butt' | 'round' | 'square';

/** 填充类型 */
export type FillType = 'winding' | 'evenOdd';

/** 裁剪操作 */
export type ClipOp = 'difference' | 'intersect';

/** 点模式 */
export type PointMode = 'points' | 'lines' | 'polygon';

/** 顶点模式 */
export type VertexMode = 'triangles' | 'trianglesStrip' | 'triangleFan';

/** 颜色通道 */
export type ColorChannel = 'r' | 'g' | 'b' | 'a';

/** 形态学操作 */
export type MorphologyOperator = 'erode' | 'dilate';

/** 模糊样式 */
export type BlurStyle = 'normal' | 'solid' | 'outer' | 'inner';

/** 过滤模式 */
export type FilterMode = 'linear' | 'nearest';

/** Mipmap 模式 */
export type MipmapMode = 'none' | 'last';

/** 拟合模式 */
export type Fit = 'contain' | 'cover' | 'fill' | 'fitWidth' | 'fitHeight' | 'scaleDown';

/** Path 1D 效果样式 */
export type Path1DEffectStyle = 'translate' | 'rotate' | 'morph';

/** 抗锯齿模式 */
export type AaMode = 'none' | 'engine' | 'gray' | 'msaa4' | 'msaa16';

// ============================================
// Skia 原生对象类型（由底层库提供）
// ============================================

/** SkPath 类型（由底层库提供） */
export interface SkPath {}

/** SkImage 类型（由底层库提供） */
export type SkImage = any;

/** SkPicture 类型（由底层库提供） */
export type SkPicture = any;

/** SkRuntimeEffect 类型（由底层库提供） */
export type SkRuntimeEffect = any;

/** SkShader 类型（由底层库提供） */
export type SkShader = any;

/** SkPaint 类型（由底层库提供） */
export type SkPaint = any;

/** SkImageFilter 类型（由底层库提供） */
export type SkImageFilter = any;

/** SkPathEffect 类型（由底层库提供） */
export type SkPathEffect = any;

/** SkMatrix 类型（由底层库提供） */
export interface SkMatrix {
  concat(other: SkMatrix): void;
  identity(): void;
  invert(): SkMatrix | null;
  mapPoints(points: SkPoint[]): SkPoint[];
  rotate(radians: number, center?: SkPoint): void;
  scale(sx: number, sy: number, center?: SkPoint): void;
  setPolyToPoly(src: SkPoint[], dst: SkPoint[]): boolean;
  skew(sx: number, sy: number): void;
  translate(dx: number, dy: number): void;
}

// ============================================
// 组件 Props 类型
// ============================================

/** Canvas 画布组件 */
export interface CanvasProps {
  style?: StyleProp<ViewStyle>;
  mode?: any;
  onSize?: any;
  onLayout?: any;
  debug?: boolean;
  colorspace?: any;
  opaque?: boolean;
  children?: ReactNode;
}

/** Group 分组组件 */
export interface GroupProps {
  transform?: Transform2d;
  origin?: SkPoint;
  clip?: any;
  invertClip?: boolean;
  layer?: SkPaint;
  zIndex?: number;
  blendMode?: BlendMode;
  children?: ReactNode;
}

/** Path 路径组件 */
export interface PathProps {
  path?: string | SkPath;
  start?: number;
  end?: number;
  stroke?: StrokeOptions;
  color?: Color;
  children?: ReactNode;
}

/** 描边选项 */
export interface StrokeOptions {
  width?: number;
  join?: StrokeJoin;
  cap?: StrokeCap;
  miter?: number;
  color?: Color;
}

/** Rect 矩形组件 */
export interface RectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: Color;
  stroke?: {
    width?: number;
    color?: Color;
  };
  children?: ReactNode;
}

/** RoundedRect 圆角矩形组件 */
export interface RoundedRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  r?: number | [number, number, number, number];
  color?: Color;
  stroke?: {
    width?: number;
    color?: Color;
  };
  children?: ReactNode;
}

/** DiffRect 差集矩形组件 */
export interface DiffRectProps {
  outer: SkRect | SkRRect;
  inner: SkRect | SkRRect;
  color?: Color;
  children?: ReactNode;
}

/** Line 直线组件 */
export interface LineProps {
  p1: SkPoint;
  p2: SkPoint;
  color?: Color;
  strokeStyle?: {
    width?: number;
    color?: Color;
    cap?: StrokeCap;
    join?: StrokeJoin;
    miter?: number;
  };
  children?: ReactNode;
}

/** Points 点集合组件 */
export interface PointsProps {
  points: SkPoint[];
  mode: PointMode;
  stroke?: StrokeOptions;
  color?: Color;
  children?: ReactNode;
}

/** Circle 圆形组件 */
export interface CircleProps {
  cx: number;
  cy: number;
  r: number;
  color?: Color;
  children?: ReactNode;
}

/** Oval 椭圆组件 */
export interface OvalProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: Color;
  children?: ReactNode;
}

/** Atlas 图集组件 */
export interface AtlasProps {
  image?: SkImage | null;
  sprites?: SkRect[];
  transforms?: any[];
  colors?: SkColor[];
  blendMode?: BlendMode;
  children?: ReactNode;
}

/** Vertices 顶点组件 */
export interface VerticesProps {
  vertices: SkPoint[];
  mode?: any;
  indices?: number[];
  textures?: SkPoint[];
  colors?: SkColor[];
  blendMode?: BlendMode;
  children?: ReactNode;
}

/** Patch 曲面组件 - 需要 4x4 控制点网格 (16个点) */
export interface PatchProps {
  patch?: [
    [CubicBezierHandle, CubicBezierHandle, CubicBezierHandle, CubicBezierHandle],
    [CubicBezierHandle, CubicBezierHandle, CubicBezierHandle, CubicBezierHandle],
    [CubicBezierHandle, CubicBezierHandle, CubicBezierHandle, CubicBezierHandle],
    [CubicBezierHandle, CubicBezierHandle, CubicBezierHandle, CubicBezierHandle],
  ];
  textures?: SkPoint[];
  colors?: SkColor[];
  blendMode?: BlendMode;
  children?: ReactNode;
}

/** 立方贝塞尔控制点 */
export interface CubicBezierHandle {
  pos: SkPoint;
  c1: SkPoint;
  c2: SkPoint;
}

/** Picture 图片组件 */
export interface PictureProps {
  picture: SkPicture;
  children?: ReactNode;
}

/** Box 盒模型组件 */
export interface BoxProps {
  box: SkRRect | SkRect;
  color?: Color;
  children?: ReactNode;
}

/** BoxShadow 盒阴影组件 */
export interface BoxShadowProps {
  dx?: number;
  dy?: number;
  spread?: number;
  blur: number;
  color?: Color;
  children?: ReactNode;
}

// ============================================
// 滤镜 Props
// ============================================

/** Shader 着色器组件 */
export interface ShaderProps {
  source: SkRuntimeEffect | any;
  uniforms?: any;
  children?: ReactNode;
}

/** ColorShader 纯色着色器 */
export interface ColorShaderProps {
  color: Color;
  children?: ReactNode;
}

/** ImageShader 图像着色器 */
export interface ImageShaderProps {
  image: SkImage | null;
  tx?: TileMode;
  ty?: TileMode;
  fm?: FilterMode;
  mm?: MipmapMode;
  fit?: Fit;
  rect?: SkRect;
  transform?: Transform2d;
  children?: ReactNode;
}

/** LinearGradient 线性渐变 */
export interface LinearGradientProps {
  start: SkPoint;
  end: SkPoint;
  colors: Color[];
  positions?: number[];
  mode?: TileMode;
  flags?: number;
  transform?: Transform2d;
  children?: ReactNode;
}

/** RadialGradient 径向渐变 */
export interface RadialGradientProps {
  c: SkPoint;
  r: number;
  colors: Color[];
  positions?: number[];
  mode?: TileMode;
  flags?: number;
  transform?: Transform2d;
  children?: ReactNode;
}

/** TwoPointConicalGradient 双点圆锥渐变 */
export interface TwoPointConicalGradientProps {
  start: SkPoint;
  startR: number;
  end: SkPoint;
  endR: number;
  colors: Color[];
  positions?: number[];
  mode?: TileMode;
  flags?: number;
  transform?: Transform2d;
  children?: ReactNode;
}

/** SweepGradient 扫描渐变 */
export interface SweepGradientProps {
  c: SkPoint;
  start?: number;
  end?: number;
  colors: Color[];
  positions?: number[];
  mode?: TileMode;
  flags?: number;
  transform?: Transform2d;
  children?: ReactNode;
}

/** FractalNoise 分形噪声 */
export interface FractalNoiseProps {
  freqX: number;
  freqY: number;
  octaves?: number;
  seed?: number;
  tileWidth?: number;
  tileHeight?: number;
  children?: ReactNode;
}

/** Turbulence 湍流 */
export interface TurbulenceProps {
  freqX: number;
  freqY: number;
  octaves?: number;
  seed?: number;
  tileWidth?: number;
  tileHeight?: number;
  children?: ReactNode;
}

/** Blend 混合组件 */
export interface BlendProps {
  mode: BlendMode;
  children?: ReactNode;
}

/** DiscretePathEffect 离散路径效果 */
export interface DiscretePathEffectProps {
  length: number;
  deviation: number;
  seed?: number;
  children?: ReactNode;
}

/** DashPathEffect 虚线路径效果 */
export interface DashPathEffectProps {
  intervals: number[];
  phase?: number;
  children?: ReactNode;
}

/** CornerPathEffect 圆角路径效果 */
export interface CornerPathEffectProps {
  r: number;
  children?: ReactNode;
}

/** Path1DPathEffect 路径沿路径效果 */
export interface Path1DPathEffectProps {
  path: string | SkPath;
  advance: number;
  phase: number;
  style?: Path1DEffectStyle;
  children?: ReactNode;
}

/** Path2DPathEffect 2D 路径效果 */
export interface Path2DPathEffectProps {
  path: string | SkPath;
  matrix: SkMatrix | number[];
  children?: ReactNode;
}

/** Line2DPathEffect 2D 直线效果 */
export interface Line2DPathEffectProps {
  width: number;
  matrix: SkMatrix | number[];
  children?: ReactNode;
}

/** Shadow 阴影滤镜 */
export interface ShadowProps {
  dx?: number;
  dy?: number;
  blur?: number;
  color?: Color;
  inner?: boolean;
  shadowOnly?: boolean;
  children?: ReactNode;
}

/** Blur 模糊滤镜 */
export interface BlurProps {
  blur: number | SkPoint;
  mode?: TileMode;
  children?: ReactNode;
}

/** DisplacementMap 位移映射滤镜 */
export interface DisplacementMapProps {
  channelX: ColorChannel;
  channelY?: ColorChannel;
  scale?: number;
  children?: ReactNode;
}

/** Offset 偏移滤镜 */
export interface OffsetProps {
  x: number;
  y: number;
  children?: ReactNode;
}

/** Morphology 形态学滤镜 */
export interface MorphologyProps {
  operator: MorphologyOperator;
  radius: number | SkPoint;
  children?: ReactNode;
}

/** RuntimeShader 运行时着色器 */
export interface RuntimeShaderProps {
  source: SkRuntimeEffect;
  uniforms?: Record<string, any>;
  children?: ReactNode;
}

/** BlurMask 模糊蒙版 */
export interface BlurMaskProps {
  blur: number;
  style?: BlurStyle;
  respectCTM?: boolean;
}

/** ColorMatrix 颜色矩阵 */
export interface ColorMatrixProps {
  matrix: number[];
  children?: ReactNode;
}
