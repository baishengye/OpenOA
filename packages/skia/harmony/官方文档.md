> 模板版本：v0.4.0

<p align="center">
  <h1 align="center"> <code>@shopify/react-native-skia</code> </h1>
</p>

本项目基于 [@shopify/react-native-skia](https://github.com/Shopify/react-native-skia) 开发。

该第三方库的仓库在 Github，且支持直接从 npm 下载，新的包名为：`@react-native-ohos/react-native-skia` 版本所属关系如下：

| 三方库名称 | 三方库版本   | 发布信息                                                                         | 支持RN版本 | Autolink | 编译API版本 | 社区基线版本 | npm地址                      
| ------------ |---------|---------------------------------------------------------------------------------------------|----------------------|--------------------|-------------------|----------------------------|----------------------------------|
|@react-native-ohos/react-native-skia| ~2.0.0 | [Github Releases](https://github.com/react-native-oh-library/react-native-skia/releases) | 0.82.*                | 否                  | API12+                   | 2.4.14  | [Npm Address](https://www.npmjs.com/package/@react-native-ohos/react-native-skia)|
|@react-native-ohos/react-native-skia| ~1.4.0 | [Github Releases](https://github.com/react-native-oh-library/react-native-skia/releases) | 0.77.*               | 否                  | API12+                   | 1.3.7 | [Npm Address](https://www.npmjs.com/package/@react-native-ohos/react-native-skia)|
|@react-native-ohos/react-native-skia| ~1.3.9 | [Gitcode Releases](https://gitcode.com/openharmony-sig/rntpc_react-native-skia/releases)          | 0.72.*               | 是                  |API12+           | 1.3.7   | [Npm Address](https://www.npmjs.com/package/@react-native-ohos/react-native-skia)|
|@react-native-oh-tpl/react-native-skia| <= 1.3.8@deprecated   | [Github Releases(deprecated)](https://github.com/react-native-oh-library/react-native-skia/releases) | 0.72.*               | 否                  | API12+            | 1.3.7                 | [Npm Address](https://www.npmjs.com/package/@react-native-oh-tpl/react-native-skia) |


## 安装与使用

进入到工程目录并输入以下命令：


<!-- tabs:start -->

#### **npm**

```bash

npm install @react-native-ohos/react-native-skia
```

#### **yarn**

```bash

yarn add @react-native-ohos/react-native-skia
```

<!-- tabs:end -->

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

```js
import React from "react";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";

const App = () => {
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
};

export default App;
```

## Link

|                                      | 是否支持autolink | RN框架版本 |
|--------------------------------------|-----------------|------------|
| ~2.0.0                               |  No              |  0.82     |
| ~1.4.0                               |  No              |  0.77     |
| ~1.3.9                               |  Yes             |  0.72     |
| <= 1.3.8@deprecated            |  No              |  0.72     |

使用AutoLink的工程需要根据该文档配置，Autolink框架指导文档：https://gitcode.com/openharmony-sig/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

如您使用的版本支持 Autolink，并且工程已接入 Autolink，可跳过ManualLink配置。
<details>
  <summary>ManualLink: 此步骤为手动配置原生依赖项的指导</summary>

首先需要使用 DevEco Studio 打开项目里的 HarmonyOS 工程 `harmony`。

### 1.在工程根目录的 `oh-package.json5` 添加 overrides 字段

```json
{
  ...
  "overrides": {
    "@rnoh/react-native-openharmony" : "./react_native_openharmony"
  }
}
```

### 2.引入原生端代码

目前有两种方法：

1. 通过 har 包引入（在 IDE 完善相关功能后该方法会被遗弃，目前首选此方法）；
2. 直接链接源码。

方法一：通过 har 包引入（推荐）

> [!TIP] har 包位于三方库安装路径的 `harmony` 文件夹下。

打开 `entry/oh-package.json5`，添加以下依赖


```json
"dependencies": {
    "@rnoh/react-native-openharmony": "file:../react_native_openharmony",
    "@react-native-ohos/react-native-skia": "file:../../node_modules/@react-native-ohos/react-native-skia/harmony/skia.har"
  }
```

点击右上角的 `sync` 按钮

或者在终端执行：

```bash
cd entry
ohpm install
```

方法二：直接链接源码

> [!TIP] 如需使用直接链接源码，请参考[直接链接源码说明](/zh-cn/link-source-code.md)

### 3.配置 CMakeLists 和引入 SkiaPackage

> 若使用的是 <= 1.3.8 版本，请跳过本章。

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")
set(LOG_VERBOSITY_LEVEL 1)
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(CMAKE_CXX_FLAGS "-fstack-protector-strong -Wl,-z,relro,-z,now,-z,noexecstack -s -fPIE -pie")
set(WITH_HITRACE_SYSTRACE 1) # for other CMakeLists.txt files to use
add_compile_definitions(WITH_HITRACE_SYSTRACE)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: manual_package_linking_1
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)

+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-skia/src/main/cpp" ./skia)

# RNOH_END: manual_package_linking_1

file(GLOB GENERATED_CPP_FILES "./generated/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: manual_package_linking_2
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
+ target_link_libraries(rnoh_app PUBLIC rnoh_skia)
# RNOH_END: manual_package_linking_2
```

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

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
+       std::make_shared<SkiaPackage>(ctx),
    };
}
```

### 4.在 ArkTs 侧引入 SkiaDomView 组件

找到 `function buildCustomRNComponent()`，一般位于 `entry/src/main/ets/pages/index.ets` 或 `entry/src/main/ets/rn/LoadBundle.ets`，添加：

```diff
  ...
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
...
```

> [!TIP] 本库使用了混合方案，需要添加组件名。

在`entry/src/main/ets/pages/index.ets` 或 `entry/src/main/ets/rn/LoadBundle.ets` 找到常量 `arkTsComponentNames` 在其数组里添加组件名

```diff
const arkTsComponentNames: Array<string> = [
  SampleView.NAME,
  GeneratedSampleView.NAME,
  PropsDisplayer.NAME,
+ SKIA_DOM_VIEW_TYPE
  ];
```

### 5.在 ArkTs 侧引入 RNSkiaPackage

打开 `entry/src/main/ets/RNPackagesFactory.ts`，添加：

```diff
  ...

+ import {RNSkiaPackage} from '@react-native-ohos/react-native-skia/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new SamplePackage(ctx),
+   new RNSkiaPackage(ctx)
  ];
}
```
</details>

## 运行

点击右上角的 `sync` 按钮

或者在终端执行：

```bash
cd entry
ohpm install
```

然后编译、运行即可。

## 约束与限制

### 兼容性


要使用此库，需要使用正确的 React-Native 和 RNOH 版本。另外，还需要使用配套的 DevEco Studio 和 手机 ROM。

在以下版本验证通过：

1. RNOH: 0.72.96; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
2. RNOH: 0.72.33; SDK: HarmonyOS NEXT B1; IDE: DevEco Studio: 5.0.3.900; ROM: Next.0.0.71;
3. RNOH: 0.77.18; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
4. RNOH: 0.82.1; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;

## 组件

### Canvas

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                                                                                                                            | Type                     | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | -------- | ----------- | ----------------- |
| style    | 视图样式                                                                                                                                             | ViewStyle                | no       | android/ios | yes               |
| ref      | 指向 SkiaView 对象的引用                                                                                                                       | Ref<SkiaView>            | no       | android/ios | yes               |
| mode <sup>deprecated from 2.0.0 </sup>    | 控制重绘频率。默认情况下，仅当绘图树或动画值发生变化时，Canvas 才会更新。当 mode="continuous" 时，Canvas 会在每一帧都重新绘制 | default \| continuous    | no       | android/ios | yes               |
| onSize   | 与 Canvas 尺寸绑定的 Reanimated 值                                                                                             | SharedValue<Size>        | no       | android/ios | yes               |
| onLayout <sup>deprecated from 2.0.0</sup> | 在挂载时和布局变化时触发的回调函数                                                                    | NativeEvent<LayoutEvent> | no       | android/ios | yes               |
| debug <sup>2.0.0</sup> | 调试开关                                                                                                                 | boolean | no       | android/ios | yes               |
| colorspace <sup>2.0.0</sup> | 色彩空间                                                                                                                 | "p3"/"srgb" | no       | ios | yes               |
| opaque <sup>2.0.0</sup> | 控制texture和surface渲染模式之间的切                                                                                                                 | boolean | no       | android | yes               |

### Group

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name       | Description                                                                                                                                                                                                            | Type              | Required | Platform    | HarmonyOS Support |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------- | ----------- | ----------------- |
| transform  | 变换属性，API 与 React Native 相同，但默认变换原点不同：在 React Native 中是对象中心，在 Skia 中是左上角. | Transform2d       | no       | android/ios | yes               |
| origin     | 设置变换的原点，此属性不会被子组件继承                                                                                                                                 | Point             | no       | android/ios | yes               |
| clip       | 用于裁剪子组件的矩形、圆角矩形或路径.                                                                                                                                                     | RectOrRRectOrPath | no       | android/ios | yes               |
| invertClip | 反转裁剪区域：裁剪区域外的部分将显示，内部部分将被隐藏                                                                                                                | boolean           | no       | android/ios | yes               |
| layer      | 将子组件绘制为位图，并应用 Paint 提供的效果                                                                                                                                          | RefObject<Paint>  | no       | android/ios | yes               |
| zIndex <sup>2.0.0</sup>     | 子元素的绘制层级顺序                                                                                                            | number  | no       | android/ios | yes               |

### Path

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Description                                                                                                                                                                                                                                      | Type             | Required | Platform    | HarmonyOS Support |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | -------- | ----------- | ----------------- |
| path   | 要绘制的路径。可以是使用[SVG路径表示法的字符串](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#line_commands)或者使用 Skia.Path.Make() 创建的对象.                                                         | SkPath`or`string | no       | android/ios | yes               |
| start  | 裁剪路径的起始位置，取值范围为 [0, 1]，默认值为 0.                                                                                                                                                                      | number           | no       | android/ios | yes               |
| end    | 裁剪路径的结束位置，取值范围为 [0, 1]，默认值为 1.                                                                                                                                                                        | number           | no       | android/ios | yes               |
| stroke | 将路径转换为描边效果。 | StrokeOptions    | no       | android/ios | yes               |

### Rect

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Description              | Type   | Required | Platform    | HarmonyOS Support |
| ------ | ------------------------ | ------ | -------- | ----------- | ----------------- |
| x      | X 坐标.            | number | yes      | android/ios | yes               |
| y      | Y 坐标.            | number | yes      | android/ios | yes               |
| width  | 矩形的宽度.  | number | yes      | android/ios | yes               |
| height | 矩形的高度. | number | yes      | android/ios | yes               |

### RoundedRect

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Description                                        | Type             | Required | Platform    | HarmonyOS Support |
| ------ | -------------------------------------------------- | ---------------- | -------- | ----------- | ----------------- |
| x      | X 坐标.                                      | SkPath`or`string | yes      | android/ios | yes               |
| y      | Y 坐标.                                      | number           | yes      | android/ios | yes               |
| width  | 矩形的宽度.                            | number           | yes      | android/ios | yes               |
| height | 矩形的高度.                           | StrokeOptions    | yes      | android/ios | yes               |
| r      | 拐角半径。如果指定，则默认为“ry”或0. | number`or`Vector | no       | android/ios | yes               |

### DiffRect

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name  | Description      | Type          | Required | Platform    | HarmonyOS Support |
| ----- | ---------------- | ------------- | -------- | ----------- | ----------------- |
| outer | 外矩形. | Rect \| RRect | yes      | android/ios | yes               |
| inner | 内部矩形. | Rect \| RRect | yes      | android/ios | yes               |

### Line

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description  | Type  | Required | Platform    | HarmonyOS Support |
| ---- | ------------ | ----- | -------- | ----------- | ----------------- |
| p1   | 起点. | Point | yes      | android/ios | yes               |
| p2   | 终点.   | Point | yes      | android/ios | yes               |

### Points

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Description                                                                                                                                                | Type      | Required | Platform    | HarmonyOS Support |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------- | ----------- | ----------------- |
| points | 要抽取的点数.                                                                                                                                            | Point     | yes      | android/ios | yes               |
| mode   | 这些点应该如何连接。可以是“点”（无连接）、“线”（连接成对的点）或“多边形”（连接线）。默认值为`点`. | PointMode | yes      | android/ios | yes               |

### Circle

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description  | Type   | Required | Platfor     | HarmonyOS Support |
| ---- | ------------ | ------ | -------- | ----------- | ----------------- |
| cx   | 起点. | number | yes      | android/ios | yes               |
| cy   | 终点   | number | yes      | android/ios | yes               |
| r    | 半径.      | number | yes      | android/ios | yes               |

### Oval

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Description                             | Type   | Required | Platfor     | HarmonyOS Support |
| ------ | --------------------------------------- | ------ | -------- | ----------- | ----------------- |
| x      | 边界矩形的X坐标. | number | yes      | android/ios | yes               |
| y      | 边界矩形的Y坐标. | number | yes      | android/ios | yes               |
| width  | 包围矩形的宽度。.        | number | yes      | android/ios | yes               |
| height | 包围矩形的宽度.       | number | yes      | android/ios | yes               |

### Atlas

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name       | Type              | Description                                                       | Required | android/ios | HarmonyOS Support |
| ---------- | ----------------- | ----------------------------------------------------------------- | -------- | ----------- | ----------------- |
| image      | `SkImage or null` | 图集图像，包含所有精灵(sprite)的源图片                              | yes      | android/ios | yes               |
| sprites    | `SkRect[]`        | 定义图集中每个精灵的位置和大小，使用矩形区域坐标.                                    | yes      | android/ios | yes               |
| transforms | `RSXform[]`       | 应用于每个精灵的旋转和缩放变换矩阵.          | yes      | android/ios | yes               |
| colors     | `SkColor[]`       | 可选属性，用于与精灵混合的颜色数组                        | no       | android/ios | yes               |
| blendMode  | `BlendMode`       | 可选属性，定义精灵和颜色混合时使用的混合模式. | no       | android/ios | yes               |

### Vertices

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name      | Type         | Description                                                                                                                                                           | Required | android/ios | HarmonyOS Support |
| --------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ----------------- |
| vertices  | `Point[]`    | 要绘制的顶点坐标数组，定义图形的几何形状                                                                                                                                                      | yes      | android/ios | yes               |
| mode      | `VertexMode` | 定义顶点如何连接形成三角形，可以是 triangles(三角形)、trianglesStrip(三角形带) 或 triangleFan(三角形扇)，默认为 triangles 模式                                                                                         | no       | android/ios | yes               |
| indices   | `number[]`   | 形成三角形的顶点索引数组。如果不提供，将按照顶点顺序连接。使用此属性可以避免重复顶点定义，优化性能. | no       | android/ios | yes               |
| textures  | `Point[]`.   | [纹理贴图](https://en.wikipedia.org/wiki/Texture_mapping). 纹理映射坐标，纹理由 paint 属性提供的着色器定义.                                                    | yes      | android/ios | yes               |
| colors    | `string[]`   | 可选属性，与每个顶点关联的颜色数组                                                                                                                       | no       | android/ios | yes               |
| blendMode | `BlendMode`  | 如果提供了 colors 属性，颜色将使用此混合模式与 paint 进行混合。                    | no       | android/ios | yes               |

### Patch

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name      | Type             | Description                                                  | Required | android/ios | HarmonyOS Support |
| --------- | ---------------- | ------------------------------------------------------------ | -------- | ----------- | ----------------- |
| patch     | `CubicBezier[4]` | 指定四条立方贝塞尔曲线，从左上角开始按顺时针方向排列，每条曲线共享第四个控制点。最后一条贝塞尔曲线结束于第一条曲线的起点，形成一个闭合的曲面. | yes      | android/ios | yes               |
| textures  | `Point[]`.       | [纹理贴图](https://en.wikipedia.org/wiki/Texture_mapping). 纹理映射坐标，纹理由 paint 属性提供的着色器定义，用于在曲面上的贴图 | yes      | android/ios | yes               |
| colors    | `string[]`       | 可选属性，与曲面每个角点关联的颜色数组，用于顶点着色              | no       | android/ios | yes               |
| blendMode | `BlendMode`      | 如果提供了 colors 属性，颜色将使用此混合模式与 paint 进行混合。 | no       | android/ios | yes               |

### Picture

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name    | Type      | Description       | Required | android/ios | HarmonyOS Support |
| ------- | --------- | ----------------- | -------- | ----------- | ----------------- |
| picture | SkPicture | 指定要渲染的图片对象 | yes      | android/ios | yes               |

### Box

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Type              | Description               | Required | android/ios | HarmonyOS Support |
| ---- | ----------------- | ------------------------- | -------- | ----------- | ----------------- |
| box  | SkRRect \| SkRect | 定义 Box 组件在画布上的目标绘制区域和形状 | yes      | android/ios | yes               |

### BoxShadow

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Type    | Description                                     | Required | android/ios | HarmonyOS Support |
| ------ | ------- | ----------------------------------------------- | -------- | ----------- | ----------------- |
| dx     | number  | 阴影在 X 轴方向的偏移量.                     | no       | android/ios | yes               |
| dy     | number  | 阴影在 Y 轴方向的偏移量.                     | no       | android/ios | yes               |
| spread | number  | 阴影的扩展距离，正值会使阴影变大，负值会使阴影变小 | no       | android/ios | yes               |
| blur   | number  | 阴影的模糊半径，值越大阴影越模糊                  | yes      | android/ios | yes               |
| color  | Color   | 阴影的颜色，支持多种颜色表示格式                    | no       | android/ios | yes               |
| inner  | boolean | 是否为内阴影，内阴影会出现在元素边框盒内部      | no       | android/ios | yes               |

### Shader

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Type                                                                       | Description                   | Required | android/ios | HarmonyOS Support |
| -------- | -------------------------------------------------------------------------- | ----------------------------- | -------- | ----------- | ----------------- |
| source   | RuntimeEffect                                                              | 编译后的着色器对象              | yes      | android/ios | yes               |
| uniforms | { [name: string]: number \| Vector \| Vector[] \| number[] \| number[][] } | 传递给着色器的统一变量值，用于动态控制着色器的外观和行为                | yes      | android/ios | yes               |
| children | Shader                                                                     | 用作统一值的其他着色器，支持着色器嵌套组合 | yes      | android/ios | yes               |

### ImageShader

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name      | Description                                                                                                              | Type              | Required | android/ios | HarmonyOS Support |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------- | -------- | ----------- | ----------------- |
| image     | 图像实例，作为着色器的纹理源.                                                                                                          | SkImage           | yes      | android/ios | yes               |
| tx        | X轴方向的平铺模式，支持 clamp(钳制)、repeat(重复)、mirror(镜像)、decal(贴花)四种模式.                                                                          | TileMode shaders  | no       | android/ios | yes               |
| ty        | Y轴方向的平铺模式，支持与 tx 相同的四种模式.                                                                          | TileMode values   | no       | android/ios | yes               |
| fm        | 过滤模式，控制图像缩放时的采样方式，支持 linear(线性) 或 nearest(最近邻).                                                                                            | FilterMode values | no       | android/ios | yes               |
| mm        | Mipmap模式，支持 none(无) 或 last(最后).                                                                                                 | MipmapMode        | no       | android/ios | yes               |
| fit       | 计算变换矩阵以适应由 fitRect 定义的矩形区域.                                           | Fit               | no       | android/ios | yes               |
| rect      | 目标矩形，通过 fit 属性计算变换矩阵.                                 | SkRect            | no       | android/ios | yes               |
| transform | 变换属性，用于设置变换的起点，此属性不会被子组件继承. | Transforms2d      | no       | android/ios | yes               |

### Gradients 公共属性

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name      | Description                                                                                                                                                                                                                                                                                            | Type         | Required | Platform    | HarmonyOS Support |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | -------- | ----------- | ----------------- |
| colors    | 渐变的颜色数组，定义从起点到终点分布的颜色序列.                                                                                                                                                                                                                                                        | string[]     | yes      | android/ios | yes               |
| positions | 颜色的相对位置数组，取值范围为0-1。如果提供，其长度必须与 colors 数组相同.                                                                                                                                                                                                                | number[]     | no       | android/ios | yes               |
| mode      | 平铺模式，支持 clamp(钳制)、repeat(重复)、mirror(镜像)、decal(贴花)四种类型.                                                                                                                                                                                                                                                        | TileMode     | no       | android/ios | yes               |
| flags     | 颜色插值标志位。默认情况下，渐变会在非预乘颜色空间进行插值，然后对结果进行预乘。将此值设为1时，渐变会先预乘颜色再进行插值.                                                                      | number       | no       | android/ios | yes               |
| transform | 变换属性，与 React Native 中的同名属性基本相同，但有一个重要区别：在 React Native 中变换原点是对象中心，而在 Skia 中是对象的左上角位置. | Transforms2d | no       | android/ios | yes               |

### LinearGradient

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name  | Description                     | Type  | Required | Platform    | HarmonyOS Support |
| ----- | ------------------------------- | ----- | -------- | ----------- | ----------------- |
| start | 渐变的起始位置. | Point | yes      | android/ios | yes               |
| end   | 渐变的结束位置.   | Point | yes      | android/ios | yes               |

### RadialGradient

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description             | Type   | Required | Platform    | HarmonyOS Support |
| ---- | ----------------------- | ------ | -------- | ----------- | ----------------- |
| c    | 渐变的中心点坐标. | Point  | yes      | android/ios | yes               |
| r    | 渐变的半径大小，控制色彩从中心向外扩散的范围. | number | yes      | android/ios | yes               |

### TwoPointConicalGradient

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Description                 | Type   | Required | Platform    | HarmonyOS Support |
| ------ | --------------------------- | ------ | -------- | ----------- | ----------------- |
| start  | 起始圆的圆心坐标. | Point  | yes      | android/ios | yes               |
| startR | 起始圆的半径大小. | number | yes      | android/ios | yes               |
| end    | 结束圆的圆心坐标.   | number | yes      | android/ios | yes               |
| endR   | 结束圆的半径大小.   | number | yes      | android/ios | yes               |

### SweepGradient

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name  | Description                            | Type   | Required | Platform    | HarmonyOS Support |
| ----- | -------------------------------------- | ------ | -------- | ----------- | ----------------- |
| c     | 渐变的中心点坐标.                | Point  | yes      | android/ios | yes               |
| start | 渐变起始角度（单位为度），默认值为 0. | number | no       | android/ios | yes               |
| end   | 渐变结束角度（单位为度），默认值为 360. | number | no       | android/ios | yes               |

### FractalNoise

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name       | Description                                                                                                                    | Type   | Required | Platform    | HarmonyOS Support |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ | -------- | ----------- | ----------------- |
| freqX      | X方向的基础频率，取值范围为[0.0, 1.0]                                                                            | number | yes      | android/ios | yes               |
| freqY      | Y方向的基础频率，取值范围为[0.0, 1.0]                                                                            | number | yes      | android/ios | yes               |
| octaves    | 噪波的八度数量，控制细节层次                                                                                                                        | number | no       | android/ios | yes               |
| seed       | 随机种子值，用于生成可重复的噪波图案                                                                                                                           | number | no       | android/ios | yes               |
| tileWidth  | 如果此值和tileHeight都非零，将调整频率使噪波在指定宽度下可平铺. | number | no       | android/ios | yes               |
| tileHeight | 如果此值和tileWidth都非零，将调整频率使噪波在指定高度下可平铺.  | number | no       | android/ios | yes               |

### Turbulence

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name       | Description                                                                                                                    | Type   | Required | Platform    | HarmonyOS Support |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ | -------- | ----------- | ----------------- |
| freqX      | X方向的基础频率，取值范围为[0.0, 1.0]                                                                            | number | yes      | android/ios | yes               |
| freqY      | Y方向的基础频率，取值范围为[0.0, 1.0]                                                                            | number | yes      | android/ios | yes               |
| octaves    | 噪波的八度数量，控制细节层次                                                                                                                        | number | no       | android/ios | yes               |
| seed       | 随机种子值，用于生成可重复的噪波图案                                                                                                                           | number | no       | android/ios | yes               |
| tileWidth  | 如果此值和tileHeight都非零，将调整频率使噪波在指定宽度下可平铺. | number | no       | android/ios | yes               |
| tileHeight | 如果此值和tileWidth都非零，将调整频率使噪波在指定高度下可平铺.  | number | no       | android/ios | yes               |

### Blend

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                          | Type      | Required | Platform    | HarmonyOS Support |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------- | ----------- | ----------------- |
| mode     | 设置混合模式，即源颜色与目标颜色的组合方式，支持以下丰富的模式选项：clear、src、dst、srcOver、dstOver、srcIn、dstIn、srcOut、dstOut、srcATop、dstATop、xor、plus、modulate、screen、overlay、darken、lighten、colorDodge、colorBurn、hardLight、softLight、difference、exclusion、multiply、hue、saturation、color、luminosity. | BlendMode | yes      | android/ios | yes               |
| children | 要混合的着色器内容                                                                                                                                                                                                                                                                                                                                                                                                                                     | ReactNode | yes      | android/ios | yes               |

### ColorShader

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name  | Description | Type   | Required | Platform    | HarmonyOS Support |
| ----- | ----------- | ------ | -------- | ----------- | ----------------- |
| color | 颜色       | string | yes      | android/ios | yes               |

### DiscretePathEffect

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name      | Description                                                   | Type       | Required | Platform    | HarmonyOS Support |
| --------- | ------------------------------------------------------------- | ---------- | -------- | ----------- | ----------------- |
| length    | 定义路径子分段的长度.                                    | number     | yes      | android/ios | yes               |
| deviation | 限制端点移动的最大偏移量.                       | number     | yes      | android/ios | yes               |
| seed      | 修改随机性，具体可参考 SkDiscretePathEffect.h 文件. | number     | no       | android/ios | yes               |
| children  | 可选的其他路径效果，可以叠加应用.                                | PathEffect | no       | android/ios | yes               |

### DashPathEffect

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name      | Description                                                                                                                             | Type       | Required | Platform    | HarmonyOS Support |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- | ----------- | ----------------- |
| intervals | 定义虚线样式的间隔数组，数组元素个数必须为偶数。其中‌偶数索引‌（0、2、4...）指定"开启"（实线）段的长度，‌奇数索引‌（1、3、5...）指定"关闭"（间隔）段的长度. | number[]   | yes      | android/ios | yes               |
| phase     | 在间隔数组中的偏移量，默认为 0.                                                                                         | number     | no       | android/ios | yes               |
| children  | 可选的其他路径效果，可以叠加应用.                                                                                                          | PathEffect | no       | android/ios | yes               |

### CornerPathEffect

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                    | Type       | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------ | ---------- | -------- | ----------- | ----------------- |
| r        | 圆角半径.                        | number     | yes      | android/ios | yes               |
| children | 可选的其他路径效果，可以叠加应用. | PathEffect | no       | android/ios | yes               |

### Path1DPathEffect

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                                                     | Type              | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------------------------------------------- | ----------------- | -------- | ----------- | ----------------- |
| path     | 要复制的路径图形，作为重复绘制的基本单元                                                    | PathDef           | yes      | android/ios | yes               |
| advance  | 各个路径实例之间的间距                                             | number            | yes      | android/ios | yes               |
| phase    | 沿着路径的初始位置距离（按 advance 取模）                  | number            | yes      | android/ios | yes               |
| style    | 在每个点如何变换路径（基于当前位置和切线方向） | Path1DEffectStyle | yes      | android/ios | yes               |
| children | 可选的其他路径效果，可以叠加应用.                                                  | PathEffect        | no       | android/ios | yes               |

### Path2DPathEffect

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                   | Type       | Required | Platform    | HarmonyOS Support |
| -------- | ----------------------------- | ---------- | -------- | ----------- | ----------------- |
| path     | 用作效果的基本路径图形，将在目标路径上重复绘制               | PathDef    | yes      | android/ios | yes               |
| matrix   | 应用于路径图形的变换矩阵，控制每个实例的缩放、旋转和平移效果          | SkMatrix   | yes      | android/ios | yes               |
| children | 可选的其他路径效果，可以叠加应用 | PathEffect | no       | android/ios | yes               |

### Line2DPathEffect

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                   | Type       | Required | Platform    | HarmonyOS Support |
| -------- | ----------------------------- | ---------- | -------- | ----------- | ----------------- |
| width    | 用作效果的路径图形               | PathDef    | yes      | android/ios | yes               |
| matrix   | 应用于路径图形的变换矩阵          | IMatrix    | yes      | android/ios | yes               |
| children | 可选的其他路径效果，可以叠加应用 | PathEffect | no       | android/ios | yes               |

### Shadow

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name       | Description                                            | Type        | Required | Platform    | HarmonyOS Support |
| ---------- | ------------------------------------------------------ | ----------- | -------- | ----------- | ----------------- |
| dx         | 阴影在 X 轴方向的偏移量.                            | number      | yes      | android/ios | yes               |
| dy         | 阴影在 Y 轴方向的偏移量.                            | number      | no       | android/ios | yes               |
| blur       | 阴影的模糊半径，值越大阴影越模糊                         | number      | no       | android/ios | yes               |
| color      | 阴影的颜色                           | Color       | no       | android/ios | yes               |
| inner      | 是否为内阴影，内阴影会出现在图形内容内部             | boolean     | no       | android/ios | yes               |
| shadowOnly | 如果设置为 true，结果将只包含阴影效果，不包括原始输入内容 | boolean     | no       | android/ios | yes               |
| children   | 可选的其他图像滤镜，将在阴影效果之前应用              | ImageFilter | no       | android/ios | yes               |

### Blur

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                                   | Type             | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------------------------- | ---------------- | -------- | ----------- | ----------------- |
| blur     | 高斯模糊的 sigma 值，控制模糊程度                                 | number`or`Vector | yes      | android/ios | yes               |
| mode     | 边缘处理模式，支持 mirror（镜像）、repeat（重复）、clamp（裁剪）或 decal（默认） | TileMode         | no       | android/ios | yes               |
| children | 可选的图像滤镜，将在模糊效果之前应用.                    | ImageFilter      | no       | android/ios | yes               |

### DisplacementMap

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                                                          | Type         | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------------------------------------------------ | ------------ | -------- | ----------- | ----------------- |
| channelX | 用于 X 轴方向位移的颜色通道，可选值为 r(红色)、g(绿色)、b(蓝色)、a(透明度) | ColorChannel | yes      | android/ios | yes               |
| channelY | 用于 Y 轴方向位移的颜色通道，可选值为 r(红色)、g(绿色)、b(蓝色)、a(透明度) | ColorChannel | no       | android/ios | yes               |
| scale    | 位移缩放因子，控制位移效果的强度                                                 | number       | no       | android/ios | yes               |
| children | 可选的图像滤镜，将在位移效果之前应用                                            | ImageFilter  | no       | android/ios | yes               |

### Offset

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                | Type        | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------ | ----------- | -------- | ----------- | ----------------- |
| x        | 沿 X 轴的偏移量，控制内容的水平移动.                   | number      | yes      | android/ios | yes               |
| y        | 沿 Y 轴的偏移量，控制内容的垂直移动.                   | number      | yes      | android/ios | yes               |
| children | 可选的图像滤镜，将在位移效果之前应用. | ImageFilter | no       | android/ios | yes               |

### Morphology

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                                         | Type             | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------------------------------- | ---------------- | -------- | ----------- | ----------------- |
| operator | 沿 X 轴的偏移量，控制内容的水平移动 | erode`or`dilate  | yes      | android/ios | yes               |
| radius   | 沿 Y 轴的偏移量，控制内容的垂直移动.                                               | number`or`Vector | yes      | android/ios | yes               |
| children | 首先应用可选的图像过滤器.                          | ImageFilter      | no       | android/ios | yes               |

### RuntimeShader

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                | Type            | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------ | --------------- | -------- | ----------- | ----------------- |
| source   | 用作图像过滤器的着色器           | SkRuntimeEffect | yes      | android/ios | yes               |
| children | 首先应用可选的图像过滤器. | ImageFilter     | no       | android/ios | yes               |
| uniforms <sup>2.0.0</sup> | 传递给着色器程序的动态参数. | Uniforms     | no       | android/ios | yes               |

### BlurMask

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name       | Description                                                           | Type      | Required | Platform    | HarmonyOS Support |
| ---------- | --------------------------------------------------------------------- | --------- | -------- | ----------- | ----------------- |
| blur       | 高斯模糊的标准差，控制模糊强度，‌必须大于 0‌.                 | number    | yes      | android/ios | yes               |
| style      | 模糊样式，支持 normal(普通)、solid(实心)、outer(外部) 或 inner(内部)，默认为 normal.  | BlurStyle | no       | android/ios | yes               |
| respectCTM | 如果设置为 true，模糊的 sigma 值会根据当前变换矩阵(CTM)进行调整，默认为 false. | bool      | no       | android/ios | yes               |

### ColorMatrix

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                | Type        | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------ | ----------- | -------- | ----------- | ----------------- |
| matrix   | 5x4的颜色转换矩阵。该矩阵通过矩阵乘法改变图像中每个像素的RGB值和透明度(alpha)                         | number[]    | yes      | android/ios | yes               |
| children | 可选的颜色滤镜，将在颜色矩阵效果之前应用. | ColorFilter | no       | android/ios | yes               |

### BlendColor

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                                                               | Type        | Required | Platform    | HarmonyOS Support |
| -------- | ----------------------------------------------------------------------------------------- | ----------- | -------- | ----------- | ----------------- |
| color    | 用于混合的颜色值                                                                                     | Color       | yes      | android/ios | yes               |
| mode     | 设置混合模式，即源颜色与目标颜色的组合方式 | BlendMode   | yes      | android/ios | yes               |
| children | 可选的颜色滤镜，将在颜色混合效果之前应用.                                                | ColorFilter | no       | android/ios | yes               |

### Lerp

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                | Type        | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------ | ----------- | -------- | ----------- | ----------------- |
| t        | 插值因子，取值范围为 0 到 1 之间。                    | number      | yes      | android/ios | yes               |
| children | 可选的颜色滤镜，将在插值效果之前应用 | ColorFilter | yes      | android/ios | yes               |

### LinearToSRGBGamma

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                | Type        | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------ | ----------- | -------- | ----------- | ----------------- |
| children | 首先应用可选的滤色器. | ColorFilter | no       | android/ios | yes               |

### SRGBToLinearGamma

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                | Type        | Required | Platform    | HarmonyOS Support |
| -------- | ------------------------------------------ | ----------- | -------- | ----------- | ----------------- |
| children | 首先应用可选的滤色器. | ColorFilter | no       | android/ios | yes               |

### Mask

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name     | Description                                          | Type               | Required | Platform    | HarmonyOS Support |
| -------- | ---------------------------------------------------- | ------------------ | -------- | ----------- | ----------------- |
| mode     | 遮罩类型，可以是基于 alpha 通道的遮罩或基于亮度的遮罩，默认为 alpha | alpha \| luminance | no       | android/ios | yes               |
| clip     | 是否裁剪遮罩，使其不超出内容边界       | boolean            | no       | android/ios | yes               |
| mask     | 定义遮罩形状的 React 节点数组，必需属性                                            | ReactNode[]        | yes      | android/ios | yes               |
| children | 需要应用遮罩效果的内容，必需属性                                            | ReactNode[]        | yes      | android/ios | yes               |

### Image

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Description                                                                                                                                                                | Type    | Required | Platform    | HarmonyOS Support |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- | ----------- | ----------------- |
| image  | 要绘制的图像实例.                                                                                                                                                  | SkImage | yes      | android/ios | yes               |
| x      | 目标图像左侧的位置坐标.                                                                                                                                | number  | yes      | android/ios | yes               |
| y      | 目标图像顶部的位置坐标.                                                                                                                                 | number  | yes      | android/ios | yes               |
| width  | 目标图像的宽度.                                                                                                                                        | number  | yes      | android/ios | yes               |
| height | 目标图像的高度.                                                                                                                                       | number  | yes      | android/ios | yes               |
| fit    | 图像适应矩形区域的方法，可选值包括：contain、fill、cover、fitHeight、fitWidth、scaleDown 或 none，默认为 contain. | Fit     | no       | android/ios | yes               |
| sampling <sup>2.0.0</sup> | 图像的采样方法.                                                                                                             | Sampling  | no      | android/ios | yes               |

### ImageSVG

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Description                                 | Type   | Required | Platform    | HarmonyOS Support |
| ------ | ------------------------------------------- | ------ | -------- | ----------- | ----------------- |
| svg    | 要绘制的SVG图像内容.                                  | SVG    | yes      | android/ios | yes               |
| x      | 目标图像左侧的位置坐标. | number | no       | android/ios | yes               |
| y      | 目标图像顶部的位置坐标.  | number | no       | android/ios | yes               |
| width  | 目标图像的宽度.         | number | no       | android/ios | yes               |
| height | 目标图像的高度.        | number | no       | android/ios | yes               |

### Paragraph

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name      | Description                                   | Type        | Required | Platform    | HarmonyOS Support |
| --------- | --------------------------------------------- | ----------- | -------- | ----------- | ----------------- |
| paragraph | 文本段落对象，包含要显示的文本内容                                | skParagraph | yes      | android/ios | yes               |
| x         | 文本的左侧位置，默认值为 0      | number      | yes      | android/ios | yes               |
| y         | 文本的底部位置，默认值为 0 | number      | yes      | android/ios | yes               |
| width     | 段落的宽度.                   | number      | yes      | android/ios | yes               |

### Text

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description                                   | Type   | Required | Platform    | HarmonyOS Support |
| ---- | --------------------------------------------- | ------ | -------- | ----------- | ----------------- |
| text | 要绘制的文本内容                                  | string | yes      | android/ios | yes               |
| x    | 文本的左侧位置，默认值为 0      | number | yes      | android/ios | yes               |
| y    | 文本的底部位置，默认值为 0 | number | yes      | android/ios | yes               |
| font | 要使用的字体对象                                   | SkFont | yes      | android/ios | yes               |

### Glyphs

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Description                                                | Type    | Required | Platform    | HarmonyOS Support |
| ------ | ---------------------------------------------------------- | ------- | -------- | ----------- | ----------------- |
| glyphs | 要绘制的字形数组                                             | Glyph[] | yes      | android/ios | yes               |
| x      | 整个字形序列的起始原点 x 坐标，默认值为 0 | number  | no       | android/ios | yes               |
| y      | 整个字形序列的起始原点 y 坐标，默认值为 0 | number  | no       | android/ios | yes               |
| font   | 要使用的字体对象                                                | SkFont  | yes      | android/ios | yes               |

### TextPath

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description                                                                                                                                                                             | Type           | Required | Platform    | HarmonyOS Support |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------- | ----------- | ----------------- |
| path | 绘制的路径，可以是使用[SVG路径](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#line_commands)表示法的字符串，也可以是使用 Skia.Path.Make() 创建的对象 | Path \| string | yes      | android/ios | yes               |
| text | 要绘制的文本内容                                                                                                                                                                            | string         | yes      | android/ios | yes               |
| font | 要使用的字体对象                                                                                                                                                                             | SkFont         | yes      | android/ios | yes               |

### TextBlob

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description                                                | Type     | Required | Platform    | HarmonyOS Support |
| ---- | ---------------------------------------------------------- | -------- | -------- | ----------- | ----------------- |
| blob | 文本块对象，包含要绘制的文本内容                                                  | TextBlob | yes      | android/ios | yes               |
| x    | 整个文本序列的起始原点 x 坐标，默认值为 0 | number   | no       | android/ios | yes               |
| y    | 整个文本序列的起始原点 y 坐标，默认值为 0 | number   | no       | android/ios | yes               |

### BackdropFilter

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name   | Description                                                                             | Type                     | Required | Platform    | HarmonyOS Support |
| ------ | --------------------------------------------------------------------------------------- | ------------------------ | -------- | ----------- | ----------------- |
| filter | 对画布后方区域或定义的裁剪蒙版后方区域应用图像滤镜 | ReactNode \| ReactNode[] | yes      | android/ios | yes               |

### BackdropBlur

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description | Type   | Required | Platform    | HarmonyOS Support |
| ---- | ----------- | ------ | -------- | ----------- | ----------------- |
| blur | 模糊半径，控制背景内容的模糊程度 | number | yes      | android/ios | yes               |

### Paint <sup>2.0.0</sup>

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description | Type   | Required | Platform    | HarmonyOS Support |
| ---- | ----------- | ------ | -------- | ----------- | ----------------- |
| color | 颜色 | Color | no      | android/ios | yes               |
| blendMode | 混合模式 | SkEnum<typeof BlendMode> | no      | android/ios | yes               |
| style | 绘制样式 | SkEnum<typeof PaintStyle> | no      | android/ios | yes               |
| strokeWidth | 描边宽度 | number | no      | android/ios | yes               |
| strokeJoin | 描边拐角样式 | SkEnum<typeof StrokeJoin> | no      | android/ios | yes               |
| strokeCap | 描边端点样式 | SkEnum<typeof StrokeCap> | no      | android/ios | yes               |
| strokeMiter | strokeJoin="miter"（尖角拐角）的 “配套限制器” | number | no      | android/ios | yes               |
| opacity | 透明度 | number | no      | android/ios | yes               |
| antiAlias | 抗锯齿 | boolean | no      | android/ios | yes               |
| dither | 抖动 | boolean | no      | android/ios | yes               |


### Video <sup>2.0.0</sup>

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description | Type   | Required | Platform    | HarmonyOS Support |
| ---- | ----------- | ------ | -------- | ----------- | ----------------- |
| source | 视频资源 | string | yes      | android/ios | yes               |
| looping | 循环播放 | Animated<boolean> | no      | android/ios | yes               |
| paused | 暂停 | Animated<boolean> | no      | android/ios | yes               |
| volume | 音量 | Animated<number> | no      | android/ios | yes       

### Skottie <sup>2.0.0</sup>

#### 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description | Type   | Required | Platform    | HarmonyOS Support |
| ---- | ----------- | ------ | -------- | ----------- | ----------------- |
| animation | 动画 | SkSkottieAnimation | yes      | android/ios | yes               |
| frame | 帧 | number | yes      | android/ios | yes               |


## RNSkiaModule API

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name    | Description      | Type     | Required | Platform    | HarmonyOS Support |
| ------- | ---------------- | -------- | -------- | ----------- | ----------------- |
| install | 用于初始化 Skia 图形库 | function | yes      | android/ios | yes               |


## 遗留问题

- [x] Text 组件无法使用 问题: [issue#Text 暂不支持](https://github.com/react-native-oh-library/react-native-skia/issues/5)
- [x] Video 组件无法使用 问题: [issue#Video 暂不支持](https://github.com/react-native-oh-library/react-native-skia/issues/6)
- [x] Image 组件无法使用 问题: [issue#Image 暂不支持](https://github.com/react-native-oh-library/react-native-skia/issues/7)

## 其他

## 开源协议

本项目基于 [The MIT License (MIT)](https://github.com/Shopify/react-native-skia/blob/main/LICENSE.md) ，请自由地享受和参与开源。