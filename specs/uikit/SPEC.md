# @itc/uikit 模块规范

## 概述

**@itc/uikit** 是 OpenOA 项目的基础 UI 控件库，以 tamagui 为内部样式基座封装常用组件。对外只暴露 `@itc/uikit` 组件与接口，不暴露 tamagui，便于日后替换底层样式引擎。

**核心职责：**
- 提供基础 UI 组件（Text / Button / Input / Card / Avatar / Badge / Spinner）
- 提供布局组件（Stack / XStack / YStack / Divider）
- 提供表单组件（Switch / Checkbox / RadioGroup）
- 提供对话框（Dialog）
- 提供 Toast 提示（全局 / 单次配置）
- 提供列表组件（List，支持下拉刷新 + 上拉加载）
- 提供 Tab 组件（TabLayout + Tab，分段控制器布局容器）
- 提供主题系统（light/dark 切换 + 语义色）

**设计原则：**
- tamagui 不外泄：内部使用，对外只暴露封装后的组件
- 组件受控优先：表单组件强制受控（value + onChange）
- 平台兼容：使用 RN 原生 Modal 确保鸿蒙兼容性
- 样式统一：基于 tamagui token 系统

---

## 0. 变更记录

| 日期 | 版本 | 变更 | 备注 |
|------|------|------|------|
| 2026-07-20 | 0.3 | 新增 Toast 组件（全局提示） | 支持 info/warn/success/fail 四种类型，支持自定义内容和全局/单次样式 |
| 2026-07-14 | 0.2 | 新增 TabLayout + Tab（分段控制器布局容器） | 支持横向/纵向布局 |
| 2026-07-14 | 0.1 | 初版（List/Button/Input/Dialog 等） | 基线版本 |

---

## 2. 主题系统

### 2.1 UIProvider

```typescript
interface UIProviderProps {
  children: ReactNode;
  /** 初始主题模式，默认 'light' */
  defaultMode?: ThemeMode;
}

/**
 * UI 根 Provider：注入主题（tamagui）+ 管理 light/dark 切换。
 * 业务只需在 App 根包一层 <UIProvider>，看不到 tamagui。
 */
export function UIProvider({ children, defaultMode = 'light' }: UIProviderProps): JSX.Element;
```

### 2.2 useTheme

```typescript
type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  background: string;     // 页面背景
  color: string;          // 主文本色
  colorSecondary: string;  // 次要文本色
  primary: string;        // 主题强调色
  border: string;         // 边框/分割线
}

interface UseThemeResult {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
  colors: ThemeColors;
}

/** 读取当前主题模式 + 语义色，并可切换主题 */
export function useTheme(): UseThemeResult;
```

---

## 3. 布局组件

### 3.1 Stack / XStack / YStack

```typescript
type Align = 'flex-start' | 'center' | 'flex-end' | 'stretch';
type Justify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';

interface StackProps {
  children?: ReactNode;
  gap?: number;           // 间距
  padding?: number;        // 内边距
  flex?: number;          // flex 值
  align?: Align;          // 交叉轴对齐
  justify?: Justify;      // 主轴对齐
  backgroundColor?: string;
  borderRadius?: number;
}

/** 纵向堆叠容器 */
export function YStack(props: StackProps): JSX.Element;

/** 横向堆叠容器 */
export function XStack(props: StackProps): JSX.Element;

/** 通用容器（YStack 别名） */
export const Stack = YStack;
```

### 3.2 Divider

```typescript
interface DividerProps {
  vertical?: boolean;  // 竖向分割线，默认横向
}

/** 分割线 */
export function Divider(props: DividerProps): JSX.Element;
```

---

## 4. 基础组件

### 4.1 Text

```typescript
type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption';

interface TextProps {
  children?: ReactNode;
  variant?: TextVariant;         // 文本层级，默认 body
  color?: string;                // 颜色，不传则跟随主题
  numberOfLines?: number;        // 行数限制
  textAlign?: 'left' | 'center' | 'right';
}

/** 文本组件 */
export function Text(props: TextProps): JSX.Element;
```

**字号映射：**

| variant | 字号 | 字重 |
|---------|------|------|
| h1 | $9 | 700 |
| h2 | $7 | 600 |
| h3 | $6 | 600 |
| body | $4 | 400 |
| caption | $2 | 400 |

### 4.2 Button

```typescript
type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;  // solid(主色)/outline(描边)/ghost(无背景)
  size?: ButtonSize;         // sm/md/lg
  disabled?: boolean;
  loading?: boolean;         // 加载中，显示 Spinner 并禁用
  onPress?: () => void;
}

/** 按钮 */
export function Button(props: ButtonProps): JSX.Element;
```

### 4.3 Input

```typescript
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps {
  value?: string;                            // 受控值
  defaultValue?: string;                     // 非受控默认值
  placeholder?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;                 // 密码输入
  disabled?: boolean;
  size?: InputSize;
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'phone-pad';
  autoFocus?: boolean;
}

/** 文本输入框 */
export function Input(props: InputProps): JSX.Element;
```

---

## 5. 表单组件

### 5.1 Switch

```typescript
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** 开关 */
export function Switch(props: SwitchProps): JSX.Element;
```

### 5.2 Checkbox

```typescript
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;      // 可选标签
  disabled?: boolean;
}

/** 复选框（可带标签） */
export function Checkbox(props: CheckboxProps): JSX.Element;
```

### 5.3 RadioGroup

```typescript
interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  value: string;              // 当前选中值
  onChange: (value: string) => void;
  options: RadioOption[];    // 选项列表
  disabled?: boolean;
}

/** 单选组 */
export function RadioGroup(props: RadioGroupProps): JSX.Element;
```

---

## 6. 展示组件

### 6.1 Card

```typescript
interface CardProps {
  children?: ReactNode;
  padding?: number;      // 内边距，默认 16
  onPress?: () => void; // 可选点击
}

/** 卡片容器（带边框 + 圆角） */
export function Card(props: CardProps): JSX.Element;
```

### 6.2 Badge

```typescript
type BadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  children?: ReactNode;
  tone?: BadgeTone;  // 颜色主题，默认 info
}

/** 小角标 */
export function Badge(props: BadgeProps): JSX.Element;
```

**颜色映射：**

| tone | 背景色 |
|------|--------|
| info | $blue9 |
| success | $green9 |
| warning | $yellow9 |
| danger | $red9 |
| neutral | $gray9 |

### 6.3 Avatar

```typescript
interface AvatarProps {
  src?: string;         // 头像图片 URL
  size?: number;        // 尺寸，默认 40
  fallback?: string;     // 无图时的占位文字（如姓名首字）
}

/** 头像（圆形） */
export function Avatar(props: AvatarProps): JSX.Element;
```

### 6.4 Spinner

```typescript
interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

/** 加载指示器 */
export function Spinner(props: SpinnerProps): JSX.Element;
```

---

## 7. 对话框

### 7.1 Dialog

```typescript
interface DialogProps {
  open: boolean;                       // 是否显示
  onOpenChange: (open: boolean) => void;
  title?: string;                     // 标题
  children?: ReactNode;               // 内容
  onConfirm?: () => void;             // 确认回调，不传则不显确认按钮
  onCancel?: () => void;              // 取消回调，不传则不显取消按钮
  confirmText?: string;               // 确认按钮文本，默认"确定"
  cancelText?: string;               // 取消按钮文本，默认"取消"
}

/**
 * 模态对话框（标题 + 内容 + 确认/取消）。
 * 使用 RN 原生 Modal，确保鸿蒙兼容性。
 */
export function Dialog(props: DialogProps): JSX.Element;
```

**平台说明：**
- 使用 RN 原生 `Modal` 而非 tamagui 的 `Dialog.Portal`
- tamagui Portal 在鸿蒙（RNOH）上触摸事件无法命中按钮
- RN Modal 在三端都有原生 ModalHostView 实现，触摸正确路由
- `onRequestClose` 接管硬件返回键，返回键收起对话框而非退出页面

---

## 7.1 Toast 组件

Toast 是一种轻量级的全局提示组件，用于向用户展示操作结果、系统状态等临时信息。

### 7.1.1 设计理念

- **全局单例**：Toast 由 Provider 自动挂载，业务层通过 `Toast.show()` 调用，无需在每个页面手动放置
- **类型化主题**：内置 `info` / `warn` / `success` / `fail` 四种视觉风格，每种对应特定语义
- **完全可定制**：支持自定义渲染内容（custom content）和全局/单次样式覆盖
- **自动消失**：默认 2 秒后自动关闭，支持手动控制

### 7.1.2 ToastType 类型

```typescript
type ToastType = 'info' | 'warn' | 'success' | 'fail';
```

| 类型 | 语义 | 图标 | 默认颜色 |
|------|------|------|----------|
| info | 提示信息 | ℹ️ | $blue10 |
| warn | 警告 | ⚠️ | $yellow10 |
| success | 成功 | ✅ | $green10 |
| fail | 失败 | ❌ | $red10 |

### 7.1.3 ToastOptions 配置

```typescript
interface ToastOptions {
  /** toast 类型，决定默认图标和颜色。可选值：info | warn | success | fail */
  type?: ToastType;

  /** toast 内容文本。如果传了 content，此字段会被忽略 */
  message?: string;

  /** 自定义渲染内容。优先级高于 message。 */
  content?: ReactNode;

  /** 显示时长（毫秒），默认 2000。传 0 则不自动关闭，需手动调用 Toast.hide() */
  duration?: number;

  /** 自定义 toast 容器样式，会与类型默认样式合并 */
  style?: ViewStyle;

  /** 自定义 toast 内部内容样式 */
  contentStyle?: ViewStyle;

  /** 自定义图标样式 */
  iconStyle?: TextStyle;

  /** 自定义图标文字，覆盖类型默认图标 */
  icon?: string;

  /** 自定义主文字样式 */
  messageStyle?: TextStyle;
}
```

### 7.1.4 Toast API

```typescript
/** 显示 toast */
function show(options: ToastOptions): void;

/** 立即隐藏 toast */
function hide(): void;

/** 配置全局默认样式，合并到所有 toast */
function setDefaultOptions(options: ToastOptions): void;

/** 重置全局样式为默认值 */
function resetDefaultOptions(): void;
```

### 7.1.5 ToastProvider

```typescript
interface ToastProviderProps {
  children: ReactNode;
  /** 全局默认配置 */
  defaultOptions?: ToastOptions;
}

/**
 * Toast Provider。
 * 在 App 根节点包一层，自动挂载 Toast 容器层。
 * 必须在 UIProvider 内部使用。
 */
export function ToastProvider(props: ToastProviderProps): JSX.Element;
```

### 7.1.6 使用方式

**基础用法（推荐在 App 根组件一次性配置）：**

```tsx
import { UIProvider, ToastProvider, Toast } from '@itc/uikit';

function App() {
  return (
    <UIProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </UIProvider>
  );
}

// 业务代码中直接使用
Toast.show({ type: 'success', message: '保存成功' });
Toast.show({ type: 'fail', message: '网络连接失败' });
Toast.show({ type: 'warn', message: '数据即将过期' });
Toast.show({ type: 'info', message: '新版本已发布' });
```

**自定义内容（完全自定义内部布局）：**

```tsx
Toast.show({
  type: 'success',
  content: (
    <YStack alignItems="center" gap={8}>
      <Text variant="h3">提交成功</Text>
      <Text variant="caption">感谢您的反馈</Text>
    </YStack>
  ),
  duration: 3000,
});
```

**全局配置样式：**

```tsx
// 在 ToastProvider 上配置默认选项
<ToastProvider
  defaultOptions={{
    type: 'info',
    duration: 3000,
    style: { borderRadius: 8 },
  }}
/>

// 或运行时动态配置
Toast.setDefaultOptions({
  duration: 3000,
  style: { backgroundColor: '#333' },
});
```

**单次样式覆盖：**

```tsx
// 单次 show 覆盖全局配置
Toast.setDefaultOptions({ duration: 2000 });

Toast.show({ message: '默认2秒' });
Toast.show({ message: '这个显示5秒', duration: 5000, style: { backgroundColor: '#f00' } });
Toast.show({ message: '不自动关闭', duration: 0 }); // 手动 Toast.hide()
```

**手动关闭：**

```tsx
Toast.show({ type: 'loading', message: '加载中...', duration: 0 });

// 异步操作完成后手动关闭
setTimeout(() => {
  Toast.hide();
}, 2000);
```

**多 toast 堆叠展示：**

```tsx
// 短时间内多次调用 toast，会垂直排列显示
Toast.show({ type: 'info', message: '消息1' });
Toast.show({ type: 'success', message: '消息2' });
Toast.show({ type: 'warn', message: '消息3' });
// 显示效果：从上到下依次为 消息1、消息2、消息3
```

**隐藏所有 toast：**

```tsx
Toast.hide(); // 隐藏所有正在显示的 toast
```

### 7.1.7 实现要点

- **多 toast 垂直堆叠**：支持同时显示多个 toast，最新 toast 显示在最下方，向上排列
- **单例容器**：Toast 容器通过 React Portals 挂载到根节点，层级最高
- **状态管理**：内部使用 `useReducer` 管理 toast 队列，支持多 toast 叠加展示
- **动画**：使用 `react-native-reanimated` 实现淡入淡出 + 位移动画
- **平台兼容**：优先使用 RN 原生 `Modal`，确保 HarmonyOS 触摸正确
- **Z-Index**：toast 容器 zIndex 设为 9999，确保在最顶层显示

### 7.1.8 目录结构

```
src/components/
├── ...
└── Toast/
    ├── Toast.tsx          # Toast 组件核心（内部使用）
    ├── ToastContainer.tsx # Toast 容器（Provider 内部）
    ├── ToastProvider.tsx  # ToastProvider 组件
    └── index.ts           # 导出
```

---

## 8. 列表组件

### 8.1 List

```typescript
interface ListProps<T> {
  data: T[];                           // 数据源
  renderItem: (item: T, index: number) => ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  refreshing?: boolean;                // 下拉刷新中
  onRefresh?: () => void;              // 下拉刷新回调
  onLoadMore?: () => void;             // 上拉加载更多回调
  loadingMore?: boolean;               // 加载更多进行中
  hasMore?: boolean;                   // 是否还有更多，默认 true
  emptyComponent?: ReactElement;       // 空数据展示
  header?: ReactElement;               // 列表头部
}

/**
 * 列表控件。封装 RN FlatList：
 * - 下拉刷新（onRefresh + refreshing）
 * - 上拉加载更多（onLoadMore + loadingMore）
 * - 没有更多（hasMore=false → 底部「没有更多」）
 */
export function List<T>(props: ListProps<T>): JSX.Element;
```

### 8.2 TabLayout

TabLayout 是一个分段控制器布局容器，将「标签列表」和「内容区域」组合在一起。

#### 8.2.1 TabLayoutProps

```typescript
type TabLayoutDirection = 'horizontal' | 'vertical';
type TabLayoutTabPosition = 'start' | 'end';

interface TabLayoutProps {
  children?: ReactNode;

  /** 布局方向：横向（标签在上/下）或纵向（标签在左/右）。默认 'horizontal' */
  direction?: TabLayoutDirection;

  /** 标签列表位于内容区的哪一侧。默认 'start' */
  tabPosition?: TabLayoutTabPosition;

  /** 标签列表的宽度（纵向布局时）或高度（横向布局时）。默认 80 */
  tabSize?: number;

  /** 当前选中标签的索引。受控模式 */
  value?: number;

  /** 默认选中的标签索引。非受控模式 */
  defaultValue?: number;

  /** 选中变化时的回调。受控模式必需 */
  onChange?: (index: number) => void;

  /** 标签列表的渲染函数。接收 isActive（是否选中）用于高亮状态 */
  renderTabList: (tab: {
    isActive: boolean;
    index: number;
    label: string;
  }) => ReactElement;

  /** 内容区域的渲染函数 */
  renderTabContent: (tab: {
    index: number;
    label: string;
  }) => ReactElement;
}
```

#### 8.2.2 Tab 组件

`Tab` 是配合 `TabLayout` 使用的子组件，用于自定义标签列表的渲染。

```typescript
interface TabProps {
  /** 标签文本 */
  label: string;

  /** 标签内容自定义渲染（优先级高于 label） */
  children?: ReactNode;

  /** 是否禁用 */
  disabled?: boolean;
}

/** Tab 标签组件 */
export function Tab(props: TabProps): JSX.Element;
```

#### 8.2.3 使用方式

**基础用法（横向 + 标签在上）：**

```tsx
<TabLayout
  defaultValue={0}
  onChange={(index) => console.log('切换到', index)}
  renderTabList={({ isActive, label }) => (
    <XStack
      padding={8}
      backgroundColor={isActive ? '$primary' : 'transparent'}
      borderRadius={4}
    >
      <Text color={isActive ? 'white' : '$gray11'}>{label}</Text>
    </XStack>
  )}
  renderTabContent={({ index, label }) => (
    <YStack flex={1} padding={16}>
      <Text>内容区域: {label}</Text>
    </YStack>
  )}
/>
```

**纵向布局（标签在左侧）：**

```tsx
<TabLayout
  direction="vertical"
  tabPosition="start"
  tabSize={120}
  defaultValue={0}
  renderTabList={({ isActive, label }) => (
    <YStack
      padding={12}
      backgroundColor={isActive ? '$primary' : 'transparent'}
    >
      <Text color={isActive ? 'white' : '$gray11'}>{label}</Text>
    </YStack>
  )}
  renderTabContent={({ index }) => (
    <YStack flex={1} padding={16}>
      <Text>这是第 {index + 1} 个面板的内容</Text>
    </YStack>
  )}
/>
```

**配合 Tab 子组件使用：**

```tsx
<TabLayout
  defaultValue={0}
  renderTabList={({ isActive, label }) => (
    <Button variant={isActive ? 'solid' : 'ghost'}>{label}</Button>
  )}
>
  <Tab label="首页" />
  <Tab label="消息" />
  <Tab label="我的" />
</TabLayout>
```

**目录结构：**

```
src/components/
├── ...
└── TabLayout.tsx   # TabLayout + Tab 组件（可合并或拆分）
```

**设计说明：**

- `renderTabList` 和 `renderTabContent` 接收当前标签信息，支持自由定制渲染
- 内部维护 `tabs` 数组：通过 React.Children 收集所有 `Tab` 子组件的 label
- 布局通过 `flexDirection` 控制（横向 `row`，纵向 `column`）
- 选中状态通过 `value`（受控）或内部 state（非受控）管理

---

## 13. 目录结构

```
packages/uikit/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # 唯一出口，白名单导出
    ├── provider.tsx          # UIProvider
    ├── tamagui/
    │   └── config.ts         # tamagui 内部配置
    ├── theme/
    │   ├── context.ts        # ThemeModeContext
    │   └── useTheme.ts       # useTheme hook
    ├── components/
    │   ├── layout.tsx        # Stack / XStack / YStack / Divider
    │   ├── Text.tsx         # Text
    │   ├── Button.tsx       # Button
    │   ├── Input.tsx        # Input
    │   ├── Dialog.tsx       # Dialog
    │   ├── form.tsx         # Switch / Checkbox / RadioGroup
    │   ├── display.tsx     # Card / Badge / Avatar / Spinner
    │   ├── TabLayout.tsx   # TabLayout / Tab
    │   └── Toast/          # Toast
    │       ├── Toast.tsx
    │       ├── ToastContainer.tsx
    │       ├── ToastProvider.tsx
    │       └── index.ts
    ├── list/
    │   └── List.tsx         # List
    └── harmony/
        └── safe-area-context-stub.tsx  # 鸿蒙 safe-area-context 兜底
```

---

## 14. 依赖关系

**dependencies：**
- `@tamagui/animations-react-native@^2.2.0`
- `@tamagui/config@^2.2.0`
- `tamagui@^2.2.0`
- `react-native-reanimated@^4.0.0`
- `react-native-worklets`

**peerDependencies：**
- `react-native`：>= 0.77.0
- `react-native-safe-area-context`：>= 4

**内部依赖：**
- 无（uikit 不依赖 @itc/base）

---

## 15. 使用示例

### 15.1 主题使用

```typescript
import { UIProvider, useTheme, Text, YStack } from '@itc/uikit';

function App() {
  return (
    <UIProvider defaultMode="light">
      <HomePage />
    </UIProvider>
  );
}

function HomePage() {
  const { mode, toggle, colors } = useTheme();

  return (
    <YStack flex={1} backgroundColor={colors.background} padding={16}>
      <Text variant="h1" color={colors.color}>Hello</Text>
      <Text variant="body" color={colors.colorSecondary}>Welcome</Text>
      <Button onPress={toggle}>切换主题</Button>
    </YStack>
  );
}
```

### 15.2 表单使用

```typescript
import { Switch, Checkbox, RadioGroup, YStack } from '@itc/uikit';
import { useState } from 'react';

function Settings() {
  const [enabled, setEnabled] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [level, setLevel] = useState('medium');

  return (
    <YStack gap={16}>
      <Switch checked={enabled} onChange={setEnabled} />
      <Checkbox checked={agreed} label="同意协议" onChange={setAgreed} />
      <RadioGroup
        value={level}
        onChange={setLevel}
        options={[
          { label: '低', value: 'low' },
          { label: '中', value: 'medium' },
          { label: '高', value: 'high' },
        ]}
      />
    </YStack>
  );
}
```

### 15.3 列表使用

```typescript
import { List, Card, Text, Avatar } from '@itc/uikit';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    setLoadingMore(true);
    // await fetchMoreUsers();
    setLoadingMore(false);
  };

  return (
    <List
      data={users}
      renderItem={(user) => (
        <Card onPress={() => console.log(user.id)}>
          <YStack flexDirection="row" alignItems="center" gap={12}>
            <Avatar src={user.avatar} fallback={user.name[0]} />
            <Text>{user.name}</Text>
          </YStack>
        </Card>
      )}
      keyExtractor={(user) => user.id}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); /* reload */ setRefreshing(false); }}
      onLoadMore={loadMore}
      loadingMore={loadingMore}
      hasMore={hasMore}
      emptyComponent={<Text>暂无数据</Text>}
    />
  );
}
```

### 15.4 对话框使用

```typescript
import { Dialog, Button } from '@itc/uikit';
import { useState } from 'react';

function DeleteConfirm() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setOpen(true)}>删除</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="确认删除"
        onConfirm={() => { /* delete */ setOpen(false); }}
        onCancel={() => setOpen(false)}
      >
        确定要删除此项吗？此操作不可撤销。
      </Dialog>
    </>
  );
}
```

---

## 16. 导出清单

```typescript
// 主题
export { UIProvider };
export type { UIProviderProps };
export { useTheme };
export type { ThemeColors, UseThemeResult, ThemeMode };

// 布局
export { Stack, XStack, YStack, Divider };
export type { StackProps, DividerProps, Align, Justify };

// 基础
export { Text };
export type { TextProps, TextVariant };
export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
export { Input };
export type { InputProps, InputSize };

// 表单
export { Switch, Checkbox, RadioGroup };
export type { SwitchProps, CheckboxProps, RadioGroupProps, RadioOption };

// 展示
export { Card, Badge, Avatar, Spinner };
export type { CardProps, BadgeProps, BadgeTone, AvatarProps, SpinnerProps };

// 反馈
export { Dialog };
export type { DialogProps };

// Toast
export { Toast, ToastProvider };
export type { ToastOptions, ToastType };

// 列表
export { List };
export type { ListProps };

// Tab 布局
export { TabLayout, Tab };
export type { TabLayoutProps, TabProps, TabLayoutDirection, TabLayoutTabPosition };
```

---

## 17. 注意事项

1. **tamagui 不外泄**：所有组件内部使用 tamagui，但不从 index 导出 tamagui 任何内容
2. **表单组件强制受控**：Switch/Checkbox/RadioGroup 必须配合 value + onChange 使用
3. **Dialog 使用 RN Modal**：确保鸿蒙平台触摸事件正确路由
4. **硬件返回键处理**：Dialog 的 onRequestClose 接管返回键，收起对话框不退出页面
5. **List 下拉刷新**：需要设置 `onRefresh` 和 `refreshing` 属性才会启用
6. **List 上拉加载**：需要设置 `onLoadMore` 属性才会启用，`hasMore` 控制是否显示"没有更多"
7. **useTheme 返回语义色**：业务层应使用 `colors.background`、`colors.primary` 等，而非直接使用色值
8. **Avatar fallback**：当 `src` 不存在或加载失败时显示 fallback 文字
9. **Button loading**：设置 `loading` 时自动禁用按钮并显示 Spinner
10. **零依赖**：@itc/uikit 不依赖 @itc/base，保持独立
11. **TabLayout 组件独立性**：TabLayout 不依赖具体平台 API，可在任意 RN 平台运行
12. **ToastProvider 嵌套**：ToastProvider 必须在 UIProvider 内部使用
13. **Toast 层级最高**：Toast 容器 zIndex 为 9999，显示在其他所有内容之上
14. **Toast 自动关闭**：默认 duration 为 2000ms，传 0 可禁用自动关闭，需手动调用 `Toast.hide()`
15. **Toast 自定义内容**：`content` 属性优先级高于 `message`，可传入任意 ReactNode
