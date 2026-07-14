# @itc/uikit 模块规范

## 概述

**@itc/uikit** 是 OpenOA 项目的基础 UI 控件库，以 tamagui 为内部样式基座封装常用组件。对外只暴露 `@itc/uikit` 组件与接口，不暴露 tamagui，便于日后替换底层样式引擎。

**核心职责：**
- 提供基础 UI 组件（Text / Button / Input / Card / Avatar / Badge / Spinner）
- 提供布局组件（Stack / XStack / YStack / Divider）
- 提供表单组件（Switch / Checkbox / RadioGroup）
- 提供对话框（Dialog）
- 提供列表组件（List，支持下拉刷新 + 上拉加载）
- 提供主题系统（light/dark 切换 + 语义色）

**设计原则：**
- tamagui 不外泄：内部使用，对外只暴露封装后的组件
- 组件受控优先：表单组件强制受控（value + onChange）
- 平台兼容：使用 RN 原生 Modal 确保鸿蒙兼容性
- 样式统一：基于 tamagui token 系统

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

---

## 9. 目录结构

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
    │   └── display.tsx     # Card / Badge / Avatar / Spinner
    ├── list/
    │   └── List.tsx         # List
    └── harmony/
        └── safe-area-context-stub.tsx  # 鸿蒙 safe-area-context 兜底
```

---

## 10. 依赖关系

**dependencies：**
- `@tamagui/animations-react-native@^2.2.0`
- `@tamagui/config@^2.2.0`
- `tamagui@^2.2.0`

**peerDependencies：**
- `react-native`：>= 0.77.0
- `react-native-safe-area-context`：>= 4

**内部依赖：**
- 无（uikit 不依赖 @itc/base）

---

## 11. 使用示例

### 11.1 主题使用

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

### 11.2 表单使用

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

### 11.3 列表使用

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

### 11.4 对话框使用

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

## 12. 导出清单

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

// 列表
export { List };
export type { ListProps };
```

---

## 13. 注意事项

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
