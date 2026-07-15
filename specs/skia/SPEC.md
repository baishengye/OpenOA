# @itc/skia 模块规范

## 概述

**@itc/skia** 是 OpenOA 项目的 2D 图形渲染层封装，基于 **@shopify/react-native-skia** 的三端适配抽象（Android/iOS/HarmonyOS NEXT）。通过统一接口屏蔽底层差异，保证三端表现一致性。

**核心职责：**
- 封装 react-native-skia 的三端适配层
- 统一 API 接口，下层自动适配具体平台实现
- 提供高性能 2D 图形渲染能力（Canvas、形状、渐变、路径、阴影等）

**设计原则：**
- **API 隐藏**：业务层只依赖 `@itc/skia`，不直接 import `@shopify/react-native-skia`
- **清晰抽象**：底层实现可随时切换，无需改动业务代码
- **组件化**：提供声明式组件，覆盖常用图形渲染场景
- **三端一致**：所有平台表现完全一致的 Canvas 渲染

---

## 1. 技术栈

| 平台 | 底层实现 | 版本要求 | 适配状态 |
|------|---------|----------|----------|
| Android | @shopify/react-native-skia | RN 0.82+ | ✅ 适配完成 |
| iOS | @shopify/react-native-skia | RN 0.82+ | ✅ 适配完成 |
| HarmonyOS NEXT | @react-native-ohos/react-native-skia | API 12+ / RN 0.82+ | ✅ 适配完成（需手动配置） |

> **说明**：
> - @shopify/react-native-skia 用于 Android/iOS（社区主版本）
> - @react-native-ohos/react-native-skia 用于 HarmonyOS（华为 RNOH 移植版）
> - API 12+ 表示兼容 HarmonyOS 5.0.0(API 12) 及以上版本
> - 最低支持 RN 0.82 与 OpenOA 基线保持一致

---

## 2. 核心组件分类

### 2.1 容器组件

| 组件 | 说明 | HarmonyOS |
|------|------|-----------|
| Canvas | 画布容器，所有绘图元素必须包裹在此组件内 | ✅ |
| Group | 分组容器，用于组织和管理多个绘图元素 | ✅ |

### 2.2 基础形状

| 组件 | 说明 | HarmonyOS |
|------|------|-----------|
| Circle | 圆形 | ✅ |
| Rect | 矩形 | ✅ |
| RoundedRect | 圆角矩形 | ✅ |
| Oval | 椭圆 | ✅ |
| Line | 直线 | ✅ |
| Points | 点集 | ✅ |
| Path | SVG 路径 | ✅ |
| DiffRect | 差集矩形 | ✅ |
| Patch | 贝塞尔曲面 | ✅ |
| Box | 盒模型 | ✅ |

### 2.3 渐变组件

| 组件 | 说明 | HarmonyOS |
|------|------|-----------|
| LinearGradient | 线性渐变 | ✅ |
| RadialGradient | 径向渐变 | ✅ |
| SweepGradient | 扫描渐变 | ✅ |
| TwoPointConicalGradient | 双点锥形渐变 | ✅ |
| FractalNoise | 分形噪声 | ✅ |
| Turbulence | 湍流噪声 | ✅ |

### 2.4 效果组件

| 组件 | 说明 | HarmonyOS |
|------|------|-----------|
| BoxShadow | 盒阴影 | ✅ |
| Shadow | 阴影滤镜 | ✅ |
| Blend | 混合模式 | ✅ |

### 2.5 着色器组件

| 组件 | 说明 | HarmonyOS |
|------|------|-----------|
| ColorShader | 纯色着色器 | ✅ |
| ImageShader | 图像着色器 | ✅ |
| Shader | 运行时着色器 | ✅ |
| RuntimeShader | GLSL 着色器 | ✅ |

### 2.6 滤镜组件

| 组件 | 说明 | HarmonyOS |
|------|------|-----------|
| Blur | 高斯模糊 | ✅ |
| DisplacementMap | 位移映射 | ✅ |
| Offset | 偏移滤镜 | ✅ |
| Morphology | 形态学滤镜 | ✅ |
| ColorMatrix | 颜色矩阵 | ✅ |
| BlurMask | 模糊遮罩 | ✅ |

### 2.7 路径效果

| 组件 | 说明 | HarmonyOS |
|------|------|-----------|
| DiscretePathEffect | 离散路径效果 | ✅ |
| DashPathEffect | 虚线路径效果 | ✅ |
| CornerPathEffect | 圆角路径效果 | ✅ |
| Path1DPathEffect | 1D 路径效果 | ✅ |
| Path2DPathEffect | 2D 路径效果 | ✅ |
| Line2DPathEffect | 2D 线条效果 | ✅ |

### 2.8 高级组件

| 组件 | 说明 | HarmonyOS |
|------|------|-----------|
| Atlas | 精灵图集 | ✅ |
| Vertices | 顶点数组 | ✅ |
| Picture | 图片渲染 | ✅ |

---

## 3. 核心类型定义

### 3.1 基础类型

```typescript
/** 二维坐标点 */
export interface SkPoint {
  x: number;
  y: number;
}

/** 矩形区域 */
export interface SkRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 圆角矩形 */
export interface SkRRect {
  rect: SkRect;
  cornerRadii: [number, number, number, number];
}

/** 颜色值 */
export type Color = string;

/** 混合模式 */
export type BlendMode =
  | 'clear' | 'src' | 'dst' | 'srcOver' | 'dstOver'
  | 'srcIn' | 'dstIn' | 'srcOut' | 'dstOut' | 'srcATop' | 'dstATop'
  | 'xor' | 'plus' | 'modulate' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'colorDodge' | 'colorBurn' | 'hardLight'
  | 'softLight' | 'difference' | 'exclusion' | 'multiply'
  | 'hue' | 'saturation' | 'color' | 'luminosity';

/** 平铺模式 */
export type TileMode = 'clamp' | 'repeat' | 'mirror' | 'decal';

/** 变换矩阵 (2D) */
export interface Transform2d {
  translateX?: number;
  translateY?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  skewX?: number;
  skewY?: number;
}
```

### 3.2 组件 Props 类型

```typescript
/** Canvas 组件 Props */
export interface CanvasProps {
  style?: ViewStyle;
  ref?: Ref<SkiaView>;
  onSize?: SharedValue<Size>;
  children?: ReactNode;
}

/** Group 组件 Props */
export interface GroupProps {
  blendMode?: BlendMode;
  transform?: Transform2d;
  origin?: SkPoint;
  clip?: SkRect | SkRRect | PathDef;
  invertClip?: boolean;
  zIndex?: number;
  children?: ReactNode;
}

/** Circle 组件 Props */
export interface CircleProps {
  cx: number;
  cy: number;
  r: number;
  color?: Color;
  children?: ReactNode;
}

/** Rect 组件 Props */
export interface RectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: Color;
  children?: ReactNode;
}

/** RoundedRect 组件 Props */
export interface RoundedRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  r: number | [number, number, number, number];
  color?: Color;
  children?: ReactNode;
}

/** LinearGradient 组件 Props */
export interface LinearGradientProps {
  start: SkPoint;
  end: SkPoint;
  colors: Color[];
  positions?: number[];
  mode?: TileMode;
  transform?: Transform2d;
  children?: ReactNode;
}

/** RadialGradient 组件 Props */
export interface RadialGradientProps {
  c: SkPoint;
  r: number;
  colors: Color[];
  positions?: number[];
  mode?: TileMode;
  children?: ReactNode;
}

/** Path 组件 Props */
export interface PathProps {
  path: PathDef;
  start?: number;
  end?: number;
  stroke?: StrokeOptions;
  color?: Color;
  children?: ReactNode;
}

/** BoxShadow 组件 Props */
export interface BoxShadowProps {
  dx?: number;
  dy?: number;
  spread?: number;
  blur: number;
  color?: Color;
  inner?: boolean;
  children?: ReactNode;
}

/** Line 组件 Props */
export interface LineProps {
  p1: SkPoint;
  p2: SkPoint;
  color?: Color;
  strokeWidth?: number;
  children?: ReactNode;
}
```

---

## 4. 目录结构

```
packages/skia/
├── package.json              # 包定义
├── tsconfig.json             # TypeScript 配置
├── src/
│   ├── index.ts              # 唯一出口，白名单导出所有组件
│   ├── types.ts              # 类型定义
│   ├── utils/
│   │   └── platform.ts       # 平台检测工具
│   └── components/
│       ├── Canvas.tsx         # 画布容器
│       ├── Group.tsx          # 分组容器
│       ├── shapes/           # 基础形状
│       │   ├── Circle.tsx
│       │   ├── Rect.tsx
│       │   ├── RoundedRect.tsx
│       │   ├── Oval.tsx
│       │   ├── Line.tsx
│       │   ├── Points.tsx
│       │   ├── Path.tsx
│       │   ├── DiffRect.tsx
│       │   ├── Patch.tsx
│       │   └── Box.tsx
│       ├── gradients/         # 渐变组件
│       │   ├── LinearGradient.tsx
│       │   ├── RadialGradient.tsx
│       │   ├── SweepGradient.tsx
│       │   ├── TwoPointConicalGradient.tsx
│       │   ├── FractalNoise.tsx
│       │   └── Turbulence.tsx
│       ├── effects/          # 效果组件
│       │   ├── BoxShadow.tsx
│       │   ├── Shadow.tsx
│       │   └── Blend.tsx
│       ├── shaders/           # 着色器组件
│       │   ├── ColorShader.tsx
│       │   ├── ImageShader.tsx
│       │   ├── Shader.tsx
│       │   └── RuntimeShader.tsx
│       ├── filters/           # 滤镜组件
│       │   ├── Blur.tsx
│       │   ├── DisplacementMap.tsx
│       │   ├── Offset.tsx
│       │   ├── Morphology.tsx
│       │   ├── ColorMatrix.tsx
│       │   └── BlurMask.tsx
│       ├── path-effects/      # 路径效果
│       │   ├── DiscretePathEffect.tsx
│       │   ├── DashPathEffect.tsx
│       │   ├── CornerPathEffect.tsx
│       │   ├── Path1DPathEffect.tsx
│       │   ├── Path2DPathEffect.tsx
│       │   └── Line2DPathEffect.tsx
│       └── advanced/          # 高级组件
│           ├── Atlas.tsx
│           ├── Vertices.tsx
│           └── Picture.tsx
├── android/                  # Android 原生（如有需要）
├── ios/                      # iOS 原生（如有需要）
└── harmony/                  # 鸿蒙配置文档
    └── README.md             # ManualLink 配置指南
```

---

## 5. 平台适配策略

### 5.1 平台检测与适配

```typescript
// src/utils/platform.ts
import { Platform } from 'react-native';

/**
 * 判断当前是否为 HarmonyOS 平台
 */
export function isHarmonyOS(): boolean {
  return Platform.OS === 'harmony';
}

/**
 * 判断当前平台是否支持 Skia
 * HarmonyOS 需要额外检查 @react-native-ohos/react-native-skia 是否正确安装
 */
export function isSkiaSupported(): boolean {
  if (isHarmonyOS()) {
    try {
      require('@react-native-ohos/react-native-skia');
      return true;
    } catch {
      return false;
    }
  }
  return true;
}
```

### 5.2 统一导出入口

```typescript
// src/index.ts
import { Platform } from 'react-native';

// 根据平台选择导入
const SkiaLib = Platform.OS === 'harmony'
  ? require('@react-native-ohos/react-native-skia')
  : require('@shopify/react-native-skia');

// 导出所有组件（统一 API）
export const Canvas = SkiaLib.Canvas;
export const Group = SkiaLib.Group;
export const Circle = SkiaLib.Circle;
export const Rect = SkiaLib.Rect;
export const RoundedRect = SkiaLib.RoundedRect;
// ... 其他组件
```

### 5.3 鸿蒙差异处理

> ⚠️ **注意**：import 语句保持不变（使用 `@shopify/react-native-skia`），运行时通过 Metro 平台选择自动切换到 `@react-native-ohos/react-native-skia`。

---

## 6. 使用示例

### 6.1 基本画布

```tsx
import { Canvas, Circle, Group, Rect } from '@itc/skia';

function BasicDemo() {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Circle cx={128} cy={128} r={80} color="cyan" />
      <Rect x={50} y={50} width={100} height={100} color="#ff6b6b" />
    </Canvas>
  );
}
```

### 6.2 混合模式

```tsx
import { Canvas, Circle, Group } from '@itc/skia';

function BlendDemo() {
  const width = 256;
  const height = 256;
  const r = width * 0.33;

  return (
    <Canvas style={{ width, height }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={width - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
}
```

### 6.3 渐变填充

```tsx
import { Canvas, Rect, LinearGradient, RadialGradient } from '@itc/skia';

function GradientDemo() {
  return (
    <Canvas style={{ width: 300, height: 200 }}>
      {/* 线性渐变 */}
      <Rect x={10} y={10} width={130} height={80}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 130, y: 80 }}
          colors={['#ff6b6b', '#4ecdc4']}
        />
      </Rect>

      {/* 径向渐变 */}
      <Rect x={160} y={10} width={130} height={80}>
        <RadialGradient
          c={{ x: 65, y: 40 }}
          r={50}
          colors={['#667eea', '#764ba2']}
        />
      </Rect>
    </Canvas>
  );
}
```

### 6.4 带阴影的圆角矩形

```tsx
import { Canvas, RoundedRect, BoxShadow } from '@itc/skia';

function ShadowDemo() {
  return (
    <Canvas style={{ width: 200, height: 120 }}>
      <BoxShadow dx={4} dy={4} blur={10} color="rgba(0,0,0,0.3)">
        <RoundedRect x={20} y={20} width={160} height={80} r={16} color="#4ecdc4" />
      </BoxShadow>
    </Canvas>
  );
}
```

### 6.5 SVG 路径

```tsx
import { Canvas, Path, Group } from '@itc/skia';

function PathDemo() {
  // SVG 路径字符串
  const heartPath = 'M 128 224 L 32 128 A 48 48 0 0 1 128 80 A 48 48 0 0 1 224 128 Z';

  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Path
        path={heartPath}
        color="#e74c3c"
        stroke={{ width: 2 }}
      />
    </Canvas>
  );
}
```

---

## 7. 依赖关系

### 7.1 peerDependencies

```json
{
  "react-native": ">= 0.82.0",
  "react": ">= 19.0.0"
}
```

### 7.2 dependencies

```json
{
  "@shopify/react-native-skia": "^2.4.14",
  "@react-native-ohos/react-native-skia": "~2.0.0"
}
```

> **说明**：
> - @shopify/react-native-skia 用于 Android/iOS（社区基线版本 2.4.14）
> - @react-native-ohos/react-native-skia 用于 HarmonyOS（版本 2.0.0，兼容 RN 0.82）

### 7.3 内部依赖

```json
{
  "@itc/base": "workspace:*"
}
```

---

## 8. 开发任务

### 8.1 Phase 1：基础框架

- [ ] 创建 packages/skia 目录结构
- [ ] 配置 package.json 和 tsconfig.json
- [ ] 实现类型定义（types.ts）
- [ ] 实现平台检测工具（utils/platform.ts）
- [ ] 创建 HarmonyOS ManualLink 配置文档

### 8.2 Phase 2：核心组件实现

- [ ] 实现容器组件（Canvas, Group）
- [ ] 实现基础形状组件（Circle, Rect, RoundedRect, Oval, Line, Points, Path, DiffRect, Patch, Box）
- [ ] 实现渐变组件（LinearGradient, RadialGradient, SweepGradient, TwoPointConicalGradient, FractalNoise, Turbulence）
- [ ] 实现效果组件（BoxShadow, Shadow, Blend）

### 8.3 Phase 3：高级组件实现

- [ ] 实现着色器组件（ColorShader, ImageShader, Shader, RuntimeShader）
- [ ] 实现滤镜组件（Blur, DisplacementMap, Offset, Morphology, ColorMatrix, BlurMask）
- [ ] 实现路径效果（DiscretePathEffect, DashPathEffect, CornerPathEffect, Path1DPathEffect, Path2DPathEffect, Line2DPathEffect）
- [ ] 实现高级组件（Atlas, Vertices, Picture）

### 8.4 Phase 4：测试验证

- [ ] Android 平台测试
- [ ] iOS 平台测试
- [ ] HarmonyOS 平台测试
- [ ] 性能对比测试

### 8.5 Phase 5：文档与集成

- [ ] 完成 SPEC.md 规范文档
- [ ] 在 apps/oa 中集成演示
- [ ] 更新 README.md 使用文档

---

## 9. 注意事项

1. **平台判断**：使用 `Platform.OS === 'harmony'` 判断鸿蒙平台
2. **Import 语句**：保持使用 `@shopify/react-native-skia`，Metro 会自动平台选择
3. **手动 Link**：v2.0.0 版本不支持 Autolink，需要手动配置
4. **transform 差异**：Skia 中 transform 原点是左上角，而非 React Native 的中心
5. **性能优化**：避免在 Canvas 内创建过多嵌套 Group
6. **调试模式**：可通过 `debug` 属性开启调试

---

## 10. HarmonyOS 手动配置

由于 `@react-native-ohos/react-native-skia` v2.0.0 **不支持 Autolink**，需要进行以下手动配置：

### 10.1 添加 overrides

在工程根目录的 `oh-package.json5` 添加 overrides 字段：

```json
{
  ...
  "overrides": {
    "@rnoh/react-native-openharmony": "./react_native_openharmony"
  }
}
```

### 10.2 引入原生端代码

打开 `entry/oh-package.json5`，添加 har 依赖：

```json
"dependencies": {
    "@rnoh/react-native-openharmony": "file:../react_native_openharmony",
    "@react-native-ohos/react-native-skia": "file:../../node_modules/@react-native-ohos/react-native-skia/harmony/skia.har"
  }
```

点击右上角 `sync` 按钮或执行：

```bash
cd entry && ohpm install
```

### 10.3 配置 CMakeLists.txt

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```diff
set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")

+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-skia/src/main/cpp" ./skia)
```

在 `target_link_libraries` 中添加：

```diff
+ target_link_libraries(rnoh_app PUBLIC rnoh_skia)
```

### 10.4 配置 PackageProvider.cpp

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```diff
+ #include "SkiaPackage.h"

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
        std::make_shared<RNOHGeneratedPackage>(ctx),
+       std::make_shared<SkiaPackage>(ctx),
    };
}
```

### 10.5 在 ArkTS 侧注册组件

找到 `function buildCustomRNComponent()`，添加：

```diff
+ import { RNCSkiaDomView, SKIA_DOM_VIEW_TYPE } from '@react-native-ohos/react-native-skia';

if (ctx.componentName === SKIA_DOM_VIEW_TYPE) {
+   RNCSkiaDomView({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}
```

在 `arkTsComponentNames` 数组中添加：

```diff
const arkTsComponentNames: Array<string> = [
+   SKIA_DOM_VIEW_TYPE
];
```

### 10.6 在 ArkTS 侧注册 Package

打开 `entry/src/main/ets/RNPackagesFactory.ts`，添加：

```diff
+ import {RNSkiaPackage} from '@react-native-ohos/react-native-skia/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
+   new RNSkiaPackage(ctx)
  ];
}
```

### 10.7 依赖版本对照表

| 三方库版本 | 支持 RN 版本 | Autolink | 编译 API |
|-----------|-------------|----------|----------|
| ~2.0.0 | 0.82.* | 否 | API12+ |
| ~1.4.0 | 0.77.* | 否 | API12+ |
| ~1.3.9 | 0.72.* | 是 | API12+ |

### 10.8 版本差异说明

| 功能 | v2.0.0 说明 |
|------|-------------|
| mode | Canvas 的 mode 属性已废弃 |
| onLayout | Canvas 的 onLayout 回调已废弃 |
| zIndex | Group 组件新增 zIndex 属性 |
| uniforms | RuntimeShader 新增 uniforms 属性 |
| colorspace | Canvas 新增 colorspace 属性（仅 iOS） |
| opaque | Canvas 新增 opaque 属性（仅 Android） |
| debug | Canvas 新增 debug 属性 |

---

## 11. 相关资源

- [@shopify/react-native-skia 官方文档](https://shopify.github.io/react-native-skia/)
- [@react-native-ohos/react-native-skia GitHub](https://github.com/react-native-oh-library/react-native-skia)
- [鸿蒙 React Native 适配指南](https://gitcode.com/openharmony-sig/ohos_react_native)
- [Autolink 框架指导文档](https://gitcode.com/openharmony-sig/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md)
