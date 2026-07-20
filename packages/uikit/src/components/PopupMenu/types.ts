/**
 * PopupMenu 类型定义
 */

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

// ── 配置类型 ────────────────────────────────────────────────────────────

export interface MenuConfig {
  /** 动画时长（毫秒），默认 200 */
  animationDuration?: number;
  /** 遮罩透明度，默认 0.3 */
  overlayOpacity?: number;
  /** 点击外部是否关闭菜单，默认 true */
  closeOnPressOutside?: boolean;
  /** 点击选项后是否自动关闭，默认 true */
  autoDismiss?: boolean;
}

// ── MenuProvider ─────────────────────────────────────────────────────────

export interface MenuProviderProps {
  children?: ReactNode;
  /** 全局默认配置 */
  config?: MenuConfig;
}

// ── Menu ────────────────────────────────────────────────────────────────

export interface MenuProps {
  children?: ReactNode;
  /** 菜单打开回调 */
  onOpen?: () => void;
  /** 菜单关闭回调 */
  onClose?: () => void;
  /** 选项选中回调 */
  onSelect?: (value: string | number | object) => void;
}

// ── MenuTrigger ─────────────────────────────────────────────────────────

export interface MenuTriggerProps {
  children?: ReactNode;
  /** 是否使用长按触发，默认 false（点击触发） */
  triggerOnLongPress?: boolean;
  /** 是否禁用触发器 */
  disabled?: boolean;
}

// ── MenuOptions ─────────────────────────────────────────────────────────

/** 水平对齐方式 */
export type HorizontalAlign = 'start' | 'center' | 'end';
/** 垂直对齐方式 */
export type VerticalAlign = 'top' | 'center' | 'bottom';

export interface MenuOptionsProps {
  children?: ReactNode;
  /** 垂直对齐方式。默认 'bottom' */
  verticalAlign?: VerticalAlign;
  /** 水平对齐方式。默认 'start' */
  horizontalAlign?: HorizontalAlign;
  /** 自定义菜单容器样式 */
  optionsStyle?: StyleProp<ViewStyle>;
  /** 自定义遮罩层样式 */
  overlayStyle?: StyleProp<ViewStyle>;
  /** 完全自定义菜单内容（优先级高于 children） */
  renderContent?: (props: { close: () => void }) => ReactNode;
  /** X轴偏移量（正值向右，负值向左） */
  offsetX?: number;
  /** Y轴偏移量（正值向下，负值向上） */
  offsetY?: number;
}

// ── MenuOption ─────────────────────────────────────────────────────────

export interface MenuOptionProps {
  children?: ReactNode;
  /** 选项值，传递给 onSelect 回调 */
  value?: string | number | object;
  /** 自定义选项样式 */
  style?: StyleProp<ViewStyle>;
  /** 是否禁用 */
  disabled?: boolean;
  /** 选中回调 */
  onSelect?: (value: string | number | object) => void;
  /** 完全自定义选项内容（优先级高于 children） */
  renderOption?: (props: { disabled: boolean; onPress: () => void }) => ReactNode;
}

// ── Context 类型 ─────────────────────────────────────────────────────────

export interface MenuContextValue {
  /** 当前菜单是否可见 */
  visible: boolean;
  /** 打开菜单 */
  open: () => void;
  /** 关闭菜单 */
  close: () => void;
  /** 切换菜单 */
  toggle: () => void;
  /** 触发器位置信息 */
  triggerLayout: TriggerLayout | null;
  /** 设置触发器位置 */
  setTriggerLayout: (layout: TriggerLayout | null) => void;
  /** 选中选项 */
  select: (value: string | number | object) => void;
  /** 全局配置 */
  config: Required<MenuConfig>;
}

export interface TriggerLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}
