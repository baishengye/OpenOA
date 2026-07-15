> 模板版本：v0.2.2

<p align="center">
  <h1 align="center"> <code>@shopify/flash-list</code> </h1>
</p>
<p align="center">
    <a href="https://github.com/Shopify/flash-list">
        <img src="https://img.shields.io/badge/platforms-android%20|%20ios%20|%20harmony%20-lightgrey.svg" alt="Supported platforms" />
    </a>
    <a href="https://github.com/Shopify/flash-list/blob/main/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" /> 
    </a>
</p>

> [!TIP] [Github 地址](https://github.com/react-native-oh-library/flash-list)

## 安装与使用

请到三方库的 Releases 发布地址查看配套的版本信息：

| 三方库名称 | 三方库版本  | 发布信息                                                                         | 支持RN版本 | Autolink | 编译API版本 | 社区基线版本 | npm地址                      
| ------------ |--------|---------------------------------------------------------------------------------------------|----------------------|--------------------|---------|--------|----------------------------------|
|@react-native-ohos/flash-list| ~2.1.1 | [GitCode Releases](https://gitcode.com/openharmony-sig/rntpc_flash-list/releases) | 0.82.*                | 否                  | API12+  | 2.1.0  | [Npm Address](https://www.npmjs.com/package/@react-native-ohos/flash-list)|
|@react-native-ohos/flash-list| ~1.8.3 | [GitCode Releases](https://gitcode.com/openharmony-sig/rntpc_flash-list/releases) | 0.77.*               | 否                  | API12+  | 1.8.2  | [Npm Address](https://www.npmjs.com/package/@react-native-ohos/flash-list)|
|@react-native-ohos/flash-list| ~1.6.4 | [GitCode Releases](https://gitcode.com/openharmony-sig/rntpc_flash-list/releases) | 0.72.*               | 否                  | API12+  | 1.6.3  | [Npm Address](https://www.npmjs.com/package/@react-native-ohos/flash-list) |
|@react-native-oh-tpl/flash-list| 1.6.3-0.2.9@deprecated  | [Github Releases](https://github.com/react-native-oh-library/flash-list/releases) | 0.72       | 否                  | API12+  | 1.6.3  | [Npm Address](https://www.npmjs.com/package/@react-native-oh-tpl/flash-list) |

对于未发布到npm的旧版本，请参考[安装指南](/zh-cn/tgz-usage.md)安装tgz包。

进入到工程目录并输入以下命令：

#### **npm**

```bash
npm install @react-native-ohos/flash-list
```

#### **yarn**

```bash
yarn add @react-native-ohos/flash-list
```

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

```js
import React from "react";
import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";

const DATA = [
  {
    title: "First Item",
  },
  {
    title: "Second Item",
  },
];

const MyList = () => {
  return (
    <FlashList
      data={DATA}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  );
};
```

## Link

|                                      | 是否支持autolink | RN框架版本 |
|--------------------------------------|-----------------|------------|
| ~2.1.1                               |  No              |  0.82     |
| ~1.8.3                               |  No              |  0.77     |
| ~1.6.4                              |  Yes             |  0.72     |
| <= 1.6.3-0.2.9@deprecated            |  No              |  0.72     |

使用AutoLink的工程需要根据该文档配置，Autolink框架指导文档：https://gitcode.com/openharmony-sig/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

如您使用的版本支持 Autolink，并且工程已接入 Autolink，可跳过ManualLink配置。
<details>
  <summary>ManualLink: 此步骤为手动配置原生依赖项的指导</summary>

首先需要使用 DevEco Studio 打开项目里的HarmonyOS工程 `harmony`

### 1.在工程根目录的 `oh-package.json5` 添加 overrides 字段

```json
{
  ...
  "overrides": {
    "@rnoh/react-native-openharmony": "^0.77.86" // ohpm 在线版本
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony.har" // 指向本地 har 包的路径
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony" // 指向源码路径
  }
}
```

### 2.引入原生端代码

> [!TIP] version>=v2.1.1不涉及原生端代码，可跳过此步骤。

目前有两种方法：

1. 通过 har 包引入（在 IDE 完善相关功能后该方法会被遗弃，目前首选此方法）；
2. 直接链接源码。

方法一：通过 har 包引入（推荐）

> [!TIP] har 包位于三方库安装路径的 `harmony` 文件夹下。

打开 `entry/oh-package.json5`，添加以下依赖

```json
"dependencies": {
    "@react-native-ohos/flash-list": "file:../../node_modules/@react-native-ohos/flash-list/harmony/flash_list.har"
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

### 3.配置 CMakeLists 和引入 FlashListPackage

> [!TIP] version>=v2.1.1不涉及原生端代码，可跳过此步骤。

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
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/flash-list/src/main/cpp" ./flash-list)
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
+ target_link_libraries(rnoh_app PUBLIC rnoh_flash_list)
# RNOH_END: manual_package_linking_2
```

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```diff
#include "RNOH/PackageProvider.h"
#include "generated/RNOHGeneratedPackage.h"
#include "SamplePackage.h"
+ #include "FlashListPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
        std::make_shared<RNOHGeneratedPackage>(ctx),
        std::make_shared<SamplePackage>(ctx),
+       std::make_shared<FlashListPackage>(ctx)
    };
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
4. RNOH: 0.82.1; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM:6.0.0.130 SP8;

## 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description | Type | Required | Platform | HarmonyOS Support  |
| ---- | ----------- | ---- | -------- | -------- | ------------------ |
| contentContainerStyle<sup>deprecated  from 2.1.1</sup>                   | 可通过 contentContainerStyle 为整个内容区域设置内边距。                                                                                                                    | ContentStyle        | No       | All      | Yes                |
| estimatedListSize<sup>deprecated  from 2.1.1</sup>                      | 列表的预估可见高度和宽度（非滚动内容尺寸）。定义该属性可让列表立即渲染，否则列表需先测量自身尺寸，导致首次渲染稍有延迟。 | object              | No       | All      | Yes                |
| horizontal                             | 设置为 true 时，项目将水平并列排列而非垂直堆叠。默认为 false。                                                                                                                   | boolean             | No       | All      | Yes |
| keyExtractor                           | 用于为指定索引位置的项生成唯一键值。键值用于优化性能。                                                                                                                       | function            | No       | All      | Yes                |
| numColumns                             | 多列布局只能在 horizontal={false} 的情况下渲染，并且会像 flexWrap 布局一样呈现“之”字形排列。所有子项的高度必须一致——不支持瀑布流（masonry）布局。                                                                                | number              | No       | All      | Yes                |
| extraData                              | 用于指示列表重新渲染的标记属性。                                                                                                                                  | any                 | No       | All      | Yes                |
| drawDistance                           | 预渲染的绘制距离。                                                                                                                                                                                                   | number              | No       | All      | Yes                |
| estimatedItemSize<sup>deprecated  from 2.1.1</sup>                      | 用于在项目渲染前向 FlashList 提示项目近似尺寸的单个数值。                                                                                            | number              | No       | All      | Yes                |
| viewabilityConfig                      | 用于判定项目可见性的默认配置。支持 `minimumViewTime`、`viewAreaCoveragePercentThreshold`、`itemVisiblePercentThreshold`、`waitForInteraction` 等字段。运行时动态更改此配置不受支持。                                                                                                                                                       | object              | No       | All      | Yes                |
| renderItem<sup>changed in 2.1.1</sup>                             | 从 data 中获取项目并渲染至列表。回调参数 `info` 包含 `item`、`index`、`target`、`extraData` 字段。`target` 为渲染目标枚举，可选值：`"Cell"`（列表项）、`"StickyHeader"`（粘性头部）、`"Measurement"`（尺寸测量，v2 已弃用）。                                                                                                                                                                                        | function            | Yes      | All      | Yes                |
| data                                   | 数据源，为指定类型的简单项目数组。                                                                                                                                                                               | ItemT[]             | Yes      | All      | Yes                |
| CellRendererComponent                  | 每个单元格的渲染元素。可以是 React 类组件或渲染函数。                                                                                                                                   | JSX Element         | No       | All      | Yes                |
| ListFooterComponent                    | 在列表底部渲染的组件。可以是 React 组件类或 React 元素。                                                                                                                                                                                                           | JSX Element         | No       | All      | Yes                |
| ListHeaderComponent                    | 在列表顶部渲染的组件。可以是 React 组件类或 React 元素。                                                                                                                                                                                                | JSX Element         | No       | All      | Yes                |
| refreshControl                         | 自定义下拉刷新控件元素。                                                                                                                                                                                                                  | JSX Element         | No       | All      | Yes                |
| renderScrollComponent                  | 作为主滚动视图渲染的组件。                                                                                                                                                                                                                  | JSX Element         | No       | All      | Yes                |
| onEndReached                           | 当滚动位置接近渲染内容末尾（距离阈值为 onEndReachedThreshold）时触发一次。                                                                                                              | callback            | No       | All      | Yes                |
| onEndReachedThreshold                  | 触发 onEndReached 回调时，列表底部边缘与内容末尾的距离阈值（以列表可见长度为单位）。                                            | number              | No       | All      | Yes                |
| onViewableItemsChanged                 | 当项目的可见性发生变化时触发（可见性由 viewabilityConfig 属性定义）。回调参数包含 `viewableItems` 和 `changed` 数组，元素为 `ViewToken` 对象（含 `item`、`key`、`index`、`isViewable`、`timestamp` 字段）。                                                                                                                             | callback            | No       | All      | Yes                |
| getItemType                            | 允许开发者指定项目类型以优化回收。接收 `item`、`index`、`extraData` 参数，返回类型标识。相同类型的项会相互回收，默认类型为 0。                                                                                                                                                                                                           | function            | No       | All      | Yes                |
| overrideItemLayout<sup>changed in 2.1.1</sup>                     | 用于更改项目列跨度。接收 `layout`、`item`、`index`、`maxColumns`、`extraData` 参数，v1 版本支持设置 `layout.span` 和 `layout.size`；v2 版本仅支持 `layout.span`。                                                                                                                                              | function            | No       | All      | Yes                |
| ItemSeparatorComponent                 | 在每项之间（不包括顶部和底部）渲染的分隔组件。默认提供 `leadingItem` 和 `trailingItem` 属性。                                                                                                                                                                            | JSX Element         | No       | All      | Yes                |
| ListEmptyComponent                     | 列表为空时渲染的组件。可以是 React 组件类或 React 元素。                                                                                                                                                                                                                     | JSX Element         | No       | All      |Yes               |
| ListFooterComponentStyle               | 列表底部组件内部容器的样式。                                                                                                                                                                                               | StyleProp | No       | All      | Yes                |
| ListHeaderComponentStyle               | 列表顶部组件内部容器的样式。                                                                                                                                                                                             | StyleProp           | No       | All      | Yes                |
| disableAutoLayout<sup>deprecated  from 2.1.1</sup>                        | FlashList 会对子项布局应用某些修复，这可能与自定义 CellRendererComponent 实现冲突。设置为 true 可禁用此行为。 | boolean             | No       | All      | Yes                |
| disableHorizontalListHeightMeasurement<sup>deprecated  from 2.1.1</sup>   | 设置为 true 时，列表的渲染尺寸需确定（即高度和宽度大于0），FlashList 将跳过用于测量的额外项目渲染。默认值为 false。 | boolean             | No       | All      | Yes                |
| estimatedFirstItemOffset<sup>deprecated  from 2.1.1</sup>                 | 指定列表窗口中首个项目的绘制偏移量（非列表头部偏移量）。      | number              | No       | All      | Yes               |
| initialScrollIndex                     | 不从首项开始显示，而是从 initialScrollIndex 指定位置开始。                                                                                                                                         | number              | No       | All      | Yes               |
| inverted<sup>deprecated  from 2.1.1</sup>                                 | 反转滚动方向（使用 -1 缩放变换实现）。                                                                                                                                                                           | boolean             | No       | All      | Yes                |
| onBlankArea<sup>deprecated  from 2.1.1</sup>                              | 滚动或列表初始加载时，FlashList 会计算用户可见的空白区域。                                                                                                              | callback            | No       | All      | Yes                 |
| onLoad                                 | 当列表在屏幕上完成项目绘制后触发。回调参数 `elapsedTimeInMs` 为绘制耗时（毫秒）。                                                                                                                                                                             | callback            | No       | All      | Yes               |
| onRefresh                              | 提供此回调可添加标准 RefreshControl 实现"下拉刷新"功能。需确保同时正确设置 refreshing 属性。                                                    | callback            | No       | All      | Yes                |
| onScroll                               | 滚动期间每帧最多触发一次（继承自 ScrollView）。 | callback            | No       | All      | Yes                |
| overrideProps                          | 除调试外不建议使用此属性。列表的内部属性将被提供值覆盖。                                                                                       | object              | No       | All      | Yes               |
| progressViewOffset                     | 当加载指示器需要偏移量时才需设置此属性。                                                                                                                                                                | number              | No       | Android      | Yes                |
| refreshing                             | 在等待刷新数据时设置为 true。                                                                                                                                                                                      | boolean             | No       | All      | Yes                 |
| viewabilityConfigCallbackPairs         | ViewabilityConfig/onViewableItemsChanged 配置对集合。每个配置对包含 `viewabilityConfig` 和 `onViewableItemsChanged` 两个属性。当对应配置条件满足时，触发对应回调。 | object              | No       | All      | Yes                 |
| ContentStyle<sup>deprecated from 2.1.1</sup> | 用于定义列表内容容器样式的类型 | object | No | All | Yes |
| CellContainer<sup>deprecated from 2.1.1</sup> | 单元格容器组件 | React.Component | No | All | Yes |
| useOnNativeBlankAreaEvents<sup>deprecated  from 2.1.1</sup> | 用于监听原生空白区域事件的 Hook，当列表出现空白区域时触发回调 | function | No | All | Yes |
| BlankAreaEventHandler<sup>deprecated  from 2.1.1</sup> | 空白区域事件处理函数类型 | function |  No | All | Yes |
| BlankAreaEvent<sup>deprecated  from 2.1.1</sup> | 空白区域事件对象 | object |  No | All | Yes |
| useBlankAreaTracker<sup>deprecated  from 2.1.1</sup> | 用于在生产环境中追踪列表可见空白区域的 Hook | function |  No | All | Yes |
| BlankAreaTrackerResult<sup>deprecated  from 2.1.1</sup> | 空白区域追踪结果对象 | object |  No | All | Yes |
| BlankAreaTrackerConfig<sup>deprecated  from 2.1.1</sup> | 空白区域追踪器配置项 | object |  No | All | Yes |
| MasonryFlashList<sup>deprecated  from 2.1.1</sup> | 瀑布流布局的 FlashList 变体组件 | React.Component |  No | All | Yes |
| MasonryFlashListProps<sup>deprecated  from 2.1.1</sup> | 瀑布流列表组件的属性类型 | object |  No | All | Yes |
| MasonryFlashlistScrollEvent<sup>deprecated  from 2.1.1</sup> | 瀑布流列表的滚动事件类型 | object |  No | All | Yes |
| MasonryFlashListRef<sup>deprecated  from 2.1.1</sup> | 瀑布流列表的 Ref 类型 | object |  No | All | Yes |
| MasonryListItem<sup>deprecated  from 2.1.1</sup> | 瀑布流列表项的包装类型 | object |  No | All | Yes |
| MasonryListRenderItem<sup>deprecated  from 2.1.1</sup> | 瀑布流列表项渲染函数类型 | function |  No | All | Yes |
| MasonryListRenderItemInfo<sup>deprecated  from 2.1.1</sup> | 瀑布流列表项渲染信息 | object |  No | All | Yes |
| FlashListRef <sup>2.1.1</sup>| 提供对FlashList实例的引用，支持直接操作列表 | React.RefObject<FlashList<T>> | No | All | Yes |
| onStartReached<sup>2.1.1</sup>| 当滚动位置接近内容起始位置时触发一次的回调。 | callback | No | All | Yes |
| onStartReachedThreshold<sup>2.1.1</sup>| 触发 onStartReached 回调时，列表顶部边缘与内容起始位置的距离阈值（以列表可见长度为单位）。 | number | No | All | Yes |
| maintainVisibleContentPosition<sup>2.1.1</sup>| 用于在内容变化时维持滚动位置的配置。支持配置 `disabled`、`autoscrollToTopThreshold`、`autoscrollToBottomThreshold`、`animateAutoScrollToBottom` 和 `startRenderingFromBottom` 等子属性。 | object | No | All | Yes |
| masonry<sup>2.1.1</sup>| 启用瀑布流布局模式。 | boolean | No | All | Yes |
| maxItemsInRecyclePool<sup>2.1.1</sup>| 回收池中缓存的最大项目数。当项目滚动出屏幕时会被缓存在回收池中。设置为 0 将禁用回收池，项目滚出屏幕后将直接卸载。 | number | No | All | Yes |
| onCommitLayoutEffect<sup>2.1.1</sup>| 当布局提交完成时调用的回调。 | function | No | All | Yes |
| LayoutCommitObserver<sup>2.1.1</sup>| 用于观察 FlashList 何时提交布局的组件。 | React.Component | No | All | Yes |
| LayoutCommitObserverProps<sup>2.1.1</sup>| 定义LayoutcommitObserver的属性接口，包含回调函数 | object | No | All | Yes |
| initialScrollIndexParams<sup>2.1.1</sup>| `initialScrollIndex` 的附加配置。可使用 `viewOffset` 对初始滚动位置应用偏移量。仅当设置了 `initialScrollIndex` 时生效。 | object | No | All | Yes |
| optimizeItemArrangement<sup>2.1.1</sup>| 启用后，MasonryFlashList 将通过调整项目顺序来减少列高差异。仅在瀑布流布局下可用。 | boolean | No | All | Yes |
| style<sup>2.1.1</sup>| RecyclerView 父容器的样式。 | StyleProp<ViewStyle> | No | All | Yes |
| props<sup>2.1.1</sup> | 获取当前列表的 props 配置。 | RecyclerViewProps\<T\> | No | All | Yes |



## HOOKS
> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description | Type | Required | Platform | HarmonyOS Support  |
| ---- | ----------- | ---- | -------- | -------- | ------------------ |
| useLayoutState<sup>2.1.1</sup>| 将状态管理与 RecyclerView 布局更新结合的自定义 Hook。状态变化时会自动触发布局重新计算。返回当前状态值和一个可选择性跳过父布局更新的 setter 函数。 | Hook | No | All | Yes |
| useRecyclingState<sup>2.1.1</sup>| 提供自动重置功能的状态管理 Hook。类似 useState，但在指定依赖项 `deps` 变化时会自动重置状态，并触发可选的 `onReset` 回调。 | Hook | No | All | Yes |
| useMappingHelper<sup>2.1.1</sup>| 返回包含 `getMappingKey` 函数的对象，用于在 `.map` 操作创建组件列表时生成最优键值。在 FlashList 内部返回 `index` 以优化回收性能，在外部返回 `itemKey` 以保持稳定键。 | Hook | No | All | Yes |
| useFlashListContext<sup>2.1.1</sup>| 获取当前 FlashList 上下文的 Hook。可访问 `layout()`、`getRef()`、`getParentRef()`、`getScrollViewRef()` 和 `getParentScrollViewRef()` 等方法。 | Hook | No | All | Yes |

## 方法

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

| Name | Description | Type | Required | Platform | HarmonyOS Support  |
| ---- | ----------- | ---- | -------- | -------- | ------------------ |
| prepareForLayoutAnimationRender | 在执行布局动画前调用此方法，例如删除元素时为其添加动画效果。                           | function | No       | All      | Yes               |
| recordInteraction               | 通知列表已发生交互行为，这将触发可见性计算（例如当 `waitForInteraction` 为 true 且用户未滚动时）。 | function | No       | All      | Yes              |
| scrollToEnd                     | 滚动至内容末尾。支持 `animated` 参数控制是否使用动画。                                                                                                                    | function | No       | All      | Yes               |
| scrollToIndex<sup>changed in 2.1.1</sup>                   | 滚动至指定索引位置。支持 `index`、`animated`、`viewPosition`（0=顶部，0.5=居中，1=底部）、`viewOffset` 参数。v1版本和v2版本对 `viewOffset` 参数的处理存在差异，具体表现为方向相反。                                                                                                                            | function | No       | All      | Yes               |
| scrollToItem<sup>changed in 2.1.1</sup>                       | 滚动至指定项目。支持 `item`、`animated`、`viewPosition`、`viewOffset` 参数。v1版本和v2版本对 `viewOffset` 参数的处理存在差异，具体表现为方向相反。                                                                                                                               | function | No       | All      | Yes              |
| scrollToOffset                  | 滚动至列表内特定的内容像素偏移量。支持 `offset`、`animated`、`skipFirstItemOffset`参数。                                                                                       | function | No       | All      | Yes              |
| recomputeViewableItems<sup>1.8.3+</sup> | 重新触发可见性计算。 | function | No | All | Yes |
| getLayout | 获取指定索引项目的布局信息，返回 `RVLayout` 对象（含 `x`、`y`、`width`、`height`）。 | function | No | All | Yes |
| getChildContainerDimensions | 返回子容器的尺寸，包含 `width` 和 `height` 属性。 | function | No | All | Yes |
| getScrollableNode | 返回底层可滚动节点。 | function | No | All | Yes |
| getFirstItemOffset | 返回第一个项目的偏移量（包含头部/内边距）。 | function | No | All | Yes |
| getWindowSize | 返回当前视口尺寸，包含 `width` 和 `height` 属性。 | function | No | All | Yes |
| getFirstVisibleIndex | 返回第一个可见项目的索引。 | function | No | All | Yes |
| getAbsoluteLastScrollOffset | 返回最后一次滚动的绝对偏移量。 | function | No | All | Yes |
| clearLayoutCacheOnUpdate | 在更新时清除布局缓存。 | function | No | All | Yes |
| computeVisibleIndices<sup>2.1.1</sup> | 返回当前可见项目的索引范围，包含 `startIndex` 和 `endIndex` 属性。 | function | No | All | Yes |
| flashScrollIndicators<sup>2.1.1</sup> | 使滚动指示器短暂闪烁显示。 | function | No | All | Yes |
| getNativeScrollRef<sup>2.1.1</sup> | 返回底层原生滚动视图引用。 | function | No | All | Yes |
| getScrollResponder<sup>2.1.1</sup> | 返回滚动响应器引用。 | function | No | All | Yes |
| scrollToTop<sup>2.1.1</sup> | 滚动至列表顶部（或起始位置）。支持 `animated` 参数控制是否使用动画。 | function | No | All | Yes |

## 遗留问题

- [ ] RNOH 的 `maintainVisibleContentPosition` 实现未考虑 FlashList 元素复用机制，导致列表滑动时出现跳跃。[Issue#19](https://gitcode.com/openharmony-sig/rntpc_flash-list/issues/19)

## 其他

## 开源协议

本项目基于 [The MIT License (MIT)](https://github.com/Shopify/flash-list/blob/main/LICENSE.md) ，请自由地享受和参与开源。