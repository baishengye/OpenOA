# @itc/uikit

基础 UI 控件库。以 **tamagui** 为内部样式基座，封装常用控件，**对外不暴露 tamagui**——业务只依赖 `@itc/uikit` 的组件与接口，未来可整体替换底层。

## 为什么不暴露 tamagui

- 业务代码只 `import { Button, Text, ... } from '@itc/uikit'`，看不到 `tamagui`/`styled`/`createTamagui`。
- [src/index.ts](src/index.ts) 是**唯一出口**，白名单导出；tamagui 配置（tokens/themes）封在 [src/tamagui/config.ts](src/tamagui/config.ts) 内部。
- 好处：① 统一控件 API，业务不被 tamagui 细节绑死；② 日后换 UI 库或某端降级纯 RN，只改 `packages/uikit` 内部，业务零改动。
- 设计与 [@itc/hotfix](../hotfix)、[@itc/storage](../storage) 一致（接口 + 内部实现分离）。

## 安装 / 接入

`apps/*` 已通过 `workspace:*` 依赖。在 App 根包一层 `UIProvider`：

```tsx
import { UIProvider } from '@itc/uikit';

export default function App() {
  return (
    <UIProvider defaultMode="light">
      <YourApp />
    </UIProvider>
  );
}
```

## 主题

```tsx
import { useTheme } from '@itc/uikit';

function ThemeToggle() {
  const { mode, toggle, setMode, colors } = useTheme();
  // mode: 'light' | 'dark'
  // toggle(): 切换；setMode('dark'): 指定
  // colors: 语义色 { background, color, colorSecondary, primary, border }
  return <Button onPress={toggle}>当前 {mode}</Button>;
}
```

- 两套主题 `light` / `dark`，切换即时全局生效（`UIProvider` 内部管理）。
- `colors` 是**封装的语义色**，业务用 `colors.primary` 等，不直接碰 tamagui token。

## 组件 API

### 布局
| 组件 | 说明 | 主要 props |
|---|---|---|
| `YStack` | 纵向容器 | `gap` `padding` `flex` `align` `justify` `backgroundColor` `borderRadius` |
| `XStack` | 横向容器 | 同上 |
| `Stack` | = YStack 别名 | 同上 |
| `Divider` | 分割线 | `vertical` |

### 基础
| 组件 | 说明 | 主要 props |
|---|---|---|
| `Text` | 文本 | `variant`(h1/h2/h3/body/caption) `color` `numberOfLines` `textAlign` |
| `Button` | 按钮 | `variant`(solid/outline/ghost) `size`(sm/md/lg) `loading` `disabled` `onPress` |
| `Input` | 输入框 | `value` `defaultValue` `placeholder` `onChangeText` `secureTextEntry` `disabled` `size` `keyboardType` |

### 表单
| 组件 | 说明 | 主要 props |
|---|---|---|
| `Switch` | 开关 | `checked` `onChange` `disabled` |
| `Checkbox` | 复选框 | `checked` `onChange` `label` `disabled` |
| `RadioGroup` | 单选组 | `value` `onChange` `options`(`{label,value}[]`) `disabled` |

### 展示
| 组件 | 说明 | 主要 props |
|---|---|---|
| `Card` | 卡片 | `padding` `onPress` |
| `Badge` | 角标 | `tone`(info/success/warning/danger/neutral) |
| `Avatar` | 头像 | `src` `size` `fallback` |
| `Spinner` | 加载指示 | `size`(small/large) `color` |

### 反馈
| 组件 | 说明 | 主要 props |
|---|---|---|
| `Dialog` | 对话框 | `open` `onOpenChange` `title` `onConfirm` `onCancel` `confirmText` `cancelText` |

### 列表
```tsx
import { List } from '@itc/uikit';

<List<Row>
  data={rows}
  keyExtractor={(it) => it.id}
  renderItem={(it) => <Row data={it} />}
  refreshing={refreshing}     // 下拉刷新中
  onRefresh={onRefresh}       // 下拉刷新（不传则无）
  onLoadMore={onLoadMore}     // 上拉加载更多（不传则无）
  loadingMore={loadingMore}   // 加载更多中（底部转圈）
  hasMore={hasMore}           // false → 底部「没有更多了」，且不再触发 onLoadMore
  emptyComponent={<Empty />}  // 空数据展示
/>
```
基于 RN `FlatList` 封装，自带：下拉刷新（`RefreshControl`）+ 上拉加载更多（`onEndReached`）+ 没有更多（底部提示）。

## 三端兼容

- **iOS / Android**：tamagui 2 原生支持 RN 0.82 新架构。
- **鸿蒙（RNOH）**：tamagui 为纯 JS（基于 RN 基础组件），核心可用；safe-area 因移植包不兼容已降级（见下）。
- 首版用 tamagui **运行时**（未启用 babel/metro 编译优化插件），降低三端构建复杂度。

## 集成坑（2026-06 实测，务必先看）

1. **tamagui 的 peer：`react-native-safe-area-context`（native）** —— 宿主 app 必须装，否则 metro 报 `Unable to resolve module react-native-safe-area-context`（tamagui 内部 import）。
2. **v4 默认 config 不含 animations** —— `<Switch.Thumb animation="quick">` 之类的 `animation` prop 会 **TS 报错**（类型里没有）。首版去掉 animation（状态切换仍生效、只是无过渡）；要动画再单独配 `@tamagui/animations-react-native`。
3. **`theme="accent"` 让组件全黑** —— v4 的 accent 主题偏深色，Switch/Checkbox/Radio 套上去整片黑。改用**明确配色**（选中 `$blue9`、未选 `$gray6/8`，Switch.Thumb `white`），别用 accent theme。
   - ⚠️ **Switch 选中态轨道颜色必须用 `activeStyle`，不能用条件式 `backgroundColor`** —— tamagui 的 native Switch（`createSwitch.native.js`）在 checked 态会在内联 props **之后** spread `backgroundColor: "$backgroundActive"`，把 `backgroundColor={checked ? A : B}` 盖掉，导致**开启后只有圆点移动、轨道不变色**。正解：未选态 `backgroundColor="$gray6"` + 选中态 `activeStyle={{ backgroundColor: '$blue9' }}`（tamagui 用 `activeStyle` 接 checked 样式，会优先生效）。见 [src/components/form.tsx](src/components/form.tsx) 的 Switch。
4. **List(FlatList) 不能嵌 ScrollView** —— 报 `VirtualizedLists should never be nested inside plain ScrollViews`。做法：页面/tab 以 `List` 为根、其它内容塞 `header` prop（见 List 的 `header`），不要用 ScrollView 包 List。
5. **`createTamagui` 的返回类型要显式注解 `TamaguiInternalConfig`** —— 否则 pnpm 隔离下 tsc 报 TS2742（类型引用 @tamagui/web 的不可移植路径）。见 [src/tamagui/config.ts](src/tamagui/config.ts)。
6. ⚠️ **鸿蒙 safe-area 降级（核心坑）** —— `react-native-safe-area-context` 的鸿蒙移植包 generated C++ 用了 RN 0.76 移除的 `butter::map`，在 RN 0.82+RNOH **无法编译**（`use of undeclared identifier 'butter'`）。降级方案（**不破坏库 / 不降 RN / 不 patch 移植包**）：
   - uikit 内自带纯 RN stub：[src/harmony/safe-area-context-stub.tsx](src/harmony/safe-area-context-stub.tsx)（`SafeAreaProvider` 直渲染、`useSafeAreaInsets` 返回状态栏高度固定值）。
   - 宿主 [apps/oa/metro.config.harmony.js](../../apps/oa/metro.config.harmony.js) 的 `HARMONY_STUBS` 仅 harmony 把 `react-native-safe-area-context` 重定向到该 stub。**这一行必须在 app**——metro 是宿主打包器配置、库无法自声明平台级依赖替换。
   - iOS/Android 不走此 config、仍用真 native 包，**完全不受影响**。
   - 代价：鸿蒙 safe-area insets 是固定值、不动态适配刘海/折叠态，但 tamagui 组件能正常渲染。
   - 验证：`bundle.harmony.js` 里 `RNCSafeArea`/`SafeAreaProviderNativeComponent` 引用数应为 **0**。
7. ⚠️ **Dialog 不能用 tamagui 的 `Dialog.Portal`（鸿蒙触摸 + 返回键坑）** —— tamagui 的 `Dialog modal` 在 native 不是真原生弹窗，而是「同 React 树内的绝对定位浮层（`@tamagui/portal`）」。在鸿蒙（RNOH）上有两个问题：① 浮层触摸事件无法命中对话框按钮（点了没反应）；② 不接管硬件返回键，返回键直接冒泡到导航器 → **退出整个页面**而非收起对话框。
   - 修复：[src/components/Dialog.tsx](src/components/Dialog.tsx) 改用 **RN 原生 `Modal`**（三端都有原生实现，鸿蒙 RNOH 有 `ModalHostViewComponentInstance`），内容仍用 tamagui 的 `YStack/Text/Button` 保持样式、不暴露 tamagui。
   - `onRequestClose={() => onOpenChange(false)}` 接管硬件返回键 → 返回键收起对话框。原生 Modal 是独立窗口，触摸正确路由到按钮。
   - 遮罩点击关闭：外层 `Pressable` 半透明遮罩 onPress 关闭，内容区包一层 `Pressable` 成为触摸响应者、阻止冒泡误关。

## 依赖补丁

本模块依赖的 `react-native-safe-area-context@5.8.0` 的 `android/build.gradle` buildscript **硬编码** `classpath("com.android.tools.build:gradle:7.3.1")`（库独立构建的 legacy fallback）。被 app 引用时 AGP 由工程根 buildscript 继承、这行多余，但 **Android Studio sync 会按字面解析子项目 buildscript classpath**，在其上下文里完不成 7.3.1 解析 → sync 报 `Could not resolve com.android.tools.build:gradle:7.3.1`（`react-native run-android` CLI 不受影响）。补丁删掉该行。

> 注意：这与「集成坑 §6」鸿蒙 safe-area 降级 stub 是**两码事**——§6 是鸿蒙移植包 C++ 编译问题，本补丁是 iOS/Android 用的真包的 Android Studio sync 问题。

- **补丁文件**：[patches/react-native-safe-area-context@5.8.0.patch](patches/react-native-safe-area-context@5.8.0.patch)（随模块就近存放）。
- **如何生效（零手动）**：补丁在仓库根 [pnpm-workspace.yaml](../../pnpm-workspace.yaml) 的 `patchedDependencies` 注册，**`pnpm install` 自动应用**。
  > ⚠️ pnpm 只读**根** `pnpm-workspace.yaml` 的 `patchedDependencies`（子包配置不生效），故注册项必须在根、但路径指向本模块的 `patches/`。
- **验证已打**：
  ```bash
  pnpm --filter @itc/uikit patch:verify
  # 或直接看 gradle 配置阶段（offline 也能过 = 不再拉 7.3.1）：
  # cd apps/oa/android && ./gradlew :react-native-safe-area-context:help --offline -q
  ```
- **重建补丁**（仅改补丁内容时）：
  ```bash
  pnpm patch react-native-safe-area-context@5.8.0   # 解出可编辑临时目录
  pnpm patch-commit <临时目录>                       # 重新生成 .patch + 更新 pnpm-workspace.yaml
  #   ⚠️ patch-commit 默认把 .patch 写到根 patches/；重建后移回 packages/uikit/patches/
  #      并把 pnpm-workspace.yaml 路径改回本模块，再 pnpm install 确认无 "Could not apply patch"
  ```
- **通用模式**：任何 RN 第三方库 buildscript 硬编码老 AGP 致 AS sync 失败，同法 patch 掉那行。

## 目录结构
```
src/
  index.ts            # 唯一出口（白名单导出）
  tamagui/config.ts   # 内部 tamagui 配置（不导出）
  provider.tsx        # UIProvider
  theme/              # context + useTheme
  components/         # Button/Text/Input/layout/form/display/Dialog
  list/List.tsx       # 列表
```

## demo
见宿主 app 的 `apps/oa/src/screens/demo/UikitTab.tsx`（DemoScreen 的「UI」tab），展示全部控件 + 主题切换 + 列表三态。
