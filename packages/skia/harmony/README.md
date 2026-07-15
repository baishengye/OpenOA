# @itc/skia HarmonyOS 配置指南

本目录包含 `@itc/skia` 包在 HarmonyOS 平台上的配置说明。

## 版本信息

| 属性 | 值 |
|------|-----|
| 包版本 | ~2.0.0 |
| 支持 RN 版本 | 0.82.* / 0.77.* / 0.72.* |
| 编译 API 版本 | API12+ |
| Autolink | v1.3.9 支持，其他版本需手动配置 |

## 安装

### 依赖安装

```bash
npm install @react-native-ohos/react-native-skia
# 或
yarn add @react-native-ohos/react-native-skia
```

### 版本兼容性

| RN 版本 | Skia 版本 | Autolink | ManualLink |
|---------|-----------|----------|------------|
| 0.82.* | ~2.0.0 | 否 | 需要 |
| 0.77.* | ~1.4.0 | 否 | 需要 |
| 0.72.* | ~1.3.9 | 是 | 不需要 |

## ManualLink 配置步骤（v2.0.0 / v1.4.0）

### 1. 配置 oh-package.json5

在工程根目录的 `oh-package.json5` 添加 overrides 字段：

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "./react_native_openharmony"
  }
}
```

### 2. 引入原生端代码

打开 `entry/oh-package.json5`，添加依赖：

```json
"dependencies": {
  "@rnoh/react-native-openharmony": "file:../react_native_openharmony",
  "@react-native-ohos/react-native-skia": "file:../../node_modules/@react-native-ohos/react-native-skia/harmony/skia.har"
}
```

执行同步：

```bash
cd entry
ohpm install
```

### 3. 配置 CMakeLists.txt

打开 `entry/src/main/cpp/CMakeLists.txt`：

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")
```

```diff
# RNOH_BEGIN: manual_package_linking_1
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-skia/src/main/cpp" ./skia)
# RNOH_END: manual_package_linking_1
```

```diff
# RNOH_BEGIN: manual_package_linking_2
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
+ target_link_libraries(rnoh_app PUBLIC rnoh_skia)
# RNOH_END: manual_package_linking_2
```

### 4. 配置 PackageProvider.cpp

打开 `entry/src/main/cpp/PackageProvider.cpp`：

```diff
#include "RNOH/PackageProvider.h"
#include "generated/RNOHGeneratedPackage.h"
#include "SamplePackage.h"
+ #include "SkiaPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
  return {
    std::make_shared<RNOHGeneratedPackage>(ctx),
    std::make_shared<SamplePackage>(ctx),
+   std::make_shared<SkiaPackage>(ctx),
  };
}
```

### 5. 配置 ArkTS 侧

找到 `function buildCustomRNComponent()`（通常位于 `entry/src/main/ets/pages/index.ets` 或 `entry/src/main/ets/rn/LoadBundle.ets`）：

```diff
+ import { RNCSkiaDomView, SKIA_DOM_VIEW_TYPE } from '@react-native-ohos/react-native-skia';

@Builder
export function buildCustomRNComponent(ctx: ComponentBuilderContext) {
  ...
+ if (ctx.componentName === SKIA_DOM_VIEW_TYPE) {
+   RNCSkiaDomView({
+     ctx: ctx.rnComponentContext,
+     tag: ctx.tag
+   })
+ }
  ...
}
```

在 `arkTsComponentNames` 数组添加组件名：

```diff
const arkTsComponentNames: Array<string> = [
  SampleView.NAME,
  GeneratedSampleView.NAME,
  PropsDisplayer.NAME,
+ SKIA_DOM_VIEW_TYPE
];
```

### 6. 配置 RNPackagesFactory

打开 `entry/src/main/ets/RNPackagesFactory.ts`：

```diff
+ import { RNSkiaPackage } from '@react-native-ohos/react-native-skia/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new SamplePackage(ctx),
+   new RNSkiaPackage(ctx)
  ];
}
```

## 使用示例

```tsx
import { Canvas, Circle, Group } from '@itc/skia';

function App() {
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

## 平台检测

```tsx
import { isHarmonyOS, isSkiaSupported } from '@itc/skia';

if (isHarmonyOS()) {
  console.log('Running on HarmonyOS');
}

if (isSkiaSupported()) {
  console.log('Skia is supported on this platform');
}
```

## 组件支持状态

### 完整支持（HarmonyOS Support: yes）

| 组件类别 | 组件 |
|---------|------|
| 容器 | Canvas, Group |
| 形状 | Circle, Rect, RoundedRect, Oval, Line, Points, Path, DiffRect, Patch, Box |
| 渐变 | LinearGradient, RadialGradient, SweepGradient, TwoPointConicalGradient, FractalNoise, Turbulence |
| 效果 | BoxShadow, Shadow, Blend |
| 着色器 | ColorShader, ImageShader, Shader, RuntimeShader |
| 滤镜 | Blur, DisplacementMap, Offset, Morphology, ColorMatrix, BlurMask |
| 路径效果 | DiscretePathEffect, DashPathEffect, CornerPathEffect, Path1DPathEffect, Path2DPathEffect, Line2DPathEffect |
| 高级 | Atlas, Vertices, Picture |

### 暂不支持

| 组件 | 说明 | 相关 Issue |
|------|------|-----------|
| Text | 文本组件暂不支持 | [issue#5](https://github.com/react-native-oh-library/react-native-skia/issues/5) |
| Video | 视频组件暂不支持 | [issue#6](https://github.com/react-native-oh-library/react-native-skia/issues/6) |
| Image | 图片组件暂不支持 | [issue#7](https://github.com/react-native-oh-library/react-native-skia/issues/7) |

## 版本差异说明

| 功能 | v2.0.0 说明 |
|------|-------------|
| mode | Canvas 的 mode 属性已废弃 |
| onLayout | Canvas 的 onLayout 回调已废弃 |
| zIndex | Group 组件新增 zIndex 属性 |
| uniforms | RuntimeShader 新增 uniforms 属性 |
| colorspace | Canvas 新增 colorspace 属性（仅 iOS） |
| opaque | Canvas 新增 opaque 属性（仅 Android） |

## 相关资源

- [官方文档](./官方文档.md) - 完整的 API 文档和属性说明
- [@react-native-ohos/react-native-skia GitHub](https://github.com/react-native-oh-library/react-native-skia)
- [@react-native-ohos/react-native-skia npm](https://www.npmjs.com/package/@react-native-ohos/react-native-skia)
- [安装指南](https://gitcode.com/openharmony-sig/ohos_react_native/blob/master/docs/zh-cn/tgz-usage.md)
