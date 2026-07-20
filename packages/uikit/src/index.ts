// @itc/uikit —— 基础 UI 控件库（tamagui 为内部基座，对外不暴露 tamagui）。
// 本文件是唯一出口；白名单导出，确保 tamagui/styled/createTamagui 等绝不外泄。

// ── 主题 ────────────────────────────────────────────────────────────────────
export { UIProvider } from './provider';
export type { UIProviderProps } from './provider';
export { useTheme } from './theme/useTheme';
export type { ThemeColors, UseThemeResult } from './theme/useTheme';
export type { ThemeMode } from './theme/context';

// ── 布局 ────────────────────────────────────────────────────────────────────
export { Stack, XStack, YStack, Divider } from './components/layout';
export type { StackProps, DividerProps, Align, Justify } from './components/layout';

// ── 基础 ────────────────────────────────────────────────────────────────────
export { Text } from './components/Text';
export type { TextProps, TextVariant } from './components/Text';
export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button';
export { Input } from './components/Input';
export type { InputProps, InputSize } from './components/Input';

// ── 表单 ────────────────────────────────────────────────────────────────────
export { Switch, Checkbox, RadioGroup } from './components/form';
export type {
  SwitchProps,
  CheckboxProps,
  RadioGroupProps,
  RadioOption,
} from './components/form';

// ── 展示 ────────────────────────────────────────────────────────────────────
export { Card, Badge, Avatar, Spinner } from './components/display';
export type {
  CardProps,
  BadgeProps,
  BadgeTone,
  AvatarProps,
  SpinnerProps,
} from './components/display';

// ── 反馈 ────────────────────────────────────────────────────────────────────
export { Dialog } from './components/Dialog';
export type { DialogProps } from './components/Dialog';

// ── Toast ─────────────────────────────────────────────────────────────────────
export { Toast, ToastProvider } from './components/Toast';
export type { ToastProviderProps } from './components/Toast';
export type { ToastOptions, ToastType, ToastTypeDefaults } from './components/Toast';

// ── 列表 ────────────────────────────────────────────────────────────────────
export { List } from './list/List';
export type { ListProps } from './list/List';

// ── Tab 布局 ─────────────────────────────────────────────────────────────────────
export { TabLayout, Tab } from './components/TabLayout';
export type { TabLayoutProps, TabProps, TabLayoutDirection, TabLayoutTabPosition, TabLayoutMode } from './components/TabLayout';
